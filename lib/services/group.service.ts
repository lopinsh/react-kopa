import { prisma } from '@/lib/prisma';
import { cache } from 'react';
import { MembershipRole } from '@prisma/client';
import { GroupFormValues } from '@/lib/validations/group';
import { ErrorCode } from '@/types/actions';
import { Prisma } from '@prisma/client';
import { hasAdminRights } from '@/lib/utils/permissions';
import { slugify } from '@/lib/slug';
import { TaxonomyResolver } from './taxonomy-resolver.service';

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
    socialLinks: {
        discord: string | null;
        website: string | null;
        instagram: string | null;
    };
    stats: {
        memberCount: number;
        eventCount: number;
    };
    user: {
        isMember: boolean;
        role: MembershipRole | 'PENDING' | null;
        isAdmin: boolean;
    };
    theme: {
        accentColor: string;
    };
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
                            include: TaxonomyResolver.getInclude(lang)
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
            const resolved = TaxonomyResolver.resolve(g.category);

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
                accentColor: g.accentColor || resolved.accentColor,
                category: {
                    id: resolved.categoryId,
                    slug: resolved.categorySlug,
                    l1Slug: resolved.l1Slug,
                    title: resolved.categoryTitle,
                    parentTitle: resolved.parentTitle,
                    color: resolved.accentColor
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
                include: TaxonomyResolver.getInclude(lang)
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
        const isAdmin = hasAdminRights(userRole);

        // 2. Format Members (with application messages for admins)
        const formattedMembers = group.members.map((m) => {
            const thread = group.appMessages
                .filter((msg) => msg.applicationUserId === m.userId)
                .map((msg) => ({
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
        const resolved = TaxonomyResolver.resolve(g.category);
        let categoryTitle = resolved.categoryTitle;
        let categorySlug = resolved.categorySlug;
        let parentTitle = resolved.parentTitle;
        const accentColor = g.accentColor || resolved.accentColor;

        // If the main category is L1, check if there's an L2 tag we can feature in breadcrumbs
        if (resolved.level === 1 && g.tags.length > 0) {
            const l2Tag = g.tags.find((t) => t.level === 2);
            if (l2Tag) {
                parentTitle = categoryTitle;
                categoryTitle = l2Tag.titles?.[0]?.title || l2Tag.slug;
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
            socialLinks: {
                discord: g.discordLink,
                website: g.websiteLink,
                instagram: g.instagramLink,
            },
            stats: {
                memberCount: g._count.members,
                eventCount: g._count.events,
            },
            user: {
                isMember,
                role: userRole as MembershipRole | null,
                isAdmin,
            },
            theme: {
                accentColor,
            },
            sections: sections as GroupContext['sections'],
            members: formattedMembers as GroupContext['members'],
            category: {
                id: resolved.categoryId,
                title: categoryTitle,
                slug: categorySlug,
                level: resolved.level,
                parentTitle,
                l1Slug: resolved.l1Slug,
                color: resolved.accentColor
            },
            tags: g.tags.map((t) => ({
                id: t.id,
                title: t.titles?.[0]?.title || t.slug,
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
            include: TaxonomyResolver.getInclude('lv')
        });

        if (!category) return { success: false, error: 'NOT_FOUND' };

        const resolved = TaxonomyResolver.resolve(category);

        const group = await prisma.group.create({
            data: {
                name: data.name,
                slug,
                description: data.description,
                city: data.city || 'Riga',
                type: data.type,
                categoryId: targetCategoryId,
                bannerImage: data.bannerImage,
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
                        }
                    ]
                }
            }
        });

        return { success: true, data: { slug: group.slug, id: group.id, l1Slug: resolved.l1Slug } };
    },

    /**
     * Sends an inquiry message from an admin to a pending member.
     */
    async sendApplicationInquiry(groupId: string, targetUserId: string, adminId: string, message: string): Promise<GroupServiceResult> {
        // Verify admin permissions
        const adminMembership = await prisma.membership.findUnique({
            where: { userId_groupId: { userId: adminId, groupId } }
        });

        if (!adminMembership || !hasAdminRights(adminMembership.role)) {
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

        // Initialize a 1-on-1 Conversation between Admin and Pending User
        const { MessageService } = await import('@/lib/services/message.service');

        // Note: we fetch the existing application messages to pre-populate the new Conversation
        const initialAppMessages = await prisma.applicationMessage.findMany({
            where: { applicationUserId: targetUserId, groupId },
            orderBy: { createdAt: 'asc' }
        });

        let conversation = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { id: adminId } } },
                    { participants: { some: { id: targetUserId } } }
                ]
            }
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    participants: {
                        connect: [{ id: adminId }, { id: targetUserId }]
                    }
                }
            });

            // Seed it with the previous app messages
            if (initialAppMessages.length > 0) {
                await prisma.message.createMany({
                    data: initialAppMessages.map(msg => ({
                        content: msg.content,
                        senderId: msg.senderId,
                        conversationId: conversation!.id,
                        createdAt: msg.createdAt,
                    }))
                });
            }
        } else {
             await MessageService.sendMessage(conversation.id, adminId, message);
        }

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

    async joinGroup(groupId: string, userId: string, message?: string): Promise<GroupServiceResult<{ pending: boolean; slugs: { slug: string; l1Slug: string } | null }>> {
        const existing = await prisma.membership.findUnique({
            where: { userId_groupId: { userId, groupId } },
        });

        if (existing) return { success: false, error: 'JOIN_FAILED' };

        if (!message?.trim()) {
            return { success: false, error: 'VALIDATION_FAILED' };
        }

        const slugs = await this.getGroupSlugs(groupId);

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

        return { success: true, data: { pending: true, slugs } };
    },

    async leaveGroup(groupId: string, userId: string): Promise<GroupServiceResult> {
        await prisma.membership.delete({
            where: { userId_groupId: { userId, groupId } },
        });
        return { success: true };
    },

    async cancelJoinRequest(groupId: string, userId: string): Promise<GroupServiceResult<{ slugs: { slug: string; l1Slug: string } | null }>> {
        const membership = await prisma.membership.findUnique({
            where: { userId_groupId: { userId, groupId } },
        });

        if (!membership || membership.role !== 'PENDING') {
            return { success: false, error: 'NOT_FOUND' };
        }

        const slugs = await this.getGroupSlugs(groupId);

        await prisma.membership.delete({
            where: { id: membership.id },
        });

        // Also cleanup application messages associated with this request
        await prisma.applicationMessage.deleteMany({
            where: { senderId: userId, groupId }
        });

        return { success: true, data: { slugs } };
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
        const [membership, actor] = await Promise.all([
            prisma.membership.findFirst({ where: { groupId, userId } }),
            prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
        ]);

        const role = membership?.role;
        const isAppAdmin = actor?.role === 'ADMIN';
        if (!hasAdminRights(role) && !isAppAdmin) {
            return { success: false, error: 'FORBIDDEN' };
        }

        const canEditTaxonomy = role === 'OWNER' || isAppAdmin;

        // Check for slug collisions if slug is being updated
        if (data.slug) {
            const existingSlug = await prisma.group.findFirst({
                where: { slug: data.slug, id: { not: groupId } }
            });
            if (existingSlug) {
                return { success: false, error: 'VALIDATION_FAILED' }; // Slug taken
            }
        }

        // Taxonomy can be edited by group owners and app admins.
        const updateData: Prisma.GroupUpdateInput = {
            name: data.name,
            slug: data.slug || undefined,
            description: data.description,
            city: data.city,
            type: data.type,
            bannerImage: data.bannerImage,
            discordLink: data.discordLink,
            websiteLink: data.websiteLink,
            instagramLink: data.instagramLink,
            isAcceptingMembers: data.isAcceptingMembers,
            accentColor: data.accentColor || null,
        };

        if (canEditTaxonomy) {
            updateData.category = { connect: { id: data.categoryId } };
            const tagsToConnect = data.tagIds ? data.tagIds.map((id: string) => ({ id })) : [];
            updateData.tags = {
                set: [],
                connect: tagsToConnect,
            };
        }

        const group = await prisma.group.update({
            where: { id: groupId },
            data: updateData,
            include: {
                category: {
                    include: TaxonomyResolver.getInclude('lv')
                }
            }
        });

        const resolved = TaxonomyResolver.resolve(group.category);

        return { success: true, data: { slug: group.slug, l1Slug: resolved.l1Slug } };
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
     * Fetches the current user's role, sections, and pending count for a given group.
     */
    async getGroupRole(l1Slug: string, groupSlug: string, userId?: string): Promise<{
        role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'PENDING' | null;
        hasInstructions: boolean;
        pendingCount: number;
        sections: Array<{ id: string; title: string; visibility: string }>;
    }> {
        const group = await prisma.group.findFirst({
            where: { slug: groupSlug, category: { slug: l1Slug } },
            select: {
                instructions: true,
                sections: {
                    orderBy: { order: 'asc' },
                    select: { id: true, title: true, visibility: true }
                },
                members: {
                    where: { userId: userId || 'none' },
                    select: { role: true }
                }
            }
        });

        if (!group) return { role: null, hasInstructions: false, pendingCount: 0, sections: [] };

        const role = group.members?.length > 0 ? group.members[0].role : null;

        let pendingCount = 0;
        if (hasAdminRights(role)) {
            pendingCount = await prisma.membership.count({
                where: {
                    group: { slug: groupSlug, category: { slug: l1Slug } },
                    role: 'PENDING'
                }
            });
        }

        const sections = (group.sections && group.sections.length > 0)
            ? group.sections
            : GroupService.getVirtualSections({ description: null, instructions: group.instructions });

        return {
            role,
            hasInstructions: !!group.instructions,
            pendingCount,
            sections: sections.map((s: { id: string; title: string; visibility: string }) => ({
                id: s.id,
                title: s.title,
                visibility: s.visibility
            }))
        };
    },
    /**
     * Internal helper to resolve group slugs.
     */
    async getGroupSlugs(groupId: string): Promise<{ slug: string; l1Slug: string } | null> {
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: {
                category: {
                    include: TaxonomyResolver.getInclude('lv')
                }
            }
        });

        if (!group) return null;

        const resolved = TaxonomyResolver.resolve(group.category);
        return { slug: group.slug, l1Slug: resolved.l1Slug };
    },

    /**
     * Internal helper to resolve group slugs by slug string.
     */
    async getGroupSlugsBySlug(slug: string): Promise<{ slug: string; l1Slug: string } | null> {
        const group = await prisma.group.findFirst({
            where: { slug },
            include: {
                category: {
                    include: TaxonomyResolver.getInclude('lv')
                }
            }
        });

        if (!group) return null;

        const resolved = TaxonomyResolver.resolve(group.category);
        return { slug: group.slug, l1Slug: resolved.l1Slug };
    },

    async upsertSection(groupId: string, data: { id?: string; title: string; content: string; order?: number; visibility?: 'PUBLIC' | 'MEMBERS_ONLY' }, userId: string): Promise<GroupServiceResult<{ slug: string; l1Slug: string }>> {
        const membership = await prisma.membership.findFirst({
            where: { groupId, userId }
        });

        const role = membership?.role;
        if (!hasAdminRights(role)) return { success: false, error: 'FORBIDDEN' };

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
        if (!hasAdminRights(role)) return { success: false, error: 'FORBIDDEN' };

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
        if (!hasAdminRights(role)) return { success: false, error: 'FORBIDDEN' };

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

        if (!requesterMembership || !hasAdminRights(requesterMembership.role)) {
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

        if (!actorMembership || !hasAdminRights(actorMembership.role)) {
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
                            include: TaxonomyResolver.getInclude('lv')
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
        const isAdminOrOwner = actorMembership && hasAdminRights(actorMembership.role);

        if (!isAuthor && !isAdminOrOwner) {
            return { success: false, error: 'FORBIDDEN' };
        }

        const resolved = TaxonomyResolver.resolve(post.group.category);
        const slugs = { slug: post.group.slug, l1Slug: resolved.l1Slug };

        await prisma.post.delete({ where: { id: postId } });
        return { success: true, data: slugs };
    }
};

