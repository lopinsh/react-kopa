'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Trash2 } from 'lucide-react';
import { purgeCompletedFeedback } from '@/actions/feedback-actions';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';

/** "Empty" button for the Completed tab: asks first, then deletes every completed note and its replies. */
export default function FeedbackPurgeButton({ count }: { count: number }) {
    const t = useTranslations('admin.feedback');
    const tErrors = useTranslations('errors');
    const { success: toastSuccess, error: toastError } = useToast();
    const [confirming, setConfirming] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleConfirm = () => {
        if (isPending) return;
        startTransition(async () => {
            const res = await purgeCompletedFeedback();
            setConfirming(false);
            if (res.success) toastSuccess(t('emptied', { count: res.data?.count ?? 0 }));
            else toastError(tErrors.has(res.error) ? tErrors(res.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setConfirming(true)}
                disabled={isPending}
                className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-500/10 disabled:opacity-50"
            >
                <Trash2 className="h-4 w-4" />
                {t('emptyAction')}
            </button>
            <ConfirmDialog
                isOpen={confirming}
                title={t('emptyTitle')}
                message={t('emptyMessage', { count })}
                confirmLabel={t('emptyAction')}
                destructive
                isPending={isPending}
                onConfirm={handleConfirm}
                onCancel={() => setConfirming(false)}
            />
        </>
    );
}
