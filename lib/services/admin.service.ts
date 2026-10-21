import { ActionError } from '@/types/actions';
import { prisma } from '@/lib/prisma';
import { ModerationService } from './moderation.service';
import { GroupService } from './group.service';

export class AdminService {
    /** What waits for an admin: shown as badges in the admin navigation. */
    static async getPendingCounts(): Promise<{ tags: number; cities: number; reports: number; suggestions: number }> {
        const [tagCount, cityCount, reports, suggestions] = await Promise.all([
            prisma.category.count({ where: { isWildcard: true, status: 'PENDING_REVIEW' } }),
            prisma.city.count({ where: { status: 'PENDING_REVIEW' } }),
            prisma.report.count({ where: { status: 'PENDING' } }),
            prisma.messageSuggestion.count()
        ]);
        // New sub-categories wait on the Categories page, new cities on the Locations page.
        return { tags: tagCount, cities: cityCount, reports, suggestions };
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
                throw new ActionError('NOT_FOUND');
            }

            // A group's primary category or a parent of other categories cannot be removed;
            // a rejected suggestion used only as a tag is detached from its groups.
            if (category._count.groups > 0 || category._count.children > 0) {
                throw new ActionError('CATEGORY_IN_USE');
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
    static async suspendReportedGroup(groupId: string, reportId: string, adminId: string, reason: string): Promise<{ slug: string; l1Slug: string }> {
        // The report must be about this group, or an admin could hide any group through any report.
        const report = await prisma.report.findUnique({ where: { id: reportId }, select: { targetGroupId: true } });
        if (!report || report.targetGroupId !== groupId) throw new ActionError('NOT_FOUND');

        // Already hidden (by another admin or another report): nothing to hide, just close this report.
        const group = await prisma.group.findUnique({ where: { id: groupId }, select: { hiddenAt: true } });
        if (group?.hiddenAt) {
            const slugs = await GroupService.getGroupSlugs(groupId);
            if (!slugs) throw new ActionError('NOT_FOUND');
            await prisma.report.update({ where: { id: reportId }, data: { status: 'ACTION_TAKEN' } });
            return slugs;
        }

        // Hiding and closing the report are one transaction inside hideGroup.
        return ModerationService.hideGroup(groupId, adminId, reason, reportId);
    }
}
