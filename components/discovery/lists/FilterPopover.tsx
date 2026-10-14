'use client';

import { useEffect, useId, useState, type ReactNode } from 'react';
import { clsx } from 'clsx';
import Sheet from '@/components/ui/Sheet';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { inFeedbackLayer } from '@/lib/feedback/capture';
import { UI } from '@/lib/constants';

const PANEL_WIDTH = 250;

/** Open state of one filter list: where the panel sits (flipped at the right edge) and whether it is a drop-down or a phone sheet. */
export function usePopover() {
    // A callback ref in state: the host element is read in handlers and effects only.
    const [host, bindHost] = useState<HTMLDivElement | null>(null);
    const id = useId();
    const [open, setOpen] = useState(false);
    const [alignRight, setAlignRight] = useState(false);
    const desktop = useMediaQuery('(min-width: 768px)');
    const toggle = () => {
        if (!open) setAlignRight((host?.getBoundingClientRect().left ?? 0) + PANEL_WIDTH > window.innerWidth - 12);
        setOpen(!open);
    };
    return { host, bindHost, id, open, setOpen, toggle, alignRight, desktop };
}

type Props = {
    pop: Omit<ReturnType<typeof usePopover>, 'bindHost'>;
    title: string;
    /** Called when the list closes by Esc, a click outside, Tab out, the sheet's × or Back. */
    onClose: () => void;
    children: ReactNode;
};

/** A filter list: an anchored panel under its button from `md`, a bottom sheet on phones (dim only). The host element must be `relative` and hold the button. */
export default function FilterPopover({ pop, title, onClose, children }: Props) {
    const { host, id, open, desktop, alignRight } = pop;

    useEffect(() => {
        if (!open || !desktop) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
                host?.querySelector('button')?.focus();
            }
        };
        const onDown = (e: MouseEvent) => {
            if (e.target instanceof Node && host?.contains(e.target)) return;
            if (!inFeedbackLayer(e.target)) onClose();
        };
        document.addEventListener('keydown', onKey);
        document.addEventListener('mousedown', onDown);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('mousedown', onDown);
        };
    }, [open, desktop, onClose, host]);

    if (!open) return null;
    if (!desktop) return <Sheet title={title} onClose={onClose}><div id={id}>{children}</div></Sheet>;
    return (
        <div
            id={id}
            data-ui={UI.filterList}
            onBlur={(e) => { if (e.relatedTarget instanceof Node && !host?.contains(e.relatedTarget)) onClose(); }}
            className={clsx(
                'absolute z-40 mt-1.5 max-h-[min(60vh,420px)] w-[250px] max-w-[calc(100vw-24px)] overflow-y-auto rounded-2xl bg-surface p-1.5 shadow-premium ring-1 ring-border',
                alignRight ? 'right-0' : 'left-0'
            )}
        >
            {children}
        </div>
    );
}
