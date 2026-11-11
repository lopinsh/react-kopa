'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { clsx } from 'clsx';
import { UI } from '@/lib/constants';

/**
 * Below 1024: once the head tile has scrolled away, a thin bar sticks under the header with the ☰ pages button (`drawer`) and the hub name.
 * The wrapper has no height (the bar hangs from it), so showing or hiding it never moves the page.
 */
export default function PagesStickyBar({ name, drawer }: { name: string; drawer: ReactNode }) {
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const banner = document.querySelector(`[data-ui="${UI.hubBanner}"]`);
        if (!banner) return;
        const headerH = document.querySelector<HTMLElement>(`[data-ui="${UI.header}"]`)?.offsetHeight ?? 0;
        // The page scrolls in a container, not the window: scroll events do not bubble, so listen in the capture phase.
        const update = () => setShown(banner.getBoundingClientRect().bottom <= headerH);
        update();
        document.addEventListener('scroll', update, { capture: true, passive: true });
        window.addEventListener('resize', update);
        return () => {
            document.removeEventListener('scroll', update, { capture: true });
            window.removeEventListener('resize', update);
        };
    }, []);

    return (
        <div className="sticky top-0 z-20 h-0 lg:hidden">
            <div
                data-ui={UI.hubStickyBar}
                aria-hidden={!shown}
                inert={!shown}
                className={clsx('flex h-10 items-center gap-2 border-b border-border bg-surface px-2 transition-opacity duration-quick', shown ? 'opacity-100' : 'pointer-events-none opacity-0')}
            >
                {drawer}
                <p className="min-w-0 truncate text-item">{name}</p>
            </div>
        </div>
    );
}
