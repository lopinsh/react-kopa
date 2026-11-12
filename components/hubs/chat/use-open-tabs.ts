'use client';

import { useCallback, useEffect, useState } from 'react';

export const MAX_OPEN_TABS = 8;
const storageKey = (l2Id: string) => `ejk.chat.tabs.${l2Id}`;

function read(l2Id: string): string[] {
    try {
        const raw: unknown = JSON.parse(localStorage.getItem(storageKey(l2Id)) ?? '[]');
        return Array.isArray(raw) ? raw.filter((k): k is string => typeof k === 'string') : [];
    } catch {
        return [];
    }
}

/**
 * The rooms a person has open in this L2 community (K5-13): newest last, at most 8, the current room always among them. Kept in localStorage; a 9th drops the
 * oldest that is not the current one. Keys no longer in the family (a closed hub) fall away.
 */
export function useOpenTabs(l2Id: string, currentKey: string, known: readonly string[]) {
    const [keys, setKeys] = useState<string[]>([currentKey]);
    const knownKey = known.join('|');

    useEffect(() => {
        const valid = new Set(knownKey.split('|'));
        const next = [...read(l2Id).filter((k) => k !== currentKey && valid.has(k)), currentKey];
        while (next.length > MAX_OPEN_TABS) next.splice(next.findIndex((k) => k !== currentKey), 1);
        localStorage.setItem(storageKey(l2Id), JSON.stringify(next));
        // eslint-disable-next-line react-hooks/set-state-in-effect -- the list lives in localStorage, which only the browser can read
        setKeys(next);
    }, [l2Id, currentKey, knownKey]);

    const close = useCallback((key: string) => {
        if (key === currentKey) return;
        setKeys((prev) => {
            const next = prev.filter((k) => k !== key);
            localStorage.setItem(storageKey(l2Id), JSON.stringify(next));
            return next;
        });
    }, [l2Id, currentKey]);

    return { keys, close };
}
