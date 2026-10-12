'use client';

import { useRef, useState, type ReactNode } from 'react';
import { usePathname, Link } from '@/i18n/routing';
import MessagesDrawer from './MessagesDrawer';

type Props = {
    className: string;
    label: string;
    children: ReactNode;
    title?: string;
};

/**
 * The messages entry of the header and the phone bar: opens the drawer for quick replies.
 * On /messages itself it is a plain link, so the full view and the drawer never run side by side.
 */
export default function MessagesDrawerButton({ className, label, children, title }: Props) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    if (pathname.startsWith('/messages')) {
        return (
            <Link href="/messages" className={className} aria-label={label} title={title} aria-current="page">
                {children}
            </Link>
        );
    }

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                className={className}
                aria-label={label}
                title={title}
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={() => setOpen(true)}
            >
                {children}
            </button>
            {open && <MessagesDrawer onClose={() => setOpen(false)} returnFocusRef={buttonRef} />}
        </>
    );
}
