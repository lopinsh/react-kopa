'use client';

import { useEffect, useRef } from 'react';
import { typeRoleOfElement, type TypeRoleId, type TypeVariant } from '@/lib/constants';

type Picked = { role: TypeRoleId; variant: TypeVariant | null; el: Element };

/**
 * While the Dizains tab is open and not paused, a click on a text with a type role picks that role instead of doing
 * what the click would do (links, buttons, forms stay still). Clicks with no role text, and anything in the panel, pass through.
 */
export function useRolePicker(active: boolean, onPick: (picked: Picked) => void) {
    const pick = useRef(onPick);
    useEffect(() => { pick.current = onPick; });

    useEffect(() => {
        if (!active) return;
        const hit = (e: Event) => {
            if (!(e.target instanceof Element) || e.target.closest('[data-feedback-ignore], [data-admin-panel]')) return null;
            return typeRoleOfElement(e.target);
        };
        const onClick = (e: MouseEvent) => {
            const found = hit(e);
            if (!found) return;
            e.preventDefault();
            e.stopPropagation();
            pick.current(found);
        };
        const stop = (e: Event) => {
            if (!hit(e)) return;
            e.preventDefault();
            e.stopPropagation();
        };
        document.addEventListener('click', onClick, true);
        document.addEventListener('auxclick', stop, true);
        document.addEventListener('submit', stop, true);
        return () => {
            document.removeEventListener('click', onClick, true);
            document.removeEventListener('auxclick', stop, true);
            document.removeEventListener('submit', stop, true);
        };
    }, [active]);
}
