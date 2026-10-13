'use client';

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';

const ITEMS = '[role^="menuitem"]:not([disabled])';

type Where = 'first' | 'last';

/** State and keys of one menu button (WAI-ARIA menu button; `initialOpen` is for the UI-elements page): spread `triggerProps` on the button, `menuProps` on `MenuPanel`, `rootRef` on the wrapper. */
export function useMenu(initialOpen = false) {
    const [open, setOpen] = useState(initialOpen);
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
