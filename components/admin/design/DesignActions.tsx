'use client';

import { Fragment } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import type { DesignPart } from '@/lib/constants';

type Props = {
    busy: boolean;
    blockedParts: DesignPart[];
    onPreview: () => void;
    onPublish: () => void;
    onReset: () => void;
    onShowPart: (part: DesignPart) => void;
};

/** Preview for yourself, publish for everyone, reset. Saving waits while a colour fails the contrast check. */
export default function DesignActions({ busy, blockedParts, onPreview, onPublish, onReset, onShowPart }: Props) {
    const t = useTranslations('admin.design');
    const blocked = blockedParts.length > 0;
    return (
        <div className="mt-8 space-y-3">
            {blocked && (
                <p role="status" className="text-meta text-warning">
                    {t('contrast.blocked')}{' '}
                    {blockedParts.map((p, i) => (
                        <Fragment key={p}>
                            {i > 0 && ', '}
                            <button type="button" className="underline underline-offset-4" onClick={() => onShowPart(p)}>{t(`parts.${p}`)}</button>
                        </Fragment>
                    ))}
                </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
                <Button variant="secondary" disabled={busy || blocked} onClick={onPreview}>{t('savePreview')}</Button>
                <Button disabled={busy || blocked} onClick={onPublish}>{t('publish')}</Button>
                <Button variant="quiet" className="sm:ml-auto" disabled={busy} onClick={onReset}>{t('reset')}</Button>
            </div>
            <p className="text-meta text-foreground-muted">{t('previewHint')}</p>
        </div>
    );
}
