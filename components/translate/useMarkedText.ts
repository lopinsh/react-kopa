'use client';

import { useEffect, useRef, useState } from 'react';
import { MARKER_START, findMarkers } from '@/lib/translate-mode/marker';

/** Subtrees the script leaves alone (the translation tools themselves). */
const IGNORE = '[data-translate-ignore]';
const HIGHLIGHT_NAME = 'translate-mode';
const HIDE_DELAY_MS = 250;

interface Segment {
    key: string;
    node: Text;
    start: number;
    end: number;
}

export interface HoverTarget {
    key: string;
    /** Where the pencil goes: the top-right corner of the hovered line of text. */
    x: number;
    y: number;
}

function scan(): Segment[] {
    const segments: Segment[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const text = node as Text;
        const value = text.nodeValue ?? '';
        if (!value.includes(MARKER_START)) continue;
        const parent = text.parentElement;
        if (!parent || parent.closest(IGNORE) || parent.closest('script, style, noscript')) continue;

        const markers = findMarkers(value);
        markers.forEach((marker, i) => {
            const end = i + 1 < markers.length ? markers[i + 1].start : value.length;
            if (value.slice(marker.textStart, end).trim() === '') return;
            segments.push({ key: marker.key, node: text, start: marker.start, end });
        });
    }
    return segments;
}

function rangeOf(segment: Segment): Range | null {
    if (!segment.node.isConnected || segment.end > (segment.node.nodeValue ?? '').length) return null;
    const range = document.createRange();
    range.setStart(segment.node, segment.start);
    range.setEnd(segment.node, segment.end);
    return range;
}

function caretNodeAt(x: number, y: number): { node: Node; offset: number } | null {
    if (document.caretPositionFromPoint) {
        const pos = document.caretPositionFromPoint(x, y);
        return pos ? { node: pos.offsetNode, offset: pos.offset } : null;
    }
    const range = document.caretRangeFromPoint?.(x, y);
    return range ? { node: range.startContainer, offset: range.startOffset } : null;
}

function rectUnderPoint(range: Range, x: number, y: number): DOMRect | null {
    for (const rect of Array.from(range.getClientRects())) {
        if (rect.width > 0 && x >= rect.left - 2 && x <= rect.right + 2 && y >= rect.top - 2 && y <= rect.bottom + 2) return rect;
    }
    return null;
}

/**
 * Finds the marked texts on the page, underlines them with the CSS Custom Highlight API (no DOM changes,
 * so React is undisturbed) and reports which one the pointer is over so a pencil can be shown.
 */
export function useMarkedText(): { target: HoverTarget | null; keepTarget: () => void; releaseTarget: () => void } {
    const [target, setTarget] = useState<HoverTarget | null>(null);
    const segmentsRef = useRef<Segment[]>([]);
    const overPencilRef = useRef(false);
    const hideTimer = useRef<number | null>(null);

    useEffect(() => {
        const highlights = typeof CSS !== 'undefined' ? CSS.highlights : undefined;
        let scanTimer: number | null = null;
        let frame: number | null = null;

        const clearHide = () => {
            if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
            hideTimer.current = null;
        };
        const scheduleHide = () => {
            if (hideTimer.current !== null) return;
            hideTimer.current = window.setTimeout(() => {
                hideTimer.current = null;
                if (!overPencilRef.current) setTarget(null);
            }, HIDE_DELAY_MS);
        };

        const rescan = () => {
            segmentsRef.current = scan();
            if (!highlights) return;
            const ranges = segmentsRef.current.map(rangeOf).filter((r): r is Range => r !== null);
            highlights.set(HIGHLIGHT_NAME, new Highlight(...ranges));
        };
        const queueScan = () => {
            if (scanTimer !== null) window.clearTimeout(scanTimer);
            scanTimer = window.setTimeout(rescan, 150);
        };

        const handleMove = (e: MouseEvent) => {
            if (frame !== null) return;
            const { clientX: x, clientY: y } = e;
            frame = window.requestAnimationFrame(() => {
                frame = null;
                if (overPencilRef.current) return;
                const el = document.elementFromPoint(x, y);
                if (el?.closest(IGNORE)) return;

                const caret = caretNodeAt(x, y);
                if (caret && caret.node.nodeType === Node.TEXT_NODE) {
                    for (const segment of segmentsRef.current) {
                        if (segment.node !== caret.node) continue;
                        const range = rangeOf(segment);
                        const rect = range && rectUnderPoint(range, x, y);
                        if (rect) {
                            clearHide();
                            setTarget((prev) => {
                                const next = { key: segment.key, x: rect.right, y: rect.top };
                                return prev && prev.key === next.key && prev.x === next.x && prev.y === next.y ? prev : next;
                            });
                            return;
                        }
                    }
                }
                scheduleHide();
            });
        };
        const handleScroll = () => {
            clearHide();
            setTarget(null);
        };

        rescan();
        const observer = new MutationObserver(queueScan);
        observer.observe(document.body, { childList: true, characterData: true, subtree: true });
        document.addEventListener('mousemove', handleMove, { passive: true });
        document.addEventListener('scroll', handleScroll, { capture: true, passive: true });

        return () => {
            observer.disconnect();
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('scroll', handleScroll, { capture: true });
            if (scanTimer !== null) window.clearTimeout(scanTimer);
            if (frame !== null) window.cancelAnimationFrame(frame);
            clearHide();
            highlights?.delete(HIGHLIGHT_NAME);
        };
    }, []);

    return {
        target,
        keepTarget: () => {
            overPencilRef.current = true;
            if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
            hideTimer.current = null;
        },
        releaseTarget: () => {
            overPencilRef.current = false;
            setTarget(null);
        },
    };
}
