import { HUB_PAGE_KEYS, type HubPageKey } from '@/lib/constants';

export interface HubPageLink {
    key: HubPageKey;
    href: string;
}

const SEGMENT: Record<HubPageKey, string> = { overview: '', groups: '/groups', events: '/events' };

/**
 * The pages a hub's menu shows, in order (K1-04). `base` is the hub's address without locale; `cities` (the Kur filter) is carried to every page.
 * Ziņas and Čats join here with K2 and K5.
 */
export function hubPages(base: string, cities: string[]): HubPageLink[] {
    const qs = cities.length > 0 ? `?city=${cities.join(',')}` : '';
    return HUB_PAGE_KEYS.map((key) => ({ key, href: `${base}${SEGMENT[key]}${qs}` }));
}

/** The page a path (without locale) is on, under the hub at `base`. */
export function hubPageForPath(pathname: string, base: string): HubPageKey {
    const rest = pathname.startsWith(base) ? pathname.slice(base.length) : '';
    return HUB_PAGE_KEYS.find((k) => k !== 'overview' && rest === SEGMENT[k]) ?? 'overview';
}
