'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MessageSquarePlus } from 'lucide-react';
import { clsx } from 'clsx';
import { isCovered } from '@/lib/feedback/capture';

type Props = {
    /** Off while paused, while a pop-up is open, or in "comment anywhere" mode. */
    enabled: boolean;
    onPick: (el: Element) => void;
};

type Entry = { el: Element; name: string; left: number; top: number; width: number; height: number; radius: string };

const BUTTON_SIZE = 28;
const INSET = 4;

function ignored(target: EventTarget | null): boolean {
    return !(target instanceof Element) || target.closest('[data-feedback-ignore]') !== null;
}

/** The innermost named element around the target, unless it belongs to feedback mode itself. */
function namedAround(target: EventTarget | null): Element | null {
    if (ignored(target)) return null;
    return (target as Element).closest('[data-ui]');
}

/**
 * Feedback mode's main layer: every element carrying a `data-ui` name gets a dotted outline (like the dotted
 * underline of translation mode) and, for the active one, a small comment button at its top-right corner.
 * Mouse: the element under the pointer is active and clicks work as usual. Touch: the first tap on an element
 * selects it (no action), a second tap uses it. Keyboard: the buttons are all focusable and appear on focus.
 * Everything sits in one fixed layer that follows each element's bounding box, so the page layout never moves; elements under an open pop-up are left out.
 */
export default function FeedbackNamedElements({ enabled, onPick }: Props) {
    const t = useTranslations('feedbackMode');
    const [entries, setEntries] = useState<Entry[]>([]);
    const [active, setActive] = useState<Element | null>(null);
    const lastSignature = useRef('');

    const measure = useCallback(() => {
        const next: Entry[] = [];
        document.querySelectorAll('[data-ui]').forEach((el) => {
            if (el.closest('[data-feedback-ignore]')) return;
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;
            const offscreen = rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth;
            if (offscreen || isCovered(el, rect)) return;
            next.push({
                el,
                name: el.getAttribute('data-ui') ?? '',
                left: Math.round(rect.left),
                top: Math.round(rect.top),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                radius: getComputedStyle(el).borderRadius,
            });
        });
        // Runs on every scroll frame and once a second; only re-render when something moved.
        const signature = next.map((e) => `${e.name}:${e.left},${e.top},${e.width},${e.height}`).join('|');
        if (signature !== lastSignature.current) {
            lastSignature.current = signature;
            setEntries(next);
        }
    }, []);

    useEffect(() => {
        if (!enabled) return;
        let frame = 0;
        const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
        schedule();
        window.addEventListener('scroll', schedule, true);
        window.addEventListener('resize', schedule);
        const timer = window.setInterval(schedule, 1000);
        return () => {
            cancelAnimationFrame(frame);
            window.clearInterval(timer);
            window.removeEventListener('scroll', schedule, true);
            window.removeEventListener('resize', schedule);
        };
    }, [enabled, measure]);

    // Mirrors `active` for the document listeners below, which are set up once per enable.
    const activeRef = useRef<Element | null>(null);
    useEffect(() => { activeRef.current = active; }, [active]);

    useEffect(() => {
        if (!enabled) return;

        // Touch or pen tap on a named element that isn't active yet: the tap only selects it (shows its
        // comment button) and must not act. Decided on pointerdown, applied to the mousedown and click after it.
        let selectOnTap: Element | null = null;
        let lastPointer = 'mouse';

        // Mouse: hover makes an element active and clicks work as usual. Touch has no hover, and its
        // pointermove fires while scrolling, so it is left out here.
        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse') return;
            if (e.target instanceof Element && e.target.closest('[data-feedback-comment]')) return;
            setActive(namedAround(e.target));
        };
        const onDown = (e: PointerEvent) => {
            selectOnTap = null;
            lastPointer = e.pointerType;
            if (e.pointerType === 'mouse') return;
            const named = namedAround(e.target);
            if (named && named !== activeRef.current) selectOnTap = named;
        };
        const onCancel = () => { selectOnTap = null; };
        const swallow = (e: Event) => {
            if (!selectOnTap || !(e.target instanceof Node) || !selectOnTap.contains(e.target)) return;
            e.preventDefault();
            e.stopPropagation();
        };
        // First tap selects; a second tap on the same element uses the page as normal. A tap outside any
        // named element clears the selection.
        const onClick = (e: MouseEvent) => {
            const picked = selectOnTap;
            selectOnTap = null;
            if (picked && e.target instanceof Node && picked.contains(e.target)) {
                e.preventDefault();
                e.stopPropagation();
                setActive(picked);
                return;
            }
            if (!ignored(e.target) && !namedAround(e.target) && lastPointer !== 'mouse') setActive(null);
        };

        document.addEventListener('pointermove', onMove, true);
        document.addEventListener('pointerdown', onDown, true);
        document.addEventListener('pointercancel', onCancel, true);
        document.addEventListener('mousedown', swallow, true);
        document.addEventListener('click', onClick, true);
        return () => {
            document.removeEventListener('pointermove', onMove, true);
            document.removeEventListener('pointerdown', onDown, true);
            document.removeEventListener('pointercancel', onCancel, true);
            document.removeEventListener('mousedown', swallow, true);
            document.removeEventListener('click', onClick, true);
        };
    }, [enabled]);

    if (!enabled) return null;

    return (
        <div data-feedback-ignore className="pointer-events-none fixed inset-0 z-[54]">
            {entries.map((entry, i) => {
                const isActive = entry.el === active;
                const right = Math.min(entry.left + entry.width, window.innerWidth);
                const buttonRight = Math.max(right - INSET, BUTTON_SIZE);
                const buttonTop = Math.min(Math.max(entry.top + INSET, INSET), window.innerHeight - BUTTON_SIZE - INSET);
                return (
                    <div key={`${entry.name}-${i}`}>
                        <div
                            aria-hidden
                            // Follows the element's bounding box, so the position and radius are measured values.
                            style={{ left: entry.left, top: entry.top, width: entry.width, height: entry.height, borderRadius: entry.radius }}
                            className={clsx(
                                'absolute border-2 border-dotted',
                                isActive ? 'border-primary bg-primary/10' : 'border-primary/50'
                            )}
                        />
                        <div
                            style={{ left: buttonRight, top: buttonTop }}
                            className={clsx(
                                'absolute flex -translate-x-full items-center gap-1 transition-opacity',
                                isActive ? 'opacity-100' : 'opacity-0 focus-within:opacity-100'
                            )}
                        >
                            <span className="whitespace-nowrap rounded-full bg-surface px-2 py-0.5 font-mono text-[10px] font-semibold text-foreground shadow-premium">{entry.name}</span>
                            <button
                                type="button"
                                data-feedback-comment
                                aria-label={t('commentOn', { name: entry.name })}
                                title={t('commentOn', { name: entry.name })}
                                onClick={() => onPick(entry.el)}
                                className={clsx(
                                    'flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-primary text-white shadow-premium',
                                    isActive ? 'pointer-events-auto' : 'pointer-events-none focus:pointer-events-auto'
                                )}
                            >
                                <MessageSquarePlus className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
