import { prisma } from '@/lib/prisma';
import { hasAdminRights } from '@/lib/utils/permissions';
import { ActionError } from '@/types/actions';
import { pusherServer } from '@/lib/pusher';

export const PostService = {
    async createPost(data: {
        groupId: string;
        authorId: string;
        content: string;
    }) {
        try {
            const membership = await prisma.membership.findUnique({
                where: {
                    userId_groupId: {
                        userId: data.authorId,
                        groupId: data.groupId,
                    }
                }
            });

            if (!membership) {
                throw new ActionError('UNAUTHORIZED');
            }

            const post = await prisma.post.create({
                data: {
                    content: data.content,
                    groupId: data.groupId,
                    authorId: data.authorId,
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

            // Trigger Pusher event
            await pusherServer.trigger(
                `group-${data.groupId}`,
                'new-post',
                post
            );

            return post;
        } catch (error) {
            if (error instanceof ActionError) throw error;
            console.error('[PostService.createPost] Error:', error);
            throw new ActionError('CREATE_FAILED');
        }
    },

    async getPostGroupMembers(groupId: string, authorId: string) {
        return prisma.membership.findMany({
            where: {
                groupId,
                userId: { not: authorId },
                role: { in: ['MEMBER', 'ADMIN', 'OWNER'] }
            },
            select: { userId: true }
        });
    },

    async getPostsByGroupId(groupId: string) {
        try {
            return await prisma.post.findMany({
                where: { groupId },
                orderBy: { createdAt: 'desc' },
                include: {
                    author: {
                        select: { id: true, name: true, image: true }
                    }
                }
            });
        } catch (error) {
            console.error('[PostService.getPostsByGroupId] Error:', error);
            return [];
        }
    },

    async deletePost(postId: string, userId: string) {
        try {
            const post = await prisma.post.findUnique({
                where: { id: postId },
                include: { group: { select: { id: true } } }
            });

            if (!post) {
                throw new ActionError('NOT_FOUND');
            }

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

            const isPrivileged = membership && hasAdminRights(membership.role);

            if (!isAuthor && !isPrivileged) {
                throw new ActionError('FORBIDDEN');
            }

            await prisma.post.delete({
                where: { id: postId }
            });

            await pusherServer.trigger(
                `group-${post.group.id}`,
                'delete-post',
                { postId }
            );

            return true;
        } catch (error) {
            if (error instanceof ActionError) throw error;
            console.error('[PostService.deletePost] Error:', error);
            throw new ActionError('DELETE_FAILED');
        }
    }
};
