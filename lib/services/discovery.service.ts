import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import type {
    GroupDiscoveryFilters,
    FacetInput,
    DiscoveryCounts
} from '@/lib/types/discovery';
import { matchingGroupIds } from './discovery-text';
import { groupWhere, loadGroupFacetRows, loadEventFacetRows, aggregateFacets } from './discovery-query';
import { startOfTodayInRiga } from '@/lib/event-dates';
import { categoryColor } from '@/lib/theme/category';
import { GROUP_CARD_SELECT, toGroupCard } from './group-card';
import { pickTitle } from '@/lib/utils/localized-title';
import { DISCOVERY_GROUPS_PAGE } from '@/lib/constants';
import type { SearchResults } from '@/lib/types/search';
import { runSearch, type SearchInput } from './discovery-search';

/** All titles: a sub-category may exist in one language only (see pickTitle). */
const ALL_TITLES = { select: { lang: true, title: true } } as const;

/**
 * Service to handle discovery logic (searching groups and categories).
 */
export const DiscoveryService = {
    /** The header search: themes, a few group and event rows and the counts for one word, place and theme (R7; see discovery-search.ts). */
    async search(input: SearchInput, locale: string, viewerId?: string): Promise<SearchResults> {
        return runSearch(input, locale, viewerId);
    },

    /**
     * Standard page-level group fetching with full filters.
     */
    async getGroups(filters: GroupDiscoveryFilters, locale: string) {
        const lang = locale === 'en' ? 'en' : 'lv';

        try {
            const { take = DISCOVERY_GROUPS_PAGE, skip = 0 } = filters;
            const queryIds = filters.query ? await matchingGroupIds(filters.query, lang) : undefined;
            const where = groupWhere({ ...filters, queryIds, cities: filters.cities && [...filters.cities].sort() }, lang);

            // Fetch groups with caching for Taxonomy Heavy Joins
            const fetchRawGroups = async (searchWhere: typeof where, reqLang: string, reqTake: number, reqSkip: number) => {
                const results = await prisma.group.findMany({
                    where: searchWhere,
                    take: reqTake + 1,
                    skip: reqSkip,
                    select: GROUP_CARD_SELECT(reqLang),
                    orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
                });

                const hasMore = results.length > reqTake;
                const items = hasMore ? results.slice(0, reqTake) : results;

                return { items, hasMore };
            };

            // Wrap in unstable_cache for revalidation, preserving TypeScript inference via typed wrapper
            const fetchGroupsWithCategories = unstable_cache(
                fetchRawGroups,
                // v3: the card shape changed in R5b (tagline data), so no entry of the old shape is read.
                [`groups-search-v3-${lang}-${JSON.stringify(where)}-${take}-${skip}`],
                {
                    revalidate: 60,
                    // A tag merge or delete moves groups between sub-categories.
                    tags: ['groups', 'categories']
                }
            ) as unknown as typeof fetchRawGroups;

            const { items: groups, hasMore } = await fetchGroupsWithCategories(where, lang, take, skip);

            return { groups: groups.map((g) => toGroupCard(g, lang)), hasMore };
        } catch (error) {
            console.error('[DiscoveryService.getGroups] Error:', error);
            return { groups: [], hasMore: false };
        }
    },

    /**
     * Counts for the filter lists and the drawer (D8): total, per category, per sub-category, per city, online.
     * Public groups and events only, so the numbers are the same for everyone. Cached 5 minutes per filter set;
     * the 'groups', 'events' and 'categories' tags drop them. A search word is unbounded, so it runs uncached.
     */
    async getCounts(input: FacetInput, locale: string): Promise<DiscoveryCounts> {
        const lang = locale === 'en' ? 'en' : 'lv';
        const cities = [...(input.cities ?? [])].sort();
        const tags = [...(input.tags ?? [])].sort();
        const sorted: FacetInput = { ...input, cities, tags };
        // If a kind ever passes a few thousand rows, move this aggregation into SQL.
        const compute = async (): Promise<DiscoveryCounts> => {
            const rows = input.kind === 'groups' ? await loadGroupFacetRows(sorted, lang) : await loadEventFacetRows(sorted);
            return { kind: input.kind, ...aggregateFacets(rows, sorted) };
        };
        if (input.query) return compute();
        return unstable_cache(compute, [
            'discovery-counts-v3', input.kind, cities.join(','), input.l1Slug ?? '', tags.join(','),
            input.from?.toISOString() ?? '', input.to?.toISOString() ?? '',
            // The Latvian day, so "upcoming" rolls over at midnight.
            input.kind === 'events' ? startOfTodayInRiga().toISOString() : ''
        ], { tags: ['groups', 'events', 'categories'], revalidate: 300 })();
    },

    async getDiscoveryCategories(locale: string) {
        const lang = locale === 'en' ? 'en' : 'lv';

        return await unstable_cache(
            async () => {
                const categories = await prisma.category.findMany({
                    where: {
                        level: 1,
                        status: 'ACTIVE',
                        isWildcard: false
                    },
                    include: {
                        titles: { where: { lang } }
                    },
                    orderBy: { slug: 'asc' }
                });

                return categories.map(c => ({
                    id: c.id,
                    slug: c.slug,
                    title: c.titles[0]?.title ?? c.slug,
                    color: categoryColor(c.slug, c.color)
                }));
            },
            [`discovery-categories-${lang}`],
            {
                revalidate: 3600, // Revalidate every hour
                tags: ['categories']
            }
        )();
    },

    /**
     * Helper for SEO metadata to get localized display name for a slug.
     */
    async getCategoryDisplayName(slug: string, locale: string): Promise<string | null> {
        const lang = locale === 'en' ? 'en' : 'lv';

        const category = await prisma.category.findUnique({
            where: { slug },
            include: {
                titles: ALL_TITLES
            }
        });

        if (!category) return null;
        return pickTitle(category.titles, lang, category.slug);
    }
};
