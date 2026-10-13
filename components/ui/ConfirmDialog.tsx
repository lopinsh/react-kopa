'use client';

import { useId, type RefObject } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
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

/** In-app dialog for steps that cannot be undone (undoable ones use ConfirmPopover). */
export default function ConfirmDialog({ isOpen, title, message, confirmLabel, destructive = false, isPending = false, onConfirm, onCancel, returnFocusRef }: Props) {
    const tCommon = useTranslations('common');
    const messageId = useId();

    if (!isOpen) return null;

    return (
        <Modal
            role="alertdialog"
            size="sm"
            title={title}
            describedBy={messageId}
            hideClose
            locked={isPending}
            onClose={onCancel}
            returnFocusRef={returnFocusRef}
        >
            <p id={messageId} className="text-sm text-foreground-muted">{message}</p>
            <div className="mt-4 flex justify-end gap-2">
                {/* Focus starts on the safe choice. */}
                <Button variant="secondary" size="sm" data-autofocus onClick={onCancel} disabled={isPending}>{tCommon('cancel')}</Button>
                <Button variant={destructive ? 'danger' : 'primary'} size="sm" onClick={onConfirm} disabled={isPending}>
                    {isPending && <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                    {confirmLabel}
                </Button>
            </div>
        </Modal>
    );
}
