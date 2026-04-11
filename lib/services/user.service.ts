import { prisma } from '@/lib/prisma';
import type { ActionResponse } from '@/types/actions';
import { TaxonomyResolver } from './taxonomy-resolver.service';

/** Minimal user shape used in group member avatar stacks */
export interface GroupMemberPreview {
    id: string;
    name: string | null;
    avatarSeed: string | null;
}

/** Shared query fragment for fetching up to 5 recent member previews per group */
const MEMBER_PREVIEW_SELECT = {
    members: {
        take: 5,
        orderBy: { joinedAt: 'desc' as const },
        select: {
            user: {
                select: { id: true, name: true, avatarSeed: true }
            }
        }
    }
} as const;

export const UserService = {
    async getUserProfile(userId: string) {
        return await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, image: true, email: true, username: true, bio: true, cities: true, avatarSeed: true }
        });
    },

    /**
     * Checks if a username is available. Returns true if no user with that username exists.
     */
    async checkUsernameAvailability(username: string): Promise<boolean> {
        const existing = await prisma.user.findUnique({
            where: { username },
            select: { id: true },
        });
        return existing === null;
    },


    async updateProfile(userId: string, data: {
        name?: string;
        image?: string;
        username?: string;
        bio?: string;
        cities?: string[];
        avatarSeed?: string;
    }): Promise<ActionResponse> {
        try {
            // Username uniqueness check — only when a username is being set
            if (data.username) {
                const existing = await prisma.user.findUnique({
                    where: { username: data.username },
                    select: { id: true }
                });
                if (existing && existing.id !== userId) {
                    return { success: false, error: 'USERNAME_TAKEN' };
                }
            }

            await prisma.user.update({
                where: { id: userId },
                data
            });

            return { success: true };
        } catch (error) {
            console.error('[UserService.updateProfile] Error:', error);
            return { success: false, error: 'UPDATE_FAILED' };
        }
    },

    async getUserByUsername(username: string, viewerId?: string) {
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                memberships: {
                    where: {
                        group: viewerId
                            ? { OR: [{ type: 'PUBLIC' }, { members: { some: { userId: viewerId } } }] }
                            : { type: 'PUBLIC' }
                    },
                    include: {
                        group: {
                            include: {
                                category: {
                                    include: { parent: { include: { parent: true, titles: true } }, titles: true }
                                },
                                _count: { select: { members: true } },
                                ...MEMBER_PREVIEW_SELECT
                            }
                        }
                    }
                }
            }
        });

        if (!user) return null;

        const formattedGroups = user.memberships.map(m => {
            const resolved = TaxonomyResolver.resolve(m.group.category, '#F97316');
            const accentColor = m.group.accentColor || resolved.accentColor;
            return {
                id: m.group.id,
                name: m.group.name,
                slug: m.group.slug,
                description: m.group.description,
                city: m.group.city,
                type: m.group.type,
                bannerImage: m.group.bannerImage,
                memberCount: m.group._count.members,
                members: m.group.members.map(mb => mb.user) satisfies GroupMemberPreview[],
                category: {
                    title: resolved.categoryTitle,
                    parentTitle: resolved.parentTitle,
                    l1Slug: resolved.l1Slug,
                    color: resolved.accentColor
                },
                accentColor
            };
        });

        return { ...user, publicGroups: formattedGroups };
    },

    async getOwnProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: {
                    select: { memberships: true, attendances: true }
                },
                memberships: {
                    take: 6,
                    orderBy: { joinedAt: 'desc' },
                    include: {
                        group: {
                            include: {
                                category: { include: { parent: { include: { parent: true, titles: true } }, titles: true } },
                                _count: { select: { members: true } },
                                ...MEMBER_PREVIEW_SELECT
                            }
                        }
                    }
                }
            }
        });

        if (!user) return null;

        const formattedGroups = user.memberships.map(m => {
            const resolved = TaxonomyResolver.resolve(m.group.category, '#F97316');
            const accentColor = m.group.accentColor || resolved.accentColor;
            return {
                id: m.group.id,
                name: m.group.name,
                slug: m.group.slug,
                description: m.group.description,
                city: m.group.city,
                type: m.group.type,
                bannerImage: m.group.bannerImage,
                memberCount: m.group._count.members,
                members: m.group.members.map(mb => mb.user) satisfies GroupMemberPreview[],
                category: {
                    title: resolved.categoryTitle,
                    parentTitle: resolved.parentTitle,
                    l1Slug: resolved.l1Slug,
                    color: resolved.accentColor
                },
                accentColor
            };
        });

        return { ...user, recentGroups: formattedGroups };
    },

    async getMyGroups(userId: string, locale: string) {
        const lang = locale === 'en' ? 'en' : 'lv';
        const memberships = await prisma.membership.findMany({
            where: { userId },
            include: {
                group: {
                    include: {
                        category: {
                            include: TaxonomyResolver.getInclude(lang)
                        },
                        _count: {
                            select: {
                                members: { where: { role: { not: 'PENDING' } } }
                            }
                        },
                        ...MEMBER_PREVIEW_SELECT
                    }
                }
            },
            orderBy: { joinedAt: 'desc' }
        });

        // Re-fetch pending count for each group manually since Prisma _count doesn't allow multiple where clauses on the same relation easily
        // But wait, we can just do a parallel query or raw count, or better: we just pull `members: { where: { role: 'PENDING' } }` since we only need the count.
        // Actually let's query the pending counts for these groups.
        const groupIds = memberships.map(m => m.group.id);
        const pendingCounts = await prisma.membership.groupBy({
            by: ['groupId'],
            where: {
                groupId: { in: groupIds },
                role: 'PENDING'
            },
            _count: true
        });

        const pendingCountMap = new Map(pendingCounts.map(pc => [pc.groupId, pc._count]));

        return memberships.map(m => {
            const resolved = TaxonomyResolver.resolve(m.group.category, '#F97316');
            const accentColor = m.group.accentColor || resolved.accentColor;

            return {
                id: m.group.id,
                name: m.group.name,
                slug: m.group.slug,
                description: m.group.description,
                city: m.group.city,
                type: m.group.type,
                bannerImage: m.group.bannerImage,
                memberCount: m.group._count.members,
                pendingCount: pendingCountMap.get(m.group.id) || 0,
                members: m.group.members.map(mb => mb.user) satisfies GroupMemberPreview[],
                category: {
                    title: resolved.categoryTitle,
                    parentTitle: resolved.parentTitle,
                    l1Slug: resolved.l1Slug,
                    color: resolved.accentColor
                },
                accentColor,
                role: m.role
            };
        });
    }
};
