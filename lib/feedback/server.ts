import { cache } from 'react';
import { cookies } from 'next/headers';
import { auth } from '@/lib/auth';

export const FEEDBACK_COOKIE = 'feedback_mode';

/**
 * Feedback mode is on only when the cookie is set AND the signed-in user is a site admin.
 * Anyone else who sets the cookie gets the plain page. Reads request data, so it is per request.
 */
export const isFeedbackModeActive = cache(async (): Promise<boolean> => {
    const cookieStore = await cookies();
    if (cookieStore.get(FEEDBACK_COOKIE)?.value !== '1') return false;
    const session = await auth();
    return session?.user?.role === 'ADMIN';
});
