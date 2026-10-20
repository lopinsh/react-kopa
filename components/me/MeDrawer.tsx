'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/routing';
import { useMeContext } from '@/components/providers/MeProvider';
import Overlay from '@/components/ui/Overlay';
import { UI } from '@/lib/constants';
import MeMenu from './MeMenu';

type Props = { id: string; onClose: () => void; returnFocusRef: RefObject<HTMLButtonElement | null> };

/** The own area's drawer on phones: from the left (80 %), the page dimmed (AR-60). Esc, the scrim, Back or a link closes it. */
export default function MeDrawer({ id, onClose, returnFocusRef }: Props) {
    const t = useTranslations('profile.area');
    const { name, avatarSrc, line } = useMeContext();
    const pathname = usePathname();
    const openedOn = useRef(pathname);

    const closeRef = useRef(onClose);
    useEffect(() => {
        closeRef.current = onClose;
    });

    // Opening a page from the drawer ends it.
    useEffect(() => {
        if (pathname !== openedOn.current) closeRef.current();
    }, [pathname]);

    return (
        <Overlay layout="left" id={id} onClose={onClose} label={t('label')} dataUi={UI.drawer} flush panelClassName="px-2.5 py-3.5" returnFocusRef={returnFocusRef}>
            <div className="flex items-center gap-2.5 border-b border-border px-1 pb-3">
                <img src={avatarSrc} alt="" className="size-10 shrink-0 rounded-full object-cover" referrerPolicy="no-referrer" />
                <div className="min-w-0">
                    <p className="truncate text-item">{name}</p>
                    {line && <p className="truncate text-meta text-foreground-muted">{line}</p>}
                </div>
            </div>
            <MeMenu variant="drawer" />
        </Overlay>
    );
}
