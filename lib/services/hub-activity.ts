import { prisma } from '@/lib/prisma';
import { HUB_FEED_ROWS } from '@/lib/constants';
import { addDays, dayInZone, zonedDayStart } from '@/lib/discovery-dates';
import { plainExcerpt } from '@/lib/text-excerpt';
import { resolveEventText, toTextLang, type TextLang } from '@/lib/translations';
import { hubGroupWhere } from './hub-query';
import { TaxonomyResolver } from './taxonomy-resolver.service';
import type { Prisma } from '@prisma/client';

export type FeedPeriodKey = 'today' | 'lastWeek' | 'lastMonth';

export interface FeedRow {
    id: string;
    kind: 'announcement' | 'event' | 'group';
    /** Announcement headline, event title or group name (the row's sentence is made from it in the UI for groups). */
    title: string;
    titleLang: TextLang;
    at: Date;
    excerpt: string | null;
    group: { name: string; slug: string };
    /** Without locale. */
    groupHref: string;
    /** Without locale: the announcement list, the event or the group. */
    href: string;
}

export interface FeedPeriod {
    key: FeedPeriodKey;
    counts: { groups: number; members: number; announcements: number };
    rows: FeedRow[];
}

const EXCERPT = 280;
const GROUP_REF = { select: { name: true, slug: true, category: { select: { id: true, slug: true, level: true, color: true, parent: { select: { id: true, slug: true, color: true, parent: { select: { id: true, slug: true, color: true } } } } } } } } as const;

/** The hub's activity (K-24a, K-78) of its own public groups (`hubGroupWhere`); see `scopeActivity`. */
export function hubActivity(hub: { l1Id: string; l1Slug: string; slug: string }, o: { cities: string[] }, locale: string, zone: string, now: Date = new Date()): Promise<FeedPeriod[]> {
    return scopeActivity(hubGroupWhere(hub, o.cities, toTextLang(locale)), hub.l1Slug, locale, zone, now);
}

/**
 * Activity over the groups `groupWhere` picks (a hub's, K3-16: a city's too): nothing is recorded, it is read from timestamps that exist: groups created, people who joined
 * (counts only, never names), public announcements and public events created. Three periods: today, the 7 days before, the 30 before those. A period without anything is left out.
 * `l1Slug` fixes the group address's first part (a topic hub); null reads it from each group's own Tēma (a city hub).
 */
export async function scopeActivity(groupWhere: Prisma.GroupWhereInput, l1Slug: string | null, locale: string, zone: string, now: Date = new Date()): Promise<FeedPeriod[]> {
    const lang = toTextLang(locale);
    const today = dayInZone(now, zone);
    const edge = (daysBack: number) => zonedDayStart(addDays(today, -daysBack), zone);
    const ranges: Array<{ key: FeedPeriodKey; from: Date; to: Date }> = [
        { key: 'today', from: edge(0), to: new Date(now.getTime() + 1) },
        { key: 'lastWeek', from: edge(7), to: edge(0) },
        { key: 'lastMonth', from: edge(37), to: edge(7) },
    ];
    const groupPath = (g: { slug: string; category: Parameters<typeof TaxonomyResolver.resolve>[0] }) => `/${l1Slug ?? TaxonomyResolver.resolve(g.category).l1Slug}/group/${g.slug}`;

    const periods = await Promise.all(ranges.map(async ({ key, from, to }): Promise<FeedPeriod> => {
        const when = { gte: from, lt: to };
        const inGroup: Prisma.PostWhereInput = { visibility: 'PUBLIC', archivedAt: null, createdAt: when, group: groupWhere };
        const take = HUB_FEED_ROWS;
        const [groups, groupCount, members, announcements, announcementCount, events] = await Promise.all([
            prisma.group.findMany({ where: { AND: [groupWhere, { createdAt: when }] }, orderBy: [{ createdAt: 'desc' }, { slug: 'asc' }], take, select: { id: true, name: true, slug: true, createdAt: true, category: GROUP_REF.select.category } }),
            prisma.group.count({ where: { AND: [groupWhere, { createdAt: when }] } }),
            prisma.membership.count({ where: { role: { not: 'PENDING' }, joinedAt: when, group: groupWhere } }),
            prisma.post.findMany({ where: inGroup, orderBy: { createdAt: 'desc' }, take, select: { id: true, title: true, content: true, createdAt: true, group: GROUP_REF } }),
            prisma.post.count({ where: inGroup }),
            prisma.event.findMany({
                where: { visibility: 'PUBLIC', createdAt: when, group: groupWhere },
                orderBy: [{ createdAt: 'desc' }, { slug: 'asc' }],
                take,
                select: { id: true, slug: true, originalLang: true, createdAt: true, translations: { select: { lang: true, title: true, description: true } }, group: GROUP_REF },
            }),
        ]);

        const rows: FeedRow[] = [
            ...groups.map((g): FeedRow => ({ id: `g-${g.id}`, kind: 'group', title: g.name, titleLang: lang, at: g.createdAt, excerpt: null, group: { name: g.name, slug: g.slug }, groupHref: groupPath(g), href: groupPath(g) })),
            ...announcements.map((p): FeedRow => ({
                id: `p-${p.id}`, kind: 'announcement', titleLang: lang, at: p.createdAt, group: { name: p.group.name, slug: p.group.slug }, groupHref: groupPath(p.group), href: `${groupPath(p.group)}/announcements`,
                title: p.title || plainExcerpt(p.content, 120) || '',
                excerpt: p.title ? plainExcerpt(p.content, EXCERPT) : null,
            })),
            ...events.map((e): FeedRow => {
                const text = resolveEventText(e.translations.map((t) => ({ ...t, instructions: null })), lang, e.originalLang, true);
                return { id: `e-${e.id}`, kind: 'event', title: text.title, titleLang: text.titleLang, at: e.createdAt, excerpt: plainExcerpt(text.description, EXCERPT), group: { name: e.group.name, slug: e.group.slug }, groupHref: groupPath(e.group), href: `${groupPath(e.group)}/events/${e.slug}` };
            }),
            // Same-moment rows keep one order on every run (ids differ per seed; the visual baseline pins equal times).
        ].sort((a, b) => b.at.getTime() - a.at.getTime() || a.href.localeCompare(b.href) || (a.id < b.id ? -1 : 1)).slice(0, take);

        return { key, counts: { groups: groupCount, members, announcements: announcementCount }, rows };
    }));

    return periods.filter((p) => p.rows.length > 0 || p.counts.groups + p.counts.members + p.counts.announcements > 0);
}
