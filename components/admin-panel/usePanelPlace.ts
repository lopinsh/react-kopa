'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { readPlace, writePlace, type PanelPlace } from './panel-storage';

/** Panel width in px (w-88); narrower viewports shrink it, see AdminPanel. */
export const PANEL_WIDTH = 352;
const MARGIN = 8;
const DOCK_EDGE = 40;
const BAR_GRAB = { x: 170, y: 20 };

const panelWidth = () => Math.min(PANEL_WIDTH, window.innerWidth - MARGIN * 2);

function clamp(x: number, y: number): { x: number; y: number } {
    const maxX = Math.max(MARGIN, window.innerWidth - panelWidth() - MARGIN);
    const maxY = Math.max(MARGIN, window.innerHeight - 48 - MARGIN);
    return { x: Math.min(Math.max(x, MARGIN), maxX), y: Math.min(Math.max(y, MARGIN), maxY) };
}

function initialPlace(): PanelPlace {
    const stored = readPlace();
    const base = stored ?? { x: window.innerWidth - PANEL_WIDTH - 24, y: 80, docked: false };
    return { ...base, ...clamp(base.x, base.y) };
}

/** Where the panel sits from 768 px: floating at x/y, or docked right. Drag by the top bar, release near the right edge to dock. */
export function usePanelPlace() {
    const [place, setPlace] = useState<PanelPlace>(initialPlace);
    const [dragging, setDragging] = useState(false);
    const [edgeHint, setEdgeHint] = useState(false);
    const grab = useRef<{ dx: number; dy: number } | null>(null);
    const latest = useRef(place);
    useEffect(() => {
        latest.current = place;
    }, [place]);

    useEffect(() => {
        const onResize = () => setPlace((p) => ({ ...p, ...clamp(p.x, p.y) }));
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const onPointerDown = useCallback((e: PointerEvent<HTMLElement>) => {
        if (e.button !== 0 || (e.target as HTMLElement).closest('button')) return;
        const p = latest.current;
        if (p.docked) {
            // Pull the docked panel loose: it hangs under the pointer.
            grab.current = { dx: BAR_GRAB.x, dy: BAR_GRAB.y };
            setPlace({ docked: false, ...clamp(e.clientX - BAR_GRAB.x, e.clientY - BAR_GRAB.y) });
        } else {
            const box = e.currentTarget.closest<HTMLElement>('[data-admin-panel]')?.getBoundingClientRect();
            grab.current = { dx: e.clientX - (box?.left ?? p.x), dy: e.clientY - (box?.top ?? p.y) };
        }
        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
            // The pointer is already gone (a very quick tap): the drag simply ends on the next event.
        }
        setDragging(true);
    }, []);

    const onPointerMove = useCallback((e: PointerEvent<HTMLElement>) => {
        const g = grab.current;
        if (!g) return;
        setPlace((p) => ({ ...p, ...clamp(e.clientX - g.dx, e.clientY - g.dy) }));
        setEdgeHint(e.clientX >= window.innerWidth - DOCK_EDGE);
    }, []);

    const onPointerEnd = useCallback((e: PointerEvent<HTMLElement>) => {
        if (!grab.current) return;
        grab.current = null;
        const dock = e.type === 'pointerup' && e.clientX >= window.innerWidth - DOCK_EDGE;
        const next = { ...latest.current, docked: dock };
        setPlace(next);
        writePlace(next);
        setDragging(false);
        setEdgeHint(false);
    }, []);

    const setDocked = useCallback((docked: boolean) => {
        const next = { ...latest.current, docked };
        setPlace(next);
        writePlace(next);
    }, []);

    return { place, dragging, edgeHint, setDocked, barProps: { onPointerDown, onPointerMove, onPointerUp: onPointerEnd, onPointerCancel: onPointerEnd } };
}
