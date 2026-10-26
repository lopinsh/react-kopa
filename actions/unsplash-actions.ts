'use server';

import { getLocale } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { handleActionError, validateActionData } from '@/lib/action-utils';
import { searchPhotos, trackDownload, type SearchResult } from '@/lib/services/unsplash.service';
import { unsplashPhotoIdSchema, unsplashSearchSchema } from '@/lib/validations/banner';
import type { ActionResponse } from '@/types/actions';

/** Banner search (R26): signed-in users only; the key, cache and request budget live in the service. */
export async function searchUnsplash(input: { query: string; page: number }): Promise<ActionResponse<SearchResult>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    const validation = await validateActionData(unsplashSearchSchema, input);
    if (!validation.success) return validation;

    try {
        return { success: true, data: await searchPhotos(validation.data, await getLocale(), session.user.id) };
    } catch (error) {
        return handleActionError(error, 'SEARCH_UNAVAILABLE');
    }
}

/** Unsplash's download ping for a picked photo (curated or searched). Succeeds whatever the ping does. */
export async function trackUnsplashPick(photoId: string): Promise<ActionResponse<void>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    const validation = await validateActionData(unsplashPhotoIdSchema, photoId);
    if (!validation.success) return validation;

    await trackDownload(validation.data, session.user.id);
    return { success: true };
}
