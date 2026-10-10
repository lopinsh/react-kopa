'use client';

import { useEffect, useState } from 'react';

export type PickRect = { left: number; top: number; width: number; height: number };

function pickable(target: EventTarget | null): Element | null {
    if (!(target instanceof Element)) return null;
    return target.closest('[data-feedback-ignore]') ? null : target;
}

/**
 * While `enabled`, reports the element under the pointer (for the highlight) and turns a click on a page
 * element into `onPick` instead of its normal action. Controls of feedback mode itself carry
 * `data-feedback-ignore` and work as usual. The listeners sit in the capture phase so links and buttons
 * underneath never see the click.
 */
export function useElementPicker(enabled: boolean, onPick: (el: Element) => void): PickRect | null {
    const [rect, setRect] = useState<PickRect | null>(null);

    useEffect(() => {
        if (!enabled) return;

        const onMove = (e: MouseEvent) => {
            const el = pickable(e.target);
            if (!el) { setRect(null); return; }
            const r = el.getBoundingClientRect();
            setRect({ left: r.left, top: r.top, width: r.width, height: r.height });
        };
        const swallow = (e: Event) => {
            if (!pickable(e.target)) return;
            e.preventDefault();
            e.stopPropagation();
        };
        const onClick = (e: MouseEvent) => {
            const el = pickable(e.target);
            if (!el) return;
            e.preventDefault();
            e.stopPropagation();
            onPick(el);
        };

        document.addEventListener('mousemove', onMove, true);
        document.addEventListener('pointerdown', swallow, true);
        document.addEventListener('mousedown', swallow, true);
        document.addEventListener('click', onClick, true);
        return () => {
            document.removeEventListener('mousemove', onMove, true);
            document.removeEventListener('pointerdown', swallow, true);
            document.removeEventListener('mousedown', swallow, true);
            document.removeEventListener('click', onClick, true);
        };
    }, [enabled, onPick]);

    return enabled ? rect : null;
}
