'use server';

import { auth } from '@/lib/auth';
import type { ActionResponse } from '@/types/actions';
import { NotificationService, type NotificationAudience } from '@/lib/services/notification.service';

/**
 * Fetch notifications for the current user.
 */
export async function getNotifications(locale: string): Promise<ActionResponse<Awaited<ReturnType<typeof NotificationService.getUserNotifications>>>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const notifications = await NotificationService.getUserNotifications(session.user.id, 20, locale);
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
        return { success: true };
    } catch (error) {
        console.error('[markAsRead] Error:', error);
        return { success: false, error: 'UPDATE_FAILED' };
    }
}

/**
 * Mark all notifications of one tab (personal or admin) as read for the current user.
 */
export async function markAllAsRead(audience: NotificationAudience = 'USER'): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };
    if (audience !== 'USER' && audience !== 'ADMIN') return { success: false, error: 'VALIDATION_FAILED' };

    try {
        await NotificationService.markAllAsReadForUser(session.user.id, audience);
        return { success: true };
    } catch (error) {
        console.error('[markAllAsRead] Error:', error);
        return { success: false, error: 'UPDATE_FAILED' };
    }
}
