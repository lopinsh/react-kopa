'use server';

import { revalidatePath, updateTag } from 'next/cache';
import type { ActionResponse } from '@/types/actions';
import { handleActionError, requireSiteAdmin, requireSiteOwner } from '@/lib/action-utils';
import { ModerationService } from '@/lib/services/moderation.service';

export async function hideGroup(groupId: string, reason: string, locale: string): Promise<ActionResponse> {
    const admin = await requireSiteAdmin();
    if (!admin.success) return admin;

    try {
        const result = await ModerationService.hideGroup(groupId, admin.userId, reason);
        if (!result.success) return result;

        updateTag('groups');
        updateTag('events');
        revalidatePath(`/${locale}`, 'page');
        revalidatePath(`/${locale}/admin`, 'page');
        revalidatePath(`/${locale}/${result.data!.l1Slug}/group/${result.data!.slug}`, 'layout');
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}

export async function restoreGroup(groupId: string, locale: string): Promise<ActionResponse> {
    const admin = await requireSiteAdmin();
    if (!admin.success) return admin;

    try {
        const result = await ModerationService.restoreGroup(groupId, admin.userId);
        if (!result.success) return result;

        updateTag('groups');
        updateTag('events');
        revalidatePath(`/${locale}`, 'page');
        revalidatePath(`/${locale}/admin`, 'page');
        revalidatePath(`/${locale}/${result.data!.l1Slug}/group/${result.data!.slug}`, 'layout');
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}

export async function deleteHiddenGroup(groupId: string, reason: string, locale: string): Promise<ActionResponse> {
    const admin = await requireSiteOwner();
    if (!admin.success) return admin;

    try {
        const result = await ModerationService.deleteHiddenGroup(groupId, admin.userId, reason);
        if (!result.success) return result;

        updateTag('groups');
        updateTag('events');
        revalidatePath(`/${locale}`, 'page');
        revalidatePath(`/${locale}/admin`, 'page');
        revalidatePath(`/${locale}/${result.data!.l1Slug}/group/${result.data!.slug}`, 'layout');
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'DELETE_FAILED');
    }
}
