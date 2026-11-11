import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { HUB_NEW_DAYS } from '@/lib/constants';
import type { TextLang } from '@/lib/translations';
import { groupWhere } from './discovery-query';

/** What a hub's queries need to know about it: its Tēma's id and its own slug (an L2 also matches its L3 children). Both null on a city hub: every topic (K3-16). */
export interface HubTopic {
    l1Id: string | null;
    slug: string | null;
}

/** What the hub pages (Grupas, Pasākumi) read from a hub: a topic hub's `HubContext` or a city hub's scope. */
export interface HubScope extends HubTopic {
    l1Slug: string | null;
    /** The hub's address without locale. */
    href: string;
    /** Set when the city is fixed by the hub (a topic x city hub or the city hub). */
    local: { citySlug: string } | null;
}

/**
 * One where-clause for everything a hub gathers (groups, events, posts, counts), so a hub never shows a group the board would not:
 * the board's `groupWhere` with the hub's Tēma and its slug as the one topic (K1-02).
 */
export function hubGroupWhere(hub: HubTopic, cities: string[], lang: TextLang): Prisma.GroupWhereInput {
    return groupWhere({ categoryId: hub.l1Id ?? undefined, tags: hub.slug ? [hub.slug] : [], cities: [...cities].sort() }, lang);
}

/** Groups created in the last `HUB_NEW_DAYS` days (the Jaunās tab). */
export function newSince(now: Date = new Date()): Prisma.GroupWhereInput {
    return { createdAt: { gte: new Date(now.getTime() - HUB_NEW_DAYS * 86_400_000) } };
}

/** Distinct people with a (non-pending) membership in the hub's groups: someone in two groups counts once (K-76). */
export async function hubMemberCount(where: Prisma.GroupWhereInput): Promise<number> {
    const rows = await prisma.membership.groupBy({ by: ['userId'], where: { role: { not: 'PENDING' }, group: where } });
    return rows.length;
}

/** Groups per city across the hub (no city filter), for the Kur list's counts. */
export async function hubCityCounts(where: Prisma.GroupWhereInput): Promise<{ byCity: Record<string, number>; anyPlace: number }> {
    const rows = await prisma.group.groupBy({ by: ['city'], where, _count: { _all: true } });
    const byCity = Object.fromEntries(rows.map((r) => [r.city, r._count._all]));
    return { byCity, anyPlace: rows.reduce((n, r) => n + r._count._all, 0) };
}
