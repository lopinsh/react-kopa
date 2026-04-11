export interface ResolvedTaxonomy {
    categoryId: string;
    categorySlug: string;
    categoryTitle: string;
    level: number;
    parentTitle: string | null;
    l1Slug: string;
    accentColor: string;
}

/**
 * Minimal category shape required for resolution.
 * Matches the common include patterns in services.
 */
export type TaxonomyModel = {
    id: string;
    slug: string;
    level: number;
    color?: string | null;
    titles?: Array<{ title: string }>;
    parent?: {
        id: string;
        slug: string;
        color?: string | null;
        titles?: Array<{ title: string }>;
        parent?: {
            id: string;
            slug: string;
            color?: string | null;
            titles?: Array<{ title: string }>;
        } | null;
    } | null;
};

/**
 * Unified service to resolve taxonomy hierarchies, inherited colors, and slugs.
 * Prevents redundancy across Group, Event, and Discovery services.
 */
export const TaxonomyResolver = {
    /**
     * Resolves full hierarchy details from a category object.
     * Expects titles and parents to be pre-fetched based on the TaxonomyModel shape.
     */
    resolve(category: TaxonomyModel, fallbackColor: string = '#6366f1'): ResolvedTaxonomy {
        const l1 = category.level === 1 ? category : (category.level === 2 ? category.parent : category.parent?.parent);

        const l1Slug = l1?.slug || category.slug;

        // Color inheritance: Category > Parent > Grandparent > Fallback
        const accentColor = category.color
            || category.parent?.color
            || category.parent?.parent?.color
            || fallbackColor;

        const categoryTitle = category.titles?.[0]?.title || category.slug;
        const parentTitle = category.parent?.titles?.[0]?.title || null;

        return {
            categoryId: category.id,
            categorySlug: category.slug,
            categoryTitle,
            level: category.level,
            parentTitle,
            l1Slug,
            accentColor
        };
    },

    /**
     * Standard Prisma 'include' fragment for taxonomy resolution.
     * Use this in findUnique/findMany to ensure resolve() has the data it needs.
     */
    getInclude(lang: string = 'lv') {
        return {
            titles: { where: { lang }, select: { title: true } },
            parent: {
                include: {
                    titles: { where: { lang }, select: { title: true } },
                    parent: {
                        include: {
                            titles: { where: { lang }, select: { title: true } }
                        }
                    }
                }
            }
        };
    }
};
