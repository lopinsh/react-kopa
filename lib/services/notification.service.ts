import { prisma } from '@/lib/prisma';
import { resolveNotificationGroups } from './notification-groups';
import type { NotificationView } from '@/lib/types/own-area';
import { isSiteAdmin } from '@/lib/site-role';
import { getSiteRole } from './site-role.service';

export type NotificationAudience = 'USER' | 'ADMIN';

/** Things that need a site admin's attention. They go to every site admin, in the bell's admin tab. */
export type AdminNotificationPayload = {
    type: 'ADMIN_REPORT' | 'ADMIN_TAG_PENDING' | 'ADMIN_SUGGESTION' | 'ADMIN_FEEDBACK' | 'ADMIN_GROUP_HIDDEN' | 'ADMIN_CITY_PENDING';
    args?: Record<string, string | number>;
    link: string;
    /** The admin who caused it already knows; they are left out. */
    exceptUserId?: string;
};

export type NotificationPayload = {
    userId: string;
    type: 'JOIN_REQUEST' | 'REQUEST_APPROVED' | 'NEW_POST' | 'NEW_EVENT' | 'APPLICATION_RECEIVED' | 'APPLICATION_ACCEPTED' | 'INQUIRY_RECEIVED' | 'APPLICATION_INQUIRY' | 'TAG_MERGED' | 'GROUP_HIDDEN' | 'GROUP_DELETED' | 'EVENT_REQUEST' | 'EVENT_APPROVED' | 'EVENT_DECLINED' | 'EVENT_LET_IN' | 'EVENT_SPOT_FREED' | 'EVENT_ROOM_AGAIN' | 'EVENT_NOW_OPEN' | 'EVENT_CANCELLED' | 'OWNERSHIP_TRANSFERRED' | 'ADMIN_GRANTED' | 'ADMIN_REVOKED' | 'CITY_APPROVED' | 'CITY_REJECTED' | 'APPLICATION_DECLINED';
    translationKey: string;
    args?: Record<string, string | number>;
    link?: string;
};

const EXCERPT_MAX = 160;

/** One bell row: the newest notification of its kind, and how many other unread ones of that kind it stands for. */
export type NotificationRow<T extends { id: string }> = T & {
    /** Ids this row stands for: just its own, or every unread notification of the same type and target. */
    ids: string[];
    /** How many unread ones are folded in besides the one shown. */
    moreCount: number;
};

/**
 * Unread notifications with the same audience, type and target (the link) become one row: the newest one,
 * placed where it was. Read ones are never folded, and neither is a lone unread one. Input is newest first.
 */
function groupUnread<T extends { id: string; read: boolean; audience: string; type: string; link: string | null }>(items: T[]): NotificationRow<T>[] {
    const keyOf = (n: T) => `${n.audience}|${n.type}|${n.link ?? ''}`;
    const unreadIds = new Map<string, string[]>();
    for (const n of items) {
        if (n.read) continue;
        const key = keyOf(n);
        unreadIds.set(key, [...(unreadIds.get(key) ?? []), n.id]);
    }
    const seen = new Set<string>();
    const rows: NotificationRow<T>[] = [];
    for (const n of items) {
        if (n.read) {
            rows.push({ ...n, ids: [n.id], moreCount: 0 });
            continue;
        }
        const key = keyOf(n);
        if (seen.has(key)) continue;
        seen.add(key);
        const ids = unreadIds.get(key) ?? [n.id];
        rows.push({ ...n, ids, moreCount: ids.length - 1 });
    }
    return rows;
}

/** Notifications show a preview of what someone wrote, not the whole text. */
function withShortExcerpt(args: NotificationPayload['args']): NotificationPayload['args'] {
    if (!args || typeof args.excerpt !== 'string') return args;
    const text = args.excerpt.replace(/\s+/g, ' ').trim();
    return { ...args, excerpt: text.length > EXCERPT_MAX ? `${text.slice(0, EXCERPT_MAX - 1).trimEnd()}…` : text };
}

