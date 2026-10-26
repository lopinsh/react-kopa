'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { useOverlayClose } from '@/components/ui/overlay-support';
import { getSmartImageUrl } from '@/lib/image-utils';
import { IconButton } from '@/components/ui/Button';
import BannerCredit from '@/components/forms/banner/BannerCredit';
import type { BannerCredit as Credit } from '@/lib/validations/banner';

/** The panel's picture (a phone sheet's is shorter, under its close bar) or, without one, the category's tone with its icon; the round × sits at its top right from md. */
export default function PanelPicture({ image, l1Slug, credit }: { image: string | null; l1Slug: string; credit?: Credit }) {
    const t = useTranslations('common');
    const close = useOverlayClose();
    return (
        <>
            {/* Phone: a close bar on top of the full-height sheet; the content scrolls under it. */}
            <div className="sticky top-0 z-10 flex shrink-0 items-center justify-end bg-surface px-3 pb-1 pt-[calc(0.25rem+env(safe-area-inset-top))] md:hidden">
                <IconButton type="button" onClick={() => close()} aria-label={t('close')}>
                    <X aria-hidden="true" className="size-5" />
                </IconButton>
            </div>
            <div className="relative h-24 shrink-0 overflow-hidden cat-tile md:h-[180px]">
                {image ? (
                    <Image src={getSmartImageUrl(image)} alt="" fill sizes="(min-width: 768px) 560px, 100vw" className="object-cover" />
                ) : l1Slug ? (
                    <span className="absolute inset-0 grid place-items-center"><CategoryIcon slug={l1Slug} aria-hidden="true" size={40} /></span>
                ) : null}
                <div className="absolute right-3 top-3 hidden md:block">
                    <IconButton variant="overlay" type="button" onClick={() => close()} aria-label={t('close')}>
                        <X aria-hidden="true" className="size-5" />
                    </IconButton>
                </div>
            </div>
            {image && <BannerCredit credit={credit} className="px-4 pt-1" />}
        </>
    );
}
