'use client';

import { useEffect, useState, type RefObject } from 'react';

/** The nearest ancestor that scrolls (the app shell scrolls its content area, not the window). */
function scrollerOf(el: HTMLElement | null): HTMLElement {
    for (let e = el?.parentElement ?? null; e; e = e.parentElement) {
        const y = getComputedStyle(e).overflowY;
        if ((y === 'auto' || y === 'scroll') && e.scrollHeight > e.clientHeight) return e;
    }
    return document.scrollingElement as HTMLElement;
}

/**
 * Which of the page's sections (by element id, in page order) is being read: the last one whose top has passed under `lineRef`
 * (the sticky section menu). The first is active at the top of the page, so there is always one.
 */
export function useSectionInView(ids: string[], lineRef: RefObject<HTMLElement | null>): string {
    const [active, setActive] = useState(ids[0] ?? '');
    const key = ids.join('|');

    useEffect(() => {
        const list = key ? key.split('|') : [];
        const scroller = scrollerOf(lineRef.current);
        const update = () => {
            const line = lineRef.current?.getBoundingClientRect().bottom ?? 0;
            let current = list[0] ?? '';
            for (const id of list) {
                const el = document.getElementById(id);
                if (el && el.getBoundingClientRect().top <= line + 8) current = id;
            }
            // At the very bottom the last section wins even when it is too short to reach the top.
            if (scroller.scrollTop > 0 && scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2) current = list[list.length - 1] ?? current;
            setActive(current);
        };
        update();
        // Scroll events do not bubble: listen in the capture phase, whichever element scrolls.
        document.addEventListener('scroll', update, { capture: true, passive: true });
        window.addEventListener('resize', update);
        return () => {
            document.removeEventListener('scroll', update, { capture: true });
            window.removeEventListener('resize', update);
        };
    }, [key, lineRef]);

    return active;
}
