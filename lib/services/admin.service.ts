import { ActionError } from '@/types/actions';
import { prisma } from '@/lib/prisma';
import { ModerationService } from './moderation.service';
import { GroupService } from './group.service';
import { FEEDBACK_TAB_STATUSES } from '@/lib/constants';
import { isSiteAdmin } from '@/lib/site-role';

export type ShieldCounts = { reports: number; feedback: number; themes: number; cities: number };

const PENDING_THEME_WHERE = { isWildcard: true, status: 'PENDING_REVIEW' } as const;
const PENDING_CITY_WHERE = { status: 'PENDING_REVIEW' } as const;
const PENDING_REPORT_WHERE = { status: 'PENDING' } as const;

export class AdminService {
    /** What waits for an admin: shown as badges in the admin navigation. */
    static async getPendingCounts(): Promise<{ tags: number; cities: number; reports: number; suggestions: number }> {
        const [tagCount, cityCount, reports, suggestions] = await Promise.all([
            prisma.category.count({ where: PENDING_THEME_WHERE }),
            prisma.city.count({ where: PENDING_CITY_WHERE }),
            prisma.report.count({ where: PENDING_REPORT_WHERE }),
            prisma.messageSuggestion.count()
        ]);
        // New sub-categories wait on the Categories page, new cities on the Locations page.
        return { tags: tagCount, cities: cityCount, reports, suggestions };
    }

    /** What waits, for the shield menu (read when it opens). Site admins only. */
    static async getShieldCounts(adminId: string): Promise<ShieldCounts> {
        const user = await prisma.user.findUnique({ where: { id: adminId }, select: { role: true } });
        if (!user || !isSiteAdmin(user.role)) throw new ActionError('FORBIDDEN');
        const [reports, feedback, themes, cities] = await Promise.all([
            prisma.report.count({ where: PENDING_REPORT_WHERE }),
            prisma.feedback.count({ where: { status: { in: [...FEEDBACK_TAB_STATUSES.open] } } }),
            prisma.category.count({ where: PENDING_THEME_WHERE }),
            prisma.city.count({ where: PENDING_CITY_WHERE })
        ]);
        return { reports, feedback, themes, cities };
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
