'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';
import { GroupFormValues, groupFormSchema } from '@/lib/validations/group';
import { auth } from '@/lib/auth';
import { GroupService } from '@/lib/services/group.service';
import { createNotification } from './notification-actions';
import { ActionResponse } from '@/types/actions';
import { validateActionData, handleActionError } from '@/lib/action-utils';

/**
 * Creates a new group and handles optional wildcard category creation.
 */
export async function createGroup(data: GroupFormValues, locale: string): Promise<ActionResponse<{ slug: string; l1Slug: string }>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const validation = await validateActionData(groupFormSchema, data);
        if (!validation.success) return validation;

        const result = await GroupService.createGroup(validation.data, session.user.id);
        if (!result.success) return result as ActionResponse<{ slug: string; l1Slug: string }>;

        const { slug, l1Slug } = result.data!;

        revalidatePath(`/[locale]/${l1Slug}/group/${slug}`, 'page');
        revalidatePath(`/${locale}`);
        revalidatePath(`/${locale}/discover`);

        return { success: true, data: { slug, l1Slug } };
    } catch (error) {
        return handleActionError(error, 'CREATE_FAILED');
    }
}

/**
 * Join a group.
 */
export async function joinGroup(groupId: string, locale: string, message?: string): Promise<ActionResponse<{ pending: boolean }>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const result = await GroupService.joinGroup(groupId, session.user.id, message);
        if (!result.success) return result as ActionResponse<{ pending: boolean }>;

        // Invalidate paths
        const slugs = await GroupService.getGroupSlugs(groupId);
        if (slugs) {
            revalidatePath(`/${locale}/${slugs.l1Slug}/group/${slugs.slug}`);
        }

        return { success: true, data: { pending: true } };
    } catch (error) {
        return handleActionError(error, 'JOIN_FAILED');
    }
}

/**
 * Cancel a pending join request.
 */
export async function cancelJoinRequest(groupId: string, locale: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const result = await GroupService.cancelJoinRequest(groupId, session.user.id);
        if (!result.success) return result as ActionResponse;

        const slugs = await GroupService.getGroupSlugs(groupId);
        if (slugs) {
            revalidatePath(`/${locale}/${slugs.l1Slug}/group/${slugs.slug}`);
        }
        revalidatePath(`/${locale}/discover`);
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'CANCEL_FAILED');
    }
}

/**
 * Send an inquiry message to a group.
 */
export async function sendInquiry(groupId: string, message: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const result = await GroupService.sendInquiry(groupId, session.user.id, message);
        if (!result.success) return result as ActionResponse;

        const { ownerId, groupName, categorySlug, groupSlug } = result.data!;

        if (ownerId) {
            await createNotification({
                userId: ownerId,
                type: 'INQUIRY_RECEIVED',
                translationKey: 'inquiryReceived',
                args: { authorName: session.user?.name || 'Someone', groupName },
                link: `/${categorySlug}/group/${groupSlug}`
            });
        }

        return { success: true };
    } catch (error) {
        return handleActionError(error, 'INQUIRY_FAILED');
    }
}

/**
 * Leave a group.
 */
export async function leaveGroup(groupId: string, locale: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const result = await GroupService.leaveGroup(groupId, session.user.id);
        if (!result.success) return result as ActionResponse;

        revalidatePath(`/${locale}/discover`);
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'LEAVE_FAILED');
    }
}

/**
 * Approve or decline a membership request.
 */
export async function manageMembership(
    membershipId: string,
    action: 'APPROVE' | 'DECLINE',
    locale: string
): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const result = await GroupService.manageMembership(membershipId, action, session.user.id);
        if (!result.success) return result as ActionResponse;

        const { targetUserId, groupName, groupSlug, categorySlug } = result.data!;

        if (action === 'APPROVE') {
            await createNotification({
                userId: targetUserId,
                type: 'APPLICATION_ACCEPTED',
                translationKey: 'applicationAccepted',
                args: { groupName },
                link: `/${categorySlug}/group/${groupSlug}`
            });
        }

        revalidatePath(`/${locale}/${categorySlug}/group/${groupSlug}`);
        revalidatePath(`/${locale}/${categorySlug}/group/${groupSlug}/members`);
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'MANAGE_FAILED');
    }
}

/**
 * Sends an inquiry message to a pending member.
 */
export async function sendApplicationInquiry(
    groupId: string,
    targetUserId: string,
    message: string,
    locale: string
): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const result = await GroupService.sendApplicationInquiry(groupId, targetUserId, session.user.id, message);
        if (!result.success) return result as ActionResponse;

        const slugs = await GroupService.getGroupSlugs(groupId);
        if (slugs) {
            revalidatePath(`/${locale}/${slugs.l1Slug}/group/${slugs.slug}/members`);
        }

        return { success: true };
    } catch (error) {
        return handleActionError(error, 'INQUIRY_FAILED');
    }
}

