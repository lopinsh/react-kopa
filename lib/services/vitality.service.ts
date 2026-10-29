import { prisma } from '@/lib/prisma';
import { VITALITY_ACTIVE_DAYS, VITALITY_QUIET_LIMIT, VITALITY_SERIES, type VitalitySeriesKey } from '@/lib/constants/vitality';
import { TaxonomyResolver } from './taxonomy-resolver.service';
import { demoFilter, healthRows, participationRow, presenceRow, seriesRows, type SeriesRow } from './vitality-sql';

export type { VitalitySeriesKey };
export type VitalitySeries = { key: VitalitySeriesKey; total: number; last7: number; last30: number; prev30: number; weeks: { week: string; count: number }[] };
export type QuietGroup = { id: string; name: string; href: string; lastActivity: Date };
export type VitalityPresence = { active1: number; active7: number; active30: number; cohort: number; returned: number; since: Date | null };
export type VitalitySnapshot = {
    includeDemo: boolean;
    series: VitalitySeries[];
    participation: { users: number; inGroup: number; groups: number; avgMembers: number; groupsMin3: number; messages7: number; messages30: number; posts7: number; posts30: number };
    health: { active: number; quiet: number; empty: number; quietGroups: QuietGroup[]; quietMore: number };
    presence: VitalityPresence | null;
};

function toSeries(key: VitalitySeriesKey, rows: SeriesRow[]): VitalitySeries {
    const first = rows[0] ?? { total: 0, last7: 0, last30: 0, prev30: 0 };
    return {
        key,
        total: first.total,
        last7: first.last7,
        last30: first.last30,
        prev30: first.prev30,
        weeks: rows.map((r) => ({ week: r.week, count: r.count })),
    };
}

/** Admin vitality panel (R31): counts only, read from existing rows; demo content left out unless asked for. */
export const VitalityService = {
    async getSnapshot({ includeDemo }: { includeDemo: boolean }): Promise<VitalitySnapshot> {
        const now = new Date();
        const demo = demoFilter(includeDemo);
        const [seriesData, participation, health, presence] = await Promise.all([
            Promise.all(VITALITY_SERIES.map((key) => seriesRows(key, now, demo))),
            participationRow(now, demo),
            healthRows(now, VITALITY_ACTIVE_DAYS, demo),
            presenceRow(now, demo),
        ]);

        const empty = health.filter((g) => g.members === 0);
        const live = health.filter((g) => g.members > 0);
        const quiet = live.filter((g) => !g.active).sort((a, b) => a.lastActivity.getTime() - b.lastActivity.getTime());
        const listed = quiet.slice(0, VITALITY_QUIET_LIMIT);
        const groups = await prisma.group.findMany({
            where: { id: { in: listed.map((g) => g.id) } },
            select: { id: true, name: true, slug: true, category: { include: TaxonomyResolver.getInclude('lv') } },
        });
        const byId = new Map(groups.map((g) => [g.id, g]));
        const quietGroups = listed.flatMap((g): QuietGroup[] => {
            const row = byId.get(g.id);
            if (!row) return [];
            return [{ id: g.id, name: row.name, href: `/${TaxonomyResolver.resolve(row.category).l1Slug}/group/${row.slug}`, lastActivity: g.lastActivity }];
        });

        return {
            includeDemo,
            series: VITALITY_SERIES.map((key, i) => toSeries(key, seriesData[i])),
            participation,
            health: { active: live.length - quiet.length, quiet: quiet.length, empty: empty.length, quietGroups, quietMore: quiet.length - listed.length },
            presence,
        };
    },
};
