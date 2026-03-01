import { prisma } from '@/lib/prisma';

export const NotificationService = {
    /**
     * Fetches the most recent notifications for a user.
     */
    async getUserNotifications(userId: string, limit: number = 10) {
        return await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    },

    /**
     * Marks a notification as read.
     */
    async markAsRead(notificationId: string) {
        return await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true }
        });
    },

    /**
     * Deletes a notification.
     */
    async deleteNotification(notificationId: string) {
        return await prisma.notification.delete({
            where: { id: notificationId }
        });
    }
};
