'use server';
import { getLocale } from 'next-intl/server';
import { handleActionError, requireSiteAdmin } from '@/lib/action-utils';
import { activityQuerySchema } from '@/lib/validations/activity';
import { ActivityService, type ActivityPage } from '@/lib/services/activity.service';
import type { ActionResponse } from '@/types/actions';

/** One more page of the admin activity feed. Read only, so nothing to revalidate. */
export async function loadActivity(input: { type?: string; cursor?: string }): Promise<ActionResponse<ActivityPage>> {
    const admin = await requireSiteAdmin();
    if (!admin.success) return admin;
    const parsed = activityQuerySchema.safeParse(input);
    if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };
    try {
        const page = await ActivityService.getPage({ filter: parsed.data.type, cursor: parsed.data.cursor ?? null, locale: await getLocale() });
        return { success: true, data: page };
    } catch (error: unknown) {
        return handleActionError(error);
    }
}
