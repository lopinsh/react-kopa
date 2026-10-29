'use server';

import { auth } from '@/lib/auth';
import { UserService } from '@/lib/services/user.service';
import { revalidateTag, revalidatePath } from 'next/cache';
import { profileSchema, privacySchema } from '@/lib/validations/user';
import type { ActionResponse } from '@/types/actions';
import { handleActionError } from '@/lib/action-utils';
import type { OwnCounts } from '@/lib/types/own-area';

export async function updateProfile(formData: unknown): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    const parsed = profileSchema.safeParse(formData);
    if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };

    const data = parsed.data;
    const userId = session.user.id;

    const citiesArray = data.cities
        ? data.cities.split(',').map(c => c.trim()).filter(Boolean)
        : [];

    try {
        await UserService.updateProfile(userId, {
            name: data.name,
            image: data.image || undefined,
            username: data.username || undefined,
            bio: data.bio || null,
            contact: data.contact === undefined ? undefined : data.contact.trim() || null,
            cities: citiesArray,
            avatarSeed: data.avatarSeed || undefined,
        });
        revalidateTag('groups', 'max');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'UPDATE_FAILED');
    }
}

/** One or more privacy switches from Iestatījumi. Never touches name, bio, places or picture. */
export async function updatePrivacy(input: unknown): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    const parsed = privacySchema.safeParse(input);
    if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };

    try {
        await UserService.updatePrivacy(session.user.id, parsed.data);
        revalidateTag('groups', 'max');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'UPDATE_FAILED');
    }
}

/** The numbers in the menus (own counts); the client asks on load, on focus and after anything that changes them. */
export async function getOwnCounts(): Promise<ActionResponse<OwnCounts>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        return { success: true, data: await UserService.getOwnCounts(session.user.id) };
    } catch (error) {
        console.error('[getOwnCounts] Error:', error);
        return { success: false, error: 'ACTION_FAILED' };
    }
}

/** Manas grupas has shown in the browser: its "new" count restarts. No revalidation: the page keeps what it showed. */
export async function markMyGroupsSeen(): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        await UserService.markMyGroupsSeen(session.user.id);
        return { success: true };
    } catch (error) {
        console.error('[markMyGroupsSeen] Error:', error);
        return { success: false, error: 'UPDATE_FAILED' };
    }
}
