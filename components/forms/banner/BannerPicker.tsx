'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import PictureBox from '@/components/ui/PictureBox';
import PictureFallback from '@/components/ui/PictureFallback';
import AdvancedUrlField from '@/components/forms/banner/AdvancedUrlField';
import BannerCredit from '@/components/forms/banner/BannerCredit';
import BannerPickerDialog from '@/components/forms/banner/BannerPickerDialog';
import { trackUnsplashPick } from '@/actions/unsplash-actions';
import { isUnsplashImageUrl, type UnsplashPick } from '@/lib/banner';
import type { BannerCredit as Credit } from '@/lib/validations/banner';

export type BannerValue = { url: string | null; credit: Credit };

type Props = {
    id: string;
    kind: 'group' | 'event';
    value: BannerValue;
    onChange: (value: BannerValue) => void;
    l1Slug: string | null;
    searchEnabled: boolean;
    /** Site admins only; the server checks it again. */
    canEditUrl: boolean;
    error?: string;
};

/** The banner field (R26): a 16:9 preview, the photo credit, and a dialog to choose (or clear) the picture. */
export default function BannerPicker({ id, kind, value, onChange, l1Slug, searchEnabled, canEditUrl, error }: Props) {
    const t = useTranslations('banner');
    const [open, setOpen] = useState(false);
    const [, startTransition] = useTransition();
    const opener = useRef<HTMLButtonElement>(null);
    const hasImage = Boolean(value.url);
    const wasOpen = useRef(false);

    // Focus returns to the button that opened the dialog, whichever way it closed.
    useEffect(() => {
        if (wasOpen.current && !open) opener.current?.focus();
        wasOpen.current = open;
    }, [open]);

    const pick = (photo: UnsplashPick | null) => {
        setOpen(false);
        if (!photo) return onChange({ url: null, credit: null });
        onChange({ url: photo.url, credit: photo.credit });
        startTransition(async () => { await trackUnsplashPick(photo.id); });
    };

    return (
        <div>
            <p className="mb-1.5 text-button-sm text-foreground">{t('label')}</p>
            <PictureBox className="max-w-page">
                {value.url ? <Image src={value.url} alt="" fill sizes="(min-width: 768px) 760px, 100vw" unoptimized className="object-cover" /> : l1Slug && <PictureFallback l1Slug={l1Slug} />}
            </PictureBox>
            {isUnsplashImageUrl(value.url) && <BannerCredit credit={value.credit} className="mt-1" />}
            <div className="mt-2 flex flex-wrap gap-2">
                <Button ref={opener} id={id} variant="secondary" size="sm" onClick={() => setOpen(true)}>{hasImage ? t('change') : t('choose')}</Button>
                {hasImage && <Button variant="quiet" size="sm" onClick={() => onChange({ url: null, credit: null })}>{t('remove')}</Button>}
            </div>
            {kind === 'event' && <p className="mt-1 text-meta text-foreground-muted">{t('eventHint')}</p>}
            {!canEditUrl && error && <p className="mt-1 text-meta text-danger">{error}</p>}
            {canEditUrl && <AdvancedUrlField id={`${id}-url`} value={value.url ?? ''} onChange={(url) => onChange({ url: url || null, credit: null })} error={error} />}
            {open && <BannerPickerDialog kind={kind} l1Slug={l1Slug} searchEnabled={searchEnabled} selectedUrl={value.url} onPick={pick} onClose={() => setOpen(false)} />}
        </div>
    );
}
