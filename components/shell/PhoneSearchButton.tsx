'use client';

import { useId, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { clsx } from 'clsx';
import { usePathname } from '@/i18n/routing';
import SearchOverlay from '@/components/search/SearchOverlay';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ICON_BUTTON } from './header-styles';

/** The phone header's search icon (AR-13, OD-20): opens the search full screen. It closes when the address changes or the window grows to `md` (the desktop field takes over). */
export default function PhoneSearchButton() {
    const t = useTranslations('shell.header');
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const url = `${pathname}?${searchParams}`;
    const [open, setOpen] = useState(false);
    const [openedOn, setOpenedOn] = useState(url);
    const wide = useMediaQuery('(min-width: 768px)');
    const id = useId();

    // State adjusted while rendering, not in an effect.
    if (open && (openedOn !== url || wide)) setOpen(false);

    return (
        <>
            <button
                type="button"
                aria-label={t('search')}
                aria-expanded={open}
                aria-controls={open ? id : undefined}
                aria-haspopup="dialog"
                onClick={() => { setOpenedOn(url); setOpen(true); }}
                className={clsx(ICON_BUTTON, 'md:hidden', open && 'bg-tint')}
            >
                <Search aria-hidden />
            </button>
            {open && <SearchOverlay id={id} onClose={() => setOpen(false)} />}
        </>
    );
}
