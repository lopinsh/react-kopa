import { MembershipRole } from '@prisma/client';

/**
 * Checks if a membership role has admin-level rights (OWNER or ADMIN).
 * Used for authorizing group management actions.
 */
export function hasAdminRights(role: MembershipRole | string | null | undefined): boolean {
    return role === 'OWNER' || role === 'ADMIN';
}

/**
 * Checks if a membership role is explicitly the OWNER.
 */
export function isOwner(role: MembershipRole | string | null | undefined): boolean {
    return role === 'OWNER';
}

/**
 * Checks if a membership role is at least a MEMBER (not PENDING or non-member).
 */
export function isAtLeastMember(role: MembershipRole | string | null | undefined): boolean {
    return role === 'OWNER' || role === 'ADMIN' || role === 'MEMBER';
}

/** What a viewer may do to another member: the one rule the member menu shows and the services enforce. */
export type MemberManageAction = 'promote' | 'demote' | 'remove';

/**
 * The owner promotes members, demotes moderators and removes anyone but themselves; moderators
 * remove plain members (or pending applicants) only; nobody removes the owner or changes their role.
 * `isSelf` always yields nothing (leaving goes through `leaveGroup`).
 */
export function allowedMemberActions(
    viewerRole: MembershipRole | string | null | undefined,
    targetRole: MembershipRole | string | null | undefined,
    isSelf = false
): MemberManageAction[] {
    if (isSelf || targetRole === 'OWNER') return [];
    const actions: MemberManageAction[] = [];
    if (viewerRole === 'OWNER') {
        if (targetRole === 'MEMBER') actions.push('promote');
        if (targetRole === 'ADMIN') actions.push('demote');
        actions.push('remove');
    } else if (viewerRole === 'ADMIN' && (targetRole === 'MEMBER' || targetRole === 'PENDING')) {
        actions.push('remove');
    }
    return actions;
}
