import { prisma } from '@/lib/prisma';
import { HUB_FEED_ROWS } from '@/lib/constants';
import { addDays, dayInZone, zonedDayStart } from '@/lib/discovery-dates';
import { plainExcerpt } from '@/lib/text-excerpt';
import { resolveEventText, toTextLang, type TextLang } from '@/lib/translations';
import { hubGroupWhere } from './hub-query';
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

/**
 * The hub's activity (K-24a, K-78): nothing is recorded, it is read from timestamps that exist: groups created, people who joined (counts only, never names),
 * public announcements and public events created, all of the hub's own public groups (`hubGroupWhere`). Three periods: today, the 7 days before, the 30 before those.
 * A period without anything is left out.
 */
export async function hubActivity(hub: { l1Id: string; l1Slug: string; slug: string }, o: { cities: string[] }, locale: string, zone: string, now: Date = new Date()): Promise<FeedPeriod[]> {
    const lang = toTextLang(locale);
    const groupWhere = hubGroupWhere(hub, o.cities, lang);
    const today = dayInZone(now, zone);
    const edge = (daysBack: number) => zonedDayStart(addDays(today, -daysBack), zone);
    const ranges: Array<{ key: FeedPeriodKey; from: Date; to: Date }> = [
        { key: 'today', from: edge(0), to: new Date(now.getTime() + 1) },
        { key: 'lastWeek', from: edge(7), to: edge(0) },
        { key: 'lastMonth', from: edge(37), to: edge(7) },
    ];
    const groupPath = (slug: string) => `/${hub.l1Slug}/group/${slug}`;

    const periods = await Promise.all(ranges.map(async ({ key, from, to }): Promise<FeedPeriod> => {
        const when = { gte: from, lt: to };
        const inGroup: Prisma.PostWhereInput = { visibility: 'PUBLIC', archivedAt: null, createdAt: when, group: groupWhere };
        const take = HUB_FEED_ROWS;
        const [groups, groupCount, members, announcements, announcementCount, events] = await Promise.all([
            prisma.group.findMany({ where: { AND: [groupWhere, { createdAt: when }] }, orderBy: { createdAt: 'desc' }, take, select: { id: true, name: true, slug: true, createdAt: true } }),
            prisma.group.count({ where: { AND: [groupWhere, { createdAt: when }] } }),
            prisma.membership.count({ where: { role: { not: 'PENDING' }, joinedAt: when, group: groupWhere } }),
            prisma.post.findMany({ where: inGroup, orderBy: { createdAt: 'desc' }, take, select: { id: true, title: true, content: true, createdAt: true, group: { select: { name: true, slug: true } } } }),
            prisma.post.count({ where: inGroup }),
            prisma.event.findMany({
                where: { visibility: 'PUBLIC', createdAt: when, group: groupWhere },
                orderBy: { createdAt: 'desc' },
                take,
                select: { id: true, slug: true, originalLang: true, createdAt: true, translations: { select: { lang: true, title: true, description: true } }, group: { select: { name: true, slug: true } } },
            }),
        ]);

        const rows: FeedRow[] = [
            ...groups.map((g): FeedRow => ({ id: `g-${g.id}`, kind: 'group', title: g.name, titleLang: lang, at: g.createdAt, excerpt: null, group: { name: g.name, slug: g.slug }, groupHref: groupPath(g.slug), href: groupPath(g.slug) })),
            ...announcements.map((p): FeedRow => ({
                id: `p-${p.id}`, kind: 'announcement', titleLang: lang, at: p.createdAt, group: p.group, groupHref: groupPath(p.group.slug), href: `${groupPath(p.group.slug)}/announcements`,
                title: p.title || plainExcerpt(p.content, 120) || '',
                excerpt: p.title ? plainExcerpt(p.content, EXCERPT) : null,
            })),
            ...events.map((e): FeedRow => {
                const text = resolveEventText(e.translations.map((t) => ({ ...t, instructions: null })), lang, e.originalLang, true);
                return { id: `e-${e.id}`, kind: 'event', title: text.title, titleLang: text.titleLang, at: e.createdAt, excerpt: plainExcerpt(text.description, EXCERPT), group: e.group, groupHref: groupPath(e.group.slug), href: `${groupPath(e.group.slug)}/events/${e.slug}` };
            }),
        ].sort((a, b) => b.at.getTime() - a.at.getTime() || (a.id < b.id ? -1 : 1)).slice(0, take);

        return { key, counts: { groups: groupCount, members, announcements: announcementCount }, rows };
    }));

    return periods.filter((p) => p.rows.length > 0 || p.counts.groups + p.counts.members + p.counts.announcements > 0);
}
