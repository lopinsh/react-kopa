'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { createNotification } from './notification-actions';

/**
 * Create a new post in a group discussion board.
 */
export async function createPost(groupId: string, content: string, locale: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'UNAUTHORIZED' };

    if (!content.trim() || content.length > 2000) {
        return { error: 'INVALID_CONTENT' };
    }

    try {
        const authorId = session.user.id;

        // Verify membership
        const membership = await prisma.membership.findUnique({
            where: {
                userId_groupId: {
                    userId: authorId,
                    groupId: groupId,
                }
            }
        });

        if (!membership) return { error: 'NOT_A_MEMBER' };

        const post = await prisma.post.create({
            data: {
                content,
                groupId,
                authorId,
            },
            include: {
                author: {
                    select: { name: true, image: true }
                },
                group: {
                    include: {
                        category: {
                            select: {
                                slug: true,
                                level: true,
                                parent: {
                                    select: {
                                        slug: true,
                                        parent: { select: { slug: true } }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Notify group members
        const members = await prisma.membership.findMany({
            where: {
                groupId,
                userId: { not: authorId },
                role: { in: ['MEMBER', 'ADMIN', 'OWNER'] }
            },
            select: { userId: true }
        });

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

        const { pusherServer } = await import('@/lib/pusher');
        await pusherServer.trigger(
            `group-${groupId}`,
            'new-post',
            post
        );

        revalidatePath(`/[locale]/[l1Slug]/group/[groupSlug]`, 'page');
        return { success: true, post };
    } catch (error) {
        console.error('[createPost] Error:', error);
        return { error: 'POST_FAILED' };
    }
}

/**
 * Get group discussion posts.
 */
export async function getGroupPosts(groupId: string) {
    try {
        const posts = await prisma.post.findMany({
            where: { groupId },
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { id: true, name: true, image: true }
                }
            }
        });

        return posts;
    } catch (error) {
        console.error('[getGroupPosts] Error:', error);
        return [];
    }
}

/**
 * Delete a post (Author or Admin/Owner only).
 */
export async function deletePost(postId: string, locale: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'UNAUTHORIZED' };

    try {
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: { group: { select: { id: true } } }
        });

        if (!post) return { error: 'NOT_FOUND' };

        const userId = session.user.id;
        const isAuthor = post.authorId === userId;

        // Check if Admin/Owner of the group
        const membership = await prisma.membership.findUnique({
            where: {
                userId_groupId: {
                    userId: userId,
                    groupId: post.group.id,
                }
            }
        });

        const isPrivileged = membership && (membership.role === 'OWNER' || membership.role === 'ADMIN');

        if (!isAuthor && !isPrivileged) {
            return { error: 'FORBIDDEN' };
        }

        await prisma.post.delete({
            where: { id: postId }
        });

        const { pusherServer } = await import('@/lib/pusher');
        await pusherServer.trigger(
            `group-${post.group.id}`,
            'delete-post',
            { postId }
        );

        revalidatePath(`/[locale]/[l1Slug]/group/[groupSlug]`, 'page');
        return { success: true };
    } catch (error) {
        console.error('[deletePost] Error:', error);
        return { error: 'DELETE_FAILED' };
    }
}
