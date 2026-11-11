import { prisma } from '@/lib/prisma';
import { ActionError } from '@/types/actions';
import { isSiteAdmin } from '@/lib/site-role';
import type { NoteViewer } from './hub-note-row';
import { noteTopicHref } from './hub-note-row';

export interface HubNoteReplyRow {
    id: string;
    content: string;
    createdAt: Date;
    /** Null for a signed-out viewer (K-41). */
    author: { id: string; name: string | null; image: string | null; avatarSeed: string | null } | null;
    mine: boolean;
    canDelete: boolean;
    canReport: boolean;
}

const active = (id: string) => ({ id, expiresAt: { gt: new Date() } });

/** Replies to a Ziņa (K2-21, K2-22): public, read only with their active note. Spread into `HubNoteService`. */
export const NoteReplies = {
    /** Oldest first. An expired or deleted note has no readable replies (K-121). Signed out: no authors. */
    async replies(noteId: string, viewer?: NoteViewer): Promise<HubNoteReplyRow[]> {
        const rows = await prisma.hubNoteReply.findMany({
            where: { note: active(noteId) },
            orderBy: { createdAt: 'asc' },
            select: { id: true, content: true, createdAt: true, authorId: true, author: { select: { id: true, name: true, image: true, avatarSeed: true } } },
        });
        const admin = isSiteAdmin(viewer?.role);
        return rows.map((r) => {
            const mine = !!viewer && r.authorId === viewer.id;
            return {
                id: r.id, content: r.content, createdAt: r.createdAt,
                author: viewer ? r.author : null,
                mine,
                canDelete: mine || admin,
                canReport: !!viewer && !mine,
            };
        });
    },

    /** Adds a reply to an active note. Returns the note's author and hub address for the notification. */
    async reply(userId: string, noteId: string, content: string): Promise<{ id: string; noteAuthorId: string; href: string }> {
        const note = await prisma.hubNote.findFirst({ where: active(noteId), select: { authorId: true, category: { select: { id: true, slug: true, level: true, titles: { select: { lang: true, title: true } }, parent: { select: { slug: true, parent: { select: { slug: true } } } } } } } });
        if (!note) throw new ActionError('NOT_FOUND');
        const created = await prisma.hubNoteReply.create({ data: { noteId, authorId: userId, content }, select: { id: true } });
        return { id: created.id, noteAuthorId: note.authorId, href: `${noteTopicHref(note.category) ?? ''}?z=${noteId}` };
    },

    /** Edits one's own reply, while its note is active. */
    async editReply(userId: string, id: string, content: string): Promise<void> {
        const reply = await prisma.hubNoteReply.findUnique({ where: { id }, select: { authorId: true, note: { select: { expiresAt: true } } } });
        if (!reply || reply.note.expiresAt.getTime() <= Date.now()) throw new ActionError('NOT_FOUND');
        if (reply.authorId !== userId) throw new ActionError('FORBIDDEN');
        await prisma.hubNoteReply.update({ where: { id }, data: { content } });
    },

    /** Deletes a reply: its author or a site admin. The note's author cannot (K-119). */
    async deleteReply(viewer: NoteViewer, id: string): Promise<void> {
        const reply = await prisma.hubNoteReply.findUnique({ where: { id }, select: { authorId: true } });
        if (!reply) throw new ActionError('NOT_FOUND');
        if (reply.authorId !== viewer.id && !isSiteAdmin(viewer.role)) throw new ActionError('FORBIDDEN');
        await prisma.hubNoteReply.delete({ where: { id } });
    },
};
