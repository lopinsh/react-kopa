'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Check, X } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { approveSuggestion, rejectSuggestion } from '@/actions/translation-actions';
import { useToast } from '@/hooks/use-toast';
import Button from '@/components/ui/Button';

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

    const run = (action: (id: string, value: string) => ReturnType<typeof approveSuggestion>, doneKey: 'approved' | 'rejected') => {
        if (isPending) return;
        setError(null);
        startTransition(async () => {
            const res = await action(id, value);
            if (res.success) {
                toastSuccess(t(doneKey));
                router.refresh();
            } else {
                // Gone or changed since the page loaded (approved, rejected or replaced elsewhere): show the list as it is now.
                if (res.error === 'NOT_FOUND') router.refresh();
                const text = tErrors.has(res.error) ? tErrors(res.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED');
                setError(text);
                toastError(text);
            }
        });
    };

    return (
        <li className="rounded-2xl line bg-surface p-4 shadow-card">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="break-all font-mono text-meta">{messageKey}</span>
                <span className="rounded-pill bg-primary/10 px-2 py-0.5 text-tag text-primary">{lang}</span>
            </div>
            <dl className="mt-3 grid gap-3 text-body-sm sm:grid-cols-2">
                <div>
                    <dt className="text-tag text-foreground-muted">{t('current')}</dt>
                    <dd lang={lang} className="mt-1 break-words">{current}</dd>
                </div>
                <div>
                    <dt className="text-tag text-foreground-muted">{t('suggested')}</dt>
                    <dd lang={lang} className="mt-1 break-words weight-medium">{value}</dd>
                </div>
            </dl>
            <p className="mt-3 text-meta text-foreground-muted">{t('suggestedBy', { name: by, when })}</p>
            {error && <p role="alert" className="mt-2 text-body-sm text-danger">{error}</p>}
            <div className="mt-3 flex flex-wrap justify-end gap-2">
                <button
                    type="button"
                    onClick={() => run(rejectSuggestion, 'rejected')}
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-xl px-4 py-2 text-button-sm text-foreground-muted transition-colors hover:bg-surface-elevated disabled:opacity-50"
                >
                    <X className="size-4" />
                    {t('reject')}
                </button>
                <Button
                    type="button"
                    onClick={() => run(approveSuggestion, 'approved')}
                    disabled={isPending}
                >
                    <Check className="size-4" />
                    {t('approve')}
                </Button>
            </div>
        </li>
    );
}
