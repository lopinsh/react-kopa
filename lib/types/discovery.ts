import { GroupType } from '@prisma/client';

export type ScopedResult = {
    type: 'category' | 'group' | 'event';
    id: string;
    slug: string;
    title: string;
    subtitle?: string;
    l1Slug: string;
    l2Slug?: string;
    color: string;
    image?: string | null;
    level?: number;
    groupSlug?: string;
};

export type DiscoveryKind = 'groups' | 'events';

export interface GroupDiscoveryFilters {
    /** City slugs; empty = Visur. */
    cities?: string[];
    categoryId?: string;
    /** Sub-category slugs (L2/L3); a group matches any of them. */
    tags?: string[];
    query?: string;
    type?: GroupType | string;
    take?: number;
    skip?: number;
}

export interface EventDiscoveryFilters {
    cities?: string[];
    /** A category slug of any level (L1, L2, L3). */
    category?: string;
    tags?: string[];
    search?: string;
    /** Ignored when `from`/`to` are set. Default 'upcoming'. */
    status?: 'upcoming' | 'past';
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
    /** L2/L3 slug → count inside `l1Slug`; cities, query, dates applied, tags not. `{}` without `l1Slug`. */
    bySubCategory: Record<string, number>;
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

export type ContextualTaxonomy = {
    l1: { id: string; slug: string; title: string; color: string };
    l2s: {
        id: string;
        slug: string;
        title: string;
        children: { id: string; slug: string; title: string }[];
    }[];
    activeHierarchy: { id: string; title: string; level: number }[];
};
