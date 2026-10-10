'use server';

import { cookies } from 'next/headers';
import { revalidatePath, updateTag } from 'next/cache';
import { auth } from '@/lib/auth';
import type { ActionResponse } from '@/types/actions';
import { handleActionError } from '@/lib/action-utils';
import {
    MessageOverrideService,
    MESSAGE_OVERRIDES_TAG,
    type TranslationEntry,
    type TranslationSearchHit,
} from '@/lib/services/message-override.service';
import { TRANSLATE_COOKIE } from '@/lib/translate-mode/marker';
import { FEEDBACK_COOKIE } from '@/lib/feedback/server';

type AdminCheck = { ok: true; adminId: string } | { ok: false; error: 'UNAUTHORIZED' | 'UNAUTHORIZED_ADMIN' };

async function requireAdmin(): Promise<AdminCheck> {
    const session = await auth();
    if (!session?.user?.id) return { ok: false, error: 'UNAUTHORIZED' };
    if (session.user.role !== 'ADMIN') return { ok: false, error: 'UNAUTHORIZED_ADMIN' };
    return { ok: true, adminId: session.user.id };
}

export async function setTranslateMode(enabled: boolean): Promise<ActionResponse> {
    const check = await requireAdmin();
    if (!check.ok) return { success: false, error: check.error };

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
    const check = await requireAdmin();
    if (!check.ok) return { success: false, error: check.error };
    try {
        const result = await MessageOverrideService.getEntry(check.adminId, key);
        return result.success ? { success: true, data: result.data } : result;
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}

export async function searchTranslations(query: string): Promise<ActionResponse<TranslationSearchHit[]>> {
    const check = await requireAdmin();
    if (!check.ok) return { success: false, error: check.error };
    try {
        const result = await MessageOverrideService.search(check.adminId, query);
        return result.success ? { success: true, data: result.data } : result;
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}

/** Proposes a text. The live site only changes when an admin approves it. */
export async function suggestTranslation(input: { key: string; lv: string; en: string }): Promise<ActionResponse> {
    const check = await requireAdmin();
    if (!check.ok) return { success: false, error: check.error };
    try {
        const result = await MessageOverrideService.suggestEntry(check.adminId, input);
        if (!result.success) return result;

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'SAVE_FAILED');
    }
}

export async function approveSuggestion(id: string): Promise<ActionResponse> {
    const check = await requireAdmin();
    if (!check.ok) return { success: false, error: check.error };
    try {
        const result = await MessageOverrideService.approveSuggestion(check.adminId, id);
        if (!result.success) return result;

        updateTag(MESSAGE_OVERRIDES_TAG);
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'SAVE_FAILED');
    }
}

export async function rejectSuggestion(id: string): Promise<ActionResponse> {
    const check = await requireAdmin();
    if (!check.ok) return { success: false, error: check.error };
    try {
        const result = await MessageOverrideService.rejectSuggestion(check.adminId, id);
        if (!result.success) return result;

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'SAVE_FAILED');
    }
}
