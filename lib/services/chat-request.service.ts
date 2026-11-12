import { prisma } from '@/lib/prisma';
import { ActionError } from '@/types/actions';
import { plainExcerpt } from '@/lib/text-excerpt';
import { findPairChat, ensurePairChat } from './direct-chat';
import { noteTopicHref, type NoteSource } from './hub-note-row';

const PERSON = { id: true, name: true, image: true, avatarSeed: true } as const;
const NOTE_BRIEF = { select: { id: true, content: true, category: { select: { id: true, slug: true, level: true, titles: { select: { lang: true, title: true } }, parent: { select: { slug: true, parent: { select: { slug: true } } } } } } } } as const;
const EXCERPT_MAX = 80;

type Person = { id: string; name: string | null; image: string | null; avatarSeed: string | null };

export interface ChatRequestRow {
    id: string;
    person: Person;
    /** Null when the Ziņa is gone (deleted): the request outlives its note (K2-26). */
    excerpt: string | null;
    noteHref: string | null;
    createdAt: Date;
}
export interface IncomingChatRequest extends ChatRequestRow {
    content: string;
}
export interface ChatRequestInbox {
    incoming: IncomingChatRequest[];
    /** One state only: a declined request looks pending to the sender, forever (K-120). */
    outgoing: ChatRequestRow[];
}

function noteInfo(note: { id: string; content: string; category: NoteSource['category'] } | null): { excerpt: string | null; noteHref: string | null } {
    if (!note) return { excerpt: null, noteHref: null };
    const href = noteTopicHref(note.category);
    return { excerpt: plainExcerpt(note.content, EXCERPT_MAX), noteHref: href ? `${href}?z=${note.id}` : null };
}

