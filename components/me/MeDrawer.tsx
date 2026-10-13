'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/routing';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useMeContext } from '@/components/providers/MeProvider';
import MeMenu from './MeMenu';

type Props = { id: string; onClose: () => void; returnFocusRef: RefObject<HTMLButtonElement | null> };

/** The own area's drawer on phones: from the left (80 %), the page dimmed (AR-60). Esc, the scrim or a link closes it. */
export default function MeDrawer({ id, onClose, returnFocusRef }: Props) {
    const t = useTranslations('profile.area');
    const { name, avatarSrc, line } = useMeContext();
    const pathname = usePathname();
    const openedOn = useRef(pathname);
    const panelRef = useFocusTrap<HTMLDivElement>(true);

    const closeRef = useRef(onClose);
    useEffect(() => {
        closeRef.current = onClose;
    });

    // Opening a page from the drawer ends it.
    useEffect(() => {
        if (pathname !== openedOn.current) closeRef.current();
    }, [pathname]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeRef.current();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    // The ☰ button gets focus back however the drawer closes.
    useEffect(() => {
        const button = returnFocusRef.current;
        return () => button?.focus();
    }, [returnFocusRef]);

    return (
        <>
            <div aria-hidden onClick={onClose} className="fixed inset-0 z-50 bg-black/40 motion-safe:animate-in motion-safe:fade-in" />
            <div
                id={id}
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={t('label')}
                tabIndex={-1}
                className="fixed inset-y-0 left-0 z-50 w-4/5 max-w-[320px] bg-surface px-2.5 py-3.5 shadow-premium motion-safe:animate-in motion-safe:slide-in-from-left"
            >
                <div className="flex items-center gap-2.5 border-b border-border px-1 pb-3">
                    <img src={avatarSrc} alt="" className="size-10 shrink-0 rounded-full object-cover" referrerPolicy="no-referrer" />
                    <div className="min-w-0">
                        <p className="truncate font-heading text-[16px] font-semibold leading-tight">{name}</p>
                        {line && <p className="truncate text-xs text-foreground-muted">{line}</p>}
                    </div>
                </div>
                <MeMenu variant="drawer" />
            </div>
        </>
    );
}
