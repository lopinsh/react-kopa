'use server';

import { auth } from '@/lib/auth';
import type { ActionResponse } from '@/types/actions';
import { validateActionData } from '@/lib/action-utils';
import { notificationIdsSchema, notificationListSchema } from '@/lib/validations/notification';
import { NotificationService, type NotificationAudience } from '@/lib/services/notification.service';
import type { NotificationView } from '@/lib/types/own-area';

/**
 * The newest notifications of one tab for the current user (the bell's dropdown).
 */
export async function getNotifications(locale: string, input: { audience: NotificationAudience; take: number }): Promise<ActionResponse<{ rows: NotificationView[]; hasMore: boolean }>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };
    const valid = await validateActionData(notificationListSchema, input);
    if (!valid.success) return valid;

    try {
        const list = await NotificationService.list(session.user.id, { ...valid.data, locale });
        return { success: true, data: list };
    } catch (error) {
        console.error('[getNotifications] Error:', error);
        return { success: false, error: 'ACTION_FAILED' };
    }
}

/**
 * Mark every notification of one grouped bell row as read.
 */
export async function markManyAsRead(ids: string[]): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };
    const valid = await validateActionData(notificationIdsSchema, { ids });
    if (!valid.success) return valid;

    try {
        await NotificationService.markManyAsReadForUser(valid.data.ids, session.user.id);
        return { success: true };
    } catch (error) {
        console.error('[markManyAsRead] Error:', error);
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
