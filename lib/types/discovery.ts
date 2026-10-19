import type { DateChoice, DayKey, DayPeriod } from '@/lib/discovery-dates';
import type { DiscoveryParams } from '@/lib/discovery-params';

export type DiscoveryKind = 'groups' | 'events';

export interface GroupDiscoveryFilters {
    /** City slugs; empty = Visur. */
    cities?: string[];
    categoryId?: string;
    /** Sub-category slugs (L2/L3); a group matches any of them. */
    tags?: string[];
    query?: string;
    /** Ids of the groups the query matches ignoring marks (`matchingGroupIds`); without them the match falls back to case-insensitive. */
    queryIds?: string[];
    take?: number;
    skip?: number;
}

export interface EventDiscoveryFilters {
    cities?: string[];
    /** A category slug of any level (L1, L2, L3). */
    category?: string;
    tags?: string[];
    search?: string;
    /** Ids of the events the search matches ignoring marks (`matchingEventIds`); without them the match falls back to case-insensitive. */
    searchIds?: string[];
    /** Without `from`/`to` only upcoming events are listed. */
    from?: Date;
    to?: Date;
    /** Default DISCOVERY_EVENTS_LIMIT (100), clamped to 1…DISCOVERY_EVENTS_MAX_LIMIT (200). */
    limit?: number;
}

/** What the counts are asked for: the list's filters minus paging. */
export interface FacetInput {
    kind: DiscoveryKind;
    cities?: string[];
    /** The L1 whose sub-categories are counted (the drawer's open category). */
    l1Slug?: string;
    tags?: string[];
    query?: string;
    /** Events only. */
    from?: Date;
    to?: Date;
}

/** Counts keyed by slug; titles come from the taxonomy and city lists the page already has. */
export interface DiscoveryCounts {
    kind: DiscoveryKind;
    /** With every filter applied (= the list's total). */
    total: number;
    /** L1 slug → count; cities, query and dates applied, topic not (each facet ignores its own filter). */
    byCategory: Record<string, number>;
    /** Every sub-category slug (L2/L3) → count; cities, query, dates applied, tags not. */
    bySubCategory: Record<string, number>;
    /** Cities, query, dates applied, topic not: the drawer's "Visas" row. */
    anyTopic: number;
    /** Topic, query, dates applied, cities not, online included: the place list's "Visur" row. */
    anyPlace: number;
    /** City slug → count; topic, query, dates applied, cities not; online events never here. */
    byCity: Record<string, number>;
    /** Events only: online events matching topic, query and dates; 0 for groups. */
    online: number;
}

export interface DayCount {
    /** YYYY-MM-DD in the asked time zone. */
    day: string;
    count: number;
}

/** Pasākumi's dates, computed once on the server in the viewer's zone (client parts never call `new Date()` for "today"). */
export interface DiscoveryDates {
    today: DayKey;
    choice: DateChoice;
    /** The choice's days. */
    period: DayPeriod;
    /** The list's first day (the chosen day on the strip). */
    listFrom: DayKey;
    /** The strip's Monday and its events per day. */
    week: DayKey;
    weekCounts: Record<DayKey, number>;
    /** The days the calendar knows counts for, and those counts. */
    calendar: DayPeriod;
    calendarCounts: Record<DayKey, number>;
}

/** What the discovery page hands to its provider: plain data from the services (Context Law). */
export interface DiscoveryState {
    kind: DiscoveryKind;
    /** The list's choice as parsed from its URL; read through `useDiscoveryNav` (the live URL is a panel's while one is open). */
    params: DiscoveryParams;
    categories: Array<{ id: string; slug: string; title: string; color: string; count: number }>;
    /** Active level-2 sub-categories of every main category ("Veidi"). */
    veidi: Array<{ slug: string; title: string; l1Slug: string; count: number }>;
    counts: Pick<DiscoveryCounts, 'total' | 'anyTopic' | 'anyPlace' | 'byCity' | 'online'>;
    /** Pasākumi only. */
    dates?: DiscoveryDates;
    /**
     * With a search word and no Tēma: the themes and Veidi the word also matches, each with the number you get when you choose it in place
     * of the word (place and, on Pasākumi, the dates kept). Themes first, then Veidi, busiest first; empty otherwise ("Atbilst arī:").
     */
    alsoMatches: Array<{ kind: 'theme' | 'veids'; slug: string; l1Slug: string; title: string; color: string; count: number }>;
}
