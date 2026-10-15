'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { inFeedbackLayer } from '@/lib/feedback/capture';
import { useFeedbackMode } from '@/components/providers/FeedbackModeContext';

/**
 * Calls `onOutside` when a mousedown lands outside the referenced element (clicks in the feedback-mode layer don't count, and while feedback mode is on nothing counts: open menus and pop-ups stay open so their items can get notes).
 * The listener is only attached while `isActive` is true.
 */
export function useClickOutside<T extends HTMLElement>(ref: RefObject<T | null>, onOutside: () => void, isActive = true): void {
    const feedbackMode = useFeedbackMode();
    const handlerRef = useRef(onOutside);
    useEffect(() => {
        handlerRef.current = onOutside;
    });

    useEffect(() => {
        if (!isActive || feedbackMode) return;
        const listener = (e: MouseEvent) => {
            const el = ref.current;
            if (!el || (e.target instanceof Node && el.contains(e.target)) || inFeedbackLayer(e.target)) return;
            handlerRef.current();
        };
        document.addEventListener('mousedown', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
        };
    }, [ref, isActive, feedbackMode]);
}
