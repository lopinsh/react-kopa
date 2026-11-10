'use client';

import { useEffect, useState } from 'react';

/**
 * The section being read (AF-24): the last id whose top is above one third of the viewport (or of `root`), recomputed on scroll
 * (captured, so a scrolling shell counts; passive, one frame at a time) and resize. `doc` is the iframe's document for a drawing.
 */
export default function useActiveSection(ids: string[], doc?: Document | null, root?: Element | null): string | null {
    const [current, setCurrent] = useState<string | null>(null);
    const key = ids.join('|');
    useEffect(() => {
        const d = doc ?? document;
        const win = d.defaultView;
        const list = key ? key.split('|') : [];
        if (!win || list.length === 0) return;
        let frame = 0;
        const compute = () => {
            frame = 0;
            const box = root?.getBoundingClientRect();
            const top = box ? box.top : 0;
            const limit = top + (box ? box.height : win.innerHeight) / 3;
            let found: string | null = list[0];
            for (const id of list) {
                const el = d.getElementById(id);
                if (el && el.getBoundingClientRect().top <= limit) found = id;
            }
            setCurrent(found);
        };
        const schedule = () => {
            if (!frame) frame = win.requestAnimationFrame(compute);
        };
        compute();
        d.addEventListener('scroll', schedule, { capture: true, passive: true });
        win.addEventListener('resize', schedule);
        return () => {
            if (frame) win.cancelAnimationFrame(frame);
            d.removeEventListener('scroll', schedule, { capture: true });
            win.removeEventListener('resize', schedule);
        };
    }, [key, doc, root]);
    return key ? current : null;
}
