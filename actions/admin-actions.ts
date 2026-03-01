'use server';

import { auth } from '@/lib/auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import type { ActionResponse } from '@/types/actions';
import { AdminService, type WildcardWithDetails, type ReportWithDetails } from '@/lib/services/admin.service';

// Basic admin check
const isAdmin = async () => {
    const session = await auth();
    if (!session?.user?.email) return false;
    return session.user.email === 'admin@local' || session.user.email === 'owner@local';
};

export async function getPendingWildcards(): Promise<ActionResponse<{ wildcards: WildcardWithDetails[] }>> {
    if (!(await isAdmin())) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const wildcards = await AdminService.getPendingWildcards();
        return { success: true, data: { wildcards: wildcards as WildcardWithDetails[] } };
    } catch (error) {
        console.error('[getPendingWildcards] Error:', error);
        return { success: false, error: 'INTERNAL_SERVER_ERROR' };
    }
}

export async function approveWildcard(categoryId: string): Promise<ActionResponse> {
    if (!(await isAdmin())) return { success: false, error: 'UNAUTHORIZED' };

    try {
        await AdminService.approveWildcard(categoryId);
        revalidatePath('/admin', 'page');
        revalidateTag('categories', 'max');
        return { success: true };
    } catch (error) {
        console.error('[approveWildcard] Error:', error);
        return { success: false, error: 'ACTION_FAILED' };
    }
}

export async function rejectWildcard(categoryId: string): Promise<ActionResponse> {
    if (!(await isAdmin())) return { success: false, error: 'UNAUTHORIZED' };

    try {
        await AdminService.rejectWildcard(categoryId);
        revalidatePath('/admin', 'page');
        revalidateTag('categories', 'max');
        return { success: true };
    } catch (error: unknown) {
        console.error('[rejectWildcard] Error:', error);
        if (error instanceof Error && error.message === 'CATEGORY_IN_USE') return { success: false, error: 'CATEGORY_IN_USE' };
        return { success: false, error: 'ACTION_FAILED' };
    }
}

export async function getPendingReports(): Promise<ActionResponse<{ reports: ReportWithDetails[] }>> {
    if (!(await isAdmin())) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const reports = await AdminService.getPendingReports();
        return { success: true, data: { reports: reports as ReportWithDetails[] } };
    } catch (error) {
        console.error('[getPendingReports] Error:', error);
        return { success: false, error: 'INTERNAL_SERVER_ERROR' };
    }
}

export async function dismissReport(reportId: string): Promise<ActionResponse> {
    if (!(await isAdmin())) return { success: false, error: 'UNAUTHORIZED' };

    try {
        await AdminService.dismissReport(reportId);
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('[dismissReport] Error:', error);
        return { success: false, error: 'ACTION_FAILED' };
    }
}

export async function suspendReportedGroup(reportId: string, groupId: string): Promise<ActionResponse> {
    if (!(await isAdmin())) return { success: false, error: 'UNAUTHORIZED' };

    try {
        await AdminService.suspendReportedGroup(groupId, reportId);
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('[suspendReportedGroup] Error:', error);
        return { success: false, error: 'ACTION_FAILED' };
    }
}
