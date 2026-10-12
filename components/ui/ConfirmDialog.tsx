'use client';

import { useId, type RefObject } from 'react';
import { useTranslations } from 'next-intl';
import Modal from '@/components/ui/Modal';

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
    /** Menu trigger to refocus on close when the opener (a menu item) no longer exists. */
    returnFocusRef?: RefObject<HTMLElement | null>;
};

/** In-app replacement for window.confirm (which blocks the page and can't be styled). */
export default function ConfirmDialog({ isOpen, title, message, confirmLabel, destructive = false, isPending = false, onConfirm, onCancel, returnFocusRef }: Props) {
    const tCommon = useTranslations('common');
    const messageId = useId();

    if (!isOpen) return null;

    return (
        <Modal
            role="alertdialog"
            variant="card"
            size="sm"
            title={title}
            titleClassName="text-lg font-black tracking-tight text-foreground"
            headerClassName="mb-2"
            describedBy={messageId}
            hideClose
            locked={isPending}
            onClose={onCancel}
            returnFocusRef={returnFocusRef}
        >
            <p id={messageId} className="text-sm font-medium leading-relaxed text-foreground-muted">{message}</p>
            <div className="mt-6 flex items-center justify-end gap-3">
                {/* Focus starts on the safe choice. */}
                <button
                    data-autofocus
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
        </Modal>
    );
}
