'use client';

import { useEffect, useState } from 'react';

/** Space the sticky bars (header and the section menu) take at the top: a section counts as "in view" from under them. */
const BARS_PX = 112;

/**
 * Which of the page's sections (by element id, in page order) is being read: the last one whose top has passed under the sticky bars.
 * The first is active at the top of the page, so there is always one.
 */
export function useSectionInView(ids: string[]): string {
    const [active, setActive] = useState(ids[0] ?? '');
    const key = ids.join('|');

    useEffect(() => {
        const list = key ? key.split('|') : [];
        const update = () => {
            let current = list[0] ?? '';
            for (const id of list) {
                const el = document.getElementById(id);
                if (el && el.getBoundingClientRect().top <= BARS_PX + 8) current = id;
            }
            // At the very bottom the last section wins even when it is too short to reach the top.
            if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = list[list.length - 1] ?? current;
            setActive(current);
        };
        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, [key]);

    return active;
}
