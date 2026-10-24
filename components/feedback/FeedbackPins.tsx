'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { FEEDBACK_TAB_STATUSES } from '@/lib/constants';
import { findNoteElement, isCovered } from '@/lib/feedback/capture';
import type { FeedbackItem } from '@/lib/services/feedback.service';

type Props = {
    notes: FeedbackItem[];
    onOpen: (note: FeedbackItem) => void;
    /** Reports which notes currently have no element on the page (they are shown in the list instead). */
    onMissing: (ids: string[]) => void;
};

type Spot = { id: string; n: number; x: number; y: number };

/**
 * Numbered pins over the elements the notes were left on. A fixed layer that follows each element's
 * bounding box, so the page layout is never touched. Re-measured on scroll (the page scrolls inside
 * the main element, hence the capture listener), on resize, and once a second for content that arrives late.
 */
export default function FeedbackPins({ notes, onOpen, onMissing }: Props) {
    const t = useTranslations('feedbackMode');
    const [spots, setSpots] = useState<Spot[]>([]);
    const lastMissing = useRef('');
    // Resolving a note walks the DOM and reads innerText; scroll frames reuse the element, the 1 s tick re-resolves.
    const resolved = useRef(new Map<string, Element>());
    const fresh = useRef(true);

    const measure = useCallback(() => {
        const next: Spot[] = [];
        const missing: string[] = [];
        notes.forEach((note, i) => {
            let el: Element | null | undefined = fresh.current ? null : resolved.current.get(note.id);
            if (!el?.isConnected) el = findNoteElement(note);
            if (el) resolved.current.set(note.id, el); else resolved.current.delete(note.id);
            if (!el) { missing.push(note.id); return; }
            const rect = el.getBoundingClientRect();
            const empty = rect.width === 0 && rect.height === 0;
            const offscreen = rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth;
            if (empty || offscreen || isCovered(el, rect)) return;
            next.push({
                id: note.id,
                n: i + 1,
                x: Math.round(Math.min(Math.max(rect.left, 8), window.innerWidth - 32)),
                y: Math.round(Math.min(Math.max(rect.top - 10, 8), window.innerHeight - 32)),
            });
        });
        fresh.current = false;
        setSpots((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
        // Runs every second; only report a change, so the parent doesn't re-render for nothing.
        const missingKey = missing.join(',');
        if (missingKey !== lastMissing.current) {
            lastMissing.current = missingKey;
            onMissing(missing);
        }
    }, [notes, onMissing]);

    useEffect(() => {
        let frame = 0;
        const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
        const refresh = () => { fresh.current = true; schedule(); };
        fresh.current = true;
        schedule();
        window.addEventListener('scroll', schedule, true);
        window.addEventListener('resize', schedule);
        const timer = window.setInterval(refresh, 1000);
        return () => {
            cancelAnimationFrame(frame);
            window.clearInterval(timer);
            window.removeEventListener('scroll', schedule, true);
            window.removeEventListener('resize', schedule);
        };
    }, [measure]);

    return (
        <div data-feedback-ignore className="pointer-events-none fixed inset-0 z-[55]">
            {spots.map((spot) => {
                const note = notes.find((n) => n.id === spot.id);
                if (!note) return null;
                const answered = (FEEDBACK_TAB_STATUSES.completed as readonly string[]).includes(note.status);
                return (
                    <button
                        key={spot.id}
                        type="button"
                        aria-label={t(answered ? 'pinLabelAnswered' : 'pinLabelNew', { n: spot.n })}
                        onClick={() => onOpen(note)}
                        // Placed from the measured bounding box, so the position has to be inline.
                        style={{ left: spot.x, top: spot.y }}
                        className={clsx(
                            'pointer-events-auto absolute flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface text-tag shadow-premium',
                            answered ? 'bg-tool-answered text-tool-answered-ink' : 'bg-tool-new text-tool-new-ink',
                        )}
                    >
                        {spot.n}
                    </button>
                );
            })}
        </div>
    );
}
