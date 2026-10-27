'use client';

import { useEffect, useState, type KeyboardEvent, type RefObject } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { IconButton } from '@/components/ui/Button';
import BannerCredit from '@/components/forms/banner/BannerCredit';
import type { BannerCredit as Credit } from '@/lib/validations/banner';

export type GalleryItem = { url: string; alt: string; credit: Credit };

type Props = {
    title: string;
    items: GalleryItem[];
    start: number;
    onClose: () => void;
    /** The tile that opened it: focus goes back there. */
    returnFocusRef?: RefObject<HTMLElement | null>;
};

/**
 * One dialog for every picture set (section pictures, the group picture): the whole picture at its natural ratio, its credit,
 * and for more than one item the ← / → buttons and keys (they wrap) with "n / N". Only the two neighbours are preloaded.
 */
export default function Gallery({ title, items, start, onClose, returnFocusRef }: Props) {
    const t = useTranslations('gallery');
    const total = items.length;
    const [idx, setIdx] = useState(Math.min(Math.max(start, 0), total - 1));
    const many = total > 1;
    const item = items[idx];

    useEffect(() => {
        if (!many) return;
        for (const n of [idx - 1, idx + 1]) {
            const img = new window.Image();
            img.src = items[(n + total) % total].url;
        }
    }, [idx, many, items, total]);

    const go = (step: number) => setIdx((i) => (i + step + total) % total);
    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (!many || e.defaultPrevented) return;
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    };
    if (!item) return null;

    return (
        <Modal onClose={onClose} title={title} size="4xl" returnFocusRef={returnFocusRef}>
            <div className="grid gap-2" onKeyDown={onKeyDown}>
                <Image src={item.url} alt={item.alt} width={1600} height={1200} sizes="100vw" unoptimized className="h-auto max-h-[75vh] w-full rounded-2xl object-contain" />
                <BannerCredit credit={item.credit} />
                {many && (
                    <div className="flex items-center justify-center gap-4">
                        <IconButton variant="secondary" size="sm" aria-label={t('prev')} onClick={() => go(-1)}><ChevronLeft aria-hidden className="size-4" /></IconButton>
                        <p aria-live="polite" className="text-meta text-foreground-muted">{t('counter', { n: idx + 1, total })}</p>
                        <IconButton variant="secondary" size="sm" aria-label={t('next')} onClick={() => go(1)}><ChevronRight aria-hidden className="size-4" /></IconButton>
                    </div>
                )}
            </div>
        </Modal>
    );
}