export const NotificationService = {
    /** Links → the group each is about (see `resolveNotificationGroups`). */
    resolveGroups: resolveNotificationGroups,

    /**
     * One tab's notifications, newest first: `take` rows and whether more exist. Admin rows only for someone who is a site admin
     * right now. Unread ones of the same type and target fold into one row.
     */
    async list(userId: string, opts: { audience: NotificationAudience; take: number; skip?: number; locale: string }): Promise<{ rows: NotificationView[]; hasMore: boolean }> {
        if (opts.audience === 'ADMIN' && !isSiteAdmin(await getSiteRole(userId))) return { rows: [], hasMore: false };
        const found = await prisma.notification.findMany({
            where: { userId, audience: opts.audience },
            orderBy: { createdAt: 'desc' },
            take: opts.take + 1,
            skip: opts.skip ?? 0,
        });
        const page = found.slice(0, opts.take);
        const groups = await resolveNotificationGroups(page.map((n) => n.link), opts.locale);
        const rows = groupUnread(page.map((n) => ({ ...n, audience: opts.audience, group: (n.link && groups.get(n.link)) || null })));
        return {
            hasMore: found.length > opts.take,
            rows: rows.map((n): NotificationView => ({
                id: n.id, ids: n.ids, moreCount: n.moreCount, type: n.type, message: n.message, link: n.link,
                read: n.read, audience: n.audience, createdAt: n.createdAt, group: n.group,
            })),
        };
    },

    /** Unread notifications per tab; the admin tab counts only for a site admin. One query. */
    async getUnreadCounts(userId: string, knownRole?: string | null): Promise<{ user: number; admin: number }> {
        const [grouped, role] = await Promise.all([
            prisma.notification.groupBy({ by: ['audience'], where: { userId, read: false }, _count: true }),
            knownRole !== undefined ? knownRole : getSiteRole(userId),
        ]);
        const countOf = (audience: NotificationAudience) => grouped.find((g) => g.audience === audience)?._count ?? 0;
        return { user: countOf('USER'), admin: isSiteAdmin(role) ? countOf('ADMIN') : 0 };
    },

    /**
     * Creates a notification and emits it to the user channel.
     */
    async createNotification(payload: NotificationPayload) {
        const notification = await prisma.notification.create({
            data: {
                userId: payload.userId,
                type: payload.type,
                message: JSON.stringify({ key: payload.translationKey, args: withShortExcerpt(payload.args) }),
                link: payload.link,
            },
        });

        const { triggerRealtime } = await import('@/lib/pusher');
        await triggerRealtime(`private-user-${payload.userId}`, 'new-notification', notification);

        return notification;
    },

    /**
     * One admin notification for every site admin (except `exceptUserId`). A failure is only logged:
     * the change that caused it must not be reported as failed.
     */
    async notifyAdmins(payload: AdminNotificationPayload) {
        try {
            const admins = await prisma.user.findMany({
                where: { role: { in: ['ADMIN', 'OWNER'] }, ...(payload.exceptUserId ? { id: { not: payload.exceptUserId } } : {}) },
                select: { id: true },
            });
            if (admins.length === 0) return [];
            const message = JSON.stringify({ args: withShortExcerpt(payload.args) });
            const notifications = await prisma.notification.createManyAndReturn({
                data: admins.map((admin) => ({
                    userId: admin.id,
                    type: payload.type,
                    message,
                    link: payload.link,
                    audience: 'ADMIN',
                })),
            });
            const { triggerRealtime } = await import('@/lib/pusher');
            await Promise.all(notifications.map((n) => triggerRealtime(`private-user-${n.userId}`, 'new-notification', n)));
            return notifications;
        } catch (error) {
            console.error('[NotificationService.notifyAdmins] Error:', error);
            return [];
        }
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
                message,
                link: payload.link,
            })),
        });

        const { triggerRealtime } = await import('@/lib/pusher');
        await Promise.all(notifications.map(n => triggerRealtime(`private-user-${n.userId}`, 'new-notification', n)));

        return notifications;
    },

    /**
     * Marks several notifications (one grouped bell row) as read, verifying userId ownership.
     */
    async markManyAsReadForUser(notificationIds: string[], userId: string) {
        return await prisma.notification.updateMany({
            where: { id: { in: notificationIds }, userId },
            data: { read: true },
        });
    },

    /**
     * Marks all unread notifications of one tab (personal or admin) as read for the given user.
     */
    async markAllAsReadForUser(userId: string, audience: NotificationAudience = 'USER') {
        return await prisma.notification.updateMany({
            where: { userId, read: false, audience },
            data: { read: true },
        });
    },

};

