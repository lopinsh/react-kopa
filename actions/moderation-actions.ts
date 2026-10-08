'use server';

import { auth } from '@/lib/auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import type { ActionResponse } from '@/types/actions';
import { handleActionError } from '@/lib/action-utils';
import { ModerationService } from '@/lib/services/moderation.service';

export async function hideGroup(groupId: string, reason: string, locale: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };
    if (session.user.role !== 'ADMIN') return { success: false, error: 'UNAUTHORIZED_ADMIN' };

    try {
        const result = await ModerationService.hideGroup(groupId, session.user.id, reason);
        if (!result.success) return result;

        revalidateTag('groups', 'max');
        revalidateTag('events', 'max');
        revalidatePath(`/${locale}`, 'page');
        revalidatePath(`/${locale}/discover`, 'page');
        revalidatePath(`/${locale}/admin`, 'page');
        revalidatePath(`/${locale}/${result.data!.l1Slug}/group/${result.data!.slug}`, 'layout');
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}

export async function restoreGroup(groupId: string, locale: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };
    if (session.user.role !== 'ADMIN') return { success: false, error: 'UNAUTHORIZED_ADMIN' };

    try {
        const result = await ModerationService.restoreGroup(groupId, session.user.id);
        if (!result.success) return result;

        revalidateTag('groups', 'max');
        revalidateTag('events', 'max');
        revalidatePath(`/${locale}`, 'page');
        revalidatePath(`/${locale}/discover`, 'page');
        revalidatePath(`/${locale}/admin`, 'page');
        revalidatePath(`/${locale}/${result.data!.l1Slug}/group/${result.data!.slug}`, 'layout');
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}
