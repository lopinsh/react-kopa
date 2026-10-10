'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Check, X } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { approveSuggestion, rejectSuggestion } from '@/actions/translation-actions';
import { useToast } from '@/hooks/use-toast';

type Props = {
    id: string;
    messageKey: string;
    lang: string;
    current: string;
    value: string;
    by: string;
    when: string;
};

/** One pending text suggestion with Approve / Reject. Both buttons are locked while either is running. */
export default function SuggestionRow({ id, messageKey, lang, current, value, by, when }: Props) {
    const t = useTranslations('admin.translations');
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const { success: toastSuccess, error: toastError } = useToast();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const run = (action: (id: string) => ReturnType<typeof approveSuggestion>, doneKey: 'approved' | 'rejected') => {
        if (isPending) return;
        setError(null);
        startTransition(async () => {
            const res = await action(id);
            if (res.success) {
                toastSuccess(t(doneKey));
                router.refresh();
            } else {
                const text = tErrors.has(res.error) ? tErrors(res.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED');
                setError(text);
                toastError(text);
            }
        });
    };

    return (
        <li className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="break-all font-mono text-xs">{messageKey}</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">{lang}</span>
            </div>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">{t('current')}</dt>
                    <dd lang={lang} className="mt-1 break-words">{current}</dd>
                </div>
                <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">{t('suggested')}</dt>
                    <dd lang={lang} className="mt-1 break-words font-medium">{value}</dd>
                </div>
            </dl>
            <p className="mt-3 text-xs text-foreground-muted">{t('suggestedBy', { name: by, when })}</p>
            {error && <p role="alert" className="mt-2 text-sm font-medium text-red-500">{error}</p>}
            <div className="mt-3 flex flex-wrap justify-end gap-2">
                <button
                    type="button"
                    onClick={() => run(rejectSuggestion, 'rejected')}
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-foreground-muted transition-all hover:bg-surface-elevated disabled:opacity-50"
                >
                    <X className="h-4 w-4" />
                    {t('reject')}
                </button>
                <button
                    type="button"
                    onClick={() => run(approveSuggestion, 'approved')}
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                >
                    <Check className="h-4 w-4" />
                    {t('approve')}
                </button>
            </div>
        </li>
    );
}
