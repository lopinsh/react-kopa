'use client';

import { createContext, useContext, type ComponentPropsWithoutRef } from 'react';

export const CloseContext = createContext<(force?: boolean) => void>(() => { });
/** `requestClose` of the surrounding pop-up: for × buttons inside. */
export const useOverlayClose = () => useContext(CloseContext);
/** Closes without asking, for the "Discard" answer. */
export const useOverlayForceClose = () => { const close = useContext(CloseContext); return () => close(true); };

/** A Cancel button inside a pop-up: closes it the same way × does (so a dirty form still asks first). */
export function OverlayCloseButton({ onClick, ...props }: ComponentPropsWithoutRef<'button'>) {
    const close = useOverlayClose();
    return <button type="button" {...props} onClick={(e) => { onClick?.(e); close(); }} />;
}

/** Focus goes back to the given trigger, else the opener, else the main region, never to <body>. */
export function restoreFocus(trigger: HTMLElement | null | undefined, opener: HTMLElement | null) {
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
