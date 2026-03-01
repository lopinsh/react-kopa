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

export type DiscoveryFilters = {
    city?: string;
    categoryId?: string;
    tag?: string;
    query?: string;
    type?: GroupType | string;
    take?: number;
    skip?: number;
};

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
