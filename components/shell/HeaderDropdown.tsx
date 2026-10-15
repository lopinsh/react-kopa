'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { clsx } from 'clsx';
import { usePathname } from '@/i18n/routing';
import { useClickOutside } from '@/hooks/useClickOutside';
import { UI } from '@/lib/constants';
import { ICON_BUTTON } from './header-styles';

type Api = { headingId: string; close: () => void };

/**
 * The shell of the header's small lists (messages, the bell): an icon button and, under it, a 360 px panel (cmv9ahbt5). A disclosure, not a
 * menu: it holds tabs and rows. It opens only on a click, Enter or Space (never on hover or on its own) and closes on Esc (focus back to the
 * icon), a click outside, a link inside, or any page change. The content mounts only while open, so a closed list costs nothing.
 */
export default function HeaderDropdown({ label, icon, active = false, children }: {
    label: string;
    icon: ReactNode;
    active?: boolean;
    children: (api: Api) => ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const [openedOn, setOpenedOn] = useState(pathname);
    const rootRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const panelId = useId();
    const headingId = useId();

    // Another page ends the list, whichever way the person got there.
    if (openedOn !== pathname) {
        setOpenedOn(pathname);
        setOpen(false);
    }

    useClickOutside(rootRef, () => setOpen(false), open);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            setOpen(false);
            buttonRef.current?.focus();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    return (
        <div ref={rootRef} className="relative shrink-0">
            <button
                ref={buttonRef}
                type="button"
                aria-label={label}
                title={label}
                aria-haspopup="true"
                aria-expanded={open}
                aria-controls={open ? panelId : undefined}
                onClick={() => setOpen((o) => !o)}
                className={clsx(ICON_BUTTON, (open || active) && 'bg-tint')}
            >
                {icon}
            </button>
            {open && (
                <div
                    id={panelId}
                    role="group"
                    aria-labelledby={headingId}
                    data-ui={UI.headerDropdown}
                    onClick={(e) => { if (e.target instanceof Element && e.target.closest('a')) setOpen(false); }}
                    className="absolute right-0 top-full z-50 mt-2 w-[360px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[14px] border border-border bg-surface shadow-premium motion-safe:animate-fade"
                >
                    {children({ headingId, close: () => setOpen(false) })}
                </div>
            )}
        </div>
    );
}
