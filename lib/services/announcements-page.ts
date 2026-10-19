import { prisma } from '@/lib/prisma';
import { ANNOUNCEMENTS_LIMIT } from '@/lib/constants';
import { hasAdminRights, isAtLeastMember } from '@/lib/utils/permissions';
import { ActionError } from '@/types/actions';
import { AUTHOR_SELECT, getRole, toRow, type PostWithAuthor } from './post.service';

/** One announcement as the pages show it: `title` is always filled (old posts: their first line). */
export interface AnnouncementItemData {
    id: string;
    title: string;
    content: string;
    visibility: 'PUBLIC' | 'MEMBERS_ONLY';
    createdAt: Date;
    archivedAt: Date | null;
    author: { name: string | null; username: string | null };
}

export interface AnnouncementsPage {
    items: AnnouncementItemData[];
    counts: { current: number; archive: number };
    canManage: boolean;
}

function toItem(post: PostWithAuthor): AnnouncementItemData {
    const row = toRow(post);
    return {
        id: row.id,
        title: row.title,
        content: row.content,
        visibility: row.visibility,
        createdAt: row.createdAt,
        archivedAt: row.archivedAt,
        author: { name: row.author.name, username: row.author.username },
    };
}

/** The group's announcements for its members (`FORBIDDEN` otherwise): the current or the archived ones, with both counts. */
export async function getAnnouncementsPage(groupId: string, viewerId: string, tab: 'current' | 'archive'): Promise<AnnouncementsPage> {
    const role = await getRole(groupId, viewerId);
    if (!isAtLeastMember(role)) throw new ActionError('FORBIDDEN');

    const [posts, current, archive] = await Promise.all([
        prisma.post.findMany({
            where: { groupId, archivedAt: tab === 'archive' ? { not: null } : null },
            orderBy: tab === 'archive' ? { archivedAt: 'desc' } : { createdAt: 'desc' },
            take: ANNOUNCEMENTS_LIMIT,
            include: { author: { select: AUTHOR_SELECT } },
        }),
        prisma.post.count({ where: { groupId, archivedAt: null } }),
        prisma.post.count({ where: { groupId, archivedAt: { not: null } } }),
    ]);
    return { items: posts.map(toItem), counts: { current, archive }, canManage: hasAdminRights(role) };
}

/**
 * The newest not archived announcement for the group's Informācija. Members get any (the page already hides a hidden group from non-owners); everyone else only a public one of a
 * visible public group (the group filter is the same as the cards').
 */
export async function getLatestForInfo(groupId: string, viewer: { isMember: boolean }): Promise<AnnouncementItemData | null> {
    const post = await prisma.post.findFirst({
        where: viewer.isMember
            ? { groupId, archivedAt: null }
            : { groupId, archivedAt: null, visibility: 'PUBLIC', group: { type: 'PUBLIC', hiddenAt: null } },
        orderBy: { createdAt: 'desc' },
        include: { author: { select: AUTHOR_SELECT } },
    });
    return post ? toItem(post) : null;
}
