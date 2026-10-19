'use client';

import { useCallback, useEffect, useState, type RefObject } from 'react';

/**
 * Which of the page's parts is being read: the last whose heading has passed the line under the sticky tabs (the tabs' own bottom edge,
 * measured, never a constant); at the bottom of the scrolling area the last part counts. The parts are looked up inside `root` (a hidden, cached copy of the page may share the ids). `initial` stands until the first scroll. `activate` sets it by hand (a clicked jump link).
 */
export function useScrollSpy(ids: string[], root: RefObject<HTMLElement | null>, tabs: RefObject<HTMLElement | null>, initial: string) {
    const [active, setActive] = useState(initial);
    const key = ids.join('|');

    useEffect(() => {
        const list = key ? key.split('|') : [];
        if (list.length < 2) return;
        // The app scrolls inside its own area, not the window: listen on the nearest scrolling ancestor.
        let area: HTMLElement | null = root.current;
        while (area && !/(auto|scroll)/.test(getComputedStyle(area).overflowY)) area = area.parentElement;
        const scroller: HTMLElement | Window = area ?? window;
        // A few rectangles per scroll event: cheap enough to run directly.
        const update = () => {
            const line = (tabs.current?.getBoundingClientRect().bottom ?? 0) + 12;
            const atEnd = area
                ? area.scrollTop > 0 && area.scrollTop + area.clientHeight >= area.scrollHeight - 2
                : window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
            let current = list[0];
            for (const id of list) {
                const el = root.current?.querySelector(`[id="part-${id}"]`);
                if (el && el.getBoundingClientRect().top <= line) current = id;
            }
            setActive(atEnd ? list[list.length - 1] : current);
        };
        scroller.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        return () => {
            scroller.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, [key, root, tabs]);

    const activate = useCallback((id: string) => setActive(id), []);
    return { active, activate };
}
