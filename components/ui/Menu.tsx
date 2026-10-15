'use client';

import type { KeyboardEvent, MouseEvent, ReactNode, Ref } from 'react';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import { UI } from '@/lib/constants';
export { useMenu } from '@/hooks/useMenu';

const ITEM_BASE = 'flex min-h-10 w-full items-center gap-2.5 rounded-[10px] px-2.5 py-[7px] text-left text-sm text-foreground hover:bg-tint focus-visible:bg-tint focus-visible:outline-none disabled:opacity-60';

type PanelProps = {
    label: string;
    id: string;
    menuRef: Ref<HTMLDivElement>;
    onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
    onClick: (e: MouseEvent<HTMLDivElement>) => void;
    /** `sm` is the short language list (200 px). */
    width?: 'md' | 'sm';
    /** `header`: under the sticky header (full width on phones). `anchor`: right under its own button at every width, for buttons inside the page. */
    placement?: 'header' | 'anchor';
    /** With `placement="anchor"`: which edge of the button the panel lines up with (`end` = right edge, `start` = left edge). */
    align?: 'start' | 'end';
    /** id of a line inside the panel that describes it (a role line, not a row). */
    describedBy?: string;
    dataUi?: string;
    className?: string;
    children: ReactNode;
};

/** The floating list: in the header it is full width under the header on phones and anchored to the trigger from `sm`; `placement="anchor"` keeps it under its button at every width. */
export function MenuPanel({ label, id, menuRef, onKeyDown, onClick, width = 'md', placement = 'header', align = 'end', describedBy, dataUi = UI.dropdownMenu, className, children }: PanelProps) {
    return (
        <div
            id={id}
            ref={menuRef}
            role="menu"
            aria-label={label}
            aria-describedby={describedBy}
            data-ui={dataUi}
            onKeyDown={onKeyDown}
            onClick={onClick}
            className={clsx(
                'z-50 rounded-[14px] border border-border bg-surface p-1.5 shadow-premium',
                placement === 'anchor'
                    ? ['absolute top-full mt-2 w-60 max-w-[calc(100vw-24px)]', align === 'start' ? 'left-0' : 'right-0']
                    : ['fixed top-[calc(var(--header-height)+4px)] sm:absolute sm:right-0 sm:top-auto sm:mt-2', width === 'sm' ? 'right-4 w-[200px]' : 'inset-x-4 sm:inset-x-auto sm:w-60'],
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

export function MenuItemButton({ onSelect, icon, trailing, disabled, current, className, children }: ItemProps & { onSelect: () => void; disabled?: boolean; current?: boolean }) {
    const radio = typeof current === 'boolean';
    return (
        <button type="button" role={radio ? 'menuitemradio' : 'menuitem'} aria-checked={radio ? current : undefined} tabIndex={-1} data-ui={UI.menuItem} disabled={disabled} onClick={onSelect} className={clsx(ITEM_BASE, current && 'font-semibold', className)}>
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
