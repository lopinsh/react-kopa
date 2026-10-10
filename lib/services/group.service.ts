import { prisma } from '@/lib/prisma';
import { cache } from 'react';
import { MembershipRole } from '@prisma/client';
import { GroupFormValues } from '@/lib/validations/group';
import { ErrorCode } from '@/types/actions';
import { Prisma } from '@prisma/client';
import { hasAdminRights } from '@/lib/utils/permissions';
import { MAX_GROUP_TAGS, DEFAULT_SECTION_TITLES, PRACTICAL_INFO_SAMPLE, isDefaultSectionTitle } from '@/lib/constants';
import { resolveSectionText, toTextLang, hasText, type TextLang } from '@/lib/translations';
import type { SectionSaveValues } from '@/lib/validations/section';
import { slugify } from '@/lib/slug';
import { TaxonomyResolver } from './taxonomy-resolver.service';
import { ModerationService } from './moderation.service';
import { MessageService } from './message.service';
import { triggerRealtime } from '@/lib/pusher';

/** One group section as a visitor sees it: text already resolved to their language (or the original, flagged). */
export interface SectionView {
    id: string;
    title: string;
    /** Language the title is written in. */
    titleLang: TextLang;
    content: string;
    /** Language the content is written in. */
    contentLang: TextLang;
    /** Language to name in the "Latviski / In English" label; null when all shown text is in the viewer's language. */
    fallbackLang: TextLang | null;
    order: number;
    visibility: 'PUBLIC' | 'MEMBERS_ONLY';
}

/** A section as the owner edits it: the text of every language (a missing row is empty text). Managers only. */
export interface EditableSection {
    id: string;
    order: number;
    visibility: 'PUBLIC' | 'MEMBERS_ONLY';
    originalLang: TextLang;
    texts: Record<TextLang, { title: string; content: string }>;
}

function toEditableSection(s: { id: string; order: number; visibility: 'PUBLIC' | 'MEMBERS_ONLY'; originalLang: string; translations: { lang: string; title: string; content: string }[] }): EditableSection {
    const text = (lang: TextLang) => {
        const row = s.translations.find((t) => t.lang === lang);
        return { title: row?.title ?? '', content: row?.content ?? '' };
    };
    return { id: s.id, order: s.order, visibility: s.visibility, originalLang: toTextLang(s.originalLang), texts: { lv: text('lv'), en: text('en') } };
}

export interface GroupContext {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    city: string;
    type: 'PUBLIC' | 'PRIVATE';
    categoryId: string;
    bannerImage: string | null;
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
    sections: SectionView[];
    members: Array<{
        id: string;
        role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'PENDING';
        joinedAt: Date;
        user: { id: string; name: string | null; image: string | null; allowDirectMessages: boolean; isProfilePublic: boolean };
        /** The group chat with this person (their join request and everything said since); only loaded for pending applicants, and only for admins and the applicant. */
        chatId: string | null;
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
    moderation: {
        isSiteAdmin: boolean;
        hidden: { reason: string | null; at: Date } | null;
    };
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
/** Translation rows of a default section: title in both languages, text only in the creator's language. */
function defaultSectionRows(key: keyof typeof DEFAULT_SECTION_TITLES, creatorLang: TextLang, content: string) {
    return (['lv', 'en'] as const).map((lang) => ({
        lang,
        title: DEFAULT_SECTION_TITLES[key][lang],
        content: lang === creatorLang ? content : ''
    }));
}

/** Thrown inside the transfer transaction to roll it back. */
class TransferRejected extends Error {}

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
            where: { userId, group: { hiddenAt: null } },
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
                                    select: { id: true, name: true, username: true, avatarSeed: true, image: true }
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
            sections: {
                orderBy: { order: 'asc' } as const,
                select: {
                    id: true,
                    order: true,
                    visibility: true,
                    originalLang: true,
                    translations: { select: { lang: true, title: true, content: true } }
                }
            },
            _count: {
                select: { members: { where: { role: { not: 'PENDING' as MembershipRole } } }, events: { where: { visibility: 'PUBLIC' as const } } }
            }
        };

        const group = await prisma.group.findFirst({
            where,
            include: groupInclude
        }) as (Prisma.GroupGetPayload<{ include: typeof groupInclude }> | null);

        if (!group) return null;

