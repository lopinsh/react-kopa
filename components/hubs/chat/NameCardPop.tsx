'use client';

import { useCallback, useEffect, useId, useReducer, useRef, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const WIDTH = 288;
const GAP = 6;
const ROOM_BELOW = 320;

type Props = { anchor: HTMLElement; title: string; locked: boolean; onClose: () => void; children: ReactNode };

/** A pop-up at the tapped name, no backdrop (drawing `chat-card`; design.md Pop-up): follows the name when the log scrolls, Escape or a click outside closes it. */
function Anchored({ anchor, title, locked, onClose, children }: Props) {
    const tCommon = useTranslations('common');
    const titleId = useId();
    // The anchor is already on screen: the place is read from it at render, and again (`place`) when the log scrolls or the window resizes.
    const [, place] = useReducer((n: number) => n + 1, 0);
    const panelRef = useFocusTrap<HTMLDivElement>(true);
    const lockedRef = useRef(locked);
    useEffect(() => { lockedRef.current = locked; });
    const close = useCallback(() => { if (!lockedRef.current) onClose(); }, [onClose]);
    useClickOutside(panelRef, close);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
        window.addEventListener('keydown', onKey, true);
        window.addEventListener('resize', place);
        window.addEventListener('scroll', place, true);
        return () => {
            window.removeEventListener('keydown', onKey, true);
            window.removeEventListener('resize', place);
            window.removeEventListener('scroll', place, true);
            if (anchor.isConnected) anchor.focus();
        };
    }, [anchor, close]);

    const r = anchor.getBoundingClientRect();
    const left = Math.min(Math.max(8, r.left), window.innerWidth - WIDTH - 8);
    // Meta lines sit low in the log: above the name its bottom edge is pinned, so the card grows upwards.
    const pos = r.bottom + GAP + ROOM_BELOW <= window.innerHeight ? { left, top: r.bottom + GAP } : { left, bottom: window.innerHeight - r.top + GAP };
    return (
        <div ref={panelRef} role="dialog" aria-labelledby={titleId} tabIndex={-1} style={{ ...pos, width: WIDTH }} className="fixed z-[90] grid gap-3 rounded-2xl frame bg-surface p-4 shadow-dialog motion-safe:animate-fade">
            <div className="flex items-start gap-2">
                <h2 id={titleId} className="min-w-0 flex-1 truncate text-item text-foreground">{title}</h2>
                <button type="button" onClick={close} disabled={locked} aria-label={tCommon('close')} className="-mr-2 -mt-2 inline-flex size-10 items-center justify-center rounded-pill text-foreground-muted hover:bg-tint"><X aria-hidden className="size-5" /></button>
            </div>
            {children}
        </div>
    );
}

/** The name card's shell (K5-19): a sheet from the bottom below 768 px, a pop-up anchored to the name from there up (spec 4.4). */
export default function NameCardPop(props: Props) {
    const wide = useMediaQuery('(min-width: 768px)');
    if (!wide) return <Modal onClose={props.onClose} title={props.title} size="sm" locked={props.locked}>{props.children}</Modal>;
    return <Anchored {...props} />;
}
