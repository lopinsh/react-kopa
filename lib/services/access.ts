import { cache } from 'react';
import type { MembershipRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { hasAdminRights, isAtLeastMember, isOwner } from '@/lib/utils/permissions';
import { isSiteAdmin as isSiteAdminRole } from '@/lib/site-role';
import { getSiteRole } from './site-role.service';

/** The group team: the roles that run a group (owner and moderators). The team is never stored; it is these members. */
export const TEAM_ROLES: MembershipRole[] = ['OWNER', 'ADMIN'];
/** Roles of approved members (everyone but pending applicants). */
export const APPROVED_ROLES: MembershipRole[] = ['MEMBER', 'ADMIN', 'OWNER'];

/** Where-fragment: the group's team members. */
export function teamMemberWhere(): { role: { in: MembershipRole[] } } {
    return { role: { in: TEAM_ROLES } };
}

/** Where-fragment: approved members (not pending). */
export function approvedMemberWhere(): { role: { in: MembershipRole[] } } {
    return { role: { in: APPROVED_ROLES } };
}

/** One viewer's standing in one group, resolved once. Signed out: no role, nothing true. */
export interface ViewerAccess {
    /** The viewer's membership role, or null (also null for a signed-out viewer). */
    role: MembershipRole | null;
    /** Approved member (owner, moderator or member); false for pending and outsiders. */
    isMember: boolean;
    /** Owner or moderator. */
    isTeam: boolean;
    isOwner: boolean;
    isSiteAdmin: boolean;
    /** The group is hidden by moderation (false when the group does not exist). */
    groupHidden: boolean;
}

const NO_ACCESS: ViewerAccess = { role: null, isMember: false, isTeam: false, isOwner: false, isSiteAdmin: false, groupHidden: false };

/** Derives the flags from a role the caller already holds (the resolver and callers with their own membership query). */
export function accessFromRole(role: MembershipRole | null, siteRole: string | null, groupHidden = false): ViewerAccess {
    return {
        role,
        isMember: isAtLeastMember(role),
        isTeam: hasAdminRights(role),
        isOwner: isOwner(role),
        isSiteAdmin: isSiteAdminRole(siteRole),
        groupHidden
    };
}

/**
 * The one lookup behind every "what may this viewer do in this group" check: membership role,
 * site role and whether the group is hidden. Cached per request. Callers decide what to do with it
 * (who may see a hidden group differs by surface and stays with the caller).
 */
export const getViewerAccess = cache(async (groupId: string, userId?: string | null): Promise<ViewerAccess> => {
    if (!userId) return NO_ACCESS;
    // Role and hidden flag in one query (a membership cannot outlive its group); the site role is cached per request.
    const [group, siteRole] = await Promise.all([
        prisma.group.findUnique({ where: { id: groupId }, select: { hiddenAt: true, members: { where: { userId }, select: { role: true }, take: 1 } } }),
        getSiteRole(userId)
    ]);
    return accessFromRole(group?.members[0]?.role ?? null, siteRole, !!group?.hiddenAt);
});
