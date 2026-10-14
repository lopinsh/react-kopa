import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { DISCOVERY_DAY_RANGE_MAX } from '@/lib/constants';
import { startOfTodayInRiga } from '@/lib/event-dates';
import type { TextLang } from '@/lib/translations';
import type {
    DayCount,
    DiscoveryCounts,
    EventDiscoveryFilters,
    FacetInput,
    GroupDiscoveryFilters
} from '@/lib/types/discovery';

/**
 * The where-builders and count aggregation behind discovery. Lists and counts both use them,
 * so a count can never disagree with its list. Plain Prisma and pure functions: no caching here.
 */

/** One group or event as the counts need it. `tagSlugs` holds the L2/L3 slugs of its category and tags, parents included. */
export interface FacetRow {
    city: string | null;
    isOnline: boolean;
    l1Slug: string;
    tagSlugs: string[];
}

const MS_PER_DAY = 86_400_000;

/**
 * A group matches when one of its PUBLIC sections has the text in any language. Members-only sections
 * are never searched, so their text cannot be found (or inferred) by outsiders.
 */
export function publicSectionMatch(q: { contains: string; mode: 'insensitive' }): Prisma.GroupWhereInput {
    return {
        sections: {
            some: {
                visibility: 'PUBLIC',
                translations: { some: { OR: [{ title: q }, { content: q }] } }
            }
        }
    };
}

/** Matches a group whose category or tags are this slug or sit under it (L1, L2 or L3; D10 for events). */
export function topicMatch(slug: string): Prisma.GroupWhereInput {
    return {
        OR: [
            { category: { slug } },
            { category: { parent: { slug } } },
            { category: { parent: { parent: { slug } } } },
            { tags: { some: { slug } } },
            { tags: { some: { parent: { slug } } } },
            { tags: { some: { parent: { parent: { slug } } } } }
        ]
    };
}

/** Any of these topic slugs (empty list = no condition). */
function anyTopic(slugs: string[]): Prisma.GroupWhereInput[] {
    return slugs.length > 0 ? [{ OR: slugs.map(topicMatch) }] : [];
}

/** The discovery group list's where (PUBLIC unless type says PRIVATE, not hidden, ACTIVE non-wildcard category). */
export function groupWhere(filters: GroupDiscoveryFilters, lang: TextLang): Prisma.GroupWhereInput {
    const { cities, categoryId, tags, query, type } = filters;
    const and: Prisma.GroupWhereInput[] = [
        // Content safety: only ACTIVE and non-wildcard categories.
        { category: { status: 'ACTIVE', isWildcard: false } }
    ];

    if (categoryId) {
        const categoryMatch = {
            OR: [
                { id: categoryId },                   // Direct match (L1, L2 or L3)
                { parentId: categoryId },             // Children
                { parent: { parentId: categoryId } }  // Grandchildren
            ]
        };
        and.push({ OR: [{ category: categoryMatch }, { tags: { some: categoryMatch } }] });
    }
    and.push(...anyTopic(tags ?? []));

    if (query) {
        const q = { contains: query, mode: 'insensitive' as const };
        and.push({
            OR: [
                { name: q },
                { description: q },
                publicSectionMatch(q),
                { category: { OR: [{ titles: { some: { lang, title: q } } }, { slug: q }] } }
            ]
        });
    }

    return {
        hiddenAt: null,
        type: type === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC',
        ...(cities && cities.length > 0 ? { city: { in: cities } } : {}),
        AND: and
    };
}

/** The span a date range may cover, or null when it is empty (`from >= to`). */
export function clampRange(from: Date, to: Date): { from: Date; to: Date } | null {
    if (!(from.getTime() < to.getTime())) return null;
    const max = from.getTime() + DISCOVERY_DAY_RANGE_MAX * MS_PER_DAY;
    return { from, to: new Date(Math.min(to.getTime(), max)) };
}

/** The event list's where, without the visibility part (callers add PUBLIC or the viewer's MEMBERS_ONLY). */
export function eventWhere(filters: EventDiscoveryFilters, now: Date = new Date()): Prisma.EventWhereInput {
    const { cities, category, tags, search, status, from, to } = filters;
    const groupAnd: Prisma.GroupWhereInput[] = [{ hiddenAt: null }];
    if (category) groupAnd.push(topicMatch(category));
    groupAnd.push(...anyTopic(tags ?? []));

    const and: Prisma.EventWhereInput[] = [{ group: { AND: groupAnd } }];

    if (cities && cities.length > 0) {
        // Online events belong to "Visur" only. The `city: null` branch covers events the old code created
        // during the R4 deploy; R5a deletes it together with the NOT NULL step.
        and.push({
            isOnline: false,
            OR: [{ city: { in: cities } }, { city: null, group: { city: { in: cities } } }]
        });
    }

    if (from && to) {
        const range = clampRange(from, to);
        // An empty range matches nothing (`in: []` is always false).
        and.push(range
            ? {
                startDate: { lt: range.to },
                OR: [{ endDate: { gte: range.from } }, { endDate: null, startDate: { gte: range.from } }]
            }
            : { id: { in: [] } });
    } else {
        // Past = the event's last day is before today (Latvian time); see isEventPast.
        const todayStart = startOfTodayInRiga(now);
        and.push(status === 'past'
            ? { OR: [{ endDate: { lt: todayStart } }, { endDate: null, startDate: { lt: todayStart } }] }
            : { OR: [{ endDate: { gte: todayStart } }, { endDate: null, startDate: { gte: todayStart } }] });
    }

    if (search) {
        const q = { contains: search, mode: 'insensitive' as const };
        // Text in any language (instructions are restricted and never searched).
        and.push({
            OR: [
                { translations: { some: { OR: [{ title: q }, { description: q }] } } },
                { group: { OR: [{ name: q }, { description: q }] } }
            ]
        });
    }

    return { AND: and };
}

