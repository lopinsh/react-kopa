'use server';

import { requireSiteAdmin } from '@/lib/action-utils';
import { revalidatePath, revalidateTag, updateTag } from 'next/cache';
import type { ActionResponse } from '@/types/actions';
import { AdminService } from '@/lib/services/admin.service';

export async function rejectWildcard(categoryId: string): Promise<ActionResponse> {
    const admin = await requireSiteAdmin();
    if (!admin.success) return admin;

    try {
        await AdminService.rejectWildcard(categoryId);
        revalidatePath('/[locale]/admin', 'page');
        revalidateTag('categories', 'max');
        revalidateTag('groups', 'max');
        return { success: true };
    } catch (error: unknown) {
        console.error('[rejectWildcard] Error:', error);
        if (error instanceof Error && error.message === 'CATEGORY_IN_USE') return { success: false, error: 'CATEGORY_IN_USE' };
        if (error instanceof Error && error.message === 'NOT_FOUND') return { success: false, error: 'NOT_FOUND' };
        return { success: false, error: 'ACTION_FAILED' };
    }
}

export async function suspendReportedGroup(reportId: string, groupId: string, reason: string, locale: string): Promise<ActionResponse> {
    const admin = await requireSiteAdmin();
    if (!admin.success) return admin;

    try {
        const result = await AdminService.suspendReportedGroup(groupId, reportId, admin.userId, reason);
        updateTag('groups');
        updateTag('events');
        revalidatePath(`/${locale}`, 'page');
        revalidatePath(`/${locale}/admin`, 'page');
        revalidatePath('/[locale]/admin/reports', 'page');
        revalidatePath(`/${locale}/${result.l1Slug}/group/${result.slug}`, 'layout');
        return { success: true };
    } catch (error) {
        console.error('[suspendReportedGroup] Error:', error);
        return { success: false, error: 'ACTION_FAILED' };
    }
}
