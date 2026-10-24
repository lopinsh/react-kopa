'use server';

import { revalidatePath, updateTag } from 'next/cache';
import type { ActionResponse } from '@/types/actions';
import { handleActionError, requireSiteAdmin } from '@/lib/action-utils';
import {
    MessageOverrideService,
    MESSAGE_OVERRIDES_TAG,
    type TranslationEntry,
    type TranslationSearchHit,
} from '@/lib/services/message-override.service';
import { setAdminPanel } from './admin-panel-actions';
import type { MessageLang } from '@/lib/translate-mode/messages';
import { NotificationService } from '@/lib/services/notification.service';

/** Superseded by setAdminPanel; removed with the old toggles in the last R23-1 commit. */
export async function setTranslateMode(enabled: boolean): Promise<ActionResponse> {
    return setAdminPanel(enabled ? 'translate' : null);
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

/** Which of these keys (the marked texts on the page) still lack a language, for the Tulkot tab. */
export async function getMissingTranslations(keys: string[]): Promise<ActionResponse<{ key: string; langs: MessageLang[] }[]>> {
    const check = await requireSiteAdmin();
    if (!check.success) return { success: false, error: check.error };
    try {
        return { success: true, data: await MessageOverrideService.missingAmong(check.userId, keys) };
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}
