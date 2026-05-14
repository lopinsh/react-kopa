'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { createNotification } from './notification-actions';
import { PostService } from '@/lib/services/post.service';
import { ActionError, type ActionResponse } from '@/types/actions';
import type { Prisma } from '@prisma/client';

type PostWithAuthorAndGroup = Prisma.PostGetPayload<{
    include: {
        author: { select: { name: true; image: true } };
        group: {
            include: {
                category: {
                    select: {
                        slug: true; level: true;
                        parent: { select: { slug: true; parent: { select: { slug: true } } } };
                    };
                };
            };
        };
    };
}>;

/**
 * Create a new post or reply in a group discussion board.
 */
export async function createPost(groupId: string, content: string, locale: string, parentId?: string): Promise<ActionResponse<{ post: PostWithAuthorAndGroup }>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    if (!content.trim() || content.length > 2000) {
        return { success: false, error: 'VALIDATION_FAILED' };
    }

    try {
        const authorId = session.user.id;

        const post = await PostService.createPost({
            groupId,
            authorId,
            content,
            parentId
        });

        // Notify group members
        const members = await PostService.getPostGroupMembers(groupId, authorId);

        if (members.length > 0) {
            let l1Slug = post.group.category.slug;
            if (post.group.category.level === 3 && post.group.category.parent?.parent) {
                l1Slug = post.group.category.parent.parent.slug;
            } else if (post.group.category.level === 2 && post.group.category.parent) {
                l1Slug = post.group.category.parent.slug;
            }

            await Promise.all(members.map(m =>
                createNotification({
                    userId: m.userId,
                    type: 'NEW_POST',
                    translationKey: 'newPost',
                    args: { authorName: post.author.name || 'Someone', groupName: post.group.name },
                    link: `/${l1Slug}/group/${post.group.slug}?tab=discussion`
                })
            ));
        }

        revalidatePath(`/[locale]/[l1Slug]/group/[groupSlug]`, 'page');
        return { success: true, data: { post: post as unknown as PostWithAuthorAndGroup } }; // Prisma payload shape matching 
    } catch (error: any) {
        if (error.name === 'ActionError') {
            return { success: false, error: error.code };
        }
        console.error('[createPost] Error:', error);
        return { success: false, error: 'POST_FAILED' };
    }
}

/**
 * Get group discussion posts.
 */
export async function getGroupPosts(groupId: string) {
    return PostService.getPostsByGroupId(groupId);
}

/**
 * Delete a post (Author or Admin/Owner only).
 */
export async function deletePost(postId: string, locale: string): Promise<ActionResponse<void>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        await PostService.deletePost(postId, session.user.id);

        revalidatePath(`/[locale]/[l1Slug]/group/[groupSlug]`, 'page');
        return { success: true };
    } catch (error: any) {
        if (error.name === 'ActionError') {
            return { success: false, error: error.code };
        }
        console.error('[deletePost] Error:', error);
        return { success: false, error: 'DELETE_FAILED' };
    }
}
