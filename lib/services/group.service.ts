import { prisma } from '@/lib/prisma';
import { cache } from 'react';
import { MembershipRole } from '@prisma/client';
import { GroupFormValues } from '@/lib/validations/group';
import { ErrorCode } from '@/types/actions';
import { Prisma } from '@prisma/client';

export interface GroupContext {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    city: string;
    type: 'PUBLIC' | 'PRIVATE';
    categoryId: string;
    bannerImage: string | null;
    instructions: string | null;
    isAcceptingMembers: boolean;
    discordLink: string | null;
    websiteLink: string | null;
    instagramLink: string | null;
    memberCount: number;
    eventCount: number;
    isMember: boolean;
    userRole: MembershipRole | 'PENDING' | null;
    accentColor: string;
    sections: Array<{
        id: string;
        title: string;
        content: string;
        order: number;
        visibility: 'PUBLIC' | 'MEMBERS_ONLY';
    }>;
    members: Array<{
        id: string;
        role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'PENDING';
        joinedAt: Date;
        user: { id: string; name: string | null; image: string | null; allowDirectMessages: boolean; isProfilePublic: boolean };
        applicationMessages: Array<{
            id: string;
            content: string;
            createdAt: Date;
            senderId: string;
            sender: { name: string | null; image: string | null };
        }>;
    }>;
    category: {
        id: string;
        title: string;
        slug: string;
        level: number;
        parentTitle: string | null;
        l1Slug: string;
        color: string | null;
    };
    tags: Array<{
        id: string;
        title: string;
        slug: string;
        level: number;
    }>;
    inquiries: Array<{
        id: string;
        content: string;
        createdAt: Date;
        senderId: string;
    }>;
}

export interface GroupServiceResponse<T = void> {
    success: true;
    data?: T;
}

export interface GroupServiceError {
    success: false;
    error: ErrorCode;
}

export type GroupServiceResult<T = void> = GroupServiceResponse<T> | GroupServiceError;

/**
 * Service to handle business logic and data fetching for Groups.
 * This acts as the single source of truth for group state and hierarchy resolution.
 */
