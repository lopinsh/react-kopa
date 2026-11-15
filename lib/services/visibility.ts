import type { Prisma, Visibility } from '@prisma/client';

/**
 * Who may see what, written once. The where-builders say what anyone (signed out too) may read;
 * `canSee` decides one item for a viewer. Who may open a hidden group differs by surface and stays
 * with the caller (see getViewerAccess.groupHidden).
 */

/** A group anyone may see: public and not hidden by moderation. */
export function publicGroupWhere(): { type: 'PUBLIC'; hiddenAt: null } {
    return { type: 'PUBLIC', hiddenAt: null };
}

/** An announcement anyone may read: public and not archived. The caller adds the group part (usually `publicGroupWhere`). */
export function publicPostWhere(): { visibility: 'PUBLIC'; archivedAt: null } {
    return { visibility: 'PUBLIC', archivedAt: null };
}

/** An event anyone may read: public. The caller adds the group part (`eventWhere` carries it for discovery). */
export function publicEventWhere(): Prisma.EventWhereInput & { visibility: 'PUBLIC' } {
    return { visibility: 'PUBLIC' };
}

/** One item: public ones are open to all, members-only ones to approved members and site admins. */
export function canSee(visibility: Visibility, access: { isMember: boolean; isSiteAdmin: boolean }): boolean {
    return visibility === 'PUBLIC' || access.isMember || access.isSiteAdmin;
}
