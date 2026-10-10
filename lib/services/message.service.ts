import { Prisma, type ConversationKind, type MembershipRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ActionError, type ErrorCode } from '@/types/actions';
import { triggerRealtime } from '@/lib/pusher';
import { TaxonomyResolver } from '@/lib/services/taxonomy-resolver.service';

/**
 * Two kinds of chat (see `Conversation.kind`):
 *  - DIRECT: two people. Both are `participants`.
 *  - GROUP: one chat per person x group. The person is `contactUserId` (and the only participant);
 *    the group's *current* OWNER/ADMIN members are the team. The team is never stored, so promoting
 *    or demoting an admin changes who sees the chat immediately.
 * Every access decision goes through `canAccess` (and `accessWhere`, its query form).
 */

const PERSON_SELECT = { id: true, name: true, image: true, avatarSeed: true } as const;
const TEAM_ROLES: MembershipRole[] = ['OWNER', 'ADMIN'];

export type OriginType = 'JOIN_REQUEST' | 'GROUP_CONTACT';

export interface PersonView {
    id: string;
    name: string | null;
    image: string | null;
    avatarSeed: string | null;
}

export interface MessageView {
    id: string;
    content: string;
    createdAt: Date;
    senderId: string;
    conversationId: string;
    sender: PersonView;
}

export interface InboxRow {
    id: string;
    kind: ConversationKind;
    isBlocked: boolean;
    /** The group of a group chat was deleted: nobody can write any more. */
    readOnly: boolean;
    canBlock: boolean;
    /** The viewer is the outside person of a group chat (not a DIRECT chat, not the team). */
    viewerIsContact: boolean;
    unread: boolean;
    updatedAt: Date;
    /** The person on the other side: the partner (DIRECT) or the outside person (seen by the team). Null for the contact person's own view of a group chat. */
    other: PersonView | null;
    /** The group of a group chat, with its server-resolved L1 category colour. Null for DIRECT chats and after the group was deleted. */
    group: { name: string; l1Slug: string; accentColor: string; href: string | null } | null;
    lastMessage: { id: string; content: string; createdAt: Date; senderId: string } | null;
    origin: { type: string; groupName: string | null; groupHref: string | null } | null;
}

export interface ConversationAccess {
    id: string;
    kind: ConversationKind;
    isBlocked: boolean;
    originGroupId: string | null;
    contactUserId: string | null;
    viewerIsContact: boolean;
    viewerIsTeam: boolean;
}

export interface RequestThreadMessage {
    id: string;
    content: string;
    createdAt: Date;
    senderId: string;
    sender: { name: string | null; username: string | null; avatarSeed: string | null; image: string | null };
}

export interface RequestThread {
    conversationId: string;
    messages: RequestThreadMessage[];
}

function fail(error: unknown, label: string, code: ErrorCode): never {
    if (error instanceof ActionError) throw error;
    console.error(`[MessageService.${label}] Error:`, error);
    throw new ActionError(code);
}

/** Which conversations the user may see: their own DIRECT chats, group chats they started, and group chats of groups they currently own/administer. */
function accessWhere(userId: string): Prisma.ConversationWhereInput {
    return {
        OR: [
            { participants: { some: { id: userId } } },
            { kind: 'GROUP', contactUserId: userId },
            { kind: 'GROUP', originGroup: { members: { some: { userId, role: { in: TEAM_ROLES } } } } }
        ]
    };
}

async function teamUserIds(groupId: string | null): Promise<string[]> {
    if (!groupId) return [];
    const members = await prisma.membership.findMany({
        where: { groupId, role: { in: TEAM_ROLES } },
        select: { userId: true }
    });
    return members.map(m => m.userId);
}

async function isTeamMember(groupId: string, userId: string): Promise<boolean> {
    const membership = await prisma.membership.findUnique({
        where: { userId_groupId: { userId, groupId } },
        select: { role: true }
    });
    return !!membership && TEAM_ROLES.includes(membership.role);
}

/** Newest message per conversation that someone else wrote: the basis of "unread". */
async function newestFromOthers(conversationIds: string[], userId: string): Promise<Map<string, Date>> {
    if (conversationIds.length === 0) return new Map();
    const rows = await prisma.message.findMany({
        where: { conversationId: { in: conversationIds }, senderId: { not: userId } },
        orderBy: [{ conversationId: 'asc' }, { createdAt: 'desc' }],
        distinct: ['conversationId'],
        select: { conversationId: true, createdAt: true }
    });
    return new Map(rows.map(r => [r.conversationId, r.createdAt]));
}

