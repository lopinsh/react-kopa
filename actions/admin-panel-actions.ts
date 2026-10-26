'use server';

import { cookies } from 'next/headers';
import type { ActionResponse } from '@/types/actions';
import { handleActionError, requireSiteAdmin } from '@/lib/action-utils';
import { AdminService, type ShieldCounts } from '@/lib/services/admin.service';
import { getGroupPanel, type GroupPanelData } from '@/lib/services/group-panel';
import { ADMIN_PANEL_COOKIE, LEGACY_PANEL_COOKIES, type AdminPanelTab } from '@/lib/constants';
import { adminPanelTabSchema, groupPanelInputSchema } from '@/lib/validations/admin-panel';

/** Opens the admin tool panel on a tab, or closes it (null). One tab at a time: feedback and translate both capture page clicks. */
export async function setAdminPanel(tab: AdminPanelTab | null): Promise<ActionResponse> {
    const check = await requireSiteAdmin();
    if (!check.success) return { success: false, error: check.error };
    const parsed = adminPanelTabSchema.safeParse(tab);
    if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };

    const cookieStore = await cookies();
    for (const legacy of LEGACY_PANEL_COOKIES) cookieStore.delete(legacy);
    if (parsed.data) {
        cookieStore.set(ADMIN_PANEL_COOKIE, parsed.data, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        });
    } else {
        cookieStore.delete(ADMIN_PANEL_COOKIE);
    }
    return { success: true };
}

/** The Grupa tab's data for one group. A read: site admins only, nothing is revalidated. */
export async function getGroupPanelData(groupId: string, locale: string): Promise<ActionResponse<GroupPanelData>> {
    const check = await requireSiteAdmin();
    if (!check.success) return { success: false, error: check.error };
    const parsed = groupPanelInputSchema.safeParse({ groupId });
    if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };
    try {
        return { success: true, data: await getGroupPanel(parsed.data.groupId, check.userId, locale) };
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}

/** What waits in each admin queue, for the shield menu. A read: site admins only. */
export async function getShieldCounts(): Promise<ActionResponse<ShieldCounts>> {
    const check = await requireSiteAdmin();
    if (!check.success) return { success: false, error: check.error };
    try {
        return { success: true, data: await AdminService.getShieldCounts(check.userId) };
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}
