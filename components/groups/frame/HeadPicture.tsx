'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Maximize2, Minimize2 } from 'lucide-react';
import { clsx } from 'clsx';
import { UI } from '@/lib/constants';
import { useGroupContext } from '@/components/providers/GroupProvider';
import Gallery from '@/components/ui/Gallery';
import BannerCredit from '@/components/forms/banner/BannerCredit';
import type { BannerCredit as Credit } from '@/lib/validations/banner';

/**
 * The group's picture on Informācija (C5, K-154, K-155), one image in two places. `strip` (under 1024): a 3:1 strip under the head that expands to 16:9
 * in place (`aria-expanded`, Esc folds it). `box` (from 1024): the first box of the side column, a rounded frame that opens the gallery with this one picture.
 * The credit is a chip on the picture, bottom-left, outside the button so its links stay clickable.
 */
export default function HeadPicture({ image, credit, variant }: { image: string; credit?: Credit; variant: 'strip' | 'box' }) {
    const t = useTranslations('group.frame');
    const g = useGroupContext();
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const strip = variant === 'strip';

    const label = strip ? t(expanded ? 'hidePicture' : 'showPicture') : t('openPicture');
    const Icon = strip && expanded ? Minimize2 : Maximize2;
    return (
        <div className="relative min-w-0">
            <button
                ref={buttonRef}
                type="button"
                data-ui={UI.groupPicture}
                aria-label={label}
                aria-expanded={strip ? expanded : undefined}
                aria-haspopup={strip ? undefined : 'dialog'}
                onClick={() => (strip ? setExpanded((v) => !v) : setOpen(true))}
                onKeyDown={(e) => { if (e.key === 'Escape' && strip && expanded) setExpanded(false); }}
                className={clsx(
                    'relative block w-full overflow-hidden rounded-2xl frame bg-tint',
                    strip ? (expanded ? 'aspect-[16/9] cursor-zoom-out' : 'aspect-[3/1] cursor-zoom-in') : 'aspect-[4/3] cursor-zoom-in',
                    strip && 'motion-safe:transition-[aspect-ratio] motion-safe:duration-base',
                )}
            >
                <Image src={image} alt="" fill sizes={strip ? '100vw' : '17.5rem'} unoptimized priority={strip} className="object-cover" />
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
