'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu } from 'lucide-react';
import { usePathname } from '@/i18n/routing';
import { UI } from '@/lib/constants';
import { useHubContext } from '@/components/providers/HubProvider';
import Overlay from '@/components/ui/Overlay';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { IconButton } from '@/components/ui/Button';
import HubPagesNav from './HubPagesNav';

/** ☰ in the phone bar or the head tile (`onTone`): opens the hub pages from the left over the page (as the group page does, AR-48). */
export default function HubPagesDrawer({ onTone = false }: { onTone?: boolean }) {
    const t = useTranslations('hub.frame');
    const hub = useHubContext();
    const [open, setOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const id = useId();
    const pathname = usePathname();
    const openedOn = useRef(pathname);

    // Opening a page from the drawer ends it.
    useEffect(() => {
        if (open && pathname !== openedOn.current) setOpen(false);
    }, [pathname, open]);

    return (
        <>
            <IconButton
                ref={buttonRef}
                variant={onTone ? 'onToneGhost' : 'ghost'}
                aria-label={t('pagesLabel')}
                aria-expanded={open}
                aria-controls={id}
                onClick={() => { openedOn.current = pathname; setOpen(true); }}
                className="lg:hidden"
            >
                <Menu aria-hidden className="size-5" />
            </IconButton>
            {open && (
                <Overlay layout="left" id={id} onClose={() => setOpen(false)} label={t('pagesLabel')} dataUi={UI.drawer} flush panelClassName="px-3 py-4" returnFocusRef={buttonRef}>
                    <div className="flex items-center gap-3 border-b border-border px-1 pb-3">
                        <span className="mark-tint grid size-9 shrink-0 place-items-center rounded-item">
                            <CategoryIcon slug={hub.l1Slug} aria-hidden className="size-5" />
                        </span>
                        <p className="min-w-0 truncate text-item">{hub.name}</p>
                    </div>
                    <HubPagesNav variant="drawer" />
                </Overlay>
            )}
        </>
    );
}
