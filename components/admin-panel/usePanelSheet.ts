'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { SHEET_SIZES, readSheet, writeSheet, type SheetSize } from './panel-storage';

const BAR_HEIGHT = 100;
const NAV_HEIGHT = 64;

/** True below 768 px, where the panel is a bottom sheet instead of a floating drawer. */
export function useIsPhone(): boolean {
    const [phone, setPhone] = useState(() => window.matchMedia('(max-width: 47.99rem)').matches);
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 47.99rem)');
        const onChange = () => setPhone(mq.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);
    return phone;
}

const heightOf = (size: SheetSize): number =>
    size === 'bar' ? BAR_HEIGHT : size === 'half' ? Math.round(window.innerHeight * 0.5) : Math.round(window.innerHeight * 0.92 - NAV_HEIGHT);

const clampHeight = (px: number): number => Math.min(heightOf('full'), Math.max(BAR_HEIGHT, px));

function nearest(px: number): SheetSize {
    return SHEET_SIZES.reduce((best, s) => (Math.abs(heightOf(s) - px) < Math.abs(heightOf(best) - px) ? s : best), SHEET_SIZES[0]);
}

/** The phone sheet's height: bar, half or full; tap or arrows on the handle step it, a drag follows the finger and snaps on release. */
export function usePanelSheet() {
    const [size, setSize] = useState<SheetSize>(readSheet);
    const [drag, setDrag] = useState<number | null>(null);
    const start = useRef<{ y: number; h: number; moved: boolean } | null>(null);

    const commit = useCallback((next: SheetSize) => {
        setSize(next);
        writeSheet(next);
    }, []);

    const onPointerDown = useCallback((e: PointerEvent<HTMLElement>) => {
        if (e.button !== 0) return;
        start.current = { y: e.clientY, h: heightOf(size), moved: false };
        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
            // The pointer is already gone (a very quick tap): the drag simply ends on the next event.
        }
    }, [size]);

    const onPointerMove = useCallback((e: PointerEvent<HTMLElement>) => {
        const s = start.current;
        if (!s) return;
        if (Math.abs(e.clientY - s.y) > 4) s.moved = true;
        if (s.moved) setDrag(clampHeight(s.h + s.y - e.clientY));
    }, []);

    const onPointerEnd = useCallback((e: PointerEvent<HTMLElement>) => {
        const s = start.current;
        start.current = null;
        if (!s) return;
        if (s.moved) commit(nearest(clampHeight(s.h + s.y - e.clientY)));
        else if (e.type === 'pointerup') commit(size === 'bar' ? 'half' : 'bar');
        setDrag(null);
    }, [commit, size]);

    const onKeyDown = useCallback((e: KeyboardEvent<HTMLElement>) => {
        const i = SHEET_SIZES.indexOf(size);
        if (e.key === 'ArrowUp') commit(SHEET_SIZES[Math.min(i + 1, SHEET_SIZES.length - 1)]);
        else if (e.key === 'ArrowDown') commit(SHEET_SIZES[Math.max(i - 1, 0)]);
        else if (e.key === 'Enter' || e.key === ' ') commit(size === 'bar' ? 'half' : 'bar');
        else return;
        e.preventDefault();
    }, [commit, size]);

    return {
        size,
        height: drag ?? heightOf(size),
        dragging: drag !== null,
        handleProps: { onPointerDown, onPointerMove, onPointerUp: onPointerEnd, onPointerCancel: onPointerEnd, onKeyDown },
    };
}
