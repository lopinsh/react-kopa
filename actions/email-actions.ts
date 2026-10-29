'use server';

import { UserService } from '@/lib/services/user.service';
import { unsubscribeLinkSchema } from '@/lib/validations/email';
import { verifyUnsubscribe } from '@/lib/email/unsubscribe-token';
import type { ActionResponse } from '@/types/actions';
import { handleActionError } from '@/lib/action-utils';

/** The button on the unsubscribe page (R33): the signed link is the credential, so no sign-in. A bad pair is `NOT_FOUND` whatever the cause. */
export async function unsubscribeByLink(input: unknown): Promise<ActionResponse> {
    const parsed = unsubscribeLinkSchema.safeParse(input);
    if (!parsed.success || !verifyUnsubscribe(parsed.data.u, parsed.data.s)) return { success: false, error: 'NOT_FOUND' };

    try {
        await UserService.updateEmailSettings(parsed.data.u, { emailNotifications: false });
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'UPDATE_FAILED');
    }
}
