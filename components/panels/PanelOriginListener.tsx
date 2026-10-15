'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { canGrow, growFrom, isBusy } from '@/lib/panel-origin';

/**
 * R6b: a plain click on a link marked `data-opens-panel` inside a card marked `data-panel-origin` opens its panel with a grow out of the card.
 * Anything else (modified clicks, phones, reduced motion, no View Transitions, links inside a dialog) is left to Next's `Link`.
 * Links that replace the history entry (the search's results) are never marked: the grow always pushes.
 */
export default function PanelOriginListener() {
    const router = useRouter();

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || !(e.target instanceof Element)) return;
            const link = e.target.closest<HTMLAnchorElement>('a[data-opens-panel]');
            const card = link?.closest<HTMLElement>('[data-panel-origin]');
            if (!link || !card || link.target === '_blank' || link.closest('[aria-modal="true"]') || !canGrow()) return;
            e.preventDefault();
            if (isBusy()) return;
            growFrom(link, card, () => router.push(link.getAttribute('href') ?? link.href, { scroll: false }));
        };
        document.addEventListener('click', onClick, true);
        return () => document.removeEventListener('click', onClick, true);
    }, [router]);

    return null;
}
