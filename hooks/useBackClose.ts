'use client';

import { useCallback, useEffect, useId, useRef } from 'react';

type Guard = { dirty: boolean; onBlocked: () => void };

type OverlayState = { ekOverlay?: string } | null;
const topKey = () => (window.history.state as OverlayState)?.ekOverlay;

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
        // Development StrictMode mounts, cleans up and mounts again: the entry from the first mount is reused.
        if (topKey() !== key) window.history.pushState({ ekOverlay: key }, '');
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
            // Closed by the code: take the entry off again, unless the pop-up came straight back (StrictMode) or a link navigated.
            queueMicrotask(() => {
                if (!alive.current && topKey() === key) window.history.back();
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
