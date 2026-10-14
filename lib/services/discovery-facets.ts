import type { DayCount, DiscoveryCounts, FacetInput } from '@/lib/types/discovery';

/** One group or event as the counts need it. `tagSlugs` holds the L2/L3 slugs of its category and tags, parents included. */
export interface FacetRow {
    city: string | null;
    isOnline: boolean;
    l1Slug: string;
    tagSlugs: string[];
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
