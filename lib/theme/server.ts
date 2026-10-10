import { cache } from 'react';
import { cookies } from 'next/headers';
import { auth } from '@/lib/auth';
import { THEME_PREVIEW_COOKIE } from '@/lib/constants';
import { ThemeService, type ThemeContext } from '@/lib/services/theme.service';

/**
 * The theme for this request: the signed-in site admin's preview when they have one, otherwise the published theme.
 * Anyone else who sets the cookie gets the published theme. Reads request data, so it is per request.
 */
export const getActiveTheme = cache(async (): Promise<ThemeContext> => {
    const draftId = (await cookies()).get(THEME_PREVIEW_COOKIE)?.value;
    if (draftId) {
        const session = await auth();
        if (session?.user?.role === 'ADMIN') {
            const draft = await ThemeService.getDraft(draftId);
            if (draft) return draft;
        }
    }
    return ThemeService.getPublished();
});
