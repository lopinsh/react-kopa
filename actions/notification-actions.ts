'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from '@/types/actions';

/**
 * Fetch notifications for the current user.
 */
export async function getNotifications() {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        return notifications;
    } catch (error) {
        console.error('[getNotifications] Error:', error);
        return [];
    }
}

/**
 * Mark a notification as read.
 */
export async function markAsRead(id: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        await prisma.notification.update({
            where: {
                id,
                userId: session.user.id // Ensure user owns the notification
            },
            data: { read: true }
        });

        // Revalidate where notifications are shown (usually layout/nav)
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('[markAsRead] Error:', error);
        return { success: false, error: 'UPDATE_FAILED' };
    }
}

/**
 * Mark all notifications as read for the current user.
 */
export async function markAllAsRead(): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        await prisma.notification.updateMany({
            where: {
                userId: session.user.id,
                read: false
            },
            data: { read: true }
        });

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('[markAllAsRead] Error:', error);
        return { success: false, error: 'UPDATE_FAILED' };
    }
}

/**
 * Internal utility to create a notification.
 * This is NOT an exported server action for client use (no 'use server' needed if used only from other actions).
 * But we keep it in the same file for organization.
 */
export async function createNotification({
    userId,
    type,
    translationKey,
    args,
    link
}: {
    userId: string;
    type: 'JOIN_REQUEST' | 'REQUEST_APPROVED' | 'NEW_POST' | 'NEW_EVENT' | 'APPLICATION_RECEIVED' | 'APPLICATION_ACCEPTED' | 'INQUIRY_RECEIVED';
    translationKey: string;
    args?: Record<string, string | number>;
    link?: string;
}) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title: type, // Store the raw type in the title since we will use dynamic `title_${type}` in the frontend.
                message: JSON.stringify({ key: translationKey, args }),
                link,
            }
        });

        // Trigger real-time event for this specific user
        const { pusherServer } = await import('@/lib/pusher');
        await pusherServer.trigger(
            `private-user-${userId}`,
            'new-notification',
            notification
        );

        return notification;
    } catch (error) {
        console.error('[createNotification] Error:', error);
        return null;
    }
}
