import { cache } from 'react';
import { cookies } from 'next/headers';
import { auth } from '@/lib/auth';
import { isSiteAdmin } from '@/lib/site-role';
import { ADMIN_MODE_COOKIE, ADMIN_PANEL_COOKIE, isAdminMode, isAdminPanelTab, type AdminMode, type AdminPanelTab } from '@/lib/constants';
import { getAdminMode } from '@/lib/services/admin-mode';

/**
 * The tab of the admin tool panel that is open, or null. Set only when the cookie holds a known tab AND the
 * signed-in user is a site admin: anyone else who sets the cookie gets the plain page. Per request.
 */
export const getAdminPanelTab = cache(async (): Promise<AdminPanelTab | null> => {
    const value = (await cookies()).get(ADMIN_PANEL_COOKIE)?.value;
    if (!isAdminPanelTab(value)) return null;
    const session = await auth();
    return isSiteAdmin(session?.user?.role) ? value : null;
});

/** The signed-in site admin's simulated group mode (A-2), or null. The site role is checked against the database (getAdminMode), never the cookie alone. */
export const getCurrentAdminMode = cache(async (): Promise<AdminMode | null> => {
    if (!isAdminMode((await cookies()).get(ADMIN_MODE_COOKIE)?.value)) return null;
    const session = await auth();
    return getAdminMode(session?.user?.id);
});
