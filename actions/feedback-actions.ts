'use server';

import { revalidatePath } from 'next/cache';
import type { ActionResponse } from '@/types/actions';
import { handleActionError, requireSiteAdmin } from '@/lib/action-utils';
import { FeedbackService, type FeedbackItem } from '@/lib/services/feedback.service';
import type { CreateFeedbackInput, ReplyFeedbackInput, UpdateFeedbackInput } from '@/lib/validations/feedback';
import { NotificationService } from '@/lib/services/notification.service';

export async function createFeedback(input: CreateFeedbackInput): Promise<ActionResponse<FeedbackItem>> {
    const check = await requireSiteAdmin();
    if (!check.success) return { success: false, error: check.error };
    try {
        const result = await FeedbackService.create(check.userId, input);
        await NotificationService.notifyAdmins({
            type: 'ADMIN_FEEDBACK',
            args: { excerpt: input.text },
            link: '/admin/feedback',
            exceptUserId: check.userId,
        });
        revalidatePath('/[locale]/admin/feedback', 'page');
        return { success: true, data: result };
    } catch (error) {
        return handleActionError(error, 'CREATE_FAILED');
    }
}

/** Notes on the page being viewed (path without locale, with or without query). */
export async function getPageFeedback(path: string): Promise<ActionResponse<FeedbackItem[]>> {
    const check = await requireSiteAdmin();
    if (!check.success) return { success: false, error: check.error };
    try {
        const result = await FeedbackService.listForPath(check.userId, path);
        return { success: true, data: result };
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}

export async function updateFeedback(id: string, input: UpdateFeedbackInput): Promise<ActionResponse<FeedbackItem>> {
    const check = await requireSiteAdmin();
    if (!check.success) return { success: false, error: check.error };
    try {
        const result = await FeedbackService.update(check.userId, id, input);
        revalidatePath('/[locale]/admin/feedback', 'page');
        return { success: true, data: result };
    } catch (error) {
        return handleActionError(error, 'UPDATE_FAILED');
    }
}

/** Adds a message to the note's thread; the original text and earlier replies stay as they are. */
export async function replyToFeedback(id: string, input: ReplyFeedbackInput): Promise<ActionResponse<FeedbackItem>> {
    const check = await requireSiteAdmin();
    if (!check.success) return { success: false, error: check.error };
    try {
        const result = await FeedbackService.reply(check.userId, id, input);
        revalidatePath('/[locale]/admin/feedback', 'page');
        return { success: true, data: result };
    } catch (error) {
        return handleActionError(error, 'UPDATE_FAILED');
    }
}

export async function deleteFeedback(id: string): Promise<ActionResponse> {
    const check = await requireSiteAdmin();
    if (!check.success) return { success: false, error: check.error };
    try {
        await FeedbackService.remove(check.userId, id);
        revalidatePath('/[locale]/admin/feedback', 'page');
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}

/** Empties the Completed tab: deletes every DONE / WONT_DO note with its replies. */
export async function purgeCompletedFeedback(): Promise<ActionResponse<{ count: number }>> {
    const check = await requireSiteAdmin();
    if (!check.success) return { success: false, error: check.error };
    try {
        const result = await FeedbackService.purgeClosed(check.userId);
        revalidatePath('/[locale]/admin/feedback', 'page');
        return { success: true, data: result };
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}

/** Open notes per page, for the panel's "Citās lapās" list. */
export async function getFeedbackPages(): Promise<ActionResponse<{ path: string; count: number }[]>> {
    const check = await requireSiteAdmin();
    if (!check.success) return { success: false, error: check.error };
    try {
        return { success: true, data: await FeedbackService.openCountsByPath(check.userId) };
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}
