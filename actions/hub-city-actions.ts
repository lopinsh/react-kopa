'use server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { requireSiteAdmin, handleActionError } from '@/lib/action-utils';
import { HubCityService } from '@/lib/services/hub-city.service';
import { NotificationService } from '@/lib/services/notification.service';
import { hubCityCloseSchema, hubCityRequestSchema } from '@/lib/validations/hub-note';
import type { ActionResponse } from '@/types/actions';

/** Requests, counts and Ziņas show on the topic hub, its topic x city hubs and the city hub: refresh every hub page. */
function refreshHubs(): void {
    revalidatePath('/[locale]/[l1Slug]/[...hub]', 'layout');
}

/** "Pieprasīt" (K3-07): auth, parse, the service decides if this request opens the hub; then the earlier requesters hear of it. */
export async function requestHubCity(input: unknown): Promise<ActionResponse<{ opened: boolean; href: string }>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };
    const parsed = hubCityRequestSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };
    try {
        const result = await HubCityService.request({ hubSlug: parsed.data.hubSlug, citySegment: parsed.data.city, userId: session.user.id, note: parsed.data.note, locale: 'lv' });
        if (result.opened && result.notifyUserIds.length > 0) {
            await Promise.all(result.notifyUserIds.map((userId) => NotificationService.notify({
                userId,
                type: 'HUB_CITY_OPENED',
                translationKey: 'HUB_CITY_OPENED',
                args: result.names,
                link: result.href,
            })));
        }
        refreshHubs();
        return { success: true, data: { opened: result.opened, href: result.href } };
    } catch (error: unknown) {
        return handleActionError(error);
    }
}

/** "Aizvērt kopienu" (K3-07): site admins only. */
export async function closeHubCity(hubCityId: unknown): Promise<ActionResponse<void>> {
    const admin = await requireSiteAdmin();
    if (!admin.success) return admin;
    const parsed = hubCityCloseSchema.safeParse({ hubCityId });
    if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };
    try {
        await HubCityService.close(parsed.data.hubCityId, admin.userId);
        // No revalidatePath here: it would re-render the page the admin is on, which is now an unopened city and redirects to its request sheet before the client navigates. The client pushes to the topic hub, which renders fresh.
        return { success: true };
    } catch (error: unknown) {
        return handleActionError(error);
    }
}
