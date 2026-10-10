'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    /** Red button for things that can't be undone. */
    destructive?: boolean;
    isPending?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

/** In-app replacement for window.confirm (which blocks the page and can't be styled). */
export default function ConfirmDialog({ isOpen, title, message, confirmLabel, destructive = false, isPending = false, onConfirm, onCancel }: Props) {
    const tCommon = useTranslations('common');
    const cancelRef = useRef<HTMLButtonElement>(null);

    // Focus the safe choice on open and give focus back to whatever opened the dialog on close.
    useEffect(() => {
        if (!isOpen) return;
        const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        cancelRef.current?.focus();
        return () => previous?.focus();
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !isPending) onCancel(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, isPending, onCancel]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
            <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-message" className="w-full max-w-sm rounded-[2rem] border border-border/50 bg-surface p-6 shadow-2xl">
                <h2 id="confirm-dialog-title" className="text-lg font-black tracking-tight text-foreground">{title}</h2>
                <p id="confirm-dialog-message" className="mt-2 text-sm font-medium leading-relaxed text-foreground-muted">{message}</p>
                <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                        ref={cancelRef}
                        type="button"
                        onClick={onCancel}
                        disabled={isPending}
                        className="rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-foreground-muted transition-all hover:text-foreground disabled:opacity-50"
                    >
                        {tCommon('cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isPending}
                        className={`flex items-center gap-2 rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-[0.15em] shadow-xl transition-all active:scale-95 disabled:opacity-50 ${destructive ? 'bg-red-500 text-white' : 'bg-foreground text-background'}`}
                    >
                        {isPending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
