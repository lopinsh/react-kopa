import { prisma } from '@/lib/prisma';
import { ActionError } from '@/types/actions';
import { GROUP_PANEL_LOG_MAX, GROUP_PANEL_REPORTS_MAX } from '@/lib/constants';
import { pickTitle } from '@/lib/utils/localized-title';
import { ModerationService, type AdminActionEntry } from './moderation.service';
import { isSiteAdminUser } from './site-role.service';
import { TaxonomyResolver } from './taxonomy-resolver.service';

/** What the admin panel's Grupa tab shows about one group (R25-2). Never a raw Prisma payload. */
export interface GroupPanelData {
    id: string;
    title: string;
    /** Path without locale. */
    href: string;
    theme: { l1: string; l2: string[] };
    status: { hidden: false } | { hidden: true; reason: string | null; by: string | null; at: Date };
    ownerName: string | null;
    createdAt: Date;
    memberCount: number;
    isPrivate: boolean;
    reports: { total: number; items: { id: string; reason: string; createdAt: Date }[] };
    log: AdminActionEntry[];
}

/** One read for the Grupa tab. Site admins only (the site role is read from the database, the session can be stale). */
export async function getGroupPanel(groupId: string, adminId: string, locale: string): Promise<GroupPanelData> {
    if (!(await isSiteAdminUser(adminId))) throw new ActionError('FORBIDDEN');

    const reportWhere = { targetGroupId: groupId, status: 'PENDING' };
    const [group, reportItems, reportTotal, log] = await Promise.all([
        prisma.group.findUnique({
            where: { id: groupId },
            select: {
                id: true, name: true, slug: true, type: true, createdAt: true, hiddenAt: true, hiddenReason: true,
                hiddenBy: { select: { name: true, username: true } },
                category: { include: TaxonomyResolver.getInclude(locale) },
                tags: { where: { status: 'ACTIVE', level: 2 }, select: { slug: true, titles: { select: { lang: true, title: true } } } },
                members: { where: { role: 'OWNER' }, take: 1, select: { user: { select: { name: true, username: true } } } },
                _count: { select: { members: { where: { role: { not: 'PENDING' } } } } },
            },
        }),
        prisma.report.findMany({ where: reportWhere, orderBy: { createdAt: 'desc' }, take: GROUP_PANEL_REPORTS_MAX, select: { id: true, reason: true, createdAt: true } }),
        prisma.report.count({ where: reportWhere }),
        ModerationService.listActions(GROUP_PANEL_LOG_MAX, groupId),
    ]);
    if (!group) throw new ActionError('NOT_FOUND');

    const resolved = TaxonomyResolver.resolve(group.category);
    const owner = group.members[0]?.user;
    return {
        id: group.id,
        title: group.name,
        href: `/${resolved.l1Slug}/group/${group.slug}`,
        theme: { l1: resolved.l1Title, l2: group.tags.map((t) => pickTitle(t.titles, locale, t.slug)) },
        status: group.hiddenAt
            ? { hidden: true, reason: group.hiddenReason, by: group.hiddenBy ? group.hiddenBy.name || group.hiddenBy.username : null, at: group.hiddenAt }
            : { hidden: false },
        ownerName: owner ? owner.name || owner.username : null,
        createdAt: group.createdAt,
        memberCount: group._count.members,
        isPrivate: group.type === 'PRIVATE',
        reports: { total: reportTotal, items: reportItems },
        log,
    };
}
