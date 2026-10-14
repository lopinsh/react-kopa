import { TaxonomyResolver, type TaxonomyModel } from './taxonomy-resolver.service';
import { pickTitle } from '@/lib/utils/localized-title';

/**
 * Query fragment every group card needs besides the group's own columns and its category: the
 * member count (pending applicants are not members) and the active tags (the card's sub-categories).
 * Spread it into a Prisma `select` or `include`.
 */
export const GROUP_CARD_RELATIONS = {
    _count: { select: { members: { where: { role: { not: 'PENDING' as const } } } } },
    tags: {
        where: { status: 'ACTIVE' as const },
        select: { level: true, slug: true, titles: { select: { lang: true, title: true } } },
    },
} as const;

/** What `toGroupCard` reads from a group fetched with the card columns, its category chain and GROUP_CARD_RELATIONS. */
export interface GroupCardSource {
    id: string;
    name: string;
    slug: string;
    city: string;
    lookingFor: string | null;
    bannerImage: string | null;
    category: TaxonomyModel;
    _count: { members: number };
    tags: Array<{ level: number; slug: string; titles: Array<{ lang: string; title: string }> }>;
}

/** The one shape the group cards and rows (discovery, profile, my groups) are rendered from. */
export function toGroupCard(group: GroupCardSource, lang: string) {
    const resolved = TaxonomyResolver.resolve(group.category);
    return {
        id: group.id,
        name: group.name,
        slug: group.slug,
        city: group.city,
        lookingFor: group.lookingFor,
        bannerImage: group.bannerImage,
        memberCount: group._count.members,
        category: {
            slug: resolved.categorySlug,
            l1Slug: resolved.l1Slug,
            l1Title: resolved.l1Title,
            color: resolved.accentColor,
        },
        subCategories: group.tags.filter((t) => t.level === 2).map((t) => pickTitle(t.titles, lang, t.slug)),
    };
}

export type GroupCardData = ReturnType<typeof toGroupCard>;
