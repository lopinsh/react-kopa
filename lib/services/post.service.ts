import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { hasAdminRights, isAtLeastMember } from '@/lib/utils/permissions';
import { ActionError } from '@/types/actions';
import { triggerRealtime } from '@/lib/pusher';

const AUTHOR_SELECT = { id: true, name: true, image: true, avatarSeed: true } as const;

export type AnnouncementRow = Prisma.PostGetPayload<{
    include: { author: { select: typeof AUTHOR_SELECT } };
}>;

async function getRole(groupId: string, userId: string) {
    const membership = await prisma.membership.findUnique({
        where: { userId_groupId: { userId, groupId } },
        select: { role: true }
    });
    return membership?.role ?? null;
}

/** Announcements: top-level posts written by a group's owner or admins. There are no replies. */
export const PostService = {
    async createAnnouncement(data: { groupId: string; authorId: string; content: string }) {
        const role = await getRole(data.groupId, data.authorId);
        if (!hasAdminRights(role)) throw new ActionError('FORBIDDEN');

        const post = await prisma.post.create({
            data: { content: data.content, groupId: data.groupId, authorId: data.authorId },
            include: {
                author: { select: AUTHOR_SELECT },
                group: {
                    include: {
                        category: {
                            select: {
                                slug: true,
                                level: true,
                                parent: { select: { slug: true, parent: { select: { slug: true } } } }
                            }
                        }
                    }
                }
            }
        });

        // Only the id goes over the (public) channel; clients refetch through the members-only action.
        await triggerRealtime(`group-${data.groupId}`, 'new-post', { id: post.id });
        return post;
    },

    /** Everyone in the group except the author and pending applicants. */
    async getAnnouncementRecipients(groupId: string, authorId: string) {
        return prisma.membership.findMany({
            where: {
                groupId,
                userId: { not: authorId },
                role: { in: ['MEMBER', 'ADMIN', 'OWNER'] }
            },
            select: { userId: true }
        });
    },

    /** Members only. Replies written before announcements existed are not shown. */
    async getAnnouncements(groupId: string, viewerId: string): Promise<AnnouncementRow[]> {
        const role = await getRole(groupId, viewerId);
        if (!isAtLeastMember(role)) throw new ActionError('FORBIDDEN');

        return prisma.post.findMany({
            where: { groupId, parentId: null },
            orderBy: { createdAt: 'desc' },
            include: { author: { select: AUTHOR_SELECT } }
        });
    }
};
