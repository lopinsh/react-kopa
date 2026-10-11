'use client';

import { useEffect } from 'react';
import { useTimeZone } from 'next-intl';
import { useRouter } from 'next/navigation';
import { TIME_ZONE_COOKIE } from '@/lib/time-zone';

/**
 * Tells the server the browser's time zone (a first-party functional cookie, one year), so server-rendered
 * times already read in the viewer's zone. When the page was rendered with another zone (first visit, or the
 * viewer travelled) the cookie is updated and the page refreshed once; the client and server then agree,
 * so there is no hydration mismatch.
 */
export default function TimeZoneSync() {
    const renderedWith = useTimeZone();
    const router = useRouter();

    useEffect(() => {
        let browserZone: string | undefined;
        try {
            browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch {
            return;
        }
        if (!browserZone) return;
        const stored = document.cookie.split('; ').find((c) => c.startsWith(`${TIME_ZONE_COOKIE}=`))?.slice(TIME_ZONE_COOKIE.length + 1);
        if (stored !== encodeURIComponent(browserZone)) {
            document.cookie = `${TIME_ZONE_COOKIE}=${encodeURIComponent(browserZone)}; path=/; max-age=31536000; SameSite=Lax`;
        }
        if (renderedWith !== browserZone) router.refresh();
    }, [renderedWith, router]);

    return null;
}
