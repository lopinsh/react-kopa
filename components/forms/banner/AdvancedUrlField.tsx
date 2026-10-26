'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/Input';

type Props = {
    id: string;
    value: string;
    onChange: (url: string) => void;
    error?: string;
};

/** Site admins only (server-enforced): a raw image address behind a disclosure. Typing clears the credit (via onChange). */
export default function AdvancedUrlField({ id, value, onChange, error }: Props) {
    const t = useTranslations('banner');
    return (
        <details className="mt-3" open={Boolean(error) || undefined}>
            <summary className="cursor-pointer text-button-sm text-foreground-muted">{t('advanced')}</summary>
            <div className="mt-2 space-y-1">
                <Input id={id} type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={t('urlPlaceholder')} aria-invalid={error ? true : undefined} aria-describedby={`${id}-hint`} />
                <p id={`${id}-hint`} className={error ? 'text-meta text-danger' : 'text-meta text-foreground-muted'}>{error ?? t('advancedHint')}</p>
            </div>
        </details>
    );
}
