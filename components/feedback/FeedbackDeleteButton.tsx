'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Trash2 } from 'lucide-react';
import { deleteFeedback } from '@/actions/feedback-actions';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';

type Props = {
    id: string;
    onDeleted: (id: string) => void;
    /** Reports whether the confirm dialog is open, so a parent pop-up can leave Escape to it. */
    onConfirmChange?: (open: boolean) => void;
    className?: string;
};

/** Delete button for a feedback note: asks first, then removes the note for good. */
export default function FeedbackDeleteButton({ id, onDeleted, onConfirmChange, className }: Props) {
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
        <>
            <button type="button" onClick={() => setOpen(true)} disabled={isPending} className={className}>
                <Trash2 className="h-4 w-4" />
                {t('delete')}
            </button>
            {/* Own stacking context so the dialog sits above the note pop-up (z-70). */}
            <div data-feedback-ignore className="absolute z-[80]">
                <ConfirmDialog
                    isOpen={confirming}
                    title={t('deleteTitle')}
                    message={t('deleteMessage')}
                    confirmLabel={t('delete')}
                    destructive
                    isPending={isPending}
                    onConfirm={handleConfirm}
                    onCancel={() => setOpen(false)}
                />
            </div>
        </>
    );
}
