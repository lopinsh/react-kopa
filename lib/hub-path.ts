import type { HubPageKey } from '@/lib/constants';

export interface HubAddress {
    l2Slug: string;
    l3Slug?: string;
    page: HubPageKey;
}

/** URL segment of each page below a hub: Pārskats is the hub's own address. */
const SEGMENT: Record<HubPageKey, string> = { overview: '', groups: '/groups', events: '/events', messages: '/messages' };
const PAGE_OF: Record<string, HubPageKey> = { groups: 'groups', events: 'events', messages: 'messages' };

/**
 * The segments after the L1 slug: `[l2]`, `[l2, page]`, `[l2, l3]`, `[l2, l3, page]` with page `groups`, `events` or `messages`.
 * Anything longer or unknown is null. A second segment named like a page is the page, never an L3 (reserved slugs keep an L3 from taking the name).
 */
export function parseHubPath(segments: string[]): HubAddress | null {
    const [l2Slug, a, b, ...rest] = segments;
    if (!l2Slug || rest.length > 0) return null;
    if (a === undefined) return { l2Slug, page: 'overview' };
    if (b === undefined) return a in PAGE_OF ? { l2Slug, page: PAGE_OF[a] } : { l2Slug, l3Slug: a, page: 'overview' };
    return b in PAGE_OF && !(a in PAGE_OF) ? { l2Slug, l3Slug: a, page: PAGE_OF[b] } : null;
}

/** A hub's address without locale: `/games/boardgames`, `/games/boardgames/chess`; a page adds `/groups`, `/events` or `/messages`. */
export function hubHref(l1Slug: string, l2Slug: string, l3Slug?: string, page: HubPageKey = 'overview'): string {
    return `/${l1Slug}/${l2Slug}${l3Slug ? `/${l3Slug}` : ''}${SEGMENT[page]}`;
}
