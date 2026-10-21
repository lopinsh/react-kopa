'use server';

import { auth } from '@/lib/auth';
import { usernameOnboardingSchema } from '@/lib/validations/onboarding';
import { UserService } from '@/lib/services/user.service';
import { revalidatePath, revalidateTag } from 'next/cache';
import type { ActionResponse } from '@/types/actions';
import { handleActionError } from '@/lib/action-utils';

/**
 * Lightweight read-only check for username availability.
 * Called by the debounced username fields (registration, onboarding) — NOT a mutation.
 * When the username is taken, `suggestion` is the first free numbered variant.
 */
export async function checkUsernameAvailability(
    username: string,
): Promise<ActionResponse<{ available: boolean; suggestion?: string }>> {
    // Reject obviously invalid formats before hitting the DB.
    const parsed = usernameOnboardingSchema.safeParse({ username });
    if (!parsed.success) return { success: true, data: { available: false } };

    try {
        if (await UserService.checkUsernameAvailability(parsed.data.username)) {
            return { success: true, data: { available: true } };
        }
        return {
            success: true,
            data: { available: false, suggestion: await UserService.suggestAvailableUsername(parsed.data.username) },
        };
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}

/**
 * Dedicated onboarding action — saves ONLY the username.
 * Uses usernameOnboardingSchema (required) instead of the full profileSchema
 * (which requires name and other fields not present on the onboarding page).
 */
export async function setUsername(username: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    const parsed = usernameOnboardingSchema.safeParse({ username });
    if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };

    try {
        await UserService.updateProfile(session.user.id, {
            username: parsed.data.username,
        });
        revalidateTag('groups', 'max');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'UPDATE_FAILED');
    }
}
