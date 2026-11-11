import type { HubPageKey } from '@/lib/constants';

export interface HubAddress {
    l2Slug: string;
    /** Between the L2 and the page: `[l3]`, `[city]` or `[l3, city]` (resolved by the service: an L3 first, else a city segment). */
    middle: string[];
    page: HubPageKey;
}

/** URL segment of each page below a hub: Pārskats is the hub's own address. */
const SEGMENT: Record<HubPageKey, string> = { overview: '', groups: '/groups', events: '/events', messages: '/messages' };
const PAGE_OF: Record<string, HubPageKey> = { groups: 'groups', events: 'events', messages: 'messages' };

/**
 * The segments after the L1 slug: `[l2, ...middle (0..2), page?]` with page `groups`, `events` or `messages` (K3-04).
 * Anything longer is null. A segment named like a page is the page, never an L3 or a city (reserved slugs keep them from taking the name).
 */
export function parseHubPath(segments: string[]): HubAddress | null {
    const [l2Slug, ...rest] = segments;
    if (!l2Slug) return null;
    const last = rest[rest.length - 1];
    const page: HubPageKey = last !== undefined && last in PAGE_OF ? PAGE_OF[last] : 'overview';
    const middle = page === 'overview' ? rest : rest.slice(0, -1);
    if (middle.length > 2 || middle.some((m) => m in PAGE_OF)) return null;
    return { l2Slug, middle, page };
}

/**
 * A hub's address without locale: `/games/boardgames`, `/games/boardgames/chess`, a topic x city hub `/games/boardgames/chess/jelgava`;
 * a page adds `/groups`, `/events` or `/messages`.
 */
export function hubHref(l1Slug: string, l2Slug: string, l3Slug?: string, page: HubPageKey = 'overview', citySegment?: string): string {
    return `/${l1Slug}/${l2Slug}${l3Slug ? `/${l3Slug}` : ''}${citySegment ? `/${citySegment}` : ''}${SEGMENT[page]}`;
}
