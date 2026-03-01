import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import type {
    ScopedResult,
    DiscoveryFilters,
    ContextualTaxonomy
} from '@/lib/types/discovery';

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
        const categoryWhere: any = {
            status: 'ACTIVE',
            isWildcard: false,
            titles: { some: { lang, title: q } }
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
                titles: { where: { lang } },
                parent: {
                    include: {
                        titles: { where: { lang } },
                        parent: { include: { titles: { where: { lang } } } }
                    }
                }
            }
        });

        // 3. Fetch Matching Groups within context
        const groupWhere: any = {
            type: 'PUBLIC',
            OR: [
                { name: q },
                { description: q }
            ]
        };

        if (contextId) {
            const categoryMatch = {
                id: contextId,
                status: 'ACTIVE' as const
            };
            groupWhere.AND = [
                {
                    OR: [
                        { category: categoryMatch },
                        { tags: { some: categoryMatch } }
                    ]
                }
            ];
        }

        // 3b. Ensure group category itself is active even if no contextId
        if (!groupWhere.AND) groupWhere.AND = [];
        groupWhere.AND.push({
            category: { status: 'ACTIVE' }
        });

        const groups = await prisma.group.findMany({
            where: groupWhere,
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
        const eventWhere: any = {
            visibility: 'PUBLIC',
            OR: [
                { title: q },
                { description: q }
            ]
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
        const mappedCategories: ScopedResult[] = categories.map(c => {
            const l1 = c.level === 1 ? c : (c.level === 2 ? c.parent : c.parent?.parent);
            const l2 = c.level === 2 ? c : (c.level === 3 ? c.parent : undefined);

            return {
                type: 'category',
                id: c.id,
                slug: c.slug,
                title: c.titles[0]?.title ?? c.slug,
                l1Slug: l1?.slug || activeCat || 'sigulda',
                l2Slug: l2?.slug,
                color: l1?.color ?? '#6366f1',
                level: c.level,
                subtitle: c.level === 3 ? `${l1?.slug} • ${l2?.slug}` : l1?.slug
            };
        });

        const mappedGroups: ScopedResult[] = groups.map(g => {
            const l1Color = g.category.color || g.category.parent?.color || g.category.parent?.parent?.color || '#6366f1';
            const l1Slug = g.category.parent?.parent?.slug || g.category.parent?.slug || g.category.slug;

            return {
                type: 'group',
                id: g.id,
                slug: g.slug,
                title: g.name,
                subtitle: g.city,
                l1Slug: l1Slug || 'sigulda',
                color: l1Color,
                image: g.bannerImage
            };
        });

        const mappedEvents: ScopedResult[] = events.map(e => {
            const g = e.group;
            const l1Color = g.category.color || g.category.parent?.color || g.category.parent?.parent?.color || '#6366f1';
            const l1Slug = g.category.parent?.parent?.slug || g.category.parent?.slug || g.category.slug;

            return {
                type: 'event',
                id: e.id,
                slug: e.slug,
                title: e.title,
                subtitle: e.location || g.city,
                l1Slug: l1Slug || 'sigulda',
                color: l1Color,
                image: e.bannerImage || g.bannerImage,
                groupSlug: g.slug
            };
        });

        return [...mappedCategories, ...mappedGroups, ...mappedEvents];
    },

    /**
     * Standard page-level group fetching with full filters.
     */
    async getGroups(filters: DiscoveryFilters, locale: string) {
        const lang = locale === 'en' ? 'en' : 'lv';

        try {
            const { city, categoryId, tag, query, type, take = 12, skip = 0 } = filters;
            const where: any = {};

            where.AND = [];

            // 0. Content Safety: Only allow ACTIVE and non-wildcard categories
            where.AND.push({
                category: {
                    status: 'ACTIVE',
                    isWildcard: false
                }
            });

            // 1. City Filter
            if (city && city !== 'all') {
                where.city = city;
            }

            // 2. Type Filter - Show only PUBLIC groups by default in discovery
            if (type && type !== 'all') {
                where.type = type;
            } else {
                where.type = 'PUBLIC';
            }

            // 2. Category Hierarchy Filter
            if (categoryId) {
                const categoryMatch = {
                    OR: [
                        { id: categoryId },              // Direct match (L1, L2, or L3)
                        { parentId: categoryId },        // Children (L2 or L3)
                        { parent: { parentId: categoryId } } // Grandchildren (L3)
                    ]
                };
                where.AND.push({
                    OR: [
                        { category: categoryMatch },
                        { tags: { some: categoryMatch } }
                    ]
                });
            }

            // 2b. Specific Tag Filter (L2/L3) with Hierarchy Support
            if (tag) {
                where.AND.push({
                    OR: [
                        { category: { slug: tag } },
                        { category: { parent: { slug: tag } } },
                        { category: { parent: { parent: { slug: tag } } } },
                        { tags: { some: { slug: tag } } },
                        { tags: { some: { parent: { slug: tag } } } },
                        { tags: { some: { parent: { parent: { slug: tag } } } } }
                    ]
                });
            }

            // 3. Search Query
            if (query) {
                const searchQuery = { contains: query, mode: 'insensitive' as const };
                where.AND.push({
                    OR: [
                        { name: searchQuery },
                        { description: searchQuery },
                        {
                            category: {
                                OR: [
                                    { titles: { some: { lang, title: searchQuery } } },
                                    { slug: searchQuery }
                                ]
                            }
                        }
                    ]
                });
            }

            // 4. Fetch Groups with Caching for Taxonomy Heavy Joins
            const fetchRawGroups = async (searchWhere: typeof where, reqLang: string, reqTake: number, reqSkip: number) => {
                const results = await prisma.group.findMany({
                    where: searchWhere,
                    take: reqTake + 1,
                    skip: reqSkip,
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        description: true,
                        city: true,
                        type: true,
                        bannerImage: true,
                        createdAt: true,
                        category: {
                            select: {
                                id: true,
                                slug: true,
                                color: true,
                                titles: { where: { lang: reqLang }, select: { title: true } },
                                parent: {
                                    select: {
                                        id: true,
                                        slug: true,
                                        color: true,
                                        titles: { where: { lang: reqLang }, select: { title: true } },
                                        parent: {
                                            select: {
                                                id: true,
                                                slug: true,
                                                color: true,
                                                titles: { where: { lang: reqLang }, select: { title: true } }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        _count: {
                            select: { members: true }
                        },
                        members: {
                            take: 5,
                            orderBy: { joinedAt: 'desc' as const },
                            select: {
                                user: {
                                    select: { id: true, name: true, avatarSeed: true }
                                }
                            }
                        }
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
                [`groups-search-${lang}-${JSON.stringify(where)}-${take}-${skip}`],
                {
                    revalidate: 60,
                    tags: ['groups']
                }
            ) as unknown as typeof fetchRawGroups;

            const { items: groups, hasMore } = await fetchGroupsWithCategories(where, lang, take, skip);

            // 5. Get total count for display (uncached for accuracy or cached with shorter TTL)
            const totalCount = await prisma.group.count({ where });

            const mappedGroups = groups.map((g) => {
                // Inherit color from the highest ancestor that has one (usually L1)
                const inheritedColor = g.category.color
                    || g.category.parent?.color
                    || g.category.parent?.parent?.color;

                const l1Slug = g.category.parent?.parent?.slug
                    || g.category.parent?.slug
                    || g.category.slug;

                return {
                    id: g.id,
                    name: g.name,
                    slug: g.slug,
                    description: g.description,
                    city: g.city,
                    type: g.type,
                    bannerImage: g.bannerImage,
                    memberCount: g._count.members,
                    members: g.members.map(m => m.user),
                    accentColor: inheritedColor || '#6366f1',
                    category: {
                        id: g.category.id,
                        slug: g.category.slug,
                        l1Slug,
                        title: g.category.titles[0]?.title ?? g.category.slug,
                        parentTitle: g.category.parent?.titles[0]?.title,
                        color: inheritedColor || '#6366f1'
                    },
                };
            });

            return { groups: mappedGroups, hasMore, totalCount };
        } catch (error) {
            console.error('[DiscoveryService.getGroups] Error:', error);
            return { groups: [], hasMore: false, totalCount: 0 };
        }
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
                    color: c.color ?? '#6366f1'
                }));
            },
            [`discovery-categories-${lang}`],
            {
                revalidate: 3600, // Revalidate every hour
                tags: ['categories']
            }
        )();
    },

    async snapInterest(query: string, locale: string) {
        const lang = locale === 'en' ? 'en' : 'lv';

        const snapped = await prisma.category.findFirst({
            where: {
                level: { in: [1, 2] },
                status: 'ACTIVE',
                titles: {
                    some: {
                        lang,
                        title: { equals: query, mode: 'insensitive' }
                    }
                }
            },
            include: {
                parent: true
            }
        });

        if (!snapped) return null;

        return {
            id: snapped.id,
            l1Id: snapped.level === 1 ? snapped.id : snapped.parentId
        };
    },

    async getContextualTaxonomy(categoryId: string | null, locale: string): Promise<ContextualTaxonomy | null> {
        if (!categoryId) return null;
        const lang = locale === 'en' ? 'en' : 'lv';

        return await unstable_cache(
            async () => {
                const target = await prisma.category.findUnique({
                    where: { id: categoryId },
                    include: {
                        titles: { where: { lang } },
                        parent: {
                            include: {
                                titles: { where: { lang } },
                                parent: {
                                    include: { titles: { where: { lang } } }
                                }
                            }
                        }
                    }
                });
                if (!target) return null;

                let l1Id = target.id;
                const activeHierarchy = [{ id: target.id, title: target.titles[0]?.title ?? target.slug, level: target.level }];

                if (target.level === 3 && target.parent?.parent) {
                    l1Id = target.parent.parentId!;
                    activeHierarchy.unshift({ id: target.parent.id, title: target.parent.titles[0]?.title ?? target.parent.slug, level: 2 });
                    activeHierarchy.unshift({ id: target.parent.parent.id, title: target.parent.parent.titles[0]?.title ?? target.parent.parent.slug, level: 1 });
                } else if (target.level === 2 && target.parent) {
                    l1Id = target.parentId!;
                    activeHierarchy.unshift({ id: target.parent.id, title: target.parent.titles[0]?.title ?? target.parent.slug, level: 1 });
                }

                const l1Tree = await prisma.category.findUnique({
                    where: { id: l1Id },
                    include: {
                        titles: { where: { lang } },
                        children: {
                            where: { status: 'ACTIVE' },
                            include: {
                                titles: { where: { lang } },
                                children: {
                                    where: { status: 'ACTIVE' },
                                    include: { titles: { where: { lang } } },
                                    orderBy: { slug: 'asc' }
                                }
                            },
                            orderBy: { slug: 'asc' }
                        }
                    }
                });

                if (!l1Tree) return null;

                return {
                    l1: {
                        id: l1Tree.id,
                        slug: l1Tree.slug,
                        title: l1Tree.titles[0]?.title ?? l1Tree.slug,
                        color: l1Tree.color ?? '#6366f1'
                    },
                    l2s: l1Tree.children.map(c2 => ({
                        id: c2.id,
                        slug: c2.slug,
                        title: c2.titles[0]?.title ?? c2.slug,
                        children: c2.children.map(c3 => ({
                            id: c3.id,
                            slug: c3.slug,
                            title: c3.titles[0]?.title ?? c3.slug
                        }))
                    })),
                    activeHierarchy
                };
            },
            [`contextual-taxonomy-${lang}-${categoryId}`],
            { revalidate: 3600, tags: ['categories'] }
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
                titles: { where: { lang } }
            }
        });

        if (!category) return null;
        return category.titles[0]?.title || category.slug;
    }
};
