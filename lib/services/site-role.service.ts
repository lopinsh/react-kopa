import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { isSiteAdmin, isSiteOwner } from '@/lib/site-role';

/** The user's site role, read from the database once per request. */
export const getSiteRole = cache(async (userId: string): Promise<string | null> => {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    return user?.role ?? null;
});

/** Site admin check against the database (the session role can be stale). ADMIN and OWNER count. */
export async function isSiteAdminUser(userId: string): Promise<boolean> {
    return isSiteAdmin(await getSiteRole(userId));
}

export async function isSiteOwnerUser(userId: string): Promise<boolean> {
    return isSiteOwner(await getSiteRole(userId));
}