type CategoryChain = { slug: string; level: number; parent?: CategoryChain | null };

/** Slugs of a category and its parents, bottom first. */
function chainSlugs(c: CategoryChain | null | undefined): string[] {
    const out: string[] = [];
    for (let cur = c; cur; cur = cur.parent) out.push(cur.slug);
    return out;
}

const CHAIN_SELECT = {
    slug: true,
    level: true,
    parent: { select: { slug: true, level: true, parent: { select: { slug: true, level: true } } } }
} as const;

function toRow(
    city: string | null,
    isOnline: boolean,
    category: CategoryChain,
    tags: CategoryChain[]
): FacetRow {
    const own = chainSlugs(category);
    // The top of a chain is the L1; everything below it is a sub-category slug.
    const subs = [own.slice(0, -1), ...tags.map((t) => chainSlugs(t).slice(0, -1))].flat();
    return { city, isOnline, l1Slug: own[own.length - 1], tagSlugs: [...new Set(subs)] };
}

/** One narrow row per matching group (query applied; cities and topic are applied by `aggregateFacets`). */
export async function loadGroupFacetRows(input: FacetInput, lang: TextLang): Promise<FacetRow[]> {
    const groups = await prisma.group.findMany({
        where: groupWhere({ query: input.query }, lang),
        select: { city: true, category: { select: CHAIN_SELECT }, tags: { select: CHAIN_SELECT } }
    });
    return groups.map((g) => toRow(g.city, false, g.category, g.tags));
}

/** One narrow row per matching public event (query and dates applied; cities and topic by `aggregateFacets`). */
export async function loadEventFacetRows(input: FacetInput, now: Date = new Date()): Promise<FacetRow[]> {
    const events = await prisma.event.findMany({
        where: { AND: [eventWhere({ search: input.query, from: input.from, to: input.to }, now), { visibility: 'PUBLIC' }] },
        select: {
            city: true,
            isOnline: true,
            group: { select: { city: true, category: { select: CHAIN_SELECT }, tags: { select: CHAIN_SELECT } } }
        }
    });
    // An event without its own city (created by the old code in the deploy window) takes its group's.
    return events.map((e) => toRow(e.city ?? e.group.city, e.isOnline, e.group.category, e.group.tags));
}

function bump(map: Record<string, number>, key: string): void {
    map[key] = (map[key] ?? 0) + 1;
}

/** The counts of DiscoveryCounts from rows: each facet ignores only its own filter, `total` applies all. */
export function aggregateFacets(rows: FacetRow[], input: FacetInput): Omit<DiscoveryCounts, 'kind'> {
    const cities = input.cities ?? [];
    const tags = input.tags ?? [];
    const out: Omit<DiscoveryCounts, 'kind'> = { total: 0, byCategory: {}, bySubCategory: {}, byCity: {}, online: 0 };

    for (const row of rows) {
        const inCities = cities.length === 0 || (!row.isOnline && !!row.city && cities.includes(row.city));
        const inL1 = !input.l1Slug || row.l1Slug === input.l1Slug;
        const inTags = tags.length === 0 || tags.some((t) => t === row.l1Slug || row.tagSlugs.includes(t));
        const inTopic = inL1 && inTags;

        if (inCities && inTopic) out.total++;
        if (inCities) bump(out.byCategory, row.l1Slug);
        if (inCities && inL1 && input.l1Slug) row.tagSlugs.forEach((s) => bump(out.bySubCategory, s));
        if (inTopic) {
            if (row.isOnline) out.online++;
            else if (row.city) bump(out.byCity, row.city);
        }
    }
    return out;
}

/** Per-day counts in a time zone; a multi-day event counts on the day it starts, or on `from`'s day if it began earlier. */
export function bucketByDay(rows: Array<{ startDate: Date }>, from: Date, to: Date, timeZone: string): DayCount[] {
    const format = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
    const counts = new Map<string, number>();
    for (const row of rows) {
        const at = Math.max(new Date(row.startDate).getTime(), from.getTime());
        if (at >= to.getTime()) continue;
        const day = format.format(at);
        counts.set(day, (counts.get(day) ?? 0) + 1);
    }
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, count]) => ({ day, count }));
}
