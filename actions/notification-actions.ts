'use server';

import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { ActionResponse } from '@/types/actions';
import { NotificationService, type NotificationPayload } from '@/lib/services/notification.service';

/**
 * Fetch notifications for the current user.
 */
export async function getNotifications(): Promise<ActionResponse<Awaited<ReturnType<typeof NotificationService.getUserNotifications>>>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const notifications = await NotificationService.getUserNotifications(session.user.id, 20);
        return { success: true, data: notifications };
    } catch (error) {
        console.error('[getNotifications] Error:', error);
        return { success: false, error: 'ACTION_FAILED' };
    }
}

/**
 * Mark a notification as read.
 */
export async function markAsRead(id: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        await NotificationService.markAsReadForUser(id, session.user.id);
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
        await NotificationService.markAllAsReadForUser(session.user.id);
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('[markAllAsRead] Error:', error);
        return { success: false, error: 'UPDATE_FAILED' };
    }
}

/**
 * Internal utility to create a notification with Pusher delivery.
 * Called from other actions (e.g. group-actions.ts) after mutations.
 * Delegates all DB work to NotificationService.
 */
export async function createNotification(payload: NotificationPayload) {
    try {
        return await NotificationService.createNotification(payload);
    } catch (error) {
        console.error('[createNotification] Error:', error);
        return null;
    }
}
