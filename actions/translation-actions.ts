'use server';

import { cookies } from 'next/headers';
import { revalidatePath, updateTag } from 'next/cache';
import type { ActionResponse } from '@/types/actions';
import { handleActionError, requireSiteAdmin } from '@/lib/action-utils';
import {
    MessageOverrideService,
    MESSAGE_OVERRIDES_TAG,
    type TranslationEntry,
    type TranslationSearchHit,
} from '@/lib/services/message-override.service';
import { TRANSLATE_COOKIE } from '@/lib/translate-mode/marker';
import { FEEDBACK_COOKIE } from '@/lib/feedback/server';
import { NotificationService } from '@/lib/services/notification.service';

export async function setTranslateMode(enabled: boolean): Promise<ActionResponse> {
    const check = await requireSiteAdmin();
    if (!check.success) return { success: false, error: check.error };

    const cookieStore = await cookies();
    if (enabled) {
        cookieStore.set(TRANSLATE_COOKIE, '1', {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        });
        // Both modes capture clicks on the page, so only one runs at a time.
        cookieStore.delete(FEEDBACK_COOKIE);
    } else {
        cookieStore.delete(TRANSLATE_COOKIE);
    }
    return { success: true };
}

export async function getTranslationEntry(key: string): Promise<ActionResponse<TranslationEntry>> {
    const check = await requireSiteAdmin();
    if (!check.success) return { success: false, error: check.error };
    try {
        const result = await MessageOverrideService.getEntry(check.userId, key);
        return { success: true, data: result };
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}

export async function searchTranslations(query: string): Promise<ActionResponse<TranslationSearchHit[]>> {
    const check = await requireSiteAdmin();
    if (!check.success) return { success: false, error: check.error };
    try {
        const result = await MessageOverrideService.search(check.userId, query);
        return { success: true, data: result };
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}

/** Proposes a text. The live site only changes when an admin approves it. */
export async function suggestTranslation(input: { key: string; lv: string; en: string }): Promise<ActionResponse> {
    const check = await requireSiteAdmin();
    if (!check.success) return { success: false, error: check.error };
    try {
        const result = await MessageOverrideService.suggestEntry(check.userId, input);

        // Saving the live text only withdraws a suggestion: nothing new for the other admins.
        if (result?.suggested) {
            await NotificationService.notifyAdmins({
                type: 'ADMIN_SUGGESTION',
                args: { title: input.key },
                link: '/admin/translations',
                exceptUserId: check.userId,
            });
        }

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'SAVE_FAILED');
    }
}

/** `value` is the suggested text the admin approved; a suggestion changed since then is NOT_FOUND. */
export async function approveSuggestion(id: string, value: string): Promise<ActionResponse> {
    const check = await requireSiteAdmin();
    if (!check.success) return { success: false, error: check.error };
    try {
        await MessageOverrideService.approveSuggestion(check.userId, id, value);

        updateTag(MESSAGE_OVERRIDES_TAG);
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'SAVE_FAILED');
    }
}

export async function rejectSuggestion(id: string, value: string): Promise<ActionResponse> {
    const check = await requireSiteAdmin();
    if (!check.success) return { success: false, error: check.error };
    try {
        await MessageOverrideService.rejectSuggestion(check.userId, id, value);

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'SAVE_FAILED');
    }
}
