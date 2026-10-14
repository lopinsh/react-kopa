import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { DISCOVERY_DAY_RANGE_MAX } from '@/lib/constants';
import { startOfTodayInRiga } from '@/lib/event-dates';
import type { TextLang } from '@/lib/translations';
import type { FacetRow } from './discovery-facets';
import type {
    EventDiscoveryFilters,
    FacetInput,
    GroupDiscoveryFilters
} from '@/lib/types/discovery';

/**
 * The where-builders and count aggregation behind discovery. Lists and counts both use them,
 * so a count can never disagree with its list. Plain Prisma and pure functions: no caching here.
 */

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
        // Online events belong to "Visur" only.
        and.push({ isOnline: false, city: { in: cities } });
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
    city: string,
    isOnline: boolean,
    category: CategoryChain,
    tags: CategoryChain[]
): FacetRow {
    const chains = [chainSlugs(category), ...tags.map(chainSlugs)];
    // The top of a chain is the L1; everything below it is a sub-category slug.
    const l1s = chains.map((c) => c[c.length - 1]);
    const subs = chains.flatMap((c) => c.slice(0, -1));
    return { city, isOnline, l1Slugs: [...new Set(l1s)], tagSlugs: [...new Set(subs)] };
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
            group: { select: { category: { select: CHAIN_SELECT }, tags: { select: CHAIN_SELECT } } }
        }
    });
    return events.map((e) => toRow(e.city, e.isOnline, e.group.category, e.group.tags));
}

export { aggregateFacets, bucketByDay } from './discovery-facets';
