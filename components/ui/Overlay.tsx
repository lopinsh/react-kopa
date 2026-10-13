'use client';

import { useEffect, useId, useState, useSyncExternalStore, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { useBackClose } from '@/hooks/useBackClose';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { CloseContext, restoreFocus } from '@/components/ui/overlay-support';
import type { UiName } from '@/lib/constants';

export type OverlayLayout = 'dialog' | 'sheet' | 'right' | 'left';

type Props = {
    layout: OverlayLayout;
    /** id of the panel, for a button's aria-controls. */
    id?: string;
    onClose: () => void;
    /** While saving: Esc, scrim, × and Back do nothing. */
    locked?: boolean;
    /** Typed input that would be lost: closing calls `onBlocked` first (Modal asks "Discard changes?"). */
    dirty?: boolean;
    onBlocked?: () => void;
    /** Own history entry for Back (default). Off for a prompt over a pop-up that already has one. */
    backClose?: boolean;
    role?: 'dialog' | 'alertdialog';
    labelledBy?: string;
    label?: string;
    describedBy?: string;
    dataUi: UiName;
    /** Dialog width from `sm`. */
    size?: 'sm' | 'md' | 'lg' | '2xl' | '4xl';
    /** No panel padding (lists that scroll inside). */
    flush?: boolean;
    panelClassName?: string;
    zIndexClassName?: string;
    translateIgnore?: boolean;
    /** Where focus goes on close when the opener is gone (a menu item of a closed menu): the menu's trigger. */
    returnFocusRef?: RefObject<HTMLElement | null>;
    children: ReactNode;
};

const SIZE = { sm: 'sm:max-w-sm', md: 'sm:max-w-[420px]', lg: 'sm:max-w-lg', '2xl': 'sm:max-w-2xl', '4xl': 'sm:max-w-4xl' } as const;
const SHEET = 'w-full max-h-[90dvh] overflow-y-auto rounded-t-3xl bg-surface shadow-dialog motion-safe:animate-rise';
const PANEL_PAD = 'p-[18px] pb-[calc(18px+env(safe-area-inset-bottom))] sm:pb-[18px]';

// Open overlays, topmost last: Esc only closes the top one; scroll stays locked until the last one closes.
const stack: string[] = [];

function panelClasses(layout: OverlayLayout, size: NonNullable<Props['size']>, flush: boolean) {
    switch (layout) {
        case 'dialog': return clsx(SHEET, 'sm:max-h-[calc(100dvh-2rem)] sm:rounded-2xl motion-safe:sm:animate-pop', SIZE[size], !flush && PANEL_PAD);
        case 'sheet': return clsx(SHEET, 'sm:max-w-[560px]', !flush && PANEL_PAD);
        case 'right': return clsx('flex h-full w-full flex-col overflow-y-auto bg-surface shadow-premium sm:max-w-md sm:border-l sm:border-border motion-safe:animate-from-right', !flush && 'p-[18px]');
        case 'left': return clsx('flex h-full w-4/5 max-w-[320px] flex-col overflow-y-auto bg-surface shadow-premium motion-safe:animate-from-left', !flush && 'p-[18px]');
    }
}

/**
 * The one pop-up shell (AR-67): portal, scrim, stack, scroll lock, Esc, Back, focus trap and focus return.
 * Render it only while it should be open (mount = open). Modal, Sheet and the drawers sit on it.
 */
export default function Overlay({
    layout, id: panelId, onClose, locked = false, dirty = false, onBlocked, backClose = true, role = 'dialog', labelledBy, label, describedBy, dataUi,
    size = 'md', flush = false, panelClassName, zIndexClassName = 'z-50', translateIgnore = false, returnFocusRef, children,
}: Props) {
    const id = useId();
    const mounted = useSyncExternalStore(() => () => { }, () => true, () => false);
    const panelRef = useFocusTrap<HTMLDivElement>(mounted);
    // The element that opened the overlay, read while rendering so a field with autoFocus cannot replace it.
    const [opener] = useState<HTMLElement | null>(() =>
        typeof document !== 'undefined' && document.activeElement instanceof HTMLElement ? document.activeElement : null
    );
    const requestClose = useBackClose(mounted && backClose, onClose, locked, dirty && onBlocked ? { dirty, onBlocked } : undefined);
    const [downOnScrim, setDownOnScrim] = useState(false);

    useEffect(() => {
        const main = document.getElementById('main-content');
        stack.push(id);
        main?.classList.add('overflow-hidden');
        document.body.style.overflow = 'hidden';
        return () => {
            stack.splice(stack.indexOf(id), 1);
            if (stack.length === 0) {
                main?.classList.remove('overflow-hidden');
                document.body.style.overflow = '';
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps -- the ref is wanted as it is at close time
            restoreFocus(returnFocusRef?.current, opener);
        };
    }, [id, opener, returnFocusRef]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && stack[stack.length - 1] === id) requestClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [id, requestClose]);

    if (!mounted) return null;

    const grab = layout === 'dialog' || layout === 'sheet';
    return createPortal(
        <CloseContext.Provider value={requestClose}>
            <div
                {...(translateIgnore ? { 'data-translate-ignore': true } : {})}
                className={clsx(
                    'fixed inset-0 flex',
                    layout === 'dialog' && 'items-end justify-center sm:items-center sm:p-4',
                    layout === 'sheet' && 'items-end justify-center',
                    layout === 'right' && 'justify-end',
                    layout === 'left' && 'justify-start',
                    zIndexClassName
                )}
            >
                <div
                    aria-hidden="true"
                    className={clsx('absolute inset-0 bg-scrim motion-safe:animate-fade', layout === 'dialog' && 'sm:backdrop-blur-[1.5px]')}
                    onMouseDown={(e) => setDownOnScrim(e.target === e.currentTarget)}
                    onMouseUp={(e) => { if (downOnScrim && e.target === e.currentTarget) requestClose(); setDownOnScrim(false); }}
                />
                <div
                    ref={panelRef}
                    id={panelId}
                    role={role}
                    aria-modal="true"
                    aria-labelledby={labelledBy}
                    aria-label={label}
                    aria-describedby={describedBy}
                    tabIndex={-1}
                    data-ui={dataUi}
                    className={clsx('relative outline-none', panelClasses(layout, size, flush), panelClassName)}
                >
                    {grab && <div aria-hidden="true" className={clsx('mx-auto mb-2 h-1 w-10 shrink-0 rounded-full bg-border sm:hidden', flush && 'mt-2')} />}
                    {children}
                </div>
            </div>
        </CloseContext.Provider>,
        document.body
    );
}
