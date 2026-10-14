'use client';

import { useEffect, useRef, useState } from 'react';

const GAP = 6;

/**
 * How many of `count` chips fit on one line. The chips are measured in an invisible copy (`probe`: the chips in order,
 * then one "+N" chip), so the visible line never has to be measured while it changes. `pinned` chips always stay.
 * `signature` changes with the chips' labels (they must be measured again). `moreExists`: some things are never chips (so "+N" shows even when every chip fits). Measures when the line or the copy changes size.
 */
export function useChipFit(signature: string, count: number, pinned: number, moreExists: boolean) {
    const row = useRef<HTMLDivElement>(null);
    const probe = useRef<HTMLDivElement>(null);
    const [fit, setFit] = useState(count);

    useEffect(() => {
        const el = row.current;
        const copy = probe.current;
        if (!el || !copy) return;
        const measure = () => {
            const kids = Array.from(copy.children) as HTMLElement[];
            const widths = kids.slice(0, count).map((k) => k.offsetWidth);
            const moreWidth = (kids[count]?.offsetWidth ?? 0) + GAP;
            const avail = el.clientWidth;
            const all = widths.reduce((sum, w) => sum + w + GAP, -GAP);
            if (!moreExists && all <= avail) { setFit(count); return; }
            let used = 0;
            let n = 0;
            for (const w of widths) {
                const next = used + w + (n > 0 ? GAP : 0);
                if (next + moreWidth > avail && !(n === widths.length - 1 && !moreExists && next <= avail)) break;
                used = next;
                n++;
            }
            setFit(Math.max(n, pinned));
        };
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        // The copy changes size too when the fonts or styles arrive after the first measure.
        observer.observe(copy);
        return () => observer.disconnect();
    }, [signature, count, pinned, moreExists]);

    return { row, probe, fit: Math.min(fit, count) };
}
