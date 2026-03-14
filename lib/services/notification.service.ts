import { prisma } from '@/lib/prisma';

export type NotificationPayload = {
    userId: string;
    type: 'JOIN_REQUEST' | 'REQUEST_APPROVED' | 'NEW_POST' | 'NEW_EVENT' | 'APPLICATION_RECEIVED' | 'APPLICATION_ACCEPTED' | 'INQUIRY_RECEIVED' | 'TAG_MERGED';
    translationKey: string;
    args?: Record<string, string | number>;
    link?: string;
};

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
                message: JSON.stringify({ key: payload.translationKey, args: payload.args }),
                link: payload.link,
            },
        });

        const { pusherServer } = await import('@/lib/pusher');
        await pusherServer.trigger(`private-user-${payload.userId}`, 'new-notification', notification);

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

