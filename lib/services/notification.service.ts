import { prisma } from '@/lib/prisma';

export type NotificationPayload = {
    userId: string;
    type: 'JOIN_REQUEST' | 'REQUEST_APPROVED' | 'NEW_POST' | 'NEW_EVENT' | 'APPLICATION_RECEIVED' | 'APPLICATION_ACCEPTED' | 'INQUIRY_RECEIVED' | 'APPLICATION_INQUIRY' | 'TAG_MERGED' | 'GROUP_HIDDEN' | 'EVENT_REQUEST' | 'EVENT_APPROVED' | 'EVENT_DECLINED' | 'EVENT_LET_IN' | 'EVENT_SPOT_FREED' | 'EVENT_ROOM_AGAIN' | 'EVENT_CANCELLED';
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
    async getUserNotifications(userId: string, limit: number = 10) {
        return await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
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