/**
 * Lightweight action to get current user's role for a specific group.
 */
export async function getGroupRole(l1Slug: string, groupSlug: string): Promise<{
    role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'PENDING' | null;
    hasInstructions: boolean;
    pendingCount: number;
    sections: Array<{ id: string; title: string; visibility: string }>;
}> {
    const session = await auth();
    try {
        const group = await prisma.group.findFirst({
            where: { slug: groupSlug, category: { slug: l1Slug } },
            select: {
                instructions: true,
                sections: {
                    orderBy: { order: 'asc' },
                    select: { id: true, title: true, visibility: true }
                },
                members: {
                    where: { userId: session?.user?.id || 'none' },
                    select: { role: true }
                }
            }
        });

        if (!group) return { role: null, hasInstructions: false, pendingCount: 0, sections: [] };

        const role = group.members?.length > 0 ? group.members[0].role : null;

        let pendingCount = 0;
        if (role === 'OWNER' || role === 'ADMIN') {
            pendingCount = await prisma.membership.count({
                where: {
                    group: { slug: groupSlug, category: { slug: l1Slug } },
                    role: 'PENDING'
                }
            });
        }

        const sections = (group.sections && group.sections.length > 0)
            ? group.sections
            : GroupService.getVirtualSections(group as any);

        return {
            role: role as any,
            hasInstructions: !!group.instructions,
            pendingCount,
            sections: sections.map((s: { id: string; title: string; visibility: string }) => ({ id: s.id, title: s.title, visibility: s.visibility }))
        };
    } catch (e) {
        return { role: null, hasInstructions: false, pendingCount: 0, sections: [] };
    }
}

/**
 * Fetches group details by slug for the landing page.
 */
export async function getGroupDetails(l1Slug: string, groupSlug: string, locale: string): Promise<any> {
    const lang = locale === 'en' ? 'en' : 'lv';
    const session = await auth();
    const currentUserId = session?.user?.id;

    noStore();

    try {
        const group = await prisma.group.findFirst({
            where: {
                slug: groupSlug,
                category: {
                    OR: [
                        { slug: l1Slug, level: 1 },
                        { parent: { slug: l1Slug, level: 1 } },
                        { parent: { parent: { slug: l1Slug, level: 1 } } }
                    ]
                }
            },
            include: {
                category: {
                    include: {
                        titles: { where: { lang } },
                        parent: {
                            include: {
                                titles: { where: { lang } },
                                parent: {
                                    include: { titles: { where: { lang } } }
                                }
                            }
                        }
                    }
                },
                tags: {
                    include: {
                        titles: { where: { lang } }
                    }
                },
                members: {
                    include: {
                        user: true,
                    }
                },
                appMessages: {
                    orderBy: { createdAt: 'desc' }
                },
                _count: {
                    select: { members: true, events: true }
                }
            }
        });

        if (!group) return null;

        const userMembership = currentUserId
            ? group.members.find((m) => m.userId === currentUserId)
            : null;

        const isMember = !!userMembership && userMembership.role !== 'PENDING';
        const userRole = userMembership?.role || null;

        let membersWithMessages = group.members as any[];

        if (userRole === 'OWNER' || userRole === 'ADMIN') {
            membersWithMessages = group.members.map((m) => {
                if (m.role === 'PENDING') {
                    const msg = group.appMessages.find((msg) => msg.applicationUserId === m.userId);
                    return { ...m, applicationMessage: msg?.content || null };
                }
                return m;
            });
        }

        const formattedTags = group.tags.map((t) => ({
            id: t.id,
            slug: t.slug,
            title: t.titles?.[0]?.title || t.slug,
            isWildcard: t.isWildcard,
            parentId: t.parentId
        }));

        const memberUserIds = new Set(group.members.map((m) => m.userId));
        const inquiries = group.appMessages
            .filter((msg) => !memberUserIds.has(msg.senderId))
            .map((msg) => ({
                id: msg.id,
                content: msg.content,
                createdAt: msg.createdAt,
                senderId: msg.senderId,
            }));

        return {
            ...group,
            members: membersWithMessages,
            isMember,
            userRole,
            tags: formattedTags,
            inquiries: (userRole === 'OWNER' || userRole === 'ADMIN') ? inquiries : [],
        };
    } catch (error) {
        console.error('[getGroupDetails] Error:', error);
        return null;
    }
}

/**
 * Updates an existing group.
 */
export async function updateGroup(groupId: string, data: GroupFormValues, locale: string): Promise<ActionResponse<{ slug: string; l1Slug: string }>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const validation = await validateActionData(groupFormSchema, data);
        if (!validation.success) return validation;

        const result = await GroupService.updateGroup(groupId, validation.data, session.user.id);
        if (!result.success) return result as ActionResponse<{ slug: string; l1Slug: string }>;

        const { slug, l1Slug } = result.data!;

        revalidatePath(`/${locale}/${l1Slug}/group/${slug}`);
        revalidatePath(`/${locale}/${l1Slug}/group/${slug}/settings`);

        return { success: true, data: { slug, l1Slug } };
    } catch (error) {
        return handleActionError(error, 'UPDATE_FAILED');
    }
}

