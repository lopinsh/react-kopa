'use server';

import { cookies } from 'next/headers';
import { revalidatePath, updateTag } from 'next/cache';
import type { ActionResponse } from '@/types/actions';
import { handleActionError, requireSiteAdmin } from '@/lib/action-utils';
import { THEME_CACHE_TAG, THEME_PREVIEW_COOKIE } from '@/lib/constants';
import { ThemeService } from '@/lib/services/theme.service';
import { themeInputSchema, type ThemeInput } from '@/lib/validations/theme';

async function clearPreviewCookie(): Promise<void> {
    (await cookies()).delete(THEME_PREVIEW_COOKIE);
}

/** The published theme changed: drop its cache entry and re-render every page. */
function themeChanged(): void {
    updateTag(THEME_CACHE_TAG);
    revalidatePath('/', 'layout');
}

/** Saves the admin's own preview and points their httpOnly cookie at it. Nobody else sees it. */
export async function savePreviewTheme(input: ThemeInput): Promise<ActionResponse> {
    const check = await requireSiteAdmin();
    if (!check.success) return { success: false, error: check.error };
    const parsed = themeInputSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };
    try {
        const res = await ThemeService.saveDraft(check.userId, parsed.data);
        if (!res.success) return res;
        if (!res.data) return { success: false, error: 'SAVE_FAILED' };
        (await cookies()).set(THEME_PREVIEW_COOKIE, res.data.id, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        });
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'SAVE_FAILED');
    }
}

/** Publishes the values sent from the Design page for everyone. */
export async function publishTheme(input: ThemeInput): Promise<ActionResponse> {
    const check = await requireSiteAdmin();
    if (!check.success) return { success: false, error: check.error };
    const parsed = themeInputSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };
    try {
        const res = await ThemeService.publish(check.userId, parsed.data);
        if (!res.success) return res;
        await clearPreviewCookie();
        themeChanged();
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'SAVE_FAILED');
    }
}

/** Publishes the admin's saved preview (the bar shown on every page while a preview is active). */
export async function publishPreviewTheme(): Promise<ActionResponse> {
    const check = await requireSiteAdmin();
    if (!check.success) return { success: false, error: check.error };
    const draftId = (await cookies()).get(THEME_PREVIEW_COOKIE)?.value;
    if (!draftId) return { success: false, error: 'NOT_FOUND' };
    try {
        const res = await ThemeService.publishDraft(check.userId, draftId);
        if (!res.success) return res;
        await clearPreviewCookie();
        themeChanged();
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'SAVE_FAILED');
    }
}

/** Throws the admin's preview away. */
export async function discardPreviewTheme(): Promise<ActionResponse> {
    const check = await requireSiteAdmin();
    if (!check.success) return { success: false, error: check.error };
    try {
        await ThemeService.discardDraft(check.userId);
        await clearPreviewCookie();
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}

/** Back to the "Pašreizējais" preset for everyone. */
export async function resetTheme(): Promise<ActionResponse> {
    const check = await requireSiteAdmin();
    if (!check.success) return { success: false, error: check.error };
    try {
        const res = await ThemeService.reset(check.userId);
        if (!res.success) return res;
        await clearPreviewCookie();
        themeChanged();
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'SAVE_FAILED');
    }
}
