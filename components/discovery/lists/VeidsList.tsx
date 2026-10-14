'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import ListSearch from './ListSearch';
import { useDiscovery } from '@/components/providers/DiscoveryProvider';
import { foldText } from '@/lib/text-fold';

type Props = {
    l1Slug: string;
    selected: string[];
    onChange: (tags: string[]) => void;
    autoFocus: boolean;
};

/** "Veids": the Tēma's Veidi with tick boxes and counts, by count then name; zero rows faded. */
export default function VeidsList({ l1Slug, selected, onChange, autoFocus }: Props) {
    const t = useTranslations('discovery');
    const { veidi } = useDiscovery();
    const [typed, setTyped] = useState('');

    const rows = veidi
        .filter((v) => v.l1Slug === l1Slug)
        .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))
        .filter((v) => !typed || foldText(v.title).includes(foldText(typed.trim())));
    const toggle = (slug: string) => onChange(selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug]);

    return (
        <div>
            <ListSearch value={typed} onChange={setTyped} label={t('searchVeids')} autoFocus={autoFocus} />
            <div className="mt-1">
                {rows.map((v) => (
                    <label key={v.slug} className={clsx('flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl px-2.5 text-sm hover:bg-tint md:min-h-9', v.count === 0 && !selected.includes(v.slug) && 'opacity-45')}>
                        <input type="checkbox" checked={selected.includes(v.slug)} onChange={() => toggle(v.slug)} className="size-4 shrink-0 accent-primary" />
                        <span className="min-w-0 flex-1 truncate">{v.title}</span>
                        <span className="text-xs text-foreground-muted">{v.count}</span>
                    </label>
                ))}
                {rows.length === 0 && <p className="px-2.5 py-3 text-sm italic text-foreground-muted">{t('nothingFound')}</p>}
            </div>
        </div>
    );
}
