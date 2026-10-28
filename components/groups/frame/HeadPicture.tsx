'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Maximize2, Minimize2 } from 'lucide-react';
import { clsx } from 'clsx';
import { UI } from '@/lib/constants';
import { useGroupContext } from '@/components/providers/GroupProvider';
import Gallery from '@/components/ui/Gallery';
import BannerCredit from '@/components/forms/banner/BannerCredit';
import type { BannerCredit as Credit } from '@/lib/validations/banner';

const SIZES = '(min-width: 1024px) 17.5rem, (min-width: 768px) 30vw, 100vw';

/**
 * The group's picture on Informācija (C5), one image for both widths. From 768 a tile beside the head that fills the head's height and opens
 * the gallery with this one picture; on phones a 3:1 strip under the head that expands to 16:9 in place (`aria-expanded`, Esc folds it).
 * The credit is a chip on the picture, bottom-left, outside the button so its links stay clickable. From 768 it joins the head tile as one card (no gap, inner corners squared).
 */
export default function HeadPicture({ image, credit }: { image: string; credit?: Credit }) {
    const t = useTranslations('group.frame');
    const g = useGroupContext();
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [phone, setPhone] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const mq = window.matchMedia('(max-width: 767px)');
        const sync = () => setPhone(mq.matches);
        sync();
        mq.addEventListener('change', sync);
        return () => mq.removeEventListener('change', sync);
    }, []);

    const label = phone ? t(expanded ? 'hidePicture' : 'showPicture') : t('openPicture');
    const Icon = phone && expanded ? Minimize2 : Maximize2;
    return (
        <div className="relative min-w-0 md:col-start-2 md:row-start-1 lg:col-start-3">
            <button
                ref={buttonRef}
                type="button"
                data-ui={UI.groupPicture}
                aria-label={label}
                aria-expanded={phone ? expanded : undefined}
                aria-haspopup={phone ? undefined : 'dialog'}
                onClick={() => (phone ? setExpanded((v) => !v) : setOpen(true))}
                onKeyDown={(e) => { if (e.key === 'Escape' && phone && expanded) setExpanded(false); }}
                className={clsx(
                    'relative block w-full overflow-hidden rounded-2xl frame bg-tint md:h-full md:rounded-l-none md:min-h-40',
                    expanded ? 'max-md:aspect-[16/9]' : 'max-md:aspect-[3/1]',
                    'motion-safe:max-md:transition-[aspect-ratio] motion-safe:max-md:duration-base',
                    phone && expanded ? 'cursor-zoom-out' : 'cursor-zoom-in',
                )}
            >
                <Image src={image} alt="" fill sizes={SIZES} unoptimized priority className="object-cover" />
                <span aria-hidden className="absolute right-2 top-2 grid size-8 place-items-center rounded-pill bg-[var(--photo-chip)] text-[var(--photo-ink)]">
                    <Icon className="size-4" />
                </span>
            </button>
            {credit && (
                <div className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] rounded-pill bg-[var(--photo-chip)] px-3 py-1 [&_a]:text-inherit [&_p]:text-[var(--photo-ink)]">
                    <BannerCredit credit={credit} />
                </div>
            )}
            {open && <Gallery title={g.name} items={[{ url: image, alt: '', credit: credit ?? null }]} start={0} onClose={() => setOpen(false)} returnFocusRef={buttonRef} />}
        </div>
    );
}
