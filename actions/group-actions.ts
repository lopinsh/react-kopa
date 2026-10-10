'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { GroupFormValues, groupFormSchema } from '@/lib/validations/group';
import { sectionSaveSchema, type SectionSaveValues } from '@/lib/validations/section';
import { auth } from '@/lib/auth';
import { GroupService } from '@/lib/services/group.service';
import { createNotification } from './notification-actions';
import { ActionResponse } from '@/types/actions';
import { validateActionData, handleActionError } from '@/lib/action-utils';
import type { MembershipRole } from '@prisma/client';
import { messageTextSchema } from '@/lib/validations/message';

type GroupDetailsResult = Record<string, unknown> & {
    members: Array<Record<string, unknown> & { applicationMessage?: string | null }>;
    isMember: boolean;
    userRole: MembershipRole | null;
    tags: Array<{ id: string; slug: string; title: string; isWildcard: boolean; parentId: string | null }>;
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

        const result = await GroupService.createGroup(validation.data, session.user.id, locale);
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
export async function joinGroup(groupId: string, locale: string, message?: string): Promise<ActionResponse<{ pending: boolean; conversationId: string }>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };
    if (!messageTextSchema.safeParse(message).success) return { success: false, error: 'VALIDATION_FAILED' };

    try {
        const result = await GroupService.joinGroup(groupId, session.user.id, message);
        if (!result.success) return result as ActionResponse<{ pending: boolean; conversationId: string }>;

        const { slugs, groupName, adminIds, conversationId } = result.data!;
        if (slugs) {
            revalidatePath(`/${locale}/${slugs.l1Slug}/group/${slugs.slug}`, 'page');
        }

        await Promise.all(adminIds.map(adminId => createNotification({
            userId: adminId,
            type: 'JOIN_REQUEST',
            translationKey: 'joinRequest',
            args: { authorName: session.user.name || session.user.username || '', groupName, excerpt: message ?? '' },
            link: slugs ? `/${slugs.l1Slug}/group/${slugs.slug}/members?tab=requests` : undefined
        })));

        return { success: true, data: { pending: true, conversationId } };
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

        const slugs = result.data?.slugs;
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
export async function sendInquiry(groupId: string, message: string): Promise<ActionResponse<{ conversationId: string }>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };
    if (!messageTextSchema.safeParse(message).success) return { success: false, error: 'VALIDATION_FAILED' };

    try {
        const result = await GroupService.sendInquiry(groupId, session.user.id, message);
        if (!result.success) return result as ActionResponse<{ conversationId: string }>;

        const { conversationId, teamIds, groupName } = result.data!;

        // Owner and admins can all answer the group chat, so all of them hear about it.
        await Promise.all(teamIds.map(teamUserId => createNotification({
            userId: teamUserId,
            type: 'INQUIRY_RECEIVED',
            translationKey: 'inquiryReceived',
            args: { authorName: session.user.name || session.user.username || '', groupName, excerpt: message },
            link: `/messages?c=${conversationId}`
        })));

        return { success: true, data: { conversationId } };
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

        const { targetUserId, groupName, groupSlug, l1Slug } = result.data!;

        if (action === 'APPROVE') {
            await createNotification({
                userId: targetUserId,
                type: 'APPLICATION_ACCEPTED',
                translationKey: 'applicationAccepted',
                args: { groupName },
                link: `/${l1Slug}/group/${groupSlug}`
            });
        }

        revalidatePath(`/${locale}/${l1Slug}/group/${groupSlug}`, 'page');
        revalidatePath(`/${locale}/${l1Slug}/group/${groupSlug}/members`, 'page');
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'MANAGE_FAILED');
    }
}

/**
 * Lightweight action to get current user's role for a specific group.
 * Delegates all DB logic to GroupService.getGroupRole.
 */
export async function getGroupRole(l1Slug: string, groupSlug: string): Promise<{
    exists: boolean;
    role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'PENDING' | null;
    pendingCount: number;
    sections: Array<{ id: string; visibility: string }>;
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

        // Discovery caches groups and events by tag; without this the deleted group stays listed (and 404s) until the cache expires.
        updateTag('groups');
        updateTag('events');
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
    data: SectionSaveValues,
    locale: string
): Promise<ActionResponse<{ sectionId: string }>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const validation = await validateActionData(sectionSaveSchema, data);
        if (!validation.success) return validation;

        const result = await GroupService.upsertSection(groupId, validation.data, session.user.id);
        if (!result.success) return result as ActionResponse<{ sectionId: string }>;

        const { slug, l1Slug, sectionId } = result.data!;

        revalidatePath(`/${locale}/${l1Slug}/group/${slug}`, 'page');
        revalidatePath(`/${locale}/${l1Slug}/group/${slug}/settings`, 'page');

        return { success: true, data: { sectionId } };
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


/**
 * Owner hands the group over to a member or moderator. The new owner is told.
 */
export async function transferOwnership(groupId: string, targetUserId: string, locale: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const result = await GroupService.transferOwnership(groupId, targetUserId, session.user.id);
        if (!result.success) return result as ActionResponse;

        const { groupName, groupSlug, l1Slug } = result.data!;

        await createNotification({
            userId: targetUserId,
            type: 'OWNERSHIP_TRANSFERRED',
            translationKey: 'ownershipTransferred',
            args: { authorName: session.user.name || session.user.username || '', groupName },
            link: `/${l1Slug}/group/${groupSlug}`
        });

        revalidatePath(`/${locale}/${l1Slug}/group/${groupSlug}`, 'layout');
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'MANAGE_FAILED');
    }
}
