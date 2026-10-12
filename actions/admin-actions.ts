'use server';

import { auth } from '@/lib/auth';
import { revalidatePath, revalidateTag, updateTag } from 'next/cache';
import type { ActionResponse } from '@/types/actions';
import { AdminService } from '@/lib/services/admin.service';
import { isSiteAdmin } from '@/lib/site-role';

const isAdmin = async () => {
    const session = await auth();
    if (!session?.user?.id) return false;
    return isSiteAdmin(session.user.role);
};

export async function rejectWildcard(categoryId: string): Promise<ActionResponse> {
    if (!(await isAdmin())) return { success: false, error: 'UNAUTHORIZED_ADMIN' };

    try {
        await AdminService.rejectWildcard(categoryId);
        revalidatePath('/admin', 'page');
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
    if (!(await isAdmin())) return { success: false, error: 'UNAUTHORIZED_ADMIN' };

    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED_ADMIN' };
        const result = await AdminService.suspendReportedGroup(groupId, reportId, session.user.id, reason);
        if (!result.success) return result;
        updateTag('groups');
        updateTag('events');
        revalidatePath(`/${locale}`, 'page');
        revalidatePath(`/${locale}/discover`, 'page');
        revalidatePath(`/${locale}/admin`, 'page');
        revalidatePath('/[locale]/admin/reports', 'page');
        revalidatePath(`/${locale}/${result.data!.l1Slug}/group/${result.data!.slug}`, 'layout');
        return { success: true };
    } catch (error) {
        console.error('[suspendReportedGroup] Error:', error);
        return { success: false, error: 'ACTION_FAILED' };
    }
}
