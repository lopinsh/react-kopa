import { cache } from 'react';
import { cookies } from 'next/headers';
import { auth } from '@/lib/auth';
import { isSiteAdmin } from '@/lib/site-role';
import { ADMIN_PANEL_COOKIE, isAdminPanelTab, type AdminPanelTab } from '@/lib/constants';

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
