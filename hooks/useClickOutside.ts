'use client';

import { useEffect, useRef, type RefObject } from 'react';

/**
 * Calls `onOutside` when a mousedown lands outside the referenced element.
 * The listener is only attached while `isActive` is true.
 */
export function useClickOutside<T extends HTMLElement>(ref: RefObject<T | null>, onOutside: () => void, isActive = true): void {
    const handlerRef = useRef(onOutside);
    useEffect(() => {
        handlerRef.current = onOutside;
    });

    useEffect(() => {
        if (!isActive) return;
        const listener = (e: MouseEvent) => {
            const el = ref.current;
            if (!el || (e.target instanceof Node && el.contains(e.target))) return;
            handlerRef.current();
        };
        document.addEventListener('mousedown', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
        };
    }, [ref, isActive]);
}
