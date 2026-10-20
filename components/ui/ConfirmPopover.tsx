'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { UI } from '@/lib/constants';

type TriggerProps = {
    ref: (el: HTMLButtonElement | null) => void;
    onClick: () => void;
    'aria-haspopup': 'dialog';
    'aria-expanded': boolean;
    'aria-controls': string | undefined;
};

type Anchor =
    /** The pop-over's own button: spread the given props onto it. */
    | { renderTrigger: (props: TriggerProps) => ReactNode; anchorRef?: never }
    /** A menu's trigger (the menu item closes with the menu): position from it, focus returns to it. */
    | { anchorRef: RefObject<HTMLElement | null>; renderTrigger?: never };

type Props = Anchor & {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    message: string;
    confirmLabel: string;
    /** Red confirm button for things that can't be undone. */
    destructive?: boolean;
    isPending?: boolean;
    onConfirm: () => void;
};

const GAP = 6;
const WIDTH = 256;

/** A small confirmation next to the button that asked for it: no backdrop, the page stays readable. Escape or a click outside cancels. */
export default function ConfirmPopover({ isOpen, onOpenChange, message, confirmLabel, destructive = false, isPending = false, onConfirm, renderTrigger, anchorRef }: Props) {
    const tCommon = useTranslations('common');
    const panelId = useId();
    const wrapperRef = useRef<HTMLSpanElement>(null);
    const [triggerEl, setTriggerEl] = useState<HTMLButtonElement | null>(null);
    const [pos, setPos] = useState<{ left: number; top?: number; bottom?: number } | null>(null);
    const panelRef = useFocusTrap<HTMLDivElement>(isOpen && pos !== null);
    const wasOpen = useRef(false);

    useClickOutside(wrapperRef, () => { if (!isPending) onOpenChange(false); }, isOpen);

    // Fixed position from the button's rectangle, so no scrolling parent can clip it.
    useLayoutEffect(() => {
        if (!isOpen) return;
        const rect = (anchorRef ? anchorRef.current : triggerEl)?.getBoundingClientRect();
        if (!rect) return;
        const left = Math.min(Math.max(8, rect.right - WIDTH), window.innerWidth - WIDTH - 8);
        const below = rect.bottom + GAP + 120 <= window.innerHeight;
        // Above the button its bottom edge is pinned, so a longer message grows upwards instead of covering the button.
        setPos(below ? { left, top: rect.bottom + GAP } : { left, bottom: window.innerHeight - rect.top + GAP });
    }, [isOpen, anchorRef, triggerEl]);

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
        if (wasOpen.current && !isOpen) (anchorRef ? anchorRef.current : triggerEl)?.focus();
        wasOpen.current = isOpen;
    }, [isOpen, anchorRef, triggerEl]);

    return (
        <span ref={wrapperRef} className="inline-flex">
            {renderTrigger?.({
                ref: setTriggerEl,
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
                    data-ui={UI.confirmPopover}
                    style={{ ...pos, width: WIDTH }}
                    className="fixed z-[90] rounded-xl line bg-surface p-3 text-left shadow-premium motion-safe:animate-fade"
                >
                    <p className="text-body-sm text-foreground">{message}</p>
                    <div className="mt-3 flex items-center justify-end gap-2">
                        <Button variant="secondary" size="sm" data-autofocus onClick={() => onOpenChange(false)} disabled={isPending}>{tCommon('cancel')}</Button>
                        <Button variant={destructive ? 'danger' : 'primary'} size="sm" onClick={onConfirm} disabled={isPending}>
                            {isPending && <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                            {confirmLabel}
                        </Button>
                    </div>
                </div>
            )}
        </span>
    );
}
