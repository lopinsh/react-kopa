import { DISCOVERY_GROUPS_MAX, DISCOVERY_GROUPS_PAGE } from '@/lib/constants';
import { isDayKey, parseDateChoice, serializeDateChoice, type DateChoice, type DayKey } from '@/lib/discovery-dates';
import type { DiscoveryKind } from '@/lib/types/discovery';

export type { DiscoveryKind };

export interface DiscoveryParams {
    kind: DiscoveryKind;
    cities: string[];
    category: string | null;
    tags: string[];
    q: string;
    limit: number;
    /** Pasākumi only: the date choice (this week when absent). */
    date: DateChoice;
    /** Pasākumi only: the day the list starts at inside the choice (the strip's tap). */
    day: DayKey | null;
}

type RawParams = URLSearchParams | Record<string, string | string[] | undefined>;

/** `?city=Riga` or `?city=Riga,Jelgava` → slugs; empty, 'all' or absent → [] (Visur). Trims, drops empties and duplicates. */
export function parseCities(param: string | string[] | null | undefined): string[] {
    const raw = Array.isArray(param) ? param.join(',') : (param ?? '');
    const slugs = raw.split(',').map((c) => c.trim()).filter((c) => c && c !== 'all');
    return [...new Set(slugs)];
}

/** Reads `tab`, `city`, `category`, `tags`, `q`, `limit`, `date`, `day` (the last two only on Pasākumi) from page searchParams or URLSearchParams; ignores `view`, `type` and anything else. */
export function parseDiscoveryParams(sp: RawParams): DiscoveryParams {
    const get = (key: string): string | undefined => {
        const v = sp instanceof URLSearchParams ? sp.get(key) : sp[key];
        return (Array.isArray(v) ? v[0] : v) ?? undefined;
    };
    const asked = parseInt(get('limit') ?? '', 10);
    const steps = Number.isFinite(asked) ? Math.ceil(asked / DISCOVERY_GROUPS_PAGE) * DISCOVERY_GROUPS_PAGE : DISCOVERY_GROUPS_PAGE;
    const kind: DiscoveryKind = get('tab') === 'events' ? 'events' : 'groups';
    const day = get('day');
    return {
        kind,
        cities: parseCities(get('city')),
        category: get('category')?.trim() || null,
        tags: [...new Set((get('tags') ?? '').split(',').map((t) => t.trim()).filter(Boolean))],
        q: (get('q') ?? '').trim().slice(0, 100),
        limit: Math.min(Math.max(steps, DISCOVERY_GROUPS_PAGE), DISCOVERY_GROUPS_MAX),
        date: kind === 'events' ? parseDateChoice(get('date')) : { kind: 'week' },
        day: kind === 'events' && day && isDayKey(day) ? day : null
    };
}

/** The discovery href for a change: `{ ...current, ...change }`, empty values dropped, `limit` dropped unless asked, `tab=events` only for events. A change of `date` without `day` starts the list at the choice's beginning; switching to groups drops both. */
export function discoveryHref(current: DiscoveryParams, change: Partial<DiscoveryParams>): string {
    const p = { ...current, ...change, limit: 'limit' in change ? change.limit : undefined };
    if (p.kind !== 'events') { p.date = { kind: 'week' }; p.day = null; }
    else if ('date' in change && !('day' in change)) p.day = null;
    const qs = new URLSearchParams();
    if (p.kind === 'events') qs.set('tab', 'events');
    if (p.q) qs.set('q', p.q);
    if (p.cities.length > 0) qs.set('city', p.cities.join(','));
    if (p.category) qs.set('category', p.category);
    if (p.tags.length > 0) qs.set('tags', p.tags.join(','));
    const date = serializeDateChoice(p.date);
    if (date) qs.set('date', date);
    if (p.day) qs.set('day', p.day);
    if (p.limit && p.limit > DISCOVERY_GROUPS_PAGE) qs.set('limit', String(p.limit));
    const s = qs.toString().replace(/%2C/g, ',');
    return s ? `/?${s}` : '/';
}

/** The discovery list filtered by a category (and one Veids of it): the link on a category line. */
export function topicHref(l1Slug: string, tagSlug?: string): string {
    return discoveryHref(parseDiscoveryParams(new URLSearchParams()), { category: l1Slug, tags: tagSlug ? [tagSlug] : [] });
}

/** How many things are chosen ("Notīrīt visu" from 2): the word, the place (1 however many cities), the Tēma, each Veids, a date other than Šonedēļ. */
export function chosenCount(p: DiscoveryParams): number {
    return (p.q ? 1 : 0) + (p.cities.length > 0 ? 1 : 0) + (p.category ? 1 : 0) + p.tags.length + (p.date.kind !== 'week' ? 1 : 0);
}
