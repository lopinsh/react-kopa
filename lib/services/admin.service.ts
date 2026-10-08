import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { ModerationService, type ModerationResult } from './moderation.service';

export type WildcardWithDetails = Prisma.CategoryGetPayload<{
    include: {
        parent: { include: { titles: true } },
        titles: true,
    }
}>;

export type ReportWithDetails = Prisma.ReportGetPayload<{
    include: {
        reporter: { select: { name: true, email: true } },
        group: { select: { name: true, slug: true } },
        event: { select: { title: true } }
    }
}>;

export class AdminService {
    /**
     * Get pending wildcard categories
     */
    static async getPendingWildcards() {
        return prisma.category.findMany({
            where: {
                isWildcard: true,
                status: 'PENDING_REVIEW',
            },
            include: {
                parent: {
                    include: { titles: true }
                },
                titles: true,
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Approve a wildcard category
     */
    static async approveWildcard(categoryId: string) {
        return prisma.category.update({
            where: { id: categoryId },
            data: {
                isWildcard: false,
                status: 'ACTIVE',
            }
        });
    }

    /**
     * Reject a wildcard category
     */
    static async rejectWildcard(categoryId: string) {
        // Find if any groups use this category
        const groupsUsingCategory = await prisma.group.count({
            where: {
                OR: [
                    { categoryId: categoryId },
                    { tags: { some: { id: categoryId } } }
                ]
            }
        });

        if (groupsUsingCategory > 0) {
            throw new Error('CATEGORY_IN_USE');
        }

        // Must delete translations first due to foreign key constraints
        await prisma.categoryTranslation.deleteMany({
            where: { categoryId }
        });

        return prisma.category.delete({
            where: { id: categoryId }
        });
    }

    /**
     * Get pending reports
     */
    static async getPendingReports() {
        return prisma.report.findMany({
            where: { status: 'PENDING' },
            include: {
                reporter: { select: { name: true, email: true } },
                group: { select: { name: true, slug: true } },
                event: { select: { title: true } }
            },
            orderBy: { createdAt: 'asc' }
        });
    }

    /**
     * Dismiss a report
     */
    static async dismissReport(reportId: string) {
        return prisma.report.update({
            where: { id: reportId },
            data: { status: 'RESOLVED' }
        });
    }

    /**
     * Take action on a report: hide the reported group (restorable) using the report's reason.
     */
    static async suspendReportedGroup(groupId: string, reportId: string, adminId: string): Promise<ModerationResult> {
        const report = await prisma.report.findUnique({ where: { id: reportId }, select: { reason: true } });
        const reason = report?.reason && report.reason.length >= 5 ? report.reason : `Reported: ${report?.reason ?? 'n/a'}`;

        const result = await ModerationService.hideGroup(groupId, adminId, reason);
        if (!result.success) return result;

        await prisma.report.update({
            where: { id: reportId },
            data: { status: 'ACTION_TAKEN' }
        });
        return { success: true };
    }
}
