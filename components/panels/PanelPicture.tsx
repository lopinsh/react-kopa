'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { useOverlayClose } from '@/components/ui/overlay-support';
import { getSmartImageUrl } from '@/lib/image-utils';

/** The panel's picture (a phone sheet's is shorter) or, without one, the category's tone with its icon; the round × sits at its top right. */
export default function PanelPicture({ image, l1Slug }: { image: string | null; l1Slug: string }) {
    const t = useTranslations('common');
    const close = useOverlayClose();
    return (
        <div className="relative h-24 shrink-0 overflow-hidden bg-[color-mix(in_srgb,var(--c)_20%,var(--surface))] text-[var(--c)] md:h-[180px]">
            {image ? (
                <Image src={getSmartImageUrl(image)} alt="" fill sizes="(min-width: 768px) 560px, 100vw" className="object-cover" />
            ) : l1Slug ? (
                <span className="absolute inset-0 grid place-items-center"><CategoryIcon slug={l1Slug} aria-hidden="true" size={28} /></span>
            ) : null}
            <button
                type="button"
                onClick={() => close()}
                aria-label={t('close')}
                className="absolute right-2.5 top-2.5 grid size-10 place-items-center rounded-full bg-surface text-foreground shadow-premium hover:bg-tint"
            >
                <X aria-hidden="true" className="size-5" />
            </button>
        </div>
    );
}
