'use server';

import { auth } from '@/lib/auth';
import { UserService } from '@/lib/services/user.service';
import { revalidateTag, revalidatePath } from 'next/cache';
import { profileSchema } from '@/lib/validations/user';
import type { ActionResponse } from '@/types/actions';

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

    const result = await UserService.updateProfile(userId, {
        name: data.name,
        image: data.image || undefined,
        username: data.username || undefined,
        bio: data.bio || undefined,
        cities: citiesArray,
        avatarSeed: data.avatarSeed || undefined,
    });

    if (!result.success) return { success: false, error: result.error };

    revalidateTag('groups', 'max' as any);
    revalidatePath('/', 'layout');
    return { success: true };
}
