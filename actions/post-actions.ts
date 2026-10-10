'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { NotificationService } from '@/lib/services/notification.service';
import { PostService, type AnnouncementRow } from '@/lib/services/post.service';
import { type ActionResponse } from '@/types/actions';
import { handleActionError } from '@/lib/action-utils';
import { announcementSchema, type AnnouncementInput } from '@/lib/validations/announcement';

/**
 * Publish an announcement. Only the group's owner and admins may (enforced by the service);
 * every other member is notified.
 */
export async function createPost(groupId: string, input: AnnouncementInput, locale: string): Promise<ActionResponse<{ postId: string }>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    const parsed = announcementSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };

    try {
        const authorId = session.user.id;
        const post = await PostService.createAnnouncement({ groupId, authorId, ...parsed.data });

        let l1Slug = post.group.category.slug;
        if (post.group.category.level === 3 && post.group.category.parent?.parent) {
            l1Slug = post.group.category.parent.parent.slug;
        } else if (post.group.category.level === 2 && post.group.category.parent) {
            l1Slug = post.group.category.parent.slug;
        }

        // The post is saved; a failed notification must not report the publish as failed.
        try {
            const members = await PostService.getAnnouncementRecipients(groupId, authorId);
            await NotificationService.createForUsers(members.map(m => m.userId), {
                type: 'NEW_POST',
                translationKey: 'newPost',
                args: { authorName: post.author.name || '', groupName: post.group.name, excerpt: parsed.data.title },
                link: `/${l1Slug}/group/${post.group.slug}/announcements`
            });
        } catch (notifyError) {
            console.error('[createPost] notify failed:', notifyError);
        }

        revalidatePath(`/${locale}/${l1Slug}/group/${post.group.slug}/announcements`, 'page');
        return { success: true, data: { postId: post.id } };
    } catch (error) {
        return handleActionError(error, 'CREATE_FAILED');
    }
}

/**
 * Announcements of a group. Members only.
 */
export async function getGroupPosts(groupId: string): Promise<ActionResponse<AnnouncementRow[]>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        return { success: true, data: await PostService.getAnnouncements(groupId, session.user.id) };
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}

/**
 * Move an announcement to the archive, or back. Owner and admins only (enforced by the service).
 */
export async function setPostArchived(postId: string, archived: boolean): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        await PostService.setArchived(postId, session.user.id, archived);
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'UPDATE_FAILED');
    }
}
