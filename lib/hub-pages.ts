import { HUB_PAGE_KEYS, type HubPageKey } from '@/lib/constants';

export interface HubPageLink {
    key: HubPageKey;
    href: string;
}

const SEGMENT: Record<HubPageKey, string> = { overview: '', groups: '/groups', events: '/events', messages: '/messages' };

/**
 * The pages a hub's menu shows, in order (K1-04). `base` is the hub's address without locale (a topic x city hub's includes the city).
 * Čats joins here with K5.
 */
export function hubPages(base: string): HubPageLink[] {
    return HUB_PAGE_KEYS.map((key) => ({ key, href: `${base}${SEGMENT[key]}` }));
}

/** The page a path (without locale) is on, under the hub at `base`. */
export function hubPageForPath(pathname: string, base: string): HubPageKey {
    const rest = pathname.startsWith(base) ? pathname.slice(base.length) : '';
    return HUB_PAGE_KEYS.find((k) => k !== 'overview' && rest === SEGMENT[k]) ?? 'overview';
}

/** How many events a hub's Pasākumi list shows: `?limit=` in steps of `step`, at least one step, at most `max`. */
export function parseEventsLimit(raw: string | undefined, step: number, max: number): number {
    const asked = parseInt(raw ?? '', 10);
    const steps = Number.isFinite(asked) ? Math.ceil(asked / step) * step : step;
    return Math.min(Math.max(steps, step), Math.floor(max / step) * step);
}
