import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { hasAdminRights, isAtLeastMember } from '@/lib/utils/permissions';
import { ActionError } from '@/types/actions';
import { triggerRealtime } from '@/lib/pusher';
import { legacyTitle } from '@/lib/utils/announcement-title';
import { TaxonomyResolver } from './taxonomy-resolver.service';

const AUTHOR_SELECT = { id: true, name: true, image: true, avatarSeed: true } as const;

type PostWithAuthor = Prisma.PostGetPayload<{
    include: { author: { select: typeof AUTHOR_SELECT } };
}>;

/** An announcement as the board shows it: `title` is always filled (old posts: their first line). */
export type AnnouncementRow = Omit<PostWithAuthor, 'title' | 'createdAt' | 'archivedAt'> & {
    title: string;
    createdAt: Date;
    archivedAt: Date | null;
};

function toRow(post: PostWithAuthor): AnnouncementRow {
    if (post.title) return { ...post, title: post.title };
    const { title, body } = legacyTitle(post.content);
    return { ...post, title, content: body };
}

/** What a post needs of its group to name the group's page: name, slug and the category chain. */
const GROUP_SLUG_SELECT = {
    name: true,
    slug: true,
    category: { include: TaxonomyResolver.getInclude('lv') }
} as const;

/**
 * The viewer's role in the group. A group hidden by moderation is readable by its owner only,
 * the same as the group page (everyone else gets a 404 there).
 */
async function getRole(groupId: string, userId: string) {
    const membership = await prisma.membership.findUnique({
        where: { userId_groupId: { userId, groupId } },
        select: { role: true, group: { select: { hiddenAt: true } } }
    });
    if (!membership) return null;
    if (membership.group.hiddenAt && membership.role !== 'OWNER') return null;
    return membership.role;
}

/** Announcements: top-level posts written by a group's owner or admins. There are no replies. */
export const PostService = {
    async createAnnouncement(data: { groupId: string; authorId: string; title: string; content: string }) {
        const role = await getRole(data.groupId, data.authorId);
        if (!hasAdminRights(role)) throw new ActionError('FORBIDDEN');

        const post = await prisma.post.create({
            data: { title: data.title, content: data.content, groupId: data.groupId, authorId: data.authorId },
            include: {
                author: { select: AUTHOR_SELECT },
                group: { select: GROUP_SLUG_SELECT }
            }
        });

        // Only the id goes over the (public) channel; clients refetch through the members-only action.
        await triggerRealtime(`group-${data.groupId}`, 'new-post', { id: post.id });
        return {
            postId: post.id,
            slug: post.group.slug,
            l1Slug: TaxonomyResolver.resolve(post.group.category).l1Slug,
            groupName: post.group.name,
            authorName: post.author.name || ''
        };
    },

    /**
     * Everyone in the group except the author and pending applicants. Nobody while the group is
     * hidden by moderation: members could not open the announcement anyway.
     */
    async getAnnouncementRecipients(groupId: string, authorId: string) {
        return prisma.membership.findMany({
            where: {
                groupId,
                group: { hiddenAt: null },
                userId: { not: authorId },
                role: { in: ['MEMBER', 'ADMIN', 'OWNER'] }
            },
            select: { userId: true }
        });
    },

    /** Members only. */
    async getAnnouncements(groupId: string, viewerId: string): Promise<AnnouncementRow[]> {
        const role = await getRole(groupId, viewerId);
        if (!isAtLeastMember(role)) throw new ActionError('FORBIDDEN');

        return prisma.post.findMany({
            where: { groupId },
            orderBy: { createdAt: 'desc' },
            include: { author: { select: AUTHOR_SELECT } }
        }).then(posts => posts.map(toRow));
    },

    /** Move an announcement to the archive (or back). Owner and admins only. */
    async setArchived(postId: string, actorId: string, archived: boolean): Promise<{ slug: string; l1Slug: string }> {
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { groupId: true, group: { select: GROUP_SLUG_SELECT } }
        });
        if (!post) throw new ActionError('NOT_FOUND');
        const role = await getRole(post.groupId, actorId);
        if (!hasAdminRights(role)) throw new ActionError('FORBIDDEN');

        await prisma.post.update({ where: { id: postId }, data: { archivedAt: archived ? new Date() : null } });
        // Only the id goes over the (public) channel; open boards refetch through the members-only action.
        await triggerRealtime(`group-${post.groupId}`, 'archive-post', { id: postId });
        return { slug: post.group.slug, l1Slug: TaxonomyResolver.resolve(post.group.category).l1Slug };
    },

    /** Deletes an announcement. Only the group's current owner and admins can. */
    async deleteAnnouncement(postId: string, actorId: string): Promise<{ slug: string; l1Slug: string }> {
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { groupId: true, group: { select: GROUP_SLUG_SELECT } }
        });
        if (!post) throw new ActionError('NOT_FOUND');
        // Same rule as the other post methods: owner/admins only; in a hidden group only the owner.
        const role = await getRole(post.groupId, actorId);
        if (!hasAdminRights(role)) throw new ActionError('FORBIDDEN');

        await prisma.post.delete({ where: { id: postId } });
        // Only the id goes over the (public) group channel; open boards drop the post.
        await triggerRealtime(`group-${post.groupId}`, 'delete-post', { postId });
        return { slug: post.group.slug, l1Slug: TaxonomyResolver.resolve(post.group.category).l1Slug };
    }
};
