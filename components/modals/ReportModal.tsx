'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { createReport } from '@/actions/report-actions';
import { X, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { REPORT_REASONS, isReportReason, UI } from '@/lib/constants';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    targetGroupId?: string;
    targetEventId?: string;
};

export default function ReportModal({ isOpen, onClose, targetGroupId, targetEventId }: Props) {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div data-ui={UI.modal} className="w-full max-w-md rounded-3xl bg-surface p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2 text-red-500">
                        <ShieldAlert className="h-5 w-5" />
                        {t('title')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-foreground-muted hover:bg-surface-elevated transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-foreground-muted leading-relaxed">
                        {t('description')}
                    </p>

                    <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full cursor-pointer rounded-xl border border-border bg-surface-elevated px-4 py-3 outline-none focus:border-red-500/50 transition-all text-sm font-medium text-foreground"
                    >
                        {REPORT_REASONS.map((value) => (
                            <option key={value} value={value}>{t(`reason${value}`)}</option>
                        ))}
                    </select>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isPending}
                        className="rounded-xl px-5 py-2.5 text-sm font-bold text-foreground-muted hover:bg-surface-elevated transition-all disabled:opacity-50"
                    >
                        {t('cancel')}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                        {isPending ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            t('submit')
                        )}
                    </button>
                </div>
            </div>
        </div >
    );
}
