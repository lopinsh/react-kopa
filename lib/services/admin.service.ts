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
    /** What waits for an admin: shown as badges in the admin navigation. */
    static async getPendingCounts(): Promise<{ tags: number; reports: number }> {
        const [tags, reports] = await Promise.all([
            prisma.category.count({ where: { isWildcard: true, status: 'PENDING_REVIEW' } }),
            prisma.report.count({ where: { status: 'PENDING' } })
        ]);
        return { tags, reports };
    }

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
        return prisma.$transaction(async (tx) => {
            // Only pending suggestions can be rejected; active categories are managed in the taxonomy editor.
            const category = await tx.category.findFirst({
                where: { id: categoryId, isWildcard: true, status: 'PENDING_REVIEW' },
                select: { id: true, _count: { select: { groups: true, children: true } } }
            });
            if (!category) {
                throw new Error('NOT_FOUND');
            }

            // A group's primary category or a parent of other categories cannot be removed;
            // a rejected suggestion used only as a tag is detached from its groups.
            if (category._count.groups > 0 || category._count.children > 0) {
                throw new Error('CATEGORY_IN_USE');
            }

            await tx.category.update({
                where: { id: categoryId },
                data: { groupsWithTags: { set: [] } }
            });

            // Translations and aliases cascade on delete.
            return tx.category.delete({
                where: { id: categoryId }
            });
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
     * Take action on a report: hide the reported group (restorable) with the reason the admin wrote.
     */
    static async suspendReportedGroup(groupId: string, reportId: string, adminId: string, reason: string): Promise<ModerationResult<{ slug: string; l1Slug: string }>> {
        const result = await ModerationService.hideGroup(groupId, adminId, reason);
        if (!result.success) return result;

        await prisma.report.update({
            where: { id: reportId },
            data: { status: 'ACTION_TAKEN' }
        });
        return result;
    }
}
