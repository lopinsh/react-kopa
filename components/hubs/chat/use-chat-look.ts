'use client';

import { useCallback, useSyncExternalStore } from 'react';

/** Iestatījumi "Izskats" (K5-22): a device setting kept in localStorage, no DB. */
export interface ChatLook { compact: boolean; times: boolean }

const KEY = 'ejk.chat.look';
const EVENT = 'ejk-chat-look';
const DEFAULT: ChatLook = { compact: false, times: true };
let last: { raw: string | null; look: ChatLook } = { raw: null, look: DEFAULT };

function snapshot(): ChatLook {
    let raw: string | null = null;
    try { raw = localStorage.getItem(KEY); } catch { /* storage blocked: defaults */ }
    if (raw === last.raw) return last.look;
    let look = DEFAULT;
    try {
        const v: unknown = raw ? JSON.parse(raw) : null;
        if (typeof v === 'object' && v !== null) look = { compact: 'compact' in v && v.compact === true, times: !('times' in v) || v.times !== false };
    } catch { /* bad JSON: defaults */ }
    last = { raw, look };
    return look;
}

function subscribe(cb: () => void): () => void {
    window.addEventListener(EVENT, cb);
    window.addEventListener('storage', cb);
    return () => { window.removeEventListener(EVENT, cb); window.removeEventListener('storage', cb); };
}

export function useChatLook(): [ChatLook, (patch: Partial<ChatLook>) => void] {
    const look = useSyncExternalStore(subscribe, snapshot, () => DEFAULT);
    const set = useCallback((patch: Partial<ChatLook>) => {
        try { localStorage.setItem(KEY, JSON.stringify({ ...snapshot(), ...patch })); } catch { /* storage blocked */ }
        window.dispatchEvent(new Event(EVENT));
    }, []);
    return [look, set];
}
