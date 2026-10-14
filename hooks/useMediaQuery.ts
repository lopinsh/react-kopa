'use client';

import { useCallback, useSyncExternalStore } from 'react';

/** True while the media query matches. False on the server and until hydration, so the phone layout is the first guess. */
export function useMediaQuery(query: string): boolean {
    const subscribe = useCallback((notify: () => void) => {
        const mq = window.matchMedia(query);
        mq.addEventListener('change', notify);
        return () => mq.removeEventListener('change', notify);
    }, [query]);
    return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}
