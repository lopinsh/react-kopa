import { prisma } from '@/lib/prisma';
import { ModerationService, type ModerationResult } from './moderation.service';

export class AdminService {
    /** What waits for an admin: shown as badges in the admin navigation. */
    static async getPendingCounts(): Promise<{ tags: number; reports: number; suggestions: number }> {
        const [tagCount, cityCount, reports, suggestions] = await Promise.all([
            prisma.category.count({ where: { isWildcard: true, status: 'PENDING_REVIEW' } }),
            prisma.city.count({ where: { status: 'PENDING_REVIEW' } }),
            prisma.report.count({ where: { status: 'PENDING' } }),
            prisma.messageSuggestion.count()
        ]);
        // New sub-categories and new cities both wait in the Taxonomy page's "needs review" card.
        return { tags: tagCount + cityCount, reports, suggestions };
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
     * Take action on a report: hide the reported group (restorable) with the reason the admin wrote.
     */
    static async suspendReportedGroup(groupId: string, reportId: string, adminId: string, reason: string): Promise<ModerationResult<{ slug: string; l1Slug: string }>> {
        // Hiding and closing the report are one transaction inside hideGroup.
        return ModerationService.hideGroup(groupId, adminId, reason, reportId);
    }
}