        // Hidden groups exist only for site admins (banner + restore) and the group's owner (banner only).
        const actor = currentUserId
            ? await prisma.user.findUnique({ where: { id: currentUserId }, select: { role: true } })
            : null;
        const isSiteAdmin = actor?.role === 'ADMIN';
        const g = group;
        const isOwner = !!currentUserId && g.members.some((m: { userId: string; role: string }) => m.userId === currentUserId && m.role === 'OWNER');
        if (g.hiddenAt && !isSiteAdmin && !isOwner) return null;

        // 1. Resolve Membership & Role
        const userMembership = currentUserId ? g.members.find((m: { userId: string }) => m.userId === currentUserId) : null;
        const isMember = !!userMembership && userMembership.role !== 'PENDING';
        const userRole = userMembership?.role || null;
        const isAdmin = hasAdminRights(userRole);

        // Members-only events count only for people who can see them.
        const eventCount = isMember || isSiteAdmin
            ? await prisma.event.count({ where: { groupId: g.id } })
            : g._count.events;

        // 2. Format Members (with application messages for admins)
        // Pending applicants and their messages are only visible to group admins, site admins and the applicant themselves.
        const canSeeApplications = isAdmin || isSiteAdmin;
        const visibleMembers = canSeeApplications ? group.members : group.members.filter((m) => m.role !== 'PENDING');
        // The request message lives in the group chat. Only pending applicants' chats are loaded, and only
        // for the group's own owner/admins and for the applicant themselves: site admins are not on the team, so they cannot open the chat either.
        const threads = await MessageService.listGroupThreads(
            g.id,
            visibleMembers.filter((m) => m.role === 'PENDING' && (isAdmin || m.userId === currentUserId)).map((m) => m.userId)
        );
        const formattedMembers = visibleMembers.map((m) => {
            const thread = threads.get(m.userId);

            return {
                id: m.id,
                role: m.role,
                joinedAt: m.joinedAt,
                user: m.user,
                chatId: thread?.conversationId ?? null,
                applicationMessages: thread?.messages ?? []
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
        // Only the text resolved for this viewer leaves the server. Members-only sections are left out
        // entirely (not even a title or a placeholder) for people who may not see them.
        const sections: SectionView[] = g.sections.length > 0
            ? g.sections.filter((s) => s.visibility !== 'MEMBERS_ONLY' || isMember || isSiteAdmin).map((s) => {
                const text = resolveSectionText(s.translations, lang, s.originalLang);
                return {
                    id: s.id,
                    title: text.title,
                    titleLang: text.titleLang,
                    content: text.content,
                    contentLang: text.contentLang,
                    fallbackLang: text.fallbackLang,
                    order: s.order,
                    visibility: s.visibility
                };
            })
            : GroupService.getVirtualSections(group, lang);

        return {
            id: g.id,
            name: g.name,
            slug: g.slug,
            description: g.description,
            city: g.city,
            type: g.type as 'PUBLIC' | 'PRIVATE',
            categoryId: g.categoryId,
            bannerImage: g.bannerImage,
            isAcceptingMembers: g.isAcceptingMembers,
            socialLinks: {
                discord: g.discordLink,
                website: g.websiteLink,
                instagram: g.instagramLink,
            },
            stats: {
                memberCount: g._count.members,
                eventCount,
            },
            user: {
                isMember,
                role: userRole as MembershipRole | null,
                isAdmin,
            },
            theme: {
                accentColor,
            },
            sections,
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
            moderation: {
                isSiteAdmin,
                hidden: g.hiddenAt ? { reason: g.hiddenReason, at: g.hiddenAt } : null
            }
        };
    }),

    async createGroup(data: GroupFormValues, userId: string, locale: string): Promise<GroupServiceResult<{ slug: string; id: string; l1Slug: string }>> {
        const lang = toTextLang(locale);
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

        if ((data.tagIds?.length ?? 0) > MAX_GROUP_TAGS) {
            return { success: false, error: 'TAG_LIMIT_REACHED' };
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
                            order: 0,
                            visibility: 'PUBLIC',
                            originalLang: lang,
                            translations: { create: defaultSectionRows('about', lang, data.description || '') }
                        },
                        {
                            // A sample the owner rewrites or deletes; its text exists only in the creator's language.
                            order: 1,
                            visibility: 'MEMBERS_ONLY',
                            originalLang: lang,
                            translations: { create: defaultSectionRows('practical', lang, PRACTICAL_INFO_SAMPLE[lang]) }
                        }
                    ]
                }
            }
        });

        return { success: true, data: { slug: group.slug, id: group.id, l1Slug: resolved.l1Slug } };
    },

    /**
     * Sends a message from someone outside the team to a group: it goes into their group chat, which the
     * owner and all admins can answer. Returns the team to notify.
     */
    async sendInquiry(groupId: string, userId: string, message: string): Promise<GroupServiceResult<{ conversationId: string; teamIds: string[]; groupName: string }>> {
        const group = await prisma.group.findFirst({
            where: { id: groupId, hiddenAt: null },
            select: { name: true, members: { where: { role: { in: ['OWNER', 'ADMIN'] } }, select: { userId: true } } }
        });

        if (!group) return { success: false, error: 'NOT_FOUND' };
        if (group.members.some((m) => m.userId === userId)) return { success: false, error: 'FORBIDDEN' };

        const chat = await MessageService.getOrCreateGroupChat(groupId, userId, 'GROUP_CONTACT');
        await MessageService.sendMessage(chat.id, userId, message);

        return {
            success: true,
            data: { conversationId: chat.id, teamIds: group.members.map((m) => m.userId), groupName: group.name }
        };
    },

    async joinGroup(groupId: string, userId: string, message?: string): Promise<GroupServiceResult<{ pending: boolean; conversationId: string; slugs: { slug: string; l1Slug: string } | null; groupName: string; adminIds: string[] }>> {
        const existing = await prisma.membership.findUnique({
            where: { userId_groupId: { userId, groupId } },
        });

        if (existing) return { success: false, error: 'JOIN_FAILED' };

        if (!message?.trim()) {
            return { success: false, error: 'VALIDATION_FAILED' };
        }

        const group = await prisma.group.findFirst({
            where: { id: groupId, hiddenAt: null },
            select: { name: true, isAcceptingMembers: true, members: { where: { role: { in: ['OWNER', 'ADMIN'] } }, select: { userId: true } } }
        });
        if (!group) return { success: false, error: 'NOT_FOUND' };
        if (!group.isAcceptingMembers) return { success: false, error: 'JOIN_FAILED' };

        const slugs = await this.getGroupSlugs(groupId);

        await prisma.membership.create({
            data: {
                userId,
                groupId,
                role: 'PENDING',
            },
        });

        // The request message opens (or continues) the applicant's group chat with the team.
        let conversationId: string;
        try {
            const chat = await MessageService.getOrCreateGroupChat(groupId, userId, 'JOIN_REQUEST');
            await MessageService.sendMessage(chat.id, userId, message);
            conversationId = chat.id;
        } catch (error) {
            // No request without its message.
            await prisma.membership.delete({ where: { userId_groupId: { userId, groupId } } });
            throw error;
        }

        return { success: true, data: { pending: true, conversationId, slugs, groupName: group.name, adminIds: group.members.map(m => m.userId) } };
    },

    async leaveGroup(groupId: string, userId: string): Promise<GroupServiceResult> {
        const membership = await prisma.membership.findUnique({
            where: { userId_groupId: { userId, groupId } },
        });
        if (!membership) return { success: false, error: 'NOT_FOUND' };
        // A group always has one owner: they hand it over (or delete the group) before leaving.
        if (membership.role === 'OWNER') return { success: false, error: 'OWNER_MUST_TRANSFER' };

        await prisma.membership.delete({ where: { id: membership.id } });
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

        // The group chat stays: it is a conversation, not part of the request.

        return { success: true, data: { slugs } };
    },

    async deleteGroup(groupId: string, userId: string): Promise<GroupServiceResult> {
        const isOwner = await prisma.membership.findFirst({
            where: { groupId, userId, role: 'OWNER' }
        });

        if (!isOwner) return { success: false, error: 'FORBIDDEN' };

        const deleted = await this.deleteGroupRecord(groupId);
        return deleted ? { success: true } : { success: false, error: 'NOT_FOUND' };
    },

    /**
     * The deletion itself; memberships, sections, events, posts etc. go with it via the schema's cascades.
     * Shared by the owner's delete and a site admin's delete of a hidden group. `onlyIfHidden` makes the
     * hidden check part of the delete itself, so a restore that lands first wins. Returns false if nothing was deleted.
     */
    async deleteGroupRecord(groupId: string, tx: Prisma.TransactionClient = prisma, opts: { onlyIfHidden?: boolean } = {}): Promise<boolean> {
        const { count } = await tx.group.deleteMany({
            where: { id: groupId, ...(opts.onlyIfHidden ? { hiddenAt: { not: null } } : {}) }
        });
        return count > 0;
    },

    /**
     * Updates a group's settings.
     * Owner (and site admins): everything. Moderators: only city, banner, accepting members and social links.
     * A moderator who sends a different name, access type, category or topics is refused.
     * The link name (slug) and accent colour are never changed here: the slug would break shared links
     * and the colour comes from the category.
     */
    async updateGroup(groupId: string, data: GroupFormValues, userId: string): Promise<GroupServiceResult<{ slug: string; l1Slug: string }>> {
        const [membership, actor, current] = await Promise.all([
            prisma.membership.findFirst({ where: { groupId, userId } }),
            prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
            prisma.group.findUnique({
                where: { id: groupId },
                select: { name: true, type: true, categoryId: true, tags: { select: { id: true } } }
            })
        ]);

        const role = membership?.role;
        const isAppAdmin = actor?.role === 'ADMIN';
        if (!hasAdminRights(role) && !isAppAdmin) {
            return { success: false, error: 'FORBIDDEN' };
        }
        if (!current) return { success: false, error: 'NOT_FOUND' };

        const canEditOwnerFields = role === 'OWNER' || isAppAdmin;

        if (!canEditOwnerFields) {
            const currentTags = current.tags.map(t => t.id).sort().join(',');
            const sentTags = [...(data.tagIds ?? [])].sort().join(',');
            if (
                data.name !== current.name ||
                data.type !== current.type ||
                data.categoryId !== current.categoryId ||
                sentTags !== currentTags
            ) {
                return { success: false, error: 'FORBIDDEN' };
            }
        }

        const updateData: Prisma.GroupUpdateInput = {
            description: data.description,
            city: data.city,
            bannerImage: data.bannerImage,
            discordLink: data.discordLink,
            websiteLink: data.websiteLink,
            instagramLink: data.instagramLink,
            isAcceptingMembers: data.isAcceptingMembers,
        };

        if (canEditOwnerFields) {
            // Groups saved before the limit may keep their tags but not gain any.
            const nextTagCount = new Set(data.tagIds ?? []).size;
            if (nextTagCount > MAX_GROUP_TAGS && nextTagCount > current.tags.length) {
                return { success: false, error: 'TAG_LIMIT_REACHED' };
            }
            updateData.name = data.name;
            updateData.type = data.type;
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

        if (isAppAdmin && !hasAdminRights(role)) {
            await ModerationService.logAction(userId, 'GROUP_EDIT', 'GROUP', groupId);
        }

        const resolved = TaxonomyResolver.resolve(group.category);

        return { success: true, data: { slug: group.slug, l1Slug: resolved.l1Slug } };
    },

    /**
     * Section Management
     */
    /**
     * Sections for the owner's editor, with the text of every language.
     * Managers only (owner, moderators, site admins); anyone else gets an empty list.
     */
    async getEditableSections(groupId: string, userId: string): Promise<EditableSection[]> {
        const access = await this.getManagerAccess(groupId, userId);
        if (!access.allowed) return [];

        const sections = await prisma.groupSection.findMany({
            where: { groupId },
            orderBy: { order: 'asc' },
            include: { translations: { select: { lang: true, title: true, content: true } } }
        });

        if (sections.length === 0) {
            const group = await prisma.group.findUnique({ where: { id: groupId }, select: { description: true } });
            return [toEditableSection({
                id: 'about',
                order: 0,
                visibility: 'PUBLIC',
                originalLang: 'lv',
                translations: [
                    { lang: 'lv', title: DEFAULT_SECTION_TITLES.about.lv, content: group?.description ?? '' },
                    { lang: 'en', title: DEFAULT_SECTION_TITLES.about.en, content: '' }
                ]
            })];
        }

        return sections.map(toEditableSection);
    },

    /**
     * Fallback for old groups that have no section rows: the group description as the first section.
     */
    getVirtualSections(group: { description: string | null }, lang: TextLang): SectionView[] {
        return [{
            id: 'about',
            title: DEFAULT_SECTION_TITLES.about[lang],
            titleLang: lang,
            content: group?.description || '',
            contentLang: lang,
            fallbackLang: null,
            order: 0,
            visibility: 'PUBLIC'
        }];
    },

    /**
     * Fetches the current user's role, sections, and pending count for a given group.
     */
    async getGroupRole(l1Slug: string, groupSlug: string, userId?: string): Promise<{
        /** False when the group does not exist (or is hidden from this user), so the sidebar can hide its menu. */
        exists: boolean;
        role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'PENDING' | null;
        pendingCount: number;
        sections: Array<{ id: string; visibility: string }>;
    }> {
        const group = await prisma.group.findFirst({
            where: { slug: groupSlug, category: { slug: l1Slug } },
            select: {
                hiddenAt: true,
                sections: {
                    orderBy: { order: 'asc' },
                    select: { id: true, visibility: true }
                },
                members: {
                    where: { userId: userId || 'none' },
                    select: { role: true }
                }
            }
        });

        if (!group) return { exists: false, role: null, pendingCount: 0, sections: [] };

        const role = group.members?.length > 0 ? group.members[0].role : null;

        // Hidden groups exist only for their owner and site admins (same rule as getGroupWithContext).
        if (group.hiddenAt && role !== 'OWNER') {
            const actor = userId ? await prisma.user.findUnique({ where: { id: userId }, select: { role: true } }) : null;
            if (actor?.role !== 'ADMIN') {
                return { exists: false, role: null, pendingCount: 0, sections: [] };
            }
        }

        let pendingCount = 0;
        if (hasAdminRights(role)) {
            pendingCount = await prisma.membership.count({
                where: {
                    group: { slug: groupSlug, category: { slug: l1Slug } },
                    role: 'PENDING'
                }
            });
        }

        const sections = group.sections.length > 0
            ? group.sections
            : GroupService.getVirtualSections({ description: null }, 'lv');

        return {
            exists: true,
            role,
            pendingCount,
            sections: sections.map((s) => ({ id: s.id, visibility: s.visibility }))
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

    /**
     * Who may manage a group's content: the owner, moderators and site admins.
     * A site admin without a role in the group is logged (GROUP_EDIT) by the caller.
     */
    async getManagerAccess(groupId: string, userId: string): Promise<{ allowed: boolean; bySiteAdminOnly: boolean }> {
        const [membership, actor] = await Promise.all([
            prisma.membership.findFirst({ where: { groupId, userId }, select: { role: true } }),
            prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
        ]);
        const isManager = hasAdminRights(membership?.role);
        const isSiteAdmin = actor?.role === 'ADMIN';
        return { allowed: isManager || isSiteAdmin, bySiteAdminOnly: !isManager && isSiteAdmin };
    },

    /**
     * Saves one language of a section: only that language's row is written (title + content);
     * the other languages stay as they are. Saving a non-original language with no text removes
     * its row (the text counts as not translated). The original language always keeps a title.
     * `originalLang` may change the section's original language: no text is moved, it only decides
     * which row visitors fall back to, so that language must already have a title.
     * New sections get the saved language as their original language.
     */
    async upsertSection(groupId: string, data: SectionSaveValues, userId: string): Promise<GroupServiceResult<{ slug: string; l1Slug: string; sectionId: string }>> {
        const access = await this.getManagerAccess(groupId, userId);
        if (!access.allowed) return { success: false, error: 'FORBIDDEN' };

        const { lang } = data;
        const title = data.title.trim();
        let sectionId: string;

        if (data.id) {
            // The section must belong to this group (a manager of one group cannot edit another's).
            const owned = await prisma.groupSection.findFirst({
                where: { id: data.id, groupId },
                select: { id: true, order: true, originalLang: true, translations: { select: { lang: true, title: true } } }
            });
            if (!owned) return { success: false, error: 'NOT_FOUND' };
            sectionId = owned.id;

            const originalLang = data.originalLang ?? toTextLang(owned.originalLang);
            if (lang === originalLang) {
                if (!title) return { success: false, error: 'TITLE_REQUIRED' };
            } else if (!owned.translations.some((t) => t.lang === originalLang && t.title.trim())) {
                return { success: false, error: 'ORIGINAL_LANG_EMPTY' };
            }
            const removeRow = lang !== originalLang && !title && !hasText(data.content);

            await prisma.$transaction(async (tx) => {
                // Order changes go through reorderSections; the first section always stays public.
                await tx.groupSection.update({
                    where: { id: sectionId },
                    data: { visibility: owned.order === 0 ? 'PUBLIC' : data.visibility, originalLang }
                });
                if (removeRow) {
                    await tx.groupSectionTranslation.deleteMany({ where: { sectionId, lang } });
                } else {
                    await tx.groupSectionTranslation.upsert({
                        where: { sectionId_lang: { sectionId, lang } },
                        update: { title, content: data.content },
                        create: { sectionId, lang, title, content: data.content }
                    });
                }

                // A renamed section must not keep showing the old default title in the other language.
                // Only the untouched default row (default title, no content) goes; a language the owner
                // has written in is left exactly as they saved it.
                if (lang === originalLang && !isDefaultSectionTitle(title)) {
                    const others = await tx.groupSectionTranslation.findMany({
                        where: { sectionId, lang: { not: lang } },
                        select: { id: true, title: true, content: true }
                    });
                    const untouched = others.filter((o) => isDefaultSectionTitle(o.title) && !hasText(o.content));
                    if (untouched.length > 0) {
                        await tx.groupSectionTranslation.deleteMany({ where: { id: { in: untouched.map((o) => o.id) } } });
                    }
                }
            });

            // The home section (order 0) is the group's summary: keep the description equal to its original-language text.
            if (owned.order === 0) {
                const original = await prisma.groupSectionTranslation.findUnique({
                    where: { sectionId_lang: { sectionId, lang: originalLang } },
                    select: { content: true }
                });
                await prisma.group.update({ where: { id: groupId }, data: { description: original?.content ?? '' } });
            }
        } else {
            if (!title) return { success: false, error: 'TITLE_REQUIRED' };
            // New sections go last (orders may have gaps after a delete); the first section is always public.
            const last = await prisma.groupSection.aggregate({ where: { groupId }, _max: { order: true } });
            const order = last._max.order === null ? 0 : last._max.order + 1;
            const created = await prisma.groupSection.create({
                data: {
                    groupId,
                    visibility: order === 0 ? 'PUBLIC' : data.visibility || 'PUBLIC',
                    order,
                    originalLang: lang,
                    translations: { create: { lang, title, content: data.content } }
                },
                select: { id: true }
            });
            sectionId = created.id;
        }

        if (access.bySiteAdminOnly) await ModerationService.logAction(userId, 'GROUP_EDIT', 'GROUP', groupId);

        const slugs = await this.getGroupSlugs(groupId);
        return { success: true, data: slugs ? { ...slugs, sectionId } : undefined };
    },

    async reorderSections(groupId: string, sectionIds: string[], userId: string): Promise<GroupServiceResult<{ slug: string; l1Slug: string }>> {
        const access = await this.getManagerAccess(groupId, userId);
        if (!access.allowed) return { success: false, error: 'FORBIDDEN' };

        // Only sections of this group can be reordered.
        await prisma.$transaction(
            sectionIds.map((id, index) =>
                prisma.groupSection.updateMany({
                    where: { id, groupId },
                    data: { order: index }
                })
            )
        );
        if (access.bySiteAdminOnly) await ModerationService.logAction(userId, 'GROUP_EDIT', 'GROUP', groupId);

        const slugs = await this.getGroupSlugs(groupId);
        return { success: true, data: slugs ?? undefined };
    },

    async deleteSection(sectionId: string, userId: string): Promise<GroupServiceResult<{ slug: string; l1Slug: string }>> {
        const section = await prisma.groupSection.findUnique({
            where: { id: sectionId }
        });

        if (!section) return { success: false, error: 'NOT_FOUND' };

        const access = await this.getManagerAccess(section.groupId, userId);
        if (!access.allowed) return { success: false, error: 'FORBIDDEN' };

        // Guard: Prevent deleting Section 1 (order 0)
        if (section.order === 0) {
            return { success: false, error: 'DELETE_FAILED' };
        }

        const slugs = await this.getGroupSlugs(section.groupId);
        await prisma.groupSection.delete({ where: { id: sectionId } });
        if (access.bySiteAdminOnly) await ModerationService.logAction(userId, 'GROUP_EDIT', 'GROUP', section.groupId);
        return { success: true, data: slugs ?? undefined };
    },

    /**
     * Makes a member a moderator (ADMIN) or takes the moderator role away (back to MEMBER).
     * Owner only. OWNER is never set here: ownership only moves through `transferOwnership`.
     */
    async updateMemberRole(groupId: string, targetUserId: string, newRole: 'ADMIN' | 'MEMBER', actorId: string): Promise<GroupServiceResult> {
        const actorMembership = await prisma.membership.findUnique({
            where: { userId_groupId: { userId: actorId, groupId } }
        });

        if (!actorMembership || actorMembership.role !== 'OWNER') {
            return { success: false, error: 'FORBIDDEN' };
        }

        // The owner keeps their own role.
        if (targetUserId === actorId) {
            return { success: false, error: 'VALIDATION_FAILED' };
        }

        // Promote a member, or demote a moderator: nothing else.
        const expectedCurrent: MembershipRole = newRole === 'ADMIN' ? 'MEMBER' : 'ADMIN';
        const updated = await prisma.membership.updateMany({
            where: { groupId, userId: targetUserId, role: expectedCurrent },
            data: { role: newRole }
        });
        if (updated.count !== 1) return { success: false, error: 'VALIDATION_FAILED' };

        return { success: true };
    },

    /**
     * Hands the group over to a member or moderator (owner only). One transaction: the old owner
     * becomes a moderator, the chosen person becomes the one owner. Demoting first keeps the
     * "one owner per group" index satisfied at every step.
     */
    async transferOwnership(groupId: string, targetUserId: string, actorId: string): Promise<GroupServiceResult<{ groupName: string; groupSlug: string; l1Slug: string }>> {
        if (targetUserId === actorId) return { success: false, error: 'VALIDATION_FAILED' };

        const group = await prisma.group.findFirst({
            where: { id: groupId, hiddenAt: null },
            include: { category: { include: TaxonomyResolver.getInclude('lv') } }
        });
        if (!group) return { success: false, error: 'NOT_FOUND' };

        const outcome = await prisma.$transaction(async (tx) => {
            const demoted = await tx.membership.updateMany({
                where: { groupId, userId: actorId, role: 'OWNER' },
                data: { role: 'ADMIN' }
            });
            if (demoted.count !== 1) return 'FORBIDDEN' as const;

            const promoted = await tx.membership.updateMany({
                where: { groupId, userId: targetUserId, role: { in: ['MEMBER', 'ADMIN'] } },
                data: { role: 'OWNER' }
            });
            // Pending people and non-members cannot receive a group: roll the demotion back.
            if (promoted.count !== 1) throw new TransferRejected();
            return 'OK' as const;
        }).catch((e: unknown) => {
            if (e instanceof TransferRejected) return 'VALIDATION_FAILED' as const;
            throw e;
        });

        if (outcome !== 'OK') return { success: false, error: outcome };

        return {
            success: true,
            data: { groupName: group.name, groupSlug: group.slug, l1Slug: TaxonomyResolver.resolve(group.category).l1Slug }
        };
    },

    /**
     * Approve or decline a membership request.
     */
    async manageMembership(membershipId: string, action: 'APPROVE' | 'DECLINE', actorId: string): Promise<GroupServiceResult<{ targetUserId: string; groupName: string; groupSlug: string; l1Slug: string }>> {
        const membershipToManage = await prisma.membership.findUnique({
            where: { id: membershipId },
            include: { group: { include: { category: { include: TaxonomyResolver.getInclude('lv') } } } }
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

        // Only open requests can be approved or declined (never an existing member, moderator or owner).
        if (membershipToManage.role !== 'PENDING') {
            return { success: false, error: 'NOT_FOUND' };
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
                l1Slug: TaxonomyResolver.resolve(membershipToManage.group.category).l1Slug
            }
        };
    },

    /**
     * Removes a member from a group.
     * The owner can remove moderators, members and requests. Moderators can remove members and requests,
     * but never the owner or another moderator. Nobody removes the owner.
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

        if (targetMembership.role === 'OWNER') return { success: false, error: 'FORBIDDEN' };

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
     * Deletes an announcement. Only the group's current owner and admins can.
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
        // Announcements: only the group's current owner/admins can remove them.
        if (!actorMembership || !hasAdminRights(actorMembership.role)) {
            return { success: false, error: 'FORBIDDEN' };
        }
        // Same rule as PostService: in a group hidden by moderation only the owner still has access.
        if (post.group.hiddenAt && actorMembership.role !== 'OWNER') {
            return { success: false, error: 'FORBIDDEN' };
        }

        const resolved = TaxonomyResolver.resolve(post.group.category);
        const slugs = { slug: post.group.slug, l1Slug: resolved.l1Slug };

        await prisma.post.delete({ where: { id: postId } });
        // Only the id goes over the (public) group channel; open boards drop the post.
        await triggerRealtime(`group-${post.groupId}`, 'delete-post', { postId });
        return { success: true, data: slugs };
    }
};

