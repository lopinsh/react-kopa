'use client';

import { useState, useTransition, type RefObject } from 'react';
import { useTranslations } from 'next-intl';
import { createReport } from '@/actions/report-actions';
import { ShieldAlert } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/hooks/use-toast';
import { REPORT_REASONS, isReportReason } from '@/lib/constants';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    targetGroupId?: string;
    targetEventId?: string;
    returnFocusRef?: RefObject<HTMLElement | null>;
};

export default function ReportModal({ isOpen, onClose, targetGroupId, targetEventId, returnFocusRef }: Props) {
    const t = useTranslations('report');
    const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
    const [isPending, startTransition] = useTransition();
    const { success, error: toastError } = useToast();

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (isPending) return;
        startTransition(async () => {
            if (!isReportReason(reason)) return;
            const res = await createReport({ targetGroupId, targetEventId, reason });
            if (res.success) {
                success(t('success'));
                onClose();
            } else {
                toastError(t('error'));
            }
        });
    };

    return (
        <Modal
            onClose={onClose}
            returnFocusRef={returnFocusRef}
            locked={isPending}
            title={<span className="inline-flex items-center gap-2"><ShieldAlert className="size-5" />{t('title')}</span>}
        >
            <div className="space-y-4">
                <p className="text-sm text-foreground-muted leading-relaxed">
                    {t('description')}
                </p>

                <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full cursor-pointer rounded-xl border border-border bg-surface-elevated px-4 py-3 outline-none focus:border-danger/40 transition-all text-sm font-medium text-foreground"
                >
                    {REPORT_REASONS.map((value) => (
                        <option key={value} value={value}>{t(`reason${value}`)}</option>
                    ))}
                </select>
            </div>

            <div className="mt-8 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isPending}
                    className="rounded-xl px-5 py-2.5 text-sm font-bold text-foreground-muted hover:bg-surface-elevated transition-all disabled:opacity-50"
                >
                    {t('cancel')}
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-full bg-danger px-5 py-2.5 text-sm font-bold text-danger-foreground shadow-lg shadow-danger/20 transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                    {isPending ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                        t('submit')
                    )}
                </button>
            </div>
        </Modal>
    );
}