export const GroupService = {
    /**
     * Finds a category by its slug.
     */
    async findCategoryBySlug(slug: string): Promise<{ id: string; slug: string } | null> {
        return await prisma.category.findUnique({
            where: { slug },
            select: { id: true, slug: true }
        });
    },

    /**
     * Fetches memberships for a user and resolves group contexts.
     * Cached per-request to prevent redundant queries in layouts and pages.
     */
    getUserMemberships: cache(async (userId: string, locale: string) => {
        const lang = locale === 'en' ? 'en' : 'lv';

        const memberships = await prisma.membership.findMany({
            where: { userId },
            include: {
                group: {
                    include: {
                        category: {
                            include: {
                                titles: { where: { lang } },
                                parent: {
                                    include: {
                                        titles: { where: { lang } },
                                        parent: { include: { titles: { where: { lang } } } }
                                    }
                                }
                            }
                        },
                        _count: { select: { members: { where: { role: { not: 'PENDING' as MembershipRole } } } } },
                        members: {
                            take: 5,
                            orderBy: { joinedAt: 'desc' as const },
                            select: {
                                user: {
                                    select: { id: true, name: true, username: true, avatarSeed: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        return memberships.map(m => {
            const g = m.group;
            const currentCat = g.category;

            // Resolve L1/L2 details for the card
            const inheritedColor = g.accentColor
                || currentCat.color
                || currentCat.parent?.color
                || currentCat.parent?.parent?.color
                || '#6366f1';

            const l1Slug = currentCat.parent?.parent?.slug
                || currentCat.parent?.slug
                || currentCat.slug;

            return {
                id: g.id,
                name: g.name,
                slug: g.slug,
                description: g.description,
                city: g.city,
                type: g.type,
                bannerImage: g.bannerImage,
                role: m.role,
                memberCount: g._count?.members ?? 0,
                members: g.members.map(mb => mb.user),
                accentColor: inheritedColor,
                category: {
                    id: currentCat.id,
                    slug: currentCat.slug,
                    l1Slug,
                    title: currentCat.titles[0]?.title ?? currentCat.slug,
                    parentTitle: (currentCat as any).parent?.titles[0]?.title,
                    color: inheritedColor
                }
            };
        });
    }),

    /**
     * Fetches a group and resolves its full context (roles, membership, taxonomy).
     * Cached per-request to prevent redundant queries in layouts and pages.
     */
    getGroupWithContext: cache(async (
        groupSlug: string,
        locale: string,
        l1Slug?: string,
        currentUserId?: string
    ): Promise<GroupContext | null> => {
        const lang = locale === 'en' ? 'en' : 'lv';

        const where: Prisma.GroupFindFirstArgs['where'] = { slug: groupSlug };
        if (l1Slug) {
            where.category = {
                OR: [
                    { slug: l1Slug, level: 1 },
                    { parent: { slug: l1Slug, level: 1 } },
                    { parent: { parent: { slug: l1Slug, level: 1 } } }
                ]
            };
        }

        const groupInclude = {
            category: {
                include: {
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
                }
            },
            tags: {
                select: {
                    id: true,
                    slug: true,
                    level: true,
                    titles: { where: { lang }, select: { title: true } }
                }
            },
            members: {
                select: {
                    id: true,
                    role: true,
                    userId: true,
                    joinedAt: true,
                    user: {
                        select: { id: true, name: true, username: true, avatarSeed: true, image: true, allowDirectMessages: true, isProfilePublic: true }
                    }
                }
            },
            appMessages: {
                include: {
                    sender: {
                        select: { name: true, username: true, avatarSeed: true, image: true }
                    }
                },
                orderBy: { createdAt: 'asc' } as const
            },
            sections: {
                orderBy: { order: 'asc' } as const,
                select: {
                    id: true,
                    title: true,
                    content: true,
                    order: true,
                    visibility: true
                }
            },
            _count: {
                select: { members: { where: { role: { not: 'PENDING' as MembershipRole } } }, events: true }
            }
        };

        const group = await prisma.group.findFirst({
            where,
            include: groupInclude
        }) as (Prisma.GroupGetPayload<{ include: typeof groupInclude }> | null);

        if (!group) return null;

        const g = group;

        // 1. Resolve Membership & Role
        const userMembership = currentUserId ? g.members.find((m: { userId: string }) => m.userId === currentUserId) : null;
        const isMember = !!userMembership && userMembership.role !== 'PENDING';
        const userRole = userMembership?.role || null;
        const isAdmin = userRole === 'OWNER' || userRole === 'ADMIN';

        // 2. Format Members (with application messages for admins)
        const formattedMembers = group.members.map((m: any) => {
            const thread = group.appMessages
                .filter((msg: any) => msg.applicationUserId === m.userId)
                .map((msg: any) => ({
                    id: msg.id,
                    content: msg.content,
                    createdAt: msg.createdAt,
                    senderId: msg.senderId,
                    sender: msg.sender
                }));

            return {
                id: m.id,
                role: m.role,
                joinedAt: m.joinedAt,
                user: m.user,
                applicationMessages: thread
            };
        });

        // 3. Resolve Taxonomy & Breadcrumbs
        const currentCat = g.category;
        const currentCatTitle = currentCat.titles?.[0]?.title || currentCat.slug;
        let categoryTitle = currentCatTitle;
        let categorySlug = currentCat.slug;
        let parentTitle = currentCat.parent?.titles?.[0]?.title || null;
        const accentColor = g.accentColor || currentCat.color || currentCat.parent?.color || currentCat.parent?.parent?.color || '#6366f1';

        // If the main category is L1, check if there's an L2 tag we can feature in breadcrumbs
        if (currentCat.level === 1 && g.tags.length > 0) {
            const l2Tag = g.tags.find((t: any) => t.level === 2 || t.parentId === (currentCat as any).id);
            if (l2Tag) {
                parentTitle = categoryTitle;
                categoryTitle = (l2Tag as any).titles?.[0]?.title || l2Tag.slug;
                categorySlug = l2Tag.slug;
            }
        }

        // 4. Final Context Construction
        const sections = (g.sections && g.sections.length > 0)
            ? g.sections
            : GroupService.getVirtualSections(group);

        return {
            id: g.id,
            name: g.name,
            slug: g.slug,
            description: g.description,
            city: g.city,
            type: g.type as 'PUBLIC' | 'PRIVATE',
            categoryId: g.categoryId,
            bannerImage: g.bannerImage,
            instructions: g.instructions,
            isAcceptingMembers: g.isAcceptingMembers,
            discordLink: g.discordLink,
            websiteLink: g.websiteLink,
            instagramLink: g.instagramLink,
            memberCount: g._count.members,
            eventCount: g._count.events,
            isMember,
            userRole: userRole as MembershipRole | null,
            accentColor,
            sections: sections as GroupContext['sections'],
            members: formattedMembers as GroupContext['members'],
            category: {
                id: currentCat.id,
                title: categoryTitle,
                slug: categorySlug,
                level: currentCat.level,
                parentTitle,
                l1Slug: (currentCat.level === 3 && currentCat.parent?.parent) ? currentCat.parent.parent.slug : (currentCat.level === 2 && currentCat.parent) ? currentCat.parent.slug : currentCat.slug,
                color: currentCat.color || currentCat.parent?.color || currentCat.parent?.parent?.color || null
            },
            tags: g.tags.map((t: { id: string; slug: string; level: number }) => ({
                id: t.id,
                title: (t as any).titles?.[0]?.title || t.slug,
                slug: t.slug,
                level: t.level
            })),
            inquiries: isAdmin ? g.appMessages.map((msg: { id: string; content: string; createdAt: Date; senderId: string }) => ({
                id: msg.id,
                content: msg.content,
                createdAt: msg.createdAt,
                senderId: msg.senderId
            })) : []
        };
    }),

    async createGroup(data: GroupFormValues, userId: string): Promise<GroupServiceResult<{ slug: string; id: string; l1Slug: string }>> {
        const baseSlug = slugify(data.name);
        const targetCategoryId = data.categoryId;

        let slug = baseSlug;
        // Check for slug collisions (simplified for service)
        const existing = await prisma.group.findFirst({
            where: { categoryId: targetCategoryId, slug }
        });
        if (existing) {
            slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
        }

        const tagsToConnect = data.tagIds ? data.tagIds.map((id: string) => ({ id })) : [];

        // Pre-fetch category to get l1Slug
        const category = await prisma.category.findUnique({
            where: { id: targetCategoryId },
            include: { parent: { include: { parent: true } } }
        });
        const l1Slug = (category?.level === 3 && category?.parent?.parent) ? category.parent.parent.slug : (category?.level === 2 && category?.parent) ? category.parent.slug : category?.slug || '';

        const group = await prisma.group.create({
            data: {
                name: data.name,
                slug,
                description: data.description,
                city: data.city || 'Riga',
                type: data.type,
                categoryId: targetCategoryId,
                bannerImage: data.bannerImage,
                instructions: data.instructions,
                discordLink: data.discordLink,
                websiteLink: data.websiteLink,
                instagramLink: data.instagramLink,
                isAcceptingMembers: data.isAcceptingMembers,
                tags: tagsToConnect.length ? { connect: tagsToConnect } : undefined,
                members: {
                    create: {
                        userId: userId,
                        role: 'OWNER',
                    },
                },
                sections: {
                    create: [
                        {
                            title: 'About us',
                            content: data.description || '',
                            order: 0,
                            visibility: 'PUBLIC'
                        },
                        ...(data.instructions ? [{
                            title: 'Member Instructions',
                            content: data.instructions,
                            order: 1,
                            visibility: 'MEMBERS_ONLY' as any
                        }] : [])
                    ]
                }
            }
        });

        return { success: true, data: { slug: group.slug, id: group.id, l1Slug } };
    },

    /**
     * Sends an inquiry message from an admin to a pending member.
     */
    async sendApplicationInquiry(groupId: string, targetUserId: string, adminId: string, message: string): Promise<GroupServiceResult> {
        // Verify admin permissions
        const adminMembership = await prisma.membership.findUnique({
            where: { userId_groupId: { userId: adminId, groupId } }
        });

        if (!adminMembership || (adminMembership.role !== 'OWNER' && adminMembership.role !== 'ADMIN')) {
            return { success: false, error: 'FORBIDDEN' };
        }

        // Verify target is pending
        const targetMembership = await prisma.membership.findUnique({
            where: { userId_groupId: { userId: targetUserId, groupId } }
        });

        if (!targetMembership || targetMembership.role !== 'PENDING') {
            return { success: false, error: 'VALIDATION_FAILED' };
        }

        await prisma.applicationMessage.create({
            data: {
                content: message,
                senderId: adminId,
                applicationUserId: targetUserId,
                groupId: groupId
            }
        });

        return { success: true };
    },

    /**
     * Sends a general inquiry message to a group.
     */
    async sendInquiry(groupId: string, userId: string, message: string): Promise<GroupServiceResult<{ ownerId: string | null; groupName: string; categorySlug: string; groupSlug: string }>> {
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            select: { name: true, slug: true, category: { select: { slug: true } } }
        });

        if (!group) return { success: false, error: 'NOT_FOUND' };

        await prisma.applicationMessage.create({
            data: {
                content: message,
                senderId: userId,
                applicationUserId: userId,
                groupId: groupId
            }
        });

        const owner = await prisma.membership.findFirst({
            where: { groupId, role: 'OWNER' },
            select: { userId: true }
        });

        return {
            success: true,
            data: {
                ownerId: owner?.userId || null,
                groupName: group.name,
                categorySlug: group.category.slug,
                groupSlug: group.slug
            }
        };
    },

    async joinGroup(groupId: string, userId: string, message?: string): Promise<GroupServiceResult<{ pending: boolean }>> {
        const existing = await prisma.membership.findUnique({
            where: { userId_groupId: { userId, groupId } },
        });

        if (existing) return { success: false, error: 'JOIN_FAILED' };

        if (!message?.trim()) {
            return { success: false, error: 'VALIDATION_FAILED' };
        }

        await prisma.membership.create({
            data: {
                userId,
                groupId,
                role: 'PENDING',
            },
        });

        if (message) {
            await prisma.applicationMessage.create({
                data: {
                    content: message,
                    senderId: userId,
                    applicationUserId: userId,
                    groupId
                }
            });
        }

        return { success: true, data: { pending: true } };
    },

    async leaveGroup(groupId: string, userId: string): Promise<GroupServiceResult> {
        await prisma.membership.delete({
            where: { userId_groupId: { userId, groupId } },
        });
        return { success: true };
    },

    async cancelJoinRequest(groupId: string, userId: string): Promise<GroupServiceResult> {
        const membership = await prisma.membership.findUnique({
            where: { userId_groupId: { userId, groupId } },
        });

        if (!membership || membership.role !== 'PENDING') {
            return { success: false, error: 'NOT_FOUND' };
        }

        await prisma.membership.delete({
            where: { id: membership.id },
        });

        // Also cleanup application messages associated with this request
        await prisma.applicationMessage.deleteMany({
            where: { senderId: userId, groupId }
        });

        return { success: true };
    },

    async deleteGroup(groupId: string, userId: string): Promise<GroupServiceResult> {
        const isOwner = await prisma.membership.findFirst({
            where: { groupId, userId, role: 'OWNER' }
        });

        if (!isOwner) return { success: false, error: 'FORBIDDEN' };

        await prisma.group.delete({ where: { id: groupId } });
        return { success: true };
    },

    async updateGroup(groupId: string, data: GroupFormValues, userId: string): Promise<GroupServiceResult<{ slug: string; l1Slug: string }>> {
        const membership = await prisma.membership.findFirst({
            where: { groupId, userId }
        });

        const role = membership?.role;
        if (role !== 'OWNER' && role !== 'ADMIN') return { success: false, error: 'FORBIDDEN' };

        const isOwner = role === 'OWNER';

        // Admins cannot change taxonomy (categoryId and tagIds)
        const updateData: Prisma.GroupUpdateInput = {
            name: data.name,
            description: data.description,
            city: data.city,
            type: data.type,
            bannerImage: data.bannerImage,
            instructions: data.instructions,
            discordLink: data.discordLink,
            websiteLink: data.websiteLink,
            instagramLink: data.instagramLink,
            isAcceptingMembers: data.isAcceptingMembers,
            accentColor: data.accentColor || null,
        };

        if (isOwner) {
            updateData.category = { connect: { id: data.categoryId } };
            const tagsToConnect = data.tagIds ? data.tagIds.map((id: string) => ({ id })) : [];
            updateData.tags = {
                set: [], // Clear old tags
                connect: tagsToConnect
            };
        }

        const group = await prisma.group.update({
            where: { id: groupId },
            data: updateData,
            include: {
                category: {
                    include: {
                        parent: {
                            include: {
                                parent: true
                            }
                        }
                    }
                }
            }
        });

        // Resolve l1Slug for navigation
        let l1Slug = group.category.slug;
        if (group.category.level === 3 && group.category.parent?.parent) {
            l1Slug = group.category.parent.parent.slug;
        } else if (group.category.level === 2 && group.category.parent) {
            l1Slug = group.category.parent.slug;
        }

        return { success: true, data: { slug: group.slug, l1Slug } };
    },

    /**
     * Section Management
     */
    async getGroupSections(groupId: string) {
        const sections = await prisma.groupSection.findMany({
            where: { groupId },
            orderBy: { order: 'asc' }
        });

        if (sections.length > 0) return sections;

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            select: { description: true, instructions: true }
        });

        return this.getVirtualSections(group as { description: string | null; instructions: string | null });
    },

    /**
     * Internal helper to generate fallback sections if none exist in DB.
     * Matches the logic in getGroupWithContext and createGroup seeds.
     */
    getVirtualSections(group: { description: string | null; instructions?: string | null }) {
        const sections = [];
        sections.push({
            id: 'about',
            title: 'About us',
            content: group?.description || '',
            order: 0,
            visibility: 'PUBLIC' as const
        });

        if (group?.instructions) {
            sections.push({
                id: 'instructions',
                title: 'Instructions',
                content: group.instructions,
                order: 1,
                visibility: 'MEMBERS_ONLY' as const
            });
        }
        return sections;
    },

    /**
     * Internal helper to resolve group slugs.
     */
    async getGroupSlugs(groupId: string): Promise<{ slug: string; l1Slug: string } | null> {
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: {
                category: {
                    include: {
                        parent: {
                            include: {
                                parent: true
                            }
                        }
                    }
                }
            }
        });

        if (!group) return null;

        let l1Slug = group.category.slug;
        if (group.category.level === 3 && group.category.parent?.parent) {
            l1Slug = group.category.parent.parent.slug;
        } else if (group.category.level === 2 && group.category.parent) {
            l1Slug = group.category.parent.slug;
        }

        return { slug: group.slug, l1Slug };
    },

    /**
     * Internal helper to resolve group slugs by slug string.
     */
    async getGroupSlugsBySlug(slug: string): Promise<{ slug: string; l1Slug: string } | null> {
        const group = await prisma.group.findFirst({
            where: { slug },
            include: {
                category: {
                    include: {
                        parent: {
                            include: {
                                parent: true
                            }
                        }
                    }
                }
            }
        });

        if (!group) return null;

        let l1Slug = group.category.slug;
        if (group.category.level === 3 && group.category.parent?.parent) {
            l1Slug = group.category.parent.parent.slug;
        } else if (group.category.level === 2 && group.category.parent) {
            l1Slug = group.category.parent.slug;
        }

        return { slug: group.slug, l1Slug };
    },

    async upsertSection(groupId: string, data: { id?: string; title: string; content: string; order?: number; visibility?: 'PUBLIC' | 'MEMBERS_ONLY' }, userId: string): Promise<GroupServiceResult<{ slug: string; l1Slug: string }>> {
        const membership = await prisma.membership.findFirst({
            where: { groupId, userId }
        });

        const role = membership?.role;
        if (role !== 'OWNER' && role !== 'ADMIN') return { success: false, error: 'FORBIDDEN' };

        if (data.id) {
            await prisma.groupSection.update({
                where: { id: data.id },
                data: {
                    title: data.title,
                    content: data.content,
                    visibility: data.visibility,
                    order: data.order
                }
            });

            // Sync with group description if it's the home section (order 0)
            const section = await prisma.groupSection.findUnique({
                where: { id: data.id },
                select: { order: true, content: true }
            });
            if (section?.order === 0) {
                await prisma.group.update({
                    where: { id: groupId },
                    data: { description: section.content }
                });
            }
        } else {
            const count = await prisma.groupSection.count({ where: { groupId } });
            await prisma.groupSection.create({
                data: {
                    groupId,
                    title: data.title,
                    content: data.content,
                    visibility: data.visibility || 'PUBLIC',
                    order: data.order ?? count
                }
            });
        }

        const slugs = await this.getGroupSlugs(groupId);
        return { success: true, data: slugs ?? undefined };
    },

    async reorderSections(groupId: string, sectionIds: string[], userId: string): Promise<GroupServiceResult<{ slug: string; l1Slug: string }>> {
        const membership = await prisma.membership.findFirst({
            where: { groupId, userId }
        });

        const role = membership?.role;
        if (role !== 'OWNER' && role !== 'ADMIN') return { success: false, error: 'FORBIDDEN' };

        await Promise.all(
            sectionIds.map((id, index) =>
                prisma.groupSection.update({
                    where: { id },
                    data: { order: index }
                })
            )
        );

        const slugs = await this.getGroupSlugs(groupId);
        return { success: true, data: slugs ?? undefined };
    },

    async deleteSection(sectionId: string, userId: string): Promise<GroupServiceResult<{ slug: string; l1Slug: string }>> {
        const section = await prisma.groupSection.findUnique({
            where: { id: sectionId },
            include: { group: { include: { members: { where: { userId } } } } }
        });

        if (!section) return { success: false, error: 'NOT_FOUND' };

        const membership = section.group.members[0];
        const role = membership?.role;
        if (role !== 'OWNER' && role !== 'ADMIN') return { success: false, error: 'FORBIDDEN' };

        // Guard: Prevent deleting Section 1 (order 0)
        if (section.order === 0) {
            return { success: false, error: 'DELETE_FAILED' };
        }

        const slugs = await this.getGroupSlugs(section.groupId);
        await prisma.groupSection.delete({ where: { id: sectionId } });
        return { success: true, data: slugs ?? undefined };
    },

    /**
     * Updates a member's role within a group.
     * Only Owners can promote to ADMIN or demote from ADMIN.
     */
    async updateMemberRole(groupId: string, targetUserId: string, newRole: MembershipRole, actorId: string): Promise<GroupServiceResult> {
        const actorMembership = await prisma.membership.findUnique({
            where: { userId_groupId: { userId: actorId, groupId } }
        });

        if (!actorMembership || actorMembership.role !== 'OWNER') {
            return { success: false, error: 'FORBIDDEN' };
        }

        // Cannot change own role if it's the owner (protection)
        if (targetUserId === actorId) {
            return { success: false, error: 'VALIDATION_FAILED' };
        }

        await prisma.membership.update({
            where: { userId_groupId: { userId: targetUserId, groupId } },
            data: { role: newRole }
        });

        return { success: true };
    },

    /**
     * Approve or decline a membership request.
     */
    async manageMembership(membershipId: string, action: 'APPROVE' | 'DECLINE', actorId: string): Promise<GroupServiceResult<{ targetUserId: string; groupName: string; groupSlug: string; categorySlug: string }>> {
        const membershipToManage = await prisma.membership.findUnique({
            where: { id: membershipId },
            include: { group: { include: { category: true } } }
        });

        if (!membershipToManage) return { success: false, error: 'NOT_FOUND' };

        const requesterMembership = await prisma.membership.findUnique({
            where: {
                userId_groupId: {
                    userId: actorId,
                    groupId: membershipToManage.groupId
                }
            }
        });

        if (!requesterMembership || (requesterMembership.role !== 'OWNER' && requesterMembership.role !== 'ADMIN')) {
            return { success: false, error: 'FORBIDDEN' };
        }

        if (action === 'APPROVE') {
            await prisma.membership.update({
                where: { id: membershipId },
                data: { role: 'MEMBER' }
            });
        } else {
            await prisma.membership.delete({
                where: { id: membershipId }
            });
        }

        return {
            success: true,
            data: {
                targetUserId: membershipToManage.userId,
                groupName: membershipToManage.group.name,
                groupSlug: membershipToManage.group.slug,
                categorySlug: membershipToManage.group.category.slug
            }
        };
    },

    /**
     * Removes a member from a group.
     * Owners can remove anyone except themselves.
     * Admins can remove regular members.
     */
    async removeMember(groupId: string, targetUserId: string, actorId: string): Promise<GroupServiceResult> {
        const actorMembership = await prisma.membership.findUnique({
            where: { userId_groupId: { userId: actorId, groupId } }
        });

        if (!actorMembership || (actorMembership.role !== 'OWNER' && actorMembership.role !== 'ADMIN')) {
            return { success: false, error: 'FORBIDDEN' };
        }

        const targetMembership = await prisma.membership.findUnique({
            where: { userId_groupId: { userId: targetUserId, groupId } }
        });

        if (!targetMembership) return { success: false, error: 'NOT_FOUND' };

        // Hierarchy logic
        // Owners can remove Admins/Members
        // Admins can only remove Members or Pending
        if (actorMembership.role === 'ADMIN' && targetMembership.role !== 'MEMBER' && targetMembership.role !== 'PENDING') {
            return { success: false, error: 'FORBIDDEN' };
        }

        // Prevent self-removal here (use leaveGroup for that)
        if (targetUserId === actorId) {
            return { success: false, error: 'VALIDATION_FAILED' };
        }

        await prisma.membership.delete({
            where: { userId_groupId: { userId: targetUserId, groupId } }
        });

        return { success: true };
    },

    /**
     * Deletes a post from a group.
     * Owners and Admins can delete any post.
     * Regular members can only delete their own posts.
     */
    async deletePost(postId: string, actorId: string): Promise<GroupServiceResult<{ slug: string; l1Slug: string }>> {
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                group: {
                    include: {
                        category: {
                            include: { parent: { include: { parent: true } } }
                        },
                        members: {
                            where: { userId: actorId }
                        }
                    }
                }
            }
        });

        if (!post) return { success: false, error: 'NOT_FOUND' };

        const actorMembership = post.group.members[0];
        const isAuthor = post.authorId === actorId;
        const isAdminOrOwner = actorMembership && (actorMembership.role === 'OWNER' || actorMembership.role === 'ADMIN');

        if (!isAuthor && !isAdminOrOwner) {
            return { success: false, error: 'FORBIDDEN' };
        }

        const category = post.group.category;
        const l1Slug = (category.level === 3 && category.parent?.parent) ? category.parent.parent.slug : (category.level === 2 && category.parent) ? category.parent.slug : category.slug;
        const slugs = { slug: post.group.slug, l1Slug };

        await prisma.post.delete({ where: { id: postId } });
        return { success: true, data: slugs };
    }
};

/**
 * Internal helper to slugify strings.
 */
function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
}
