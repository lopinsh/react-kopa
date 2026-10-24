'use client';

import { useEffect, useRef, RefObject } from 'react';

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Hook to trap focus within a container.
 * Useful for modals, wizards, and drawers.
 * On activation focus moves to the element marked `data-autofocus`, else the first focusable one
 * (unless focus is already inside, e.g. an `autoFocus` field). The focusable list is read on every Tab,
 * so content that changes while the container is open stays reachable.
 */
export function useFocusTrap<T extends HTMLElement>(isActive: boolean): RefObject<T | null> {
    const containerRef = useRef<T>(null);

    useEffect(() => {
        if (!isActive) return;

        const container = containerRef.current;
        if (!container) return;

        const getFocusable = () => Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;
            // The admin tool panel sits above slide-overs and keeps its own Tab order.
            if (document.activeElement?.closest('[data-admin-panel]')) return;
            const elements = getFocusable();
            if (elements.length === 0) {
                e.preventDefault();
                container.focus();
                return;
            }
            const first = elements[0];
            const last = elements[elements.length - 1];
            const active = document.activeElement;
            if (e.shiftKey) {
                if (active === first || active === container) {
                    e.preventDefault();
                    last.focus();
                }
            } else if (active === last) {
                e.preventDefault();
                first.focus();
            }
        };

        container.addEventListener('keydown', handleKeyDown);

        if (!container.contains(document.activeElement)) {
            const preferred = container.querySelector<HTMLElement>('[data-autofocus]');
            const elements = getFocusable();
            if (preferred) preferred.focus();
            else if (elements.length > 0) elements[0].focus();
            else container.focus();
        }

        return () => {
            container.removeEventListener('keydown', handleKeyDown);
        };
    }, [isActive]);

    return containerRef;
}
