'use client';

import { useCallback, type KeyboardEvent, type RefObject } from 'react';

interface Options {
    rootRef: RefObject<HTMLElement | null>;
    hasSelection: boolean;
    clearSelection: () => void;
    close: () => void;
}

const FIELDS = 'input, textarea, select';

/**
 * Escape inside the panel, one layer at a time: leave a field (focus goes to the selected tab), then clear the
 * tab's selection, then close. It never reaches the page, so a slide-over behind the panel stays open.
 */
export function usePanelEscape({ rootRef, hasSelection, clearSelection, close }: Options) {
    return useCallback((e: KeyboardEvent<HTMLElement>) => {
        if (e.key !== 'Escape') return;
        // Dialogs the tabs open render elsewhere in the page but bubble through React: only Escape pressed inside the panel is ours.
        if (!(e.target instanceof Node) || !rootRef.current?.contains(e.target)) return;
        e.stopPropagation();
        const active = document.activeElement;
        if (active instanceof HTMLElement && active.matches(FIELDS)) {
            active.blur();
            rootRef.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus();
        } else if (hasSelection) clearSelection();
        else close();
    }, [rootRef, hasSelection, clearSelection, close]);
}
