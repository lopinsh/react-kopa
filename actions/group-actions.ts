'use server';

import { revalidatePath } from 'next/cache';
import { GroupFormValues, groupFormSchema } from '@/lib/validations/group';
import { auth } from '@/lib/auth';
import { GroupService } from '@/lib/services/group.service';
import { createNotification } from './notification-actions';
import { ActionResponse } from '@/types/actions';
import { validateActionData, handleActionError } from '@/lib/action-utils';
import type { MembershipRole } from '@prisma/client';

type GroupDetailsResult = Record<string, unknown> & {
    members: Array<Record<string, unknown> & { applicationMessage?: string | null }>;
    isMember: boolean;
    userRole: MembershipRole | null;
    tags: Array<{ id: string; slug: string; title: string; isWildcard: boolean; parentId: string | null }>;
    inquiries: Array<{ id: string; content: string; createdAt: Date; senderId: string }>;
};

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
        revalidatePath(`/${locale}`, 'page');
        revalidatePath(`/${locale}/discover`, 'page');

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
            revalidatePath(`/${locale}/${slugs.l1Slug}/group/${slugs.slug}`, 'page');
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
            revalidatePath(`/${locale}/${slugs.l1Slug}/group/${slugs.slug}`, 'page');
        }
        revalidatePath(`/${locale}/discover`, 'page');
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

        revalidatePath(`/${locale}/discover`, 'page');
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

        revalidatePath(`/${locale}/${categorySlug}/group/${groupSlug}`, 'page');
        revalidatePath(`/${locale}/${categorySlug}/group/${groupSlug}/members`, 'page');
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
            revalidatePath(`/${locale}/${slugs.l1Slug}/group/${slugs.slug}/members`, 'page');
        }

        return { success: true };
    } catch (error) {
        return handleActionError(error, 'INQUIRY_FAILED');
    }
}

/**
 * Lightweight action to get current user's role for a specific group.
 * Delegates all DB logic to GroupService.getGroupRole.
 */
export async function getGroupRole(l1Slug: string, groupSlug: string): Promise<{
    role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'PENDING' | null;
    hasInstructions: boolean;
    pendingCount: number;
    sections: Array<{ id: string; title: string; visibility: string }>;
}> {
    const session = await auth();
    return GroupService.getGroupRole(l1Slug, groupSlug, session?.user?.id);
}

/**
 * Fetches group details by slug for the landing page.
 * Delegates all DB work to GroupService.getGroupWithContext.
 */
export async function getGroupDetails(l1Slug: string, groupSlug: string, locale: string): Promise<GroupDetailsResult | null> {
    const session = await auth();
    const context = await GroupService.getGroupWithContext(groupSlug, locale, l1Slug, session?.user?.id);
    return context as GroupDetailsResult | null;
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

        revalidatePath(`/${locale}/${l1Slug}/group/${slug}`, 'page');
        revalidatePath(`/${locale}/${l1Slug}/group/${slug}/settings`, 'page');

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

        revalidatePath(`/${locale}/discover`, 'page');
        revalidatePath(`/${locale}`, 'page');

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

        revalidatePath(`/${locale}/${l1Slug}/group/${slug}`, 'page');
        revalidatePath(`/${locale}/${l1Slug}/group/${slug}/settings`, 'page');

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

        revalidatePath(`/${locale}/${l1Slug}/group/${slug}`, 'page');
        revalidatePath(`/${locale}/${l1Slug}/group/${slug}/settings`, 'page');

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

        revalidatePath(`/${locale}/${l1Slug}/group/${slug}`, 'page');
        revalidatePath(`/${locale}/${l1Slug}/group/${slug}/settings`, 'page');
        revalidatePath(`/${locale}`, 'page');

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
            revalidatePath(`/${locale}/${slugs.l1Slug}/group/${slugs.slug}/members`, 'page');
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
            revalidatePath(`/${locale}/${slugs.l1Slug}/group/${slugs.slug}/members`, 'page');
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
            revalidatePath(`/${locale}/${slugs.l1Slug}/group/${slugs.slug}/members`, 'page');
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
        revalidatePath(`/${locale}/${l1Slug}/group/${slug}`, 'page');
        revalidatePath(`/${locale}/${l1Slug}/group/${slug}/discussion`, 'page');

        return { success: true };
    } catch (error) {
        return handleActionError(error, 'DELETE_FAILED');
    }
}

