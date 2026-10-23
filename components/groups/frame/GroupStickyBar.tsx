'use client';

import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { UI } from '@/lib/constants';
import { useGroupContext } from '@/components/providers/GroupProvider';
import GroupPagesDrawer from './GroupPagesDrawer';

/**
 * Phones: once the banner has scrolled away, a thin bar sticks under the header with the ☰ pages button and the group's name.
 * The wrapper has no height (the bar hangs from it), so showing or hiding it never moves the page. Hidden from `md`, where the pages column stays in view.
 */
export default function GroupStickyBar() {
    const g = useGroupContext();
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const banner = document.querySelector(`[data-ui="${UI.groupBanner}"]`);
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
        <div className="sticky top-0 z-20 h-0 md:hidden">
            <div
                data-ui={UI.groupStickyBar}
                aria-hidden={!shown}
                inert={!shown}
                className={clsx('flex h-10 items-center gap-2 border-b border-border bg-surface px-2 transition-opacity duration-quick', shown ? 'opacity-100' : 'pointer-events-none opacity-0')}
            >
                <GroupPagesDrawer />
                <p className="min-w-0 truncate text-item">{g.name}</p>
            </div>
        </div>
    );
}
