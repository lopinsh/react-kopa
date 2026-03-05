import { prisma } from '@/lib/prisma';
import type { ActionResponse } from '@/types/actions';

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
            const l1Slug = m.group.category.parent?.parent?.slug
                || m.group.category.parent?.slug
                || m.group.category.slug;
            const accentColor = m.group.category.parent?.color || m.group.category.color || '#F97316';
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
                    title: m.group.category.titles[0]?.title || m.group.category.slug,
                    parentTitle: m.group.category.parent?.titles?.[0]?.title,
                    l1Slug,
                    color: accentColor
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
            const l1Slug = m.group.category.parent?.parent?.slug
                || m.group.category.parent?.slug
                || m.group.category.slug;
            const accentColor = m.group.category.parent?.color || m.group.category.color || '#F97316';
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
                    title: m.group.category.titles[0]?.title || m.group.category.slug,
                    parentTitle: m.group.category.parent?.titles?.[0]?.title,
                    l1Slug,
                    color: accentColor
                },
                accentColor
            };
        });

        return { ...user, recentGroups: formattedGroups };
    },

    async getMyGroups(userId: string, locale: string) {
        const memberships = await prisma.membership.findMany({
            where: { userId },
            include: {
                group: {
                    include: {
                        category: {
                            include: {
                                parent: { include: { parent: true, titles: { where: { lang: locale } } } },
                                titles: { where: { lang: locale } }
                            }
                        },
                        _count: { select: { members: true } },
                        ...MEMBER_PREVIEW_SELECT
                    }
                }
            },
            orderBy: { joinedAt: 'desc' }
        });

        return memberships.map(m => {
            const l1Slug = m.group.category.parent?.parent?.slug
                || m.group.category.parent?.slug
                || m.group.category.slug;
            const accentColor = m.group.category.parent?.color || m.group.category.color || '#F97316';

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
                    title: m.group.category.titles[0]?.title || 'Unknown',
                    parentTitle: m.group.category.parent?.titles?.[0]?.title,
                    l1Slug,
                    color: accentColor
                },
                accentColor,
                role: m.role
            };
        });
    }
};
