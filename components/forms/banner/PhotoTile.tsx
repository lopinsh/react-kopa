'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import PictureBox from '@/components/ui/PictureBox';

type Props = {
    /** A thumbnail, or the picture-less tile (children). */
    thumb?: string;
    alt?: string;
    /** The photographer, or the tile's label. */
    label: string;
    sub?: string;
    selected: boolean;
    disabled?: boolean;
    onPick: () => void;
    children?: ReactNode;
};

/** One choice in the picker: a 16:9 thumbnail and a short line under it. A button, at least 44 px high. */
export default function PhotoTile({ thumb, alt = '', label, sub, selected, disabled, onPick, children }: Props) {
    const t = useTranslations('banner');
    return (
        <button
            type="button"
            onClick={onPick}
            disabled={disabled}
            aria-pressed={selected}
            aria-label={thumb ? `${alt ? `${alt}. ` : ''}${t('tileCredit', { name: label })}` : label}
            className="group block min-h-11 min-w-0 text-left disabled:opacity-50"
        >
            <PictureBox className={clsx('mb-1 transition-shadow group-hover:shadow-card', selected && 'ring-2 ring-primary')}>
                {thumb ? <Image src={thumb} alt={alt} fill sizes="(min-width: 768px) 220px, 45vw" unoptimized className="object-cover" /> : children}
            </PictureBox>
            <span className="block truncate text-meta text-foreground-muted">{thumb ? t('tileCredit', { name: label }) : label}</span>
            {sub && <span className="block truncate text-meta text-foreground-muted">{sub}</span>}
        </button>
    );
}