/**
 * Deletes a group.
 */
export async function deleteGroup(groupId: string, locale: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const result = await GroupService.deleteGroup(groupId, session.user.id);
        if (!result.success) return result as ActionResponse;

        revalidatePath(`/${locale}/discover`);
        revalidatePath(`/${locale}`);

        return { success: true };
    } catch (error) {
        return handleActionError(error, 'DELETE_FAILED');
    }
}

/**
 * CRUD Actions for Group Sections
 */
export async function upsertSectionAction(
    groupId: string,
    data: { id?: string; title: string; content: string; order?: number; visibility?: 'PUBLIC' | 'MEMBERS_ONLY' },
    locale: string
): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const result = await GroupService.upsertSection(groupId, data, session.user.id);
        if (!result.success) return result as ActionResponse;

        const { slug, l1Slug } = result.data!;

        revalidatePath(`/${locale}/${l1Slug}/group/${slug}`);
        revalidatePath(`/${locale}/${l1Slug}/group/${slug}/settings`);

        return { success: true };
    } catch (error) {
        return handleActionError(error, 'SAVE_FAILED');
    }
}

export async function reorderSectionsAction(
    groupId: string,
    sectionIds: string[],
    locale: string
): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const result = await GroupService.reorderSections(groupId, sectionIds, session.user.id);
        if (!result.success) return result as ActionResponse;

        const { slug, l1Slug } = result.data!;

        revalidatePath(`/${locale}/${l1Slug}/group/${slug}`);
        revalidatePath(`/${locale}/${l1Slug}/group/${slug}/settings`);

        return { success: true };
    } catch (error) {
        return handleActionError(error, 'MANAGE_FAILED');
    }
}

export async function deleteSectionAction(
    sectionId: string,
    locale: string
): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const result = await GroupService.deleteSection(sectionId, session.user.id);
        if (!result.success) return result as ActionResponse;

        const { slug, l1Slug } = result.data!;

        revalidatePath(`/${locale}/${l1Slug}/group/${slug}`);
        revalidatePath(`/${locale}/${l1Slug}/group/${slug}/settings`);
        revalidatePath(`/${locale}`);

        return { success: true };
    } catch (error) {
        return handleActionError(error, 'DELETE_FAILED');
    }
}

/**
 * Promote a member to Admin role.
 */
export async function promoteMember(groupId: string, targetUserId: string, locale: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const result = await GroupService.updateMemberRole(groupId, targetUserId, 'ADMIN', session.user.id);
        if (!result.success) return result as ActionResponse;

        const slugs = await GroupService.getGroupSlugs(groupId);
        if (slugs) {
            revalidatePath(`/${locale}/${slugs.l1Slug}/group/${slugs.slug}/members`);
        }

        return { success: true };
    } catch (error) {
        return handleActionError(error, 'MANAGE_FAILED');
    }
}

/**
 * Demote an Admin to Member role.
 */
export async function demoteMember(groupId: string, targetUserId: string, locale: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const result = await GroupService.updateMemberRole(groupId, targetUserId, 'MEMBER', session.user.id);
        if (!result.success) return result as ActionResponse;

        const slugs = await GroupService.getGroupSlugs(groupId);
        if (slugs) {
            revalidatePath(`/${locale}/${slugs.l1Slug}/group/${slugs.slug}/members`);
        }

        return { success: true };
    } catch (error) {
        return handleActionError(error, 'MANAGE_FAILED');
    }
}

/**
 * Kick/Remove a member from the group.
 */
export async function kickMember(groupId: string, targetUserId: string, locale: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const result = await GroupService.removeMember(groupId, targetUserId, session.user.id);
        if (!result.success) return result as ActionResponse;

        const slugs = await GroupService.getGroupSlugs(groupId);
        if (slugs) {
            revalidatePath(`/${locale}/${slugs.l1Slug}/group/${slugs.slug}/members`);
        }

        return { success: true };
    } catch (error) {
        return handleActionError(error, 'MANAGE_FAILED');
    }
}

/**
 * Deletes a post.
 */
export async function deletePostAction(postId: string, locale: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const result = await GroupService.deletePost(postId, session.user.id);
        if (!result.success) return result as ActionResponse;

        const { slug, l1Slug } = result.data!;
        revalidatePath(`/${locale}/${l1Slug}/group/${slug}`);
        revalidatePath(`/${locale}/${l1Slug}/group/${slug}/discussion`);

        return { success: true };
    } catch (error) {
        return handleActionError(error, 'DELETE_FAILED');
    }
}
