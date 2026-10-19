'use client';

import { useCallback, useEffect, useState, type RefObject } from 'react';

/**
 * Which of the page's parts is being read: the last whose heading has passed the line under the sticky tabs (the tabs' own bottom edge,
 * measured, never a constant); at the page bottom the last part counts. `initial` stands until the first scroll. `activate` sets it by hand (a clicked jump link).
 */
export function useScrollSpy(ids: string[], tabs: RefObject<HTMLElement | null>, initial: string) {
    const [active, setActive] = useState(initial);
    const key = ids.join('|');

    useEffect(() => {
        const list = key ? key.split('|') : [];
        if (list.length < 2) return;
        let frame = 0;
        const update = () => {
            frame = 0;
            const line = (tabs.current?.getBoundingClientRect().bottom ?? 0) + 12;
            const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
            let current = list[0];
            for (const id of list) {
                const el = document.getElementById(`part-${id}`);
                if (el && el.getBoundingClientRect().top <= line) current = id;
            }
            setActive(atEnd && window.scrollY > 0 ? list[list.length - 1] : current);
        };
        const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        return () => {
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', schedule);
            if (frame) cancelAnimationFrame(frame);
        };
    }, [key, tabs]);

    const activate = useCallback((id: string) => setActive(id), []);
    return { active, activate };
}
