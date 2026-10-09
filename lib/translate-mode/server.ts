import { cache } from 'react';
import { cookies } from 'next/headers';
import { auth } from '@/lib/auth';
import { TRANSLATE_COOKIE } from './marker';

/**
 * Translation mode is on only when the cookie is set AND the signed-in user is a site admin.
 * Anyone else who sets the cookie gets plain messages. Reads request data, so it is per request.
 */
export const isTranslateModeActive = cache(async (): Promise<boolean> => {
    const cookieStore = await cookies();
    if (cookieStore.get(TRANSLATE_COOKIE)?.value !== '1') return false;
    const session = await auth();
    return session?.user?.role === 'ADMIN';
});
