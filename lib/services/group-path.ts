import type { Prisma } from '@prisma/client';

/**
 * Where-clause for a group addressed by its URL path. A slug is only unique within one
 * primary category, so the path's L1 slug picks the group whose category chain
 * (L1, L2 or L3) belongs to that L1. Without an L1 slug only the group slug is matched.
 */
export function findGroupByPath(groupSlug: string, l1Slug?: string): Prisma.GroupWhereInput {
    if (!l1Slug) return { slug: groupSlug };
    return {
        slug: groupSlug,
        category: {
            OR: [
                { slug: l1Slug, level: 1 },
                { parent: { slug: l1Slug, level: 1 } },
                { parent: { parent: { slug: l1Slug, level: 1 } } },
            ],
        },
    };
}
