'use client';

import { useTranslations } from 'next-intl';
import { CloudOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { UI } from '@/lib/constants';

/** A page or list that failed to load, in plain words (never the error's own text), with a way to try again. */
export default function ErrorState({ onRetry }: { onRetry: () => void }) {
    const t = useTranslations('common.errorState');
    return (
        <div data-ui={UI.errorState}>
            <EmptyState
                icon={CloudOff}
                title={t('title')}
                description={t('text')}
                action={<Button variant="secondary" onClick={onRetry}>{t('retry')}</Button>}
            />
        </div>
    );
}
