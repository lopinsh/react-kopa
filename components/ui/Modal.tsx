'use client';

import { useEffect, useId, useState, useSyncExternalStore, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { UI } from '@/lib/constants';

type Props = {
    onClose: () => void;
    /** Heading text; it labels the dialog (`aria-labelledby`). */
    title: ReactNode;
    titleClassName?: string;
    /** Sits next to the heading, e.g. an icon tile. */
    icon?: ReactNode;
    /** Small text under the heading. */
    subtitle?: ReactNode;
    /** `card`: rounded, bordered, accent line on top. `plain`: the simple flat pop-up. */
    variant?: 'plain' | 'card';
    /** `right`: a drawer from the right edge, full height (full width on phones). */
    placement?: 'center' | 'right';
    size?: 'sm' | 'md' | 'lg' | '2xl' | '4xl';
    /** Thin accent-coloured line along the top edge (card variant). */
    accentLine?: boolean;
    headerClassName?: string;
    /** Panel without padding and a ruled header, for lists that scroll inside. */
    flush?: boolean;
    /** `alertdialog` for confirmations that need an answer. */
    role?: 'dialog' | 'alertdialog';
    /** id of an element inside that describes the dialog. */
    describedBy?: string;
    /** While something is saving: Escape and the close button do nothing. */
    locked?: boolean;
    hideClose?: boolean;
    closeOnBackdrop?: boolean;
    /** Marks the pop-up as not translatable in translate mode. */
    translateIgnore?: boolean;
    zIndexClassName?: string;
    panelClassName?: string;
    /**
     * Where focus goes on close when the element that opened the pop-up is gone (e.g. a menu item of a
     * menu that closed on click): pass the menu's trigger button. Without it, focus goes to the opener,
     * else to the page's main region.
     */
    returnFocusRef?: RefObject<HTMLElement | null>;
    children: ReactNode;
};

const SIZE = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', '2xl': 'max-w-2xl', '4xl': 'max-w-4xl' } as const;

// Open modals, topmost last: Escape only closes the top one; scroll stays locked until the last one closes.
const openModals: string[] = [];

/** Focus goes back to the given trigger, else the opener, else the main region, never to <body>. */
function restoreFocus(trigger: HTMLElement | null | undefined, opener: HTMLElement | null) {
    const target = [trigger, opener].find((el): el is HTMLElement => !!el && el.isConnected && el !== document.body);
    if (target) {
        target.focus();
        return;
    }
    const main = document.querySelector<HTMLElement>('main');
    if (main) {
        if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
        main.focus({ preventScroll: true });
    }
}

/**
 * The one pop-up shell: backdrop, close button, Escape, scroll lock, focus trap and focus return.
 * Render it only while it should be open (mount = open); content goes in `children`.
 */
export default function Modal({
    onClose, title, titleClassName, icon, subtitle, variant = 'plain', placement = 'center', size = 'md', flush = false, accentLine = false, headerClassName,
    role = 'dialog', describedBy, locked = false, hideClose = false, closeOnBackdrop = false,
    translateIgnore = false, zIndexClassName = 'z-50', panelClassName, returnFocusRef, children,
}: Props) {
    const tCommon = useTranslations('common');
    const titleId = useId();
    const mounted = useSyncExternalStore(() => () => { }, () => true, () => false);
    const panelRef = useFocusTrap<HTMLDivElement>(mounted);
    // The element that opened the modal, read while rendering so a field with autoFocus cannot replace it.
    const [opener] = useState<HTMLElement | null>(() =>
        typeof document !== 'undefined' && document.activeElement instanceof HTMLElement ? document.activeElement : null
    );
    const id = titleId;

    useEffect(() => {
        openModals.push(id);
        document.body.style.overflow = 'hidden';
        return () => {
            openModals.splice(openModals.indexOf(id), 1);
            if (openModals.length === 0) document.body.style.overflow = '';
            // eslint-disable-next-line react-hooks/exhaustive-deps -- the ref is wanted as it is at close time
            restoreFocus(returnFocusRef?.current, opener);
        };
    }, [id, opener, returnFocusRef]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape' || locked || openModals[openModals.length - 1] !== id) return;
            onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [id, locked, onClose]);

    if (!mounted) return null;

    const card = variant === 'card';
    const drawer = placement === 'right';
    const heading = (
        <div className="min-w-0">
            <h2 id={titleId} className={clsx(titleClassName ?? (card ? 'text-xl font-black tracking-tight text-foreground sm:text-2xl' : 'text-xl font-bold text-foreground'))}>{title}</h2>
            {subtitle}
        </div>
    );

    return createPortal(
        <div
            {...(translateIgnore ? { 'data-translate-ignore': true } : {})}
            className={clsx(
                'fixed inset-0 flex animate-in fade-in duration-200',
                drawer ? 'items-stretch justify-end' : 'items-center justify-center overflow-y-auto p-4',
                card ? 'bg-black/60 backdrop-blur-md' : 'bg-black/50 backdrop-blur-sm',
                zIndexClassName
            )}
            onMouseDown={closeOnBackdrop ? (e) => { if (e.target === e.currentTarget && !locked) onClose(); } : undefined}
        >
            <div
                ref={panelRef}
                role={role}
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={describedBy}
                tabIndex={-1}
                data-ui={role === 'alertdialog' ? UI.confirmDialog : UI.modal}
                className={clsx(
                    'relative w-full bg-surface shadow-2xl outline-none animate-in duration-200',
                    SIZE[size],
                    drawer
                        ? 'flex h-full flex-col overflow-hidden border-l border-border'
                        : card ? 'zoom-in-95 overflow-hidden rounded-[2rem] border border-border/50' : 'zoom-in-95 rounded-3xl',
                    !flush && (card ? 'p-6 sm:p-8' : 'p-6'),
                    panelClassName
                )}
            >
                {accentLine && <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50" />}
                <div className={clsx('flex shrink-0 items-center justify-between gap-4', headerClassName ?? (flush ? 'border-b border-border p-6' : card ? 'mb-6' : 'mb-4'))}>
                    <div className="flex min-w-0 items-center gap-3">
                        {icon}
                        {heading}
                    </div>
                    {!hideClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={locked}
                            aria-label={tCommon('close')}
                            className={clsx('shrink-0 p-2 text-foreground-muted transition-all hover:bg-surface-elevated disabled:opacity-50', card ? 'rounded-xl hover:text-foreground' : 'rounded-full')}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
                {children}
            </div>
        </div>,
        document.body
    );
}