/** Private "Rakstīt privāti" requests from a Ziņa's reader to its author (K-83, K-120). Decline is silent. */
export const ChatRequestService = {
    /** For the Ziņas page: how each of others' notes looks to the viewer (K2-23). DECLINED maps to `pending`. Notes with no entry get `none`. */
    async stateFor(viewerId: string, notes: Array<{ id: string; authorId: string }>): Promise<Map<string, 'pending' | 'open' | 'hidden'>> {
        const others = notes.filter((n) => n.authorId !== viewerId);
        const states = new Map<string, 'pending' | 'open' | 'hidden'>();
        if (others.length === 0) return states;
        const [requests, authors, chats] = await Promise.all([
            prisma.chatRequest.findMany({ where: { senderId: viewerId, noteId: { in: others.map((n) => n.id) } }, select: { noteId: true } }),
            prisma.user.findMany({ where: { id: { in: [...new Set(others.map((n) => n.authorId))] } }, select: { id: true, allowDirectMessages: true } }),
            prisma.conversation.findMany({ where: { kind: 'DIRECT', participants: { some: { id: viewerId } } }, select: { participants: { select: { id: true } } } }),
        ]);
        const asked = new Set(requests.map((r) => r.noteId));
        const allows = new Map(authors.map((a) => [a.id, a.allowDirectMessages]));
        const chatWith = new Set(chats.filter((c) => c.participants.length === 2).flatMap((c) => c.participants.map((p) => p.id)));
        for (const n of others) {
            if (chatWith.has(n.authorId)) states.set(n.id, 'open');
            else if (asked.has(n.id)) states.set(n.id, 'pending');
            else if (!allows.get(n.authorId)) states.set(n.id, 'hidden');
        }
        return states;
    },

    /** The DIRECT chat between two people, for the "open" button. */
    async chatWith(viewerId: string, otherId: string): Promise<string | null> {
        return (await findPairChat(prisma, viewerId, otherId))?.id ?? null;
    },

    /** Sends one request to a Ziņa's author. Returns the request id and recipient for the notification. */
    async send(senderId: string, noteId: string, content: string): Promise<{ id: string; recipientId: string }> {
        const note = await prisma.hubNote.findFirst({ where: { id: noteId, expiresAt: { gt: new Date() } }, select: { authorId: true, author: { select: { allowDirectMessages: true } } } });
        if (!note) throw new ActionError('NOT_FOUND');
        if (note.authorId === senderId) throw new ActionError('FORBIDDEN');
        if (!note.author.allowDirectMessages) throw new ActionError('DM_NOT_ALLOWED');
        if (await findPairChat(prisma, senderId, note.authorId)) throw new ActionError('CHAT_REQUEST_EXISTS');
        if (await prisma.chatRequest.findUnique({ where: { noteId_senderId: { noteId, senderId } }, select: { id: true } })) throw new ActionError('CHAT_REQUEST_EXISTS');
        try {
            const created = await prisma.chatRequest.create({ data: { senderId, recipientId: note.authorId, noteId, content }, select: { id: true } });
            return { id: created.id, recipientId: note.authorId };
        } catch (error: unknown) {
            if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') throw new ActionError('CHAT_REQUEST_EXISTS');
            throw error;
        }
    },

    /** A request to a person from a name card (K5-20), no Ziņa behind it (`noteId` null). Not self, they take requests, no chat and no open request in either direction. */
    async sendDirect(senderId: string, recipientId: string, content: string): Promise<{ id: string; recipientId: string }> {
        if (senderId === recipientId) throw new ActionError('FORBIDDEN');
        const to = await prisma.user.findUnique({ where: { id: recipientId }, select: { allowDirectMessages: true } });
        if (!to) throw new ActionError('NOT_FOUND');
        if (!to.allowDirectMessages) throw new ActionError('DM_NOT_ALLOWED');
        if (await findPairChat(prisma, senderId, recipientId)) throw new ActionError('CHAT_REQUEST_EXISTS');
        if (await this.isWaiting(senderId, recipientId)) throw new ActionError('CHAT_REQUEST_EXISTS');
        const created = await prisma.chatRequest.create({ data: { senderId, recipientId, noteId: null, content }, select: { id: true } });
        return { id: created.id, recipientId };
    },

    /** An open request between two people: mine to them (a declined one reads as open, K-120) or theirs to me. */
    async isWaiting(viewerId: string, otherId: string): Promise<boolean> {
        const n = await prisma.chatRequest.count({
            where: { OR: [{ senderId: viewerId, recipientId: otherId, status: { in: ['PENDING', 'DECLINED'] } }, { senderId: otherId, recipientId: viewerId, status: 'PENDING' }] },
        });
        return n > 0;
    },

    /** Incoming PENDING requests, and the viewer's own sent ones (PENDING or DECLINED, both shown as waiting). */
    async listForInbox(userId: string): Promise<ChatRequestInbox> {
        const [incoming, outgoing] = await Promise.all([
            prisma.chatRequest.findMany({ where: { recipientId: userId, status: 'PENDING' }, orderBy: { createdAt: 'desc' }, select: { id: true, content: true, createdAt: true, sender: { select: PERSON }, note: NOTE_BRIEF } }),
            prisma.chatRequest.findMany({ where: { senderId: userId, status: { in: ['PENDING', 'DECLINED'] } }, orderBy: { createdAt: 'desc' }, select: { id: true, createdAt: true, recipient: { select: PERSON }, note: NOTE_BRIEF } }),
        ]);
        return {
            incoming: incoming.map((r) => ({ id: r.id, person: r.sender, content: r.content, createdAt: r.createdAt, ...noteInfo(r.note) })),
            outgoing: outgoing.map((r) => ({ id: r.id, person: r.recipient, createdAt: r.createdAt, ...noteInfo(r.note) })),
        };
    },

    /** Incoming PENDING count, added to the header badge. */
    async incomingCount(userId: string): Promise<number> {
        return prisma.chatRequest.count({ where: { recipientId: userId, status: 'PENDING' } });
    },

    /** Recipient accepts: the pair chat is created or reused (no shared-group rule) and the request text becomes its first message. */
    async accept(userId: string, id: string): Promise<{ conversationId: string; senderId: string }> {
        const req = await prisma.chatRequest.findUnique({ where: { id }, select: { senderId: true, recipientId: true, status: true, content: true } });
        if (!req || req.recipientId !== userId || req.status !== 'PENDING') throw new ActionError('NOT_FOUND');
        const now = new Date();
        const chat = await ensurePairChat(req.senderId, userId, async (tx, chatId) => {
            const claimed = await tx.chatRequest.updateMany({ where: { id, status: 'PENDING' }, data: { status: 'ACCEPTED', conversationId: chatId, decidedAt: now } });
            if (claimed.count !== 1) throw new ActionError('NOT_FOUND');
            await tx.message.create({ data: { content: req.content, conversationId: chatId, senderId: req.senderId, createdAt: now } });
            await tx.conversation.update({ where: { id: chatId }, data: { updatedAt: now } });
            await tx.conversationRead.upsert({
                where: { conversationId_userId: { conversationId: chatId, userId: req.senderId } },
                create: { conversationId: chatId, userId: req.senderId, lastReadAt: now },
                update: { lastReadAt: now },
            });
        });
        return { conversationId: chat.id, senderId: req.senderId };
    },

    /** Recipient declines: the status changes, nothing else (no message, no notification; the sender's view is unchanged). */
    async decline(userId: string, id: string): Promise<void> {
        const done = await prisma.chatRequest.updateMany({ where: { id, recipientId: userId, status: 'PENDING' }, data: { status: 'DECLINED', decidedAt: new Date() } });
        if (done.count !== 1) throw new ActionError('NOT_FOUND');
    },
};
