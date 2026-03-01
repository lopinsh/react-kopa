'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { usernameOnboardingSchema } from '@/lib/validations/onboarding';
import { UserService } from '@/lib/services/user.service';
import { revalidatePath } from 'next/cache';
import type { ActionResponse } from '@/types/actions';

/**
 * Lightweight read-only check for username availability.
 * Called by the UsernameForm debounce handler — NOT a mutation.
 * Returns { available: true } when the username is free to claim.
 */
export async function checkUsernameAvailability(
    username: string,
): Promise<{ available: boolean }> {
    // Reject obviously invalid formats before hitting the DB.
    const parsed = usernameOnboardingSchema.safeParse({ username });
    if (!parsed.success) return { available: false };

    const existing = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
    });

    return { available: existing === null };
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

    const result = await UserService.updateProfile(session.user.id, {
        username: parsed.data.username,
    });

    if (!result.success) return { success: false, error: result.error };

    revalidatePath('/', 'layout');
    return { success: true };
}
