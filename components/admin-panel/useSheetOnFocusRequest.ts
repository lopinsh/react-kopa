'use client';

import { useEffect } from 'react';
import { hasPanelFocus, type SheetSize } from './panel-storage';

/** A focus request for the Grupa tab (the shield, R25-3) on a phone: the sheet opens to at least half so the field is visible. */
export function useSheetOnFocusRequest(active: boolean, size: SheetSize, commit: (next: SheetSize) => void): void {
    useEffect(() => {
        if (!active) return;
        const open = () => { if (size === 'bar' && hasPanelFocus()) commit('half'); };
        open();
        window.addEventListener('ek:admin-panel-focus', open);
        return () => window.removeEventListener('ek:admin-panel-focus', open);
    }, [active, size, commit]);
}
