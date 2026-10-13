'use client';

import { useCallback, useEffect, useId, useRef } from 'react';

type Guard = { dirty: boolean; onBlocked: () => void };

type OverlayState = { ekOverlay?: string } | null;
const topKey = () => (window.history.state as OverlayState)?.ekOverlay;
// Pop-ups closed by the code in this task, whose entry is about to be taken off.
const closing = new Set<string>();

/**
 * After a refresh (a Server Action that revalidates, `router.refresh()`) Next.js rewrites the current entry's state
 * without unknown keys, which would orphan the open pop-up's entry. Keep the key while the URL stays the same;
 * a navigation with `replace` (new URL) drops it as before. Installed once, over Next.js's own wrapper.
 */
let keepsKey = false;
function keepKeyOnRefresh() {
    if (keepsKey) return;
    keepsKey = true;
    const replace = window.history.replaceState.bind(window.history);
    window.history.replaceState = (data: unknown, unused: string, url?: string | URL | null) => {
        const k = topKey();
        const sameUrl = url == null || new URL(url, window.location.href).href === window.location.href;
        if (k && sameUrl && data && typeof data === 'object' && !('ekOverlay' in data)) data = { ...data, ekOverlay: k };
        replace(data, unused, url);
    };
}

/**
 * AR-67: Back closes the top pop-up. While `open`, one extra history entry (same URL) sits on top; Back pops it.
 * `locked` keeps the pop-up open (Back pushes the entry again). `guard.dirty` does the same and calls `onBlocked`,
 * so the pop-up can ask before typed input is lost. Returns `requestClose(force?)` for ×, Esc and the scrim.
 */
export function useBackClose(open: boolean, onClose: () => void, locked = false, guard?: Guard): (force?: boolean) => void {
    const key = useId();
    const latest = useRef({ onClose, locked, guard });
    const forced = useRef(false);
    const alive = useRef(false);
    useEffect(() => {
        latest.current = { onClose, locked, guard };
    });

    useEffect(() => {
        if (!open) return;
        alive.current = true;
        keepKeyOnRefresh();
        // Development StrictMode mounts, cleans up and mounts again: the entry from the first mount is reused.
        // One pop-up handing over to the next in the same commit (a menu item opening a dialog): take over its entry.
        const top = topKey();
        if (top === key) closing.delete(key);
        else if (top && closing.delete(top)) window.history.replaceState({ ekOverlay: key }, '');
        else window.history.pushState({ ekOverlay: key }, '');
        const onPop = () => {
            if (topKey() === key) return;
            const { onClose: close, locked: isLocked, guard: g } = latest.current;
            if (isLocked || (g?.dirty && !forced.current)) {
                window.history.pushState({ ekOverlay: key }, '');
                if (!isLocked) g?.onBlocked();
                return;
            }
            close();
        };
        window.addEventListener('popstate', onPop);
        return () => {
            window.removeEventListener('popstate', onPop);
            alive.current = false;
            closing.add(key);
            // Closed by the code: take the entry off again, unless the pop-up came straight back (StrictMode), another
            // pop-up took the entry over, or a link navigated.
            queueMicrotask(() => {
                const handedOver = !closing.delete(key);
                if (!handedOver && !alive.current && topKey() === key) window.history.back();
            });
        };
    }, [open, key]);

    return useCallback((force = false) => {
        const { onClose: close, locked: isLocked, guard: g } = latest.current;
        if (isLocked) return;
        if (!force && g?.dirty) {
            g.onBlocked();
            return;
        }
        forced.current = force;
        if (topKey() === key) window.history.back();
        else close();
    }, [key]);
}
