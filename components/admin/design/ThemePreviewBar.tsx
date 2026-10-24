'use client';

import { useTranslations } from 'next-intl';
import { Eye } from 'lucide-react';
import { buttonClass } from '@/components/ui/Button';
import { UI } from '@/lib/constants';
import { useDraftActions } from './useDraftActions';

/** Shown on every page while a site admin has a design preview active (and the admin panel is closed); only that admin ever gets it. */
export default function ThemePreviewBar() {
    const t = useTranslations('admin.design.bar');
    const { isPending, publish, discard } = useDraftActions();

    return (
        <div
            data-ui={UI.banner}
            role="region"
            aria-label={t('label')}
            className="fixed bottom-24 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-2 rounded-2xl bg-surface px-3 py-2 text-body-sm shadow-premium frame md:bottom-4"
        >
            <Eye className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate weight-strong text-foreground">{t('preview')}</span>
            <button type="button" disabled={isPending} onClick={publish} className={buttonClass('primary', '', 'sm')}>
                {t('publish')}
            </button>
            <button type="button" disabled={isPending} onClick={discard} className={buttonClass('quiet', '', 'sm')}>
                {t('discard')}
            </button>
        </div>
    );
}
