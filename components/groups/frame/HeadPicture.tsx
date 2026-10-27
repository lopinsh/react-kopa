'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Maximize2, Minimize2 } from 'lucide-react';
import { clsx } from 'clsx';
import { UI } from '@/lib/constants';
import { useGroupContext } from '@/components/providers/GroupProvider';
import Modal from '@/components/ui/Modal';
import BannerCredit from '@/components/forms/banner/BannerCredit';
import type { BannerCredit as Credit } from '@/lib/validations/banner';

const SIZES = '(min-width: 1024px) 17.5rem, (min-width: 768px) 30vw, 100vw';

/**
 * The group's picture on Informācija (C5), one image for both widths. From 768 a tile beside the head that fills the head's height and opens
 * the whole picture in a dialog; on phones a 3:1 strip under the head that expands to 16:9 in place (`aria-expanded`, Esc folds it).
 * The credit sits under it. The gallery is R28.
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
        <div className="grid min-w-0 content-start gap-1 md:col-start-2 md:row-start-1 lg:col-start-3">
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
                    'relative block w-full overflow-hidden rounded-2xl frame bg-tint max-md:aspect-[3/1] md:h-full md:min-h-40',
                    expanded && 'max-md:aspect-video',
                    'motion-safe:max-md:transition-[aspect-ratio] motion-safe:max-md:duration-base',
                    phone && expanded ? 'cursor-zoom-out' : 'cursor-zoom-in',
                )}
            >
                <Image src={image} alt="" fill sizes={SIZES} unoptimized priority className="object-cover" />
                <span aria-hidden className="absolute right-2 top-2 grid size-8 place-items-center rounded-pill bg-[var(--photo-chip)] text-[var(--photo-ink)]">
                    <Icon className="size-4" />
                </span>
            </button>
            <BannerCredit credit={credit} className="max-md:text-right" />
            {open && (
                <Modal onClose={() => setOpen(false)} title={g.name} size="4xl" returnFocusRef={buttonRef}>
                    <div className="grid gap-2">
                        {/* The whole picture at its natural ratio. */}
                        <Image src={image} alt="" width={1600} height={1200} sizes="100vw" unoptimized className="h-auto max-h-[75vh] w-full rounded-2xl object-contain" />
                        <BannerCredit credit={credit} />
                    </div>
                </Modal>
            )}
        </div>
    );
}
