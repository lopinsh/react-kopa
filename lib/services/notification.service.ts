import { prisma } from '@/lib/prisma';
import { TaxonomyResolver } from './taxonomy-resolver.service';
import { groupCategoryTitle } from './message.service';

export type NotificationPayload = {
    userId: string;
    type: 'JOIN_REQUEST' | 'REQUEST_APPROVED' | 'NEW_POST' | 'NEW_EVENT' | 'APPLICATION_RECEIVED' | 'APPLICATION_ACCEPTED' | 'INQUIRY_RECEIVED' | 'APPLICATION_INQUIRY' | 'TAG_MERGED' | 'GROUP_HIDDEN' | 'GROUP_DELETED' | 'EVENT_REQUEST' | 'EVENT_APPROVED' | 'EVENT_DECLINED' | 'EVENT_LET_IN' | 'EVENT_SPOT_FREED' | 'EVENT_ROOM_AGAIN' | 'EVENT_NOW_OPEN' | 'EVENT_CANCELLED' | 'OWNERSHIP_TRANSFERRED';
    translationKey: string;
    args?: Record<string, string | number>;
    link?: string;
};

const EXCERPT_MAX = 160;

/** Notifications show a preview of what someone wrote, not the whole text. */
function withShortExcerpt(args: NotificationPayload['args']): NotificationPayload['args'] {
    if (!args || typeof args.excerpt !== 'string') return args;
    const text = args.excerpt.replace(/\s+/g, ' ').trim();
    return { ...args, excerpt: text.length > EXCERPT_MAX ? `${text.slice(0, EXCERPT_MAX - 1).trimEnd()}…` : text };
}

export const NotificationService = {
    /**
     * Fetches the most recent notifications for a user.
     */
    async getUserNotifications(userId: string, limit: number = 10, locale: string = 'lv') {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        // The group a notification is about is named by its link: the group page itself, or a conversation
        // that started from a group. Resolved here so the list can show "Group · Category" like the inbox.
        const groupLink = /^\/([^/?#]+)\/group\/([^/?#]+)/;
        const conversationLink = /^\/messages\?c=([^&#]+)/;
        const slugs = new Set<string>();
        const conversationIds = new Set<string>();
        for (const n of notifications) {
            const g = n.link ? groupLink.exec(n.link) : null;
            if (g) slugs.add(g[2]);
            const c = n.link ? conversationLink.exec(n.link) : null;
            if (c) conversationIds.add(c[1]);
        }

        const groupSelect = {
            id: true,
            name: true,
            slug: true,
            category: { include: TaxonomyResolver.getInclude(locale) },
            tags: {
                where: { level: 2 },
                take: 1,
                select: { slug: true, titles: { where: { lang: locale }, select: { title: true } } },
            },
        } as const;
        const [groups, conversations] = await Promise.all([
            slugs.size > 0 ? prisma.group.findMany({ where: { slug: { in: [...slugs] }, hiddenAt: null }, select: groupSelect }) : [],
            conversationIds.size > 0
                ? prisma.conversation.findMany({
                    where: { id: { in: [...conversationIds] }, originGroupId: { not: null } },
                    select: { id: true, originGroup: { select: groupSelect } },
                })
                : [],
        ]);

        const describe = (g: (typeof groups)[number]) => {
            const resolved = TaxonomyResolver.resolve(g.category);
            return { name: g.name, categoryTitle: groupCategoryTitle(resolved, g.tags), l1Slug: resolved.l1Slug, slug: g.slug };
        };
        const byConversation = new Map(
            conversations.flatMap((c) => (c.originGroup ? [[c.id, describe(c.originGroup)] as const] : []))
        );
        const byPath = new Map(groups.map((g) => { const d = describe(g); return [`${d.l1Slug}/${d.slug}`, d] as const; }));

        return notifications.map((n) => {
            const g = n.link ? groupLink.exec(n.link) : null;
            const c = n.link ? conversationLink.exec(n.link) : null;
            const found = g ? byPath.get(`${g[1]}/${g[2]}`) : c ? byConversation.get(c[1]) : undefined;
            return { ...n, group: found ? { name: found.name, categoryTitle: found.categoryTitle } : null };
        });
    },

    /**
     * Creates a notification and emits it to the user channel.
     */
    async createNotification(payload: NotificationPayload) {
        const notification = await prisma.notification.create({
            data: {
                userId: payload.userId,
                type: payload.type,
                title: payload.type,
                message: JSON.stringify({ key: payload.translationKey, args: withShortExcerpt(payload.args) }),
                link: payload.link,
            },
        });

        const { triggerRealtime } = await import('@/lib/pusher');
        await triggerRealtime(`private-user-${payload.userId}`, 'new-notification', notification);

        return notification;
    },

    /**
     * Like createNotification, but a failure is only logged: a saved change must not be reported
     * as failed because its notification could not be sent. Not a Server Action on purpose.
     */
    async notify(payload: NotificationPayload) {
        try {
            return await NotificationService.createNotification(payload);
        } catch (error) {
            console.error('[NotificationService.notify] Error:', error);
            return null;
        }
    },

    /**
     * The same notification for many people: one insert, then one realtime event per person.
     */
    async createForUsers(userIds: string[], payload: Omit<NotificationPayload, 'userId'>) {
        if (userIds.length === 0) return [];
        const message = JSON.stringify({ key: payload.translationKey, args: withShortExcerpt(payload.args) });
        const notifications = await prisma.notification.createManyAndReturn({
            data: userIds.map(userId => ({
                userId,
                type: payload.type,
                title: payload.type,
                message,
                link: payload.link,
            })),
        });

        const { triggerRealtime } = await import('@/lib/pusher');
        await Promise.all(notifications.map(n => triggerRealtime(`private-user-${n.userId}`, 'new-notification', n)));

        return notifications;
    },

    /**
     * Marks a single notification as read, verifying userId ownership.
     */
    async markAsReadForUser(notificationId: string, userId: string) {
        return await prisma.notification.update({
            where: { id: notificationId, userId },
            data: { read: true },
        });
    },

    /**
     * Marks all unread notifications as read for the given user.
     */
    async markAllAsReadForUser(userId: string) {
        return await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
    },

    /**
     * Marks a notification as read.
     * @deprecated Use markAsReadForUser for ownership-checked mutations.
     */
    async markAsRead(notificationId: string) {
        return await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true },
        });
    },

    /**
     * Deletes a notification.
     */
    async deleteNotification(notificationId: string) {
        return await prisma.notification.delete({
            where: { id: notificationId },
        });
    },
};

