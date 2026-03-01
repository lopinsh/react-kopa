'use client';

import { useEffect, useRef, RefObject } from 'react';

/**
 * Hook to trap focus within a container.
 * Useful for modals, wizards, and drawers.
 */
export function useFocusTrap(isActive: boolean): RefObject<HTMLElement | null> {
    const containerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!isActive) return;

        const container = containerRef.current;
        if (!container) return;

        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        container.addEventListener('keydown', handleKeyDown);

        // Initial focus - focus the first element or the container itself if no focusable elements
        if (focusableElements.length > 0) {
            (focusableElements[0] as HTMLElement).focus();
        } else {
            container.focus();
        }

        return () => {
            container.removeEventListener('keydown', handleKeyDown);
        };
    }, [isActive]);

    return containerRef;
}
