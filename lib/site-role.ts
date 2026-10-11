/**
 * Site-level roles (User.role / AppRole), not group roles. The one place that decides
 * who counts as a site admin: the owner is an admin too, plus the owner-only powers.
 */
export type SiteRole = 'USER' | 'ADMIN' | 'OWNER';

/** Site admin: moderation, translation mode, feedback mode, Handbook. True for ADMIN and OWNER. */
export function isSiteAdmin(role: string | null | undefined): boolean {
    return role === 'ADMIN' || role === 'OWNER';
}

/** The single site owner: manages admins and may permanently delete groups. */
export function isSiteOwner(role: string | null | undefined): boolean {
    return role === 'OWNER';
}
