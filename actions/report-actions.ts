'use server';
import { auth } from '@/lib/auth';
import { ReportService } from '@/lib/services/report.service';
import { ActionError, type ActionResponse } from '@/types/actions';
import { revalidatePath } from 'next/cache';

export async function createReport(data: {
    targetGroupId?: string;
    targetEventId?: string;
    reason: string;
}): Promise<ActionResponse<void>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'UNAUTHORIZED' };
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
    } catch (error) {
        if (error instanceof ActionError) {
            return { success: false, error: error.code };
        }
        return { success: false, error: 'REPORT_FAILED' };
    }
}

export async function getReports() {
    const session = await auth();
    // In a real app, verify admin status here. For now, we'll allow any logged-in user to see reports for testing, or assume we have an admin role logic later.
    if (!session?.user?.id) return [];

    return ReportService.getPendingReports();
}

export async function resolveReport(reportId: string, resolutionReason: string): Promise<ActionResponse<void>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        await ReportService.resolveReport(reportId);
        revalidatePath('/[locale]/admin/reports', 'page');
        return { success: true };
    } catch (error) {
        if (error instanceof ActionError) {
            return { success: false, error: error.code };
        }
        return { success: false, error: 'RESOLUTION_FAILED' };
    }
}

export async function deleteReportedContent(reportId: string): Promise<ActionResponse<void>> {
    const session = await auth();
    // Assuming admin role is checked here in a real app
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        await ReportService.deleteReportedContent(reportId);
        revalidatePath('/[locale]/admin/reports', 'page');
        return { success: true };
    } catch (error) {
        if (error instanceof ActionError) {
            return { success: false, error: error.code };
        }
        return { success: false, error: 'DELETE_FAILED' };
    }
}
