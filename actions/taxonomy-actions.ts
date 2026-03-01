'use server';

import { prisma } from '@/lib/prisma';
import { ActionResponse } from '@/types/actions';
import { handleActionError } from '@/lib/action-utils';
import { unstable_cache } from 'next/cache';

// ─── Types ────────────────────────────────────────────────────────────────────

export type L3Tag = {
    id: string;
    slug: string;
    title: string;
    isWildcard: boolean;
};

export type L2Category = {
    id: string;
    slug: string;
    title: string;
    tags: L3Tag[];
};

export type L1Category = {
    id: string;
    slug: string;
    title: string;
    color: string;
    subcategories: L2Category[];
};

export type TaxonomyTree = L1Category[];

// ─── Server Action ────────────────────────────────────────────────────────────

/**
 * Fetches the group taxonomy from the database and structures it into a tree.
 * Levels: L1 (Group) -> L2 (Category) -> L3 (Tag/Interest)
 * Cached for 1 hour with revalidation tag.
 */
export async function getTaxonomy(locale: string): Promise<ActionResponse<TaxonomyTree>> {
    const lang = locale === 'en' ? 'en' : 'lv';

    try {
        const tree = await unstable_cache(
            async () => {
                // Fetch all categories with their translations in one query
                const allCategories = await prisma.category.findMany({
                    where: {
                        status: 'ACTIVE',
                    },
                    include: {
                        titles: {
                            where: { lang },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                });

                if (allCategories.length === 0) {
                    console.warn('[getTaxonomy] No categories found in database.');
                    return [];
                }

                // Helper to get title for current locale or fallback to slug
                const getTitle = (cat: { titles: { title: string }[]; slug: string }) =>
                    cat.titles[0]?.title ?? cat.slug;

                // Filter categories by level
                const l1s = allCategories.filter((c: { level: number }) => c.level === 1);
                const l2s = allCategories.filter((c: { level: number }) => c.level === 2);
                const l3s = allCategories.filter((c: { level: number }) => c.level === 3);

                // Build the tree structure
                return l1s.map((l1: any) => {
                    const subcategories: L2Category[] = l2s
                        .filter((l2: any) => l2.parentId === l1.id)
                        .map((l2: any) => ({
                            id: l2.id,
                            slug: l2.slug,
                            title: getTitle(l2),
                            tags: l3s
                                .filter((l3: any) => l3.parentId === l2.id)
                                .map((l3: any) => ({
                                    id: l3.id,
                                    slug: l3.slug,
                                    title: getTitle(l3),
                                    isWildcard: l3.isWildcard,
                                })),
                        }));

                    return {
                        id: l1.id,
                        slug: l1.slug,
                        title: getTitle(l1),
                        color: l1.color ?? '#6366f1',
                        subcategories,
                    };
                });
            },
            [`taxonomy-${lang}`],
            {
                revalidate: 3600,
                tags: ['categories']
            }
        )();

        return { success: true, data: tree };
    } catch (error) {
        return handleActionError(error, 'INTERNAL_SERVER_ERROR');
    }
}
