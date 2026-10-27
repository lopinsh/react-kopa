'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { IconButton } from '@/components/ui/Button';
import { useToast } from '@/hooks/use-toast';
import { reorderSectionPicturesAction } from '@/actions/section-picture-actions';

type Picture = { id: string; url: string };

/** Picture order of a saved section: ← / → under each thumbnail, saved at once (optimistic, rolled back on failure). Add and remove stay on Informācija. */
export default function SectionPicturesOrder({ sectionId, pictures }: { sectionId: string; pictures: Picture[] }) {
    const t = useTranslations('group.pictures');
    const tErrors = useTranslations('errors');
    const locale = useLocale();
    const { error } = useToast();
    const [order, setOrder] = useState(pictures);
    const [isPending, startTransition] = useTransition();
    if (order.length < 2) return null;

    const move = (from: number, to: number) => {
        const before = order;
        const next = [...order];
        next.splice(to, 0, next.splice(from, 1)[0]);
        setOrder(next);
        startTransition(async () => {
            const result = await reorderSectionPicturesAction(sectionId, next.map((p) => p.id), locale);
            if (result.success) return;
            setOrder(before);
            error(tErrors.has(result.error) ? tErrors(result.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
        });
    };

    return (
        <ul className="flex flex-wrap gap-3">
            {order.map((p, i) => (
                <li key={p.id} className="w-28">
                    <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-tint">
                        <Image src={p.url} alt="" fill sizes="7rem" unoptimized className="object-cover" />
                    </div>
                    <div className="mt-1 flex justify-between">
                        <IconButton size="sm" aria-label={t('moveEarlier')} disabled={isPending || i === 0} onClick={() => move(i, i - 1)}><ArrowLeft aria-hidden className="size-4" /></IconButton>
                        <IconButton size="sm" aria-label={t('moveLater')} disabled={isPending || i === order.length - 1} onClick={() => move(i, i + 1)}><ArrowRight aria-hidden className="size-4" /></IconButton>
                    </div>
                </li>
            ))}
        </ul>
    );
}
