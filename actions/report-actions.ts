'use server';
import { auth } from '@/lib/auth';
import { ReportService } from '@/lib/services/report.service';
import { type ActionResponse } from '@/types/actions';
import { handleActionError } from '@/lib/action-utils';
import { isReportReason } from '@/lib/constants';
import { revalidatePath } from 'next/cache';

/** Resolves the signed-in site admin, or null. Reading and closing reports is for site admins only. */
async function getAdminId(): Promise<string | null> {
    const session = await auth();
    return session?.user?.id && session.user.role === 'ADMIN' ? session.user.id : null;
}

export async function createReport(data: {
    targetGroupId?: string;
    targetEventId?: string;
    reason: string;
}): Promise<ActionResponse<void>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'UNAUTHORIZED' };
    }
    // Only the known reasons are stored, so the admin list can always show them translated.
    if (!isReportReason(data.reason) || (!data.targetGroupId && !data.targetEventId)) {
        return { success: false, error: 'VALIDATION_FAILED' };
    }

    try {
        await ReportService.createReport({
            reporterId: session.user.id,
            targetGroupId: data.targetGroupId,
            targetEventId: data.targetEventId,
            reason: data.reason,
        });

        // Ensure path revalidation as per Action Consistency Law
        revalidatePath('/[locale]/admin/reports', 'page');
        return { success: true };
    } catch (error: unknown) {
        return handleActionError(error, 'REPORT_FAILED');
    }
}

export async function getReports() {
    if (!(await getAdminId())) return [];

    return ReportService.getPendingReports();
}

export async function resolveReport(reportId: string): Promise<ActionResponse<void>> {
    if (!(await getAdminId())) return { success: false, error: 'UNAUTHORIZED_ADMIN' };

    try {
        await ReportService.resolveReport(reportId);
        revalidatePath('/[locale]/admin/reports', 'page');
        return { success: true };
    } catch (error: unknown) {
        return handleActionError(error, 'RESOLUTION_FAILED');
    }
}

export async function deleteReportedContent(reportId: string): Promise<ActionResponse<void>> {
    if (!(await getAdminId())) return { success: false, error: 'UNAUTHORIZED_ADMIN' };

    try {
        await ReportService.deleteReportedContent(reportId);
        revalidatePath('/[locale]/admin/reports', 'page');
        return { success: true };
    } catch (error: unknown) {
        return handleActionError(error, 'DELETE_FAILED');
    }
}
