'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { useBackClose } from '@/hooks/useBackClose';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useOverlayLayer } from '@/hooks/useOverlayLayer';
import { CloseContext, restoreFocus } from '@/components/ui/overlay-support';
import { panelClasses, type OverlayLayout, type OverlaySize } from '@/components/ui/overlay-layouts';
import type { UiName } from '@/lib/constants';

export type { OverlayLayout };

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
    size?: OverlaySize;
    /** No panel padding (lists that scroll inside). */
    flush?: boolean;
    panelClassName?: string;
    zIndexClassName?: string;
    translateIgnore?: boolean;
    /** Where focus goes on close when the opener is gone (a menu item of a closed menu): the menu's trigger. */
    returnFocusRef?: RefObject<HTMLElement | null>;
    children: ReactNode;
};

/**
 * The one pop-up shell (AR-67): portal, scrim, layer stack and scroll lock (useOverlayLayer), Esc, Back, focus trap and focus return.
 * Render it only while it should be open (mount = open). Modal, Sheet and the drawers sit on it.
 */
export default function Overlay({
    layout, id: panelId, onClose, locked = false, dirty = false, onBlocked, backClose = true, role = 'dialog', labelledBy, label, describedBy, dataUi,
    size = 'md', flush = false, panelClassName, zIndexClassName = 'z-50', translateIgnore = false, returnFocusRef, children,
}: Props) {
    const mounted = useSyncExternalStore(() => () => { }, () => true, () => false);
    const panelRef = useFocusTrap<HTMLDivElement>(mounted);
    // The element that opened the overlay, read while rendering so a field with autoFocus cannot replace it.
    const [opener] = useState<HTMLElement | null>(() =>
        typeof document !== 'undefined' && document.activeElement instanceof HTMLElement ? document.activeElement : null
    );
    const requestClose = useBackClose(mounted && backClose, onClose, locked, dirty && onBlocked ? { dirty, onBlocked } : undefined);
    const downOnScrim = useRef(false);

    const isTop = useOverlayLayer(true);

    useEffect(() => {
        return () => {
            // Only when focus was in this pop-up (now gone, so on <body>): a parent closing in the same commit
            // (Discard over a dirty form) has already put it back on its opener, which a child must not undo.
            const active = document.activeElement;
            // eslint-disable-next-line react-hooks/exhaustive-deps -- the ref is wanted as it is at close time
            if (!active || active === document.body || !active.isConnected) restoreFocus(returnFocusRef?.current, opener);
        };
    }, [opener, returnFocusRef]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isTop()) requestClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isTop, requestClose]);

    if (!mounted) return null;

    const grab = layout === 'dialog' || layout === 'sheet' || layout === 'panel';
    return createPortal(
        <CloseContext.Provider value={requestClose}>
            <div
                {...(translateIgnore ? { 'data-translate-ignore': true } : {})}
                className={clsx(
                    'fixed inset-0 flex',
                    layout === 'dialog' && 'items-end justify-center sm:items-center sm:p-4',
                    layout === 'sheet' && 'items-end justify-center',
                    layout === 'right' && 'justify-end',
                    layout === 'panel' && 'items-end justify-center md:items-center md:p-6',
                    layout === 'left' && 'justify-start',
                    layout === 'screen' && 'items-stretch',
                    zIndexClassName
                )}
            >
                <div
                    aria-hidden="true"
                    className={clsx('absolute inset-0 bg-scrim motion-safe:animate-fade', layout === 'dialog' && 'sm:backdrop-blur-[1.5px]')}
                    onMouseDown={(e) => { downOnScrim.current = e.target === e.currentTarget; }}
                    onMouseUp={(e) => { if (downOnScrim.current && e.target === e.currentTarget) requestClose(); downOnScrim.current = false; }}
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
                    {grab && <div aria-hidden="true" className={clsx('mx-auto mb-2 h-1 w-10 shrink-0 rounded-pill bg-border', layout === 'panel' ? 'md:hidden' : 'sm:hidden', flush && 'mt-2')} />}
                    {children}
                </div>
            </div>
        </CloseContext.Provider>,
        document.body
    );
}
