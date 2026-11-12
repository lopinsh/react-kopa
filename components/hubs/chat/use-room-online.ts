'use client';

import { useEffect, useState } from 'react';
import { roomOnline } from '@/actions/chat-actions';
import type { HubKey } from '@/lib/services/chat-access.service';
import type { OnlineList } from '@/lib/services/chat-people.service';

const REFRESH_MS = 60_000;

/** Who is online now in this room (K5-18): asked on open and every 60 s while the tab is visible. Nothing is kept; a failed read leaves the last list. */
export function useRoomOnline(hubKey: HubKey, enabled: boolean): OnlineList | null {
    const [state, setState] = useState<{ key: string; list: OnlineList } | null>(null);
    const slug = hubKey.hubSlug;
    const city = hubKey.city;
    const key = `${slug}/${city ?? ''}`;
    useEffect(() => {
        if (!enabled) return;
        let gone = false;
        const load = () => {
            void roomOnline({ hubKey: city ? { hubSlug: slug, city } : { hubSlug: slug } }).then((res) => {
                if (!gone && res.success && res.data) setState({ key, list: res.data });
            });
        };
        load();
        const id = window.setInterval(() => { if (document.visibilityState === 'visible') load(); }, REFRESH_MS);
        return () => { gone = true; window.clearInterval(id); };
    }, [slug, city, key, enabled]);
    // A list that belongs to the room left behind is not shown for the new one.
    return state?.key === key ? state.list : null;
}
