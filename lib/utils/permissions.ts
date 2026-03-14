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
