'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import { clsx } from 'clsx';
import { usePathname } from '@/i18n/routing';
import HeaderSearchField from './HeaderSearchField';
import { ICON_BUTTON } from './header-styles';

/** Phone search icon: opens a one-line search row under the header (interim until R7's full-screen search). */
export default function PhoneSearchToggle() {
    const t = useTranslations('shell.header');
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [openedOn, setOpenedOn] = useState(pathname);
    const id = useId();
    const iconRef = useRef<HTMLButtonElement>(null);

    // A pathname change closes the row (state adjusted while rendering, not in an effect).
    if (open && openedOn !== pathname) setOpen(false);

    const close = () => {
        setOpen(false);
        iconRef.current?.focus();
    };

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    return (
        <>
            <button
                ref={iconRef}
                type="button"
                aria-label={t('search')}
                aria-expanded={open}
                aria-controls={id}
                onClick={() => {
                    setOpenedOn(pathname);
                    setOpen((v) => !v);
                }}
                className={clsx(ICON_BUTTON, 'md:hidden', open && 'bg-tint')}
            >
                <Search aria-hidden />
            </button>
            {open && (
                <div id={id} className="fixed inset-x-0 top-[var(--header-height)] z-40 flex items-center gap-1 border-b border-border bg-surface p-2 md:hidden">
                    <HeaderSearchField autoFocus className="flex flex-1" onSubmit={close} />
                    <button type="button" aria-label={t('closeSearch')} onClick={close} className={ICON_BUTTON}>
                        <X aria-hidden />
                    </button>
                </div>
            )}
        </>
    );
}
