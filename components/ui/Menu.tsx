'use client';

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode, type Ref } from 'react';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import { UI } from '@/lib/constants';
import { useClickOutside } from '@/hooks/useClickOutside';

const ITEMS = '[role^="menuitem"]:not([disabled])';
const ITEM_BASE = 'flex min-h-10 w-full items-center gap-2.5 rounded-[10px] px-2.5 py-[7px] text-left text-sm text-foreground hover:bg-tint focus-visible:bg-tint focus-visible:outline-none disabled:opacity-60';

type Where = 'first' | 'last';

/** State and keys of one menu button (WAI-ARIA menu button): spread `triggerProps` on the button, `menuProps` on `MenuPanel`, `rootRef` on the wrapper. */
export function useMenu() {
    const [open, setOpen] = useState(false);
    const id = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const focusOnOpen = useRef<Where | null>(null);

    useClickOutside(rootRef, () => setOpen(false), open);

    useEffect(() => {
        if (!open || !focusOnOpen.current) return;
        const items = menuRef.current?.querySelectorAll<HTMLElement>(ITEMS);
        if (items?.length) items[focusOnOpen.current === 'last' ? items.length - 1 : 0].focus();
        focusOnOpen.current = null;
    }, [open]);

    const close = useCallback(() => {
        setOpen(false);
        triggerRef.current?.focus();
    }, []);

    const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        if (open && (e.key === 'Enter' || e.key === ' ')) return setOpen(false);
        if (open) {
            const items = menuRef.current?.querySelectorAll<HTMLElement>(ITEMS);
            if (items?.length) items[e.key === 'ArrowUp' ? items.length - 1 : 0].focus();
            return;
        }
        focusOnOpen.current = e.key === 'ArrowUp' ? 'last' : 'first';
        setOpen(true);
    };

    const onMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>(ITEMS) ?? []);
        const at = items.indexOf(document.activeElement as HTMLElement);
        const go = (i: number) => {
            e.preventDefault();
            items[(i + items.length) % items.length]?.focus();
        };
        if (e.key === 'ArrowDown') go(at + 1);
        else if (e.key === 'ArrowUp') go(at < 0 ? -1 : at - 1);
        else if (e.key === 'Home') go(0);
        else if (e.key === 'End') go(-1);
        else if (e.key === 'Escape') {
            e.preventDefault();
            close();
        } else if (e.key === 'Tab') setOpen(false);
    };

    // Choosing an item closes the menu (the item's own handler has already run).
    const onMenuClick = (e: MouseEvent<HTMLDivElement>) => {
        if (e.target instanceof Element && e.target.closest(ITEMS)) setOpen(false);
    };

    return {
        open,
        setOpen,
        close,
        rootRef,
        triggerProps: {
            ref: triggerRef,
            type: 'button' as const,
            'aria-haspopup': 'menu' as const,
            'aria-expanded': open,
            'aria-controls': open ? id : undefined,
            onClick: () => setOpen((v) => !v),
            onKeyDown: onTriggerKeyDown,
        },
        menuProps: { id, menuRef, onKeyDown: onMenuKeyDown, onClick: onMenuClick },
    };
}

type PanelProps = {
    label: string;
    id: string;
    menuRef: Ref<HTMLDivElement>;
    onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
    onClick: (e: MouseEvent<HTMLDivElement>) => void;
    /** `sm` is the short language list (200 px). */
    width?: 'md' | 'sm';
    dataUi?: string;
    className?: string;
    children: ReactNode;
};

/** The floating list: full width under the header on phones, anchored to the trigger from `sm`. */
export function MenuPanel({ label, id, menuRef, onKeyDown, onClick, width = 'md', dataUi = UI.dropdownMenu, className, children }: PanelProps) {
    return (
        <div
            id={id}
            ref={menuRef}
            role="menu"
            aria-label={label}
            data-ui={dataUi}
            onKeyDown={onKeyDown}
            onClick={onClick}
            className={clsx(
                'fixed top-[calc(var(--header-height)+4px)] z-50 rounded-[14px] border border-border bg-surface p-1.5 shadow-premium sm:absolute sm:right-0 sm:top-auto sm:mt-2',
                width === 'sm' ? 'right-4 w-[200px]' : 'inset-x-4 sm:inset-x-auto sm:w-60',
                className
            )}
        >
            {children}
        </div>
    );
}

type ItemProps = { icon?: ReactNode; trailing?: ReactNode; className?: string; children: ReactNode };

export function MenuItemLink({ href, icon, trailing, locale, hrefLang, current, className, children }: ItemProps & { href: string; locale?: string; hrefLang?: string; current?: boolean }) {
    const radio = typeof current === 'boolean';
    return (
        <Link
            href={href}
            locale={locale}
            hrefLang={hrefLang}
            role={radio ? 'menuitemradio' : 'menuitem'}
            aria-checked={radio ? current : undefined}
            tabIndex={-1}
            data-ui={UI.menuItem}
            className={clsx(ITEM_BASE, current && 'font-semibold', className)}
        >
            {icon}
            {children}
            {trailing}
        </Link>
    );
}

export function MenuItemButton({ onSelect, icon, trailing, disabled, className, children }: ItemProps & { onSelect: () => void; disabled?: boolean }) {
    return (
        <button type="button" role="menuitem" tabIndex={-1} data-ui={UI.menuItem} disabled={disabled} onClick={onSelect} className={clsx(ITEM_BASE, className)}>
            {icon}
            {children}
            {trailing}
        </button>
    );
}

export function MenuSeparator() {
    return <div role="separator" className="mx-2 my-1 h-px bg-border" />;
}

/** The look of a menu row, for items that bring their own markup (the admin mode toggles). */
export const MENU_ITEM_CLASS = ITEM_BASE;
/** Trailing text/state slot of a row. */
export const MENU_TRAILING_CLASS = 'ml-auto text-xs text-foreground-muted';
