import type { GroupType } from '@prisma/client';
import { TaxonomyResolver, type TaxonomyModel } from './taxonomy-resolver.service';

/** Minimal user shape used in group member avatar stacks */
export interface GroupMemberPreview {
    id: string;
    name: string | null;
    avatarSeed: string | null;
    image: string | null;
}

/**
 * Query fragment every group card needs besides the group's own columns and its category: the
 * member count (pending applicants are not members) and up to 5 recent member previews. Spread it
 * into a Prisma `select` or `include`.
 */
export const GROUP_CARD_RELATIONS = {
    _count: { select: { members: { where: { role: { not: 'PENDING' as const } } } } },
    members: {
        where: { role: { not: 'PENDING' as const } },
        take: 5,
        orderBy: { joinedAt: 'desc' as const },
        select: {
            user: { select: { id: true, name: true, avatarSeed: true, image: true } },
        },
    },
} as const;

/** What `toGroupCard` reads from a group fetched with the card columns, its category chain and GROUP_CARD_RELATIONS. */
export interface GroupCardSource {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    city: string;
    type: GroupType;
    bannerImage: string | null;
    category: TaxonomyModel;
    _count: { members: number };
    members: { user: GroupMemberPreview }[];
}

/** The one shape the group cards (discovery, profile, my groups) are rendered from. */
export function toGroupCard(group: GroupCardSource) {
    const resolved = TaxonomyResolver.resolve(group.category);
    return {
        id: group.id,
        name: group.name,
        slug: group.slug,
        description: group.description,
        city: group.city,
        type: group.type,
        bannerImage: group.bannerImage,
        memberCount: group._count.members,
        members: group.members.map((m) => m.user),
        accentColor: resolved.accentColor,
        category: {
            id: resolved.categoryId,
            slug: resolved.categorySlug,
            l1Slug: resolved.l1Slug,
            title: resolved.categoryTitle,
            parentTitle: resolved.parentTitle,
            color: resolved.accentColor,
        },
    };
}

export type GroupCardData = ReturnType<typeof toGroupCard>;
