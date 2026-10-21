'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Eye } from 'lucide-react';
import { discardPreviewTheme, publishPreviewTheme } from '@/actions/theme-actions';
import { buttonClass } from '@/components/ui/Button';
import { useToast } from '@/hooks/use-toast';
import { UI } from '@/lib/constants';

/** Shown on every page while a site admin has a design preview active; only that admin ever gets it. */
export default function ThemePreviewBar() {
    const t = useTranslations('admin.design.bar');
    const tErrors = useTranslations('errors');
    const router = useRouter();
    const { success: toastSuccess, error: toastError } = useToast();
    const [isPending, startTransition] = useTransition();

    const run = (action: typeof publishPreviewTheme, doneKey: 'published' | 'discarded') => {
        if (isPending) return;
        startTransition(async () => {
            const res = await action();
            if (res.success) {
                toastSuccess(t(doneKey));
                router.refresh();
            } else {
                toastError(tErrors.has(res.error) ? tErrors(res.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
            }
        });
    };

    return (
        <div
            data-ui={UI.banner}
            role="region"
            aria-label={t('label')}
            className="fixed bottom-24 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-2 rounded-2xl bg-surface px-3 py-2 text-body-sm shadow-premium frame md:bottom-4"
        >
            <Eye className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate weight-strong text-foreground">{t('preview')}</span>
            <button
                type="button"
                disabled={isPending}
                onClick={() => run(publishPreviewTheme, 'published')}
                className={buttonClass('primary', '', 'sm')}
            >
                {t('publish')}
            </button>
            <button
                type="button"
                disabled={isPending}
                onClick={() => run(discardPreviewTheme, 'discarded')}
                className={buttonClass('quiet', '', 'sm')}
            >
                {t('discard')}
            </button>
        </div>
    );
}
