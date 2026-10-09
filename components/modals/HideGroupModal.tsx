'use client';

import { useState, useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { X, EyeOff } from 'lucide-react';
import { hideGroup } from '@/actions/moderation-actions';
import { suspendReportedGroup } from '@/actions/admin-actions';
import { hideGroupSchema } from '@/lib/validations/moderation';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
    /** When hiding from a report: closes that report as well. */
    reportId?: string;
    onHidden?: () => void;
};

export default function HideGroupModal({ isOpen, onClose, groupId, reportId, onHidden }: Props) {
    const t = useTranslations('moderation');
    const tErrors = useTranslations('errors');
    const locale = useLocale();
    const router = useRouter();
    const [reason, setReason] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (isPending) return;
        if (!hideGroupSchema.safeParse({ reason }).success) {
            setError(tErrors('VALIDATION_FAILED'));
            return;
        }
        setError(null);
        startTransition(async () => {
            const res = reportId
                ? await suspendReportedGroup(reportId, groupId, reason, locale)
                : await hideGroup(groupId, reason, locale);
            if (res.success) {
                onHidden?.();
                onClose();
                router.refresh();
            } else {
                setError(tErrors(res.error));
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl bg-surface p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-xl font-bold text-red-500">
                        <EyeOff className="h-5 w-5" />
                        {t('hideTitle')}
                    </h2>
                    <button onClick={onClose} className="rounded-full p-2 text-foreground-muted hover:bg-surface-elevated transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <p className="mb-4 text-sm leading-relaxed text-foreground-muted">{t('hideDescription')}</p>

                <label className="mb-1 block text-sm font-semibold text-foreground" htmlFor="hide-reason">{t('reasonLabel')}</label>
                <textarea
                    id="hide-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder={t('reasonPlaceholder')}
                    className="w-full resize-none rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm text-foreground outline-none focus:border-red-500/50"
                />
                <p className="mt-1 text-xs text-foreground-muted">{t('reasonHint')}</p>
                {error && <p className="mt-2 text-sm font-medium text-red-500">{error}</p>}

                <div className="mt-6 flex justify-end gap-3">
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
                        className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-700 disabled:opacity-50"
                    >
                        {isPending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : t('confirmHide')}
                    </button>
                </div>
            </div>
        </div>
    );
}
