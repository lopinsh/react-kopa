import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { ADMIN_MODE_COOKIE, isAdminMode, type AdminMode } from '@/lib/constants';
import { isSiteAdmin } from '@/lib/site-role';
import { getSiteRole } from './site-role.service';

/** Test-only: stands in for the cookie (the service tests run without Next). `undefined` = read the real cookie. */
let testMode: AdminMode | null | undefined;
export function setAdminModeForTest(mode: AdminMode | null | undefined): void {
    if (process.env.NODE_ENV !== 'test') throw new Error('setAdminModeForTest is for tests only');
    testMode = mode;
}

async function readCookie(): Promise<string | undefined> {
    if (testMode !== undefined) return testMode ?? undefined;
    try {
        return (await cookies()).get(ADMIN_MODE_COOKIE)?.value;
    } catch {
        return undefined; // outside a request (tests, scripts): no cookie
    }
}

/**
 * The simulated group mode of a site admin (A-2), or null: off, no request, or the user is not a site admin
 * (anyone else who sets the cookie gets nothing). The site role is read from the database every time.
 */
export async function getAdminMode(userId: string | null | undefined): Promise<AdminMode | null> {
    if (!userId) return null;
    const value = await readCookie();
    if (!isAdminMode(value)) return null;
    return isSiteAdmin(await getSiteRole(userId)) ? value : null;
}

/** Owner mode acts as the group's owner without being it: a write done there is logged like a site admin's override. */
export async function logOwnerModeWrite(access: { simulated: AdminMode | null }, userId: string, groupId: string): Promise<void> {
    if (access.simulated !== 'owner') return;
    await prisma.adminAction.create({ data: { adminId: userId, action: 'GROUP_EDIT', targetType: 'GROUP', targetId: groupId, reason: null, targetName: null } });
}
