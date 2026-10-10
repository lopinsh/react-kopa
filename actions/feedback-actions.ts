'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import type { ActionResponse } from '@/types/actions';
import { handleActionError } from '@/lib/action-utils';
import { FeedbackService, type FeedbackItem } from '@/lib/services/feedback.service';
import { FEEDBACK_COOKIE } from '@/lib/feedback/server';
import { TRANSLATE_COOKIE } from '@/lib/translate-mode/marker';
import type { CreateFeedbackInput, ReplyFeedbackInput, UpdateFeedbackInput } from '@/lib/validations/feedback';

type AdminCheck = { ok: true; adminId: string } | { ok: false; error: 'UNAUTHORIZED' | 'FORBIDDEN' };

async function requireAdmin(): Promise<AdminCheck> {
    const session = await auth();
    if (!session?.user?.id) return { ok: false, error: 'UNAUTHORIZED' };
    if (session.user.role !== 'ADMIN') return { ok: false, error: 'FORBIDDEN' };
    return { ok: true, adminId: session.user.id };
}

/** Switches feedback mode on or off. Turning it on turns translation mode off: both capture clicks on the page. */
export async function setFeedbackMode(enabled: boolean): Promise<ActionResponse> {
    const check = await requireAdmin();
    if (!check.ok) return { success: false, error: check.error };

    const cookieStore = await cookies();
    if (enabled) {
        cookieStore.set(FEEDBACK_COOKIE, '1', {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        });
        cookieStore.delete(TRANSLATE_COOKIE);
    } else {
        cookieStore.delete(FEEDBACK_COOKIE);
    }
    return { success: true };
}

export async function createFeedback(input: CreateFeedbackInput): Promise<ActionResponse<FeedbackItem>> {
    const check = await requireAdmin();
    if (!check.ok) return { success: false, error: check.error };
    try {
        const result = await FeedbackService.create(check.adminId, input);
        if (!result.success) return result;
        revalidatePath('/admin/feedback');
        return { success: true, data: result.data };
    } catch (error) {
        return handleActionError(error, 'CREATE_FAILED');
    }
}

/** Notes on the page being viewed (path without locale, with or without query). */
export async function getPageFeedback(path: string): Promise<ActionResponse<FeedbackItem[]>> {
    const check = await requireAdmin();
    if (!check.ok) return { success: false, error: check.error };
    try {
        const result = await FeedbackService.listForPath(check.adminId, path);
        return result.success ? { success: true, data: result.data } : result;
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}

export async function updateFeedback(id: string, input: UpdateFeedbackInput): Promise<ActionResponse<FeedbackItem>> {
    const check = await requireAdmin();
    if (!check.ok) return { success: false, error: check.error };
    try {
        const result = await FeedbackService.update(check.adminId, id, input);
        if (!result.success) return result;
        revalidatePath('/admin/feedback');
        return { success: true, data: result.data };
    } catch (error) {
        return handleActionError(error, 'UPDATE_FAILED');
    }
}

/** Adds a message to the note's thread; the original text and earlier replies stay as they are. */
export async function replyToFeedback(id: string, input: ReplyFeedbackInput): Promise<ActionResponse<FeedbackItem>> {
    const check = await requireAdmin();
    if (!check.ok) return { success: false, error: check.error };
    try {
        const result = await FeedbackService.reply(check.adminId, id, input);
        if (!result.success) return result;
        revalidatePath('/admin/feedback');
        return { success: true, data: result.data };
    } catch (error) {
        return handleActionError(error, 'UPDATE_FAILED');
    }
}

export async function deleteFeedback(id: string): Promise<ActionResponse> {
    const check = await requireAdmin();
    if (!check.ok) return { success: false, error: check.error };
    try {
        const result = await FeedbackService.remove(check.adminId, id);
        if (!result.success) return result;
        revalidatePath('/admin/feedback');
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}

/** Empties the Completed tab: deletes every DONE / WONT_DO note with its replies. */
export async function purgeCompletedFeedback(): Promise<ActionResponse<{ count: number }>> {
    const check = await requireAdmin();
    if (!check.ok) return { success: false, error: check.error };
    try {
        const result = await FeedbackService.purgeClosed(check.adminId);
        if (!result.success) return result;
        revalidatePath('/admin/feedback');
        return { success: true, data: result.data };
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}
