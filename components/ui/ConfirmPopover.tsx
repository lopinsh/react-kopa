'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useTranslations } from 'next-intl';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useFocusTrap } from '@/hooks/useFocusTrap';

type TriggerProps = {
    ref: RefObject<HTMLButtonElement | null>;
    onClick: () => void;
    'aria-haspopup': 'dialog';
    'aria-expanded': boolean;
    'aria-controls': string | undefined;
};

type Props = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    message: string;
    confirmLabel: string;
    /** Red confirm button for things that can't be undone. */
    destructive?: boolean;
    isPending?: boolean;
    onConfirm: () => void;
    /** Renders the button that opens the pop-over; spread the given props onto it. */
    renderTrigger: (props: TriggerProps) => ReactNode;
};

const GAP = 6;
const WIDTH = 256;

/** A small confirmation next to the button that asked for it: no backdrop, the page stays readable. Escape or a click outside cancels. */
export default function ConfirmPopover({ isOpen, onOpenChange, message, confirmLabel, destructive = false, isPending = false, onConfirm, renderTrigger }: Props) {
    const tCommon = useTranslations('common');
    const panelId = useId();
    const wrapperRef = useRef<HTMLSpanElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
    const panelRef = useFocusTrap<HTMLDivElement>(isOpen && pos !== null);
    const wasOpen = useRef(false);

    useClickOutside(wrapperRef, () => { if (!isPending) onOpenChange(false); }, isOpen);

    // Fixed position from the button's rectangle, so no scrolling parent can clip it.
    useLayoutEffect(() => {
        if (!isOpen) return;
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const left = Math.min(Math.max(8, rect.right - WIDTH), window.innerWidth - WIDTH - 8);
        const below = rect.bottom + GAP + 120 <= window.innerHeight;
        setPos({ left, top: below ? rect.bottom + GAP : Math.max(8, rect.top - GAP - 110) });
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const close = () => { if (!isPending) onOpenChange(false); };
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            e.stopPropagation();
            close();
        };
        window.addEventListener('keydown', onKey, true);
        window.addEventListener('resize', close);
        window.addEventListener('scroll', close, true);
        return () => {
            window.removeEventListener('keydown', onKey, true);
            window.removeEventListener('resize', close);
            window.removeEventListener('scroll', close, true);
        };
    }, [isOpen, isPending, onOpenChange]);

    // Focus goes back to the button when the pop-over closes.
    useEffect(() => {
        if (wasOpen.current && !isOpen) triggerRef.current?.focus();
        wasOpen.current = isOpen;
    }, [isOpen]);

    return (
        <span ref={wrapperRef} className="inline-flex">
            {renderTrigger({
                ref: triggerRef,
                onClick: () => onOpenChange(!isOpen),
                'aria-haspopup': 'dialog',
                'aria-expanded': isOpen,
                'aria-controls': isOpen ? panelId : undefined,
            })}
            {isOpen && pos && (
                <div
                    ref={panelRef}
                    id={panelId}
                    role="alertdialog"
                    aria-label={message}
                    tabIndex={-1}
                    style={{ top: pos.top, left: pos.left, width: WIDTH }}
                    className="fixed z-[90] rounded-xl border border-border bg-surface p-3 text-left shadow-premium animate-in fade-in zoom-in-95 duration-100"
                >
                    <p className="text-sm font-semibold text-foreground">{message}</p>
                    <div className="mt-3 flex items-center justify-end gap-2">
                        <button
                            data-autofocus
                            type="button"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                            className="rounded-lg px-3 py-1.5 text-xs font-bold text-foreground-muted hover:text-foreground disabled:opacity-50"
                        >
                            {tCommon('cancel')}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isPending}
                            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold disabled:opacity-50 ${destructive ? 'bg-danger text-danger-foreground' : 'bg-foreground text-background'}`}
                        >
                            {isPending && <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            )}
        </span>
    );
}
