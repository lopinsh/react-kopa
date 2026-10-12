'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Trash2 } from 'lucide-react';
import { deleteFeedback } from '@/actions/feedback-actions';
import ConfirmPopover from '@/components/ui/ConfirmPopover';
import { useToast } from '@/hooks/use-toast';

type Props = {
    id: string;
    onDeleted: (id: string) => void;
    /** Reports whether the confirm pop-over is open, so a parent pop-up can leave Escape to it. */
    onConfirmChange?: (open: boolean) => void;
    className?: string;
    /** Trash icon only (label kept for screen readers) for crowded rows. */
    iconOnly?: boolean;
};

/** Delete button for a feedback note: asks first, then removes the note for good. */
export default function FeedbackDeleteButton({ id, onDeleted, onConfirmChange, className, iconOnly }: Props) {
    const t = useTranslations('feedbackMode');
    const tErrors = useTranslations('errors');
    const { success: toastSuccess, error: toastError } = useToast();
    const [confirming, setConfirming] = useState(false);
    const [isPending, startTransition] = useTransition();

    const setOpen = (open: boolean) => {
        setConfirming(open);
        onConfirmChange?.(open);
    };

    const handleConfirm = () => {
        if (isPending) return;
        startTransition(async () => {
            const res = await deleteFeedback(id);
            // A note that is already gone counts as deleted.
            if (res.success || res.error === 'NOT_FOUND') {
                setOpen(false);
                toastSuccess(t('deleted'));
                onDeleted(id);
            } else {
                setOpen(false);
                toastError(tErrors.has(res.error) ? tErrors(res.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
            }
        });
    };

    return (
        <ConfirmPopover
            isOpen={confirming}
            onOpenChange={setOpen}
            message={t('deleteTitle')}
            confirmLabel={t('delete')}
            destructive
            isPending={isPending}
            onConfirm={handleConfirm}
            renderTrigger={(triggerProps) => (
                <button type="button" {...triggerProps} disabled={isPending} className={className} aria-label={iconOnly ? t('delete') : undefined} title={iconOnly ? t('delete') : undefined}>
                    <Trash2 className="h-4 w-4" />
                    {!iconOnly && t('delete')}
                </button>
            )}
        />
    );
}