function toMessageView(message: {
    id: string; content: string; createdAt: Date; senderId: string; conversationId: string; sender: PersonView;
}): MessageView {
    return {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        senderId: message.senderId,
        conversationId: message.conversationId,
        sender: message.sender
    };
}

function groupHref(group: { slug: string; hiddenAt: Date | null; category: Parameters<typeof TaxonomyResolver.resolve>[0] }): string | null {
    // Hidden groups 404 for everyone but site admins, so no link.
    return group.hiddenAt ? null : `/${TaxonomyResolver.resolve(group.category).l1Slug}/group/${group.slug}`;
}

export const MessageService = {
    /**
     * The one access check. Returns how the user relates to the conversation, or null when they may not see it.
     */
    async canAccess(conversationId: string, userId: string): Promise<ConversationAccess | null> {
        if (!conversationId || !userId) return null;
        const conversation = await prisma.conversation.findFirst({
            where: { id: conversationId, AND: [accessWhere(userId)] },
            select: { id: true, kind: true, isBlocked: true, originGroupId: true, contactUserId: true }
        });
        if (!conversation) return null;
        const isGroup = conversation.kind === 'GROUP';
        return {
            ...conversation,
            viewerIsContact: isGroup && conversation.contactUserId === userId,
            viewerIsTeam: isGroup && conversation.contactUserId !== userId
        };
    },

    async listInbox(userId: string, locale: string): Promise<InboxRow[]> {
        try {
            const conversations = await prisma.conversation.findMany({
                where: accessWhere(userId),
                orderBy: { updatedAt: 'desc' },
                select: {
                    id: true,
                    kind: true,
                    isBlocked: true,
                    originType: true,
                    originGroupId: true,
                    contactUserId: true,
                    updatedAt: true,
                    participants: { select: PERSON_SELECT },
                    contactUser: { select: PERSON_SELECT },
                    originGroup: {
                        select: {
                            name: true,
                            slug: true,
                            hiddenAt: true,
                            category: { include: TaxonomyResolver.getInclude(locale) }
                        }
                    },
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                        select: { id: true, content: true, createdAt: true, senderId: true }
                    },
                    reads: { where: { userId }, select: { lastReadAt: true } }
                }
            });

            const newest = await newestFromOthers(conversations.map(c => c.id), userId);

            return conversations.map((c): InboxRow => {
                const isGroup = c.kind === 'GROUP';
                const viewerIsContact = isGroup && c.contactUserId === userId;
                const resolved = c.originGroup ? TaxonomyResolver.resolve(c.originGroup.category) : null;
                const href = c.originGroup ? groupHref(c.originGroup) : null;
                const lastFromOthers = newest.get(c.id);
                const lastReadAt = c.reads[0]?.lastReadAt;

                return {
                    id: c.id,
                    kind: c.kind,
                    isBlocked: c.isBlocked,
                    readOnly: isGroup && !c.originGroupId,
                    canBlock: !isGroup || !viewerIsContact,
                    viewerIsContact,
                    unread: !!lastFromOthers && (!lastReadAt || lastFromOthers > lastReadAt),
                    updatedAt: c.updatedAt,
                    other: isGroup
                        ? (viewerIsContact ? null : c.contactUser)
                        : (c.participants.find(p => p.id !== userId) ?? null),
                    group: c.originGroup && resolved
                        ? { name: c.originGroup.name, l1Slug: resolved.l1Slug, accentColor: resolved.accentColor, href }
                        : null,
                    lastMessage: c.messages[0] ?? null,
                    origin: c.originType
                        ? { type: c.originType, groupName: c.originGroup?.name ?? null, groupHref: href }
                        : null
                };
            });
        } catch (error) {
            console.error('[MessageService.listInbox] Error:', error);
            return [];
        }
    },

    async getMessages(conversationId: string, userId: string): Promise<MessageView[]> {
        try {
            if (!(await MessageService.canAccess(conversationId, userId))) throw new ActionError('NOT_FOUND');
            const messages = await prisma.message.findMany({
                where: { conversationId },
                orderBy: { createdAt: 'asc' },
                select: {
                    id: true, content: true, createdAt: true, senderId: true, conversationId: true,
                    sender: { select: PERSON_SELECT }
                }
            });
            return messages.map(toMessageView);
        } catch (error) {
            return fail(error, 'getMessages', 'INTERNAL_SERVER_ERROR');
        }
    },

    async sendMessage(conversationId: string, senderId: string, content: string): Promise<MessageView> {
        try {
            const access = await MessageService.canAccess(conversationId, senderId);
            if (!access) throw new ActionError('NOT_FOUND');
            if (access.kind === 'GROUP' && !access.originGroupId) throw new ActionError('GROUP_GONE');
            if (access.isBlocked) throw new ActionError('FORBIDDEN');

            const now = new Date();
            const [message] = await prisma.$transaction([
                prisma.message.create({
                    data: { content, conversationId, senderId, createdAt: now },
                    select: {
                        id: true, content: true, createdAt: true, senderId: true, conversationId: true,
                        sender: { select: PERSON_SELECT }
                    }
                }),
                prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: now } }),
                // Whoever writes has seen everything up to now.
                prisma.conversationRead.upsert({
                    where: { conversationId_userId: { conversationId, userId: senderId } },
                    create: { conversationId, userId: senderId, lastReadAt: now },
                    update: { lastReadAt: now }
                })
            ]);

            const view = toMessageView(message);

            // Realtime goes to everyone who can see the chat right now: the participants, the contact person and the current team.
            const participants = await prisma.conversation.findUnique({
                where: { id: conversationId },
                select: { participants: { select: { id: true } } }
            });
            const recipients = new Set<string>([
                ...(participants?.participants.map(p => p.id) ?? []),
                ...(access.contactUserId ? [access.contactUserId] : []),
                ...(await teamUserIds(access.originGroupId))
            ]);
            await Promise.all([...recipients].map(id => triggerRealtime(
                `private-user-${id}`,
                'new-message',
                { ...view, createdAt: view.createdAt.toISOString() }
            )));

            return view;
        } catch (error) {
            return fail(error, 'sendMessage', 'POST_FAILED');
        }
    },

    async markRead(conversationId: string, userId: string): Promise<void> {
        try {
            if (!(await MessageService.canAccess(conversationId, userId))) throw new ActionError('NOT_FOUND');
            const now = new Date();
            await prisma.conversationRead.upsert({
                where: { conversationId_userId: { conversationId, userId } },
                create: { conversationId, userId, lastReadAt: now },
                update: { lastReadAt: now }
            });
        } catch (error) {
            fail(error, 'markRead', 'UPDATE_FAILED');
        }
    },

    /** Number of chats with something unread: messages after my `lastReadAt` that I did not write. */
    async unreadCount(userId: string): Promise<number> {
        try {
            const conversations = await prisma.conversation.findMany({
                where: accessWhere(userId),
                select: { id: true, reads: { where: { userId }, select: { lastReadAt: true } } }
            });
            const newest = await newestFromOthers(conversations.map(c => c.id), userId);
            return conversations.filter(c => {
                const last = newest.get(c.id);
                const lastReadAt = c.reads[0]?.lastReadAt;
                return !!last && (!lastReadAt || last > lastReadAt);
            }).length;
        } catch (error) {
            console.error('[MessageService.unreadCount] Error:', error);
            return 0;
        }
    },

    /**
     * The one chat between a person and a group's team. Reused when it exists (whatever its origin);
     * `originType` only records how a new one started.
     */
    async getOrCreateGroupChat(groupId: string, personId: string, originType: OriginType = 'GROUP_CONTACT'): Promise<{ id: string; created: boolean }> {
        try {
            const existing = await prisma.conversation.findUnique({
                where: { originGroupId_contactUserId: { originGroupId: groupId, contactUserId: personId } },
                select: { id: true }
            });
            if (existing) return { id: existing.id, created: false };

            const group = await prisma.group.findFirst({ where: { id: groupId, hiddenAt: null }, select: { id: true } });
            if (!group) throw new ActionError('NOT_FOUND');
            // The team does not write to itself.
            if (await isTeamMember(groupId, personId)) throw new ActionError('FORBIDDEN');

            try {
                const created = await prisma.conversation.create({
                    data: {
                        kind: 'GROUP',
                        originType,
                        originGroupId: groupId,
                        contactUserId: personId,
                        participants: { connect: { id: personId } }
                    },
                    select: { id: true }
                });
                return { id: created.id, created: true };
            } catch (error) {
                // Two requests at once: the other one won.
                if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                    const raced = await prisma.conversation.findUnique({
                        where: { originGroupId_contactUserId: { originGroupId: groupId, contactUserId: personId } },
                        select: { id: true }
                    });
                    if (raced) return { id: raced.id, created: false };
                }
                throw error;
            }
        } catch (error) {
            return fail(error, 'getOrCreateGroupChat', 'CREATE_FAILED');
        }
    },

    /**
     * The chat between two people. A new one can only start between two full members (not PENDING)
     * of at least one shared group, and only if the other person accepts direct messages. An existing
     * pair chat is reused and stays writable unless it is blocked.
     */
    async getOrCreateDirectChat(userId: string, otherUserId: string): Promise<{ id: string; created: boolean }> {
        try {
            if (!userId || !otherUserId || userId === otherUserId) throw new ActionError('FORBIDDEN');

            const candidates = await prisma.conversation.findMany({
                where: {
                    kind: 'DIRECT',
                    AND: [
                        { participants: { some: { id: userId } } },
                        { participants: { some: { id: otherUserId } } }
                    ]
                },
                select: { id: true, _count: { select: { participants: true } } }
            });
            const existing = candidates.find(c => c._count.participants === 2);
            if (existing) return { id: existing.id, created: false };

            const target = await prisma.user.findUnique({ where: { id: otherUserId }, select: { allowDirectMessages: true } });
            if (!target) throw new ActionError('NOT_FOUND');
            if (!target.allowDirectMessages) throw new ActionError('DM_NOT_ALLOWED');

            const shared = await prisma.membership.findFirst({
                where: {
                    userId,
                    role: { not: 'PENDING' },
                    group: { members: { some: { userId: otherUserId, role: { not: 'PENDING' } } } }
                },
                select: { id: true }
            });
            if (!shared) throw new ActionError('DM_NOT_ALLOWED');

            const created = await prisma.conversation.create({
                data: {
                    kind: 'DIRECT',
                    participants: { connect: [{ id: userId }, { id: otherUserId }] }
                },
                select: { id: true }
            });
            return { id: created.id, created: true };
        } catch (error) {
            return fail(error, 'getOrCreateDirectChat', 'CREATE_FAILED');
        }
    },

    /**
     * Group chats of the given people with a group, newest data first: what the Requests tab shows.
     * The caller decides who may see them.
     */
    async listGroupThreads(groupId: string, personIds: string[]): Promise<Map<string, RequestThread>> {
        if (personIds.length === 0) return new Map();
        const conversations = await prisma.conversation.findMany({
            where: { kind: 'GROUP', originGroupId: groupId, contactUserId: { in: personIds } },
            select: {
                id: true,
                contactUserId: true,
                messages: {
                    orderBy: { createdAt: 'asc' },
                    select: {
                        id: true, content: true, createdAt: true, senderId: true,
                        sender: { select: { name: true, username: true, avatarSeed: true, image: true } }
                    }
                }
            }
        });
        const threads = new Map<string, RequestThread>();
        for (const c of conversations) {
            if (c.contactUserId) threads.set(c.contactUserId, { conversationId: c.id, messages: c.messages });
        }
        return threads;
    },

    /** Block or unblock. Group chats: only the team. Direct chats: either person, except people who administer a group the blocker is in. */
    async blockConversation(conversationId: string, userId: string, isBlocked: boolean): Promise<void> {
        try {
            const access = await MessageService.canAccess(conversationId, userId);
            if (!access) throw new ActionError('NOT_FOUND');

            if (access.kind === 'GROUP') {
                if (!access.viewerIsTeam) throw new ActionError('FORBIDDEN');
            } else if (isBlocked) {
                const other = await prisma.user.findFirst({
                    where: { conversations: { some: { id: conversationId } }, id: { not: userId } },
                    select: { id: true }
                });
                if (other) {
                    const sharedAdminMembership = await prisma.membership.findFirst({
                        where: {
                            userId: other.id,
                            role: { in: TEAM_ROLES },
                            group: { members: { some: { userId } } }
                        },
                        select: { id: true }
                    });
                    if (sharedAdminMembership) throw new ActionError('FORBIDDEN'); // Cannot block admins/owners of shared groups
                }
            }

            await prisma.conversation.update({ where: { id: conversationId }, data: { isBlocked } });
        } catch (error) {
            fail(error, 'blockConversation', 'UPDATE_FAILED');
        }
    }
};
