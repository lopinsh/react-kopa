'use client';

import { useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { useGroupContext } from '@/components/providers/GroupProvider';
import { useToast } from '@/hooks/use-toast';
import Gallery from '@/components/ui/Gallery';
import ConfirmPopover from '@/components/ui/ConfirmPopover';
import { removeSectionPictureAction } from '@/actions/section-picture-actions';
import type { SectionView } from '@/lib/services/group.service';

type Picture = SectionView['pictures'][number];

const SIZES_FIRST = '(min-width: 768px) 12rem, 33vw';
const SIZES_LATER = '(min-width: 768px) 18rem, 50vw';

/** A tile: the picture as a button that opens the gallery at its index. `cover` puts "+N" over it. */
function Tile({ pic, label, sizes, cover, onOpen }: { pic: Picture; label: string; sizes: string; cover?: string; onOpen: (button: HTMLButtonElement) => void }) {
    return (
        <button type="button" aria-label={label} aria-haspopup="dialog" onClick={(e) => onOpen(e.currentTarget)} className="relative block aspect-[3/2] w-full overflow-hidden rounded-2xl bg-tint">
            <Image src={pic.url} alt="" fill sizes={sizes} unoptimized loading="lazy" className="object-cover" />
            {cover && <span aria-hidden className="absolute inset-0 grid place-items-center bg-scrim text-title text-photo-ink">{cover}</span>}
        </button>
    );
}

/** The × on a team tile, confirmed at the button. */
function RemoveChip({ id }: { id: string }) {
    const t = useTranslations('group.pictures');
    const tErrors = useTranslations('errors');
    const locale = useLocale();
    const { error } = useToast();
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const remove = () => startTransition(async () => {
        const result = await removeSectionPictureAction(id, locale);
        setOpen(false);
        if (!result.success) error(tErrors.has(result.error) ? tErrors(result.error as 'ACTION_FAILED') : tErrors('ACTION_FAILED'));
    });
    return (
        <div className="absolute right-0 top-0">
            <ConfirmPopover
                isOpen={open}
                onOpenChange={setOpen}
                message={t('removeConfirm')}
                confirmLabel={t('remove')}
                destructive
                isPending={isPending}
                onConfirm={remove}
                renderTrigger={(props) => (
                    <button type="button" {...props} aria-label={t('remove')} disabled={isPending} className="grid size-10 place-items-center disabled:opacity-60">
                        <span className="grid size-8 place-items-center rounded-pill bg-photo-chip text-photo-ink"><X aria-hidden className="size-4" /></span>
                    </button>
                )}
            />
        </div>
    );
}

/**
 * The pictures under a section's text (R28): 3 tiles in the first section, 2 in later ones at a fixed 3:2, the last one "+N" when there
 * are more; a press opens the gallery there. The team sees every picture, each with a ×. No pictures, no row.
 */
export default function PhotoRow({ title, pictures, first }: { title: string; pictures: Picture[]; first: boolean }) {
    const t = useTranslations('group.pictures');
    const g = useGroupContext();
    const [at, setAt] = useState<number | null>(null);
    const opener = useRef<HTMLElement | null>(null);
    if (pictures.length === 0) return null;

    const team = g.user.isAdmin;
    const k = first ? 3 : 2;
    const shown = team ? pictures : pictures.slice(0, k);
    const rest = pictures.length - k;
    const sizes = first ? SIZES_FIRST : SIZES_LATER;
    const open = (i: number) => (button: HTMLButtonElement) => { opener.current = button; setAt(i); };

    return (
        <>
            <div className={clsx('mt-4 grid gap-2 md:gap-3', first ? 'grid-cols-3' : 'grid-cols-2')}>
                {shown.map((pic, i) => {
                    const more = !team && rest > 0 && i === k - 1;
                    const label = more ? t('more', { n: rest + 1 }) : t('open', { n: i + 1 });
                    return (
                        <div key={pic.id} className="relative min-w-0">
                            <Tile pic={pic} label={label} sizes={sizes} cover={more ? `+${rest + 1}` : undefined} onOpen={open(i)} />
                            {team && <RemoveChip id={pic.id} />}
                        </div>
                    );
                })}
            </div>
            {at !== null && (
                <Gallery
                    title={title}
                    items={pictures.map((p, i) => ({ url: p.url, alt: t('alt', { title, n: i + 1 }), credit: p.credit }))}
                    start={at}
                    onClose={() => setAt(null)}
                    returnFocusRef={opener}
                />
            )}
        </>
    );
}
