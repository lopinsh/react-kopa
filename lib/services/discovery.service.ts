import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import { Prisma } from '@prisma/client';
import type {
    ScopedResult,
    GroupDiscoveryFilters,
    FacetInput,
    DiscoveryCounts
} from '@/lib/types/discovery';
import { groupWhere, publicSectionMatch, loadGroupFacetRows, loadEventFacetRows, aggregateFacets } from './discovery-query';
import { startOfTodayInRiga } from '@/lib/event-dates';
import { TaxonomyResolver } from './taxonomy-resolver.service';
import { categoryColor } from '@/lib/theme/category';
import { GROUP_CARD_RELATIONS, toGroupCard } from './group-card';
import { getTranslations } from 'next-intl/server';
import { cityLabel } from '@/lib/city-label';
import { toTextLang, resolveText } from '@/lib/translations';
import { pickTitle } from '@/lib/utils/localized-title';
import { DISCOVERY_GROUPS_PAGE } from '@/lib/constants';

/** All titles: a sub-category may exist in one language only (see pickTitle). */
const ALL_TITLES = { select: { lang: true, title: true } } as const;

/**
 * Service to handle discovery logic (searching groups and categories).
 */
export const DiscoveryService = {
    /**
     * Scoped search for both categories and groups within a specific hierarchy.
     */
    async searchContextual(
        query: string,
        locale: string,
        activeCat?: string, // L1 slug
        activeTag?: string  // L2 or L3 slug
    ): Promise<ScopedResult[]> {
        if (!query || query.length < 2) return [];
        const lang = locale === 'en' ? 'en' : 'lv';
        const q = { contains: query, mode: 'insensitive' as const };

        // 1. Find the active context ID if slugs are provided
        let contextId: string | undefined;
        if (activeTag) {
            const tag = await prisma.category.findUnique({ where: { slug: activeTag } });
            if (tag) contextId = tag.id;
        } else if (activeCat) {
            const cat = await prisma.category.findUnique({ where: { slug: activeCat } });
            if (cat) contextId = cat.id;
        }

        // 2. Fetch Matching Categories within context
        const categoryWhere: Prisma.CategoryWhereInput = {
            status: 'ACTIVE',
            isWildcard: false,
            // Any language: a sub-category may have a title in one language only.
            titles: { some: { title: q } }
        };

        if (contextId) {
            categoryWhere.AND = [
                {
                    OR: [
                        { id: contextId },
                        { parentId: contextId },
                        { parent: { parentId: contextId } }
                    ]
                }
            ];
        }

        const categories = await prisma.category.findMany({
            where: categoryWhere,
            take: 5,
            include: {
                titles: ALL_TITLES,
                parent: {
                    include: {
                        titles: ALL_TITLES,
                        parent: { include: { titles: ALL_TITLES } }
                    }
                }
            }
        });

        // 3. Fetch Matching Groups within context
        const contextGroupWhere: Prisma.GroupWhereInput = {
            type: 'PUBLIC',
            hiddenAt: null,
            OR: [
                { name: q },
                { description: q },
                publicSectionMatch(q)
            ]
        };
        const groupAnd: Prisma.GroupWhereInput[] = [];

        if (contextId) {
            const categoryMatch = {
                id: contextId,
                status: 'ACTIVE' as const
            };
            groupAnd.push({
                OR: [
                    { category: categoryMatch },
                    { tags: { some: categoryMatch } }
                ]
            });
        }

        // 3b. Ensure group category itself is active even if no contextId
        groupAnd.push({
            category: { status: 'ACTIVE' }
        });
        contextGroupWhere.AND = groupAnd;

        const groups = await prisma.group.findMany({
            where: contextGroupWhere,
            take: 5,
            include: {
                category: {
                    include: {
                        parent: { include: { parent: true } }
                    }
                }
            }
        });

        // 3c. Fetch Matching Events within context
        const eventWhere: Prisma.EventWhereInput = {
            visibility: 'PUBLIC',
            group: { hiddenAt: null },
            // Text in any language; instructions are restricted and never searched.
            translations: { some: { OR: [{ title: q }, { description: q }] } }
        };

        if (contextId) {
            const categoryMatch = {
                id: contextId,
                status: 'ACTIVE' as const
            };
            eventWhere.AND = [
                {
                    OR: [
                        { group: { category: categoryMatch } },
                        { group: { tags: { some: categoryMatch } } }
                    ]
                }
            ];
        }

        const events = await prisma.event.findMany({
            where: eventWhere,
            take: 5,
            include: {
                translations: { select: { lang: true, title: true } },
                group: {
                    include: {
                        category: {
                            include: {
                                parent: { include: { parent: true } }
                            }
                        }
                    }
                }
            }
        });

        // 4. Map and Combine
        const tCities = await getTranslations({ locale: lang, namespace: 'cities' });
        const tEvent = await getTranslations({ locale: lang, namespace: 'event' });
        const mappedCategories: ScopedResult[] = categories.map(c => {
            const resolved = TaxonomyResolver.resolve(c);
            const l2 = c.level === 2 ? c : (c.level === 3 ? c.parent : undefined);

            return {
                type: 'category',
                id: resolved.categoryId,
                slug: resolved.categorySlug,
                title: pickTitle(c.titles, lang, c.slug),
                l1Slug: resolved.l1Slug || activeCat || 'sigulda',
                l2Slug: l2?.slug,
                color: resolved.accentColor,
                level: resolved.level,
                subtitle: resolved.level === 3 ? `${resolved.l1Slug} • ${l2?.slug}` : resolved.l1Slug
            };
        });

        const mappedGroups: ScopedResult[] = groups.map(g => {
            const resolved = TaxonomyResolver.resolve(g.category);

            return {
                type: 'group',
                id: g.id,
                slug: g.slug,
                title: g.name,
                subtitle: cityLabel(tCities, g.city),
                l1Slug: resolved.l1Slug || 'sigulda',
                color: resolved.accentColor,
                image: g.bannerImage
            };
        });

        const mappedEvents: ScopedResult[] = events.map(e => {
            const resolved = TaxonomyResolver.resolve(e.group.category);

            return {
                type: 'event',
                id: e.id,
                slug: e.slug,
                title: resolveText(e.translations, toTextLang(lang), e.originalLang, (t) => t.title).value,
                subtitle: e.isOnline ? tEvent('online') : (e.location || cityLabel(tCities, e.city)),
                l1Slug: resolved.l1Slug || 'sigulda',
                color: resolved.accentColor,
                image: e.bannerImage || e.group.bannerImage,
                groupSlug: e.group.slug
            };
        });

        return [...mappedCategories, ...mappedGroups, ...mappedEvents];
    },

    /**
     * Standard page-level group fetching with full filters.
     */
    async getGroups(filters: GroupDiscoveryFilters, locale: string) {
        const lang = locale === 'en' ? 'en' : 'lv';

        try {
            const { take = DISCOVERY_GROUPS_PAGE, skip = 0 } = filters;
            const where = groupWhere({ ...filters, cities: filters.cities && [...filters.cities].sort() }, lang);

            // Fetch groups with caching for Taxonomy Heavy Joins
            const fetchRawGroups = async (searchWhere: typeof where, reqLang: string, reqTake: number, reqSkip: number) => {
                const results = await prisma.group.findMany({
                    where: searchWhere,
                    take: reqTake + 1,
                    skip: reqSkip,
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        city: true,
                        lookingFor: true,
                        description: true,
                        bannerImage: true,
                        createdAt: true,
                        category: {
                            include: TaxonomyResolver.getInclude(reqLang)
                        },
                        ...GROUP_CARD_RELATIONS
                    },
                    orderBy: { createdAt: 'desc' },
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
            'discovery-counts-v2', input.kind, cities.join(','), input.l1Slug ?? '', tags.join(','),
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
