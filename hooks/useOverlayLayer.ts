'use client';

import { useCallback, useEffect, useId } from 'react';

// Open layers, topmost last: Esc only closes the top one; page scroll stays locked until the last one is gone.
const stack: string[] = [];

/**
 * The one place for the pop-up stack (R7): while `active` this layer is registered and the page behind it cannot scroll.
 * Returns `isTop()`, so an Esc handler closes only the topmost layer. `Overlay` uses it, and so does the desktop search
 * (which is not a portal), so a sheet opened from the search closes first and the scroll lock is counted once.
 */
export function useOverlayLayer(active: boolean): () => boolean {
    const id = useId();

    useEffect(() => {
        if (!active) return;
        const main = document.getElementById('main-content');
        stack.push(id);
        main?.classList.add('overflow-hidden');
        document.body.style.overflow = 'hidden';
        return () => {
            stack.splice(stack.indexOf(id), 1);
            if (stack.length === 0) {
                main?.classList.remove('overflow-hidden');
                document.body.style.overflow = '';
            }
        };
    }, [active, id]);

    return useCallback(() => stack[stack.length - 1] === id, [id]);
}
