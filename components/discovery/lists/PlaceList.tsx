'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import ListSearch from './ListSearch';
import { useCities } from '@/components/providers/CitiesContext';
import { useDiscovery } from '@/components/providers/DiscoveryProvider';
import { foldText } from '@/lib/text-fold';

type Props = {
    selected: string[];
    onChange: (cities: string[]) => void;
    autoFocus: boolean;
};

/** "Kur": Visur with its count, a thin line, then the cities with tick boxes and counts (ticked first, then by count). */
export default function PlaceList({ selected, onChange, autoFocus }: Props) {
    const t = useTranslations('discovery');
    const cities = useCities();
    const { counts } = useDiscovery();
    const [typed, setTyped] = useState('');
    const [start] = useState(selected);

    const rows = cities
        .map((c) => ({ ...c, count: counts.byCity[c.slug] ?? 0 }))
        .sort((a, b) => Number(start.includes(b.slug)) - Number(start.includes(a.slug)) || b.count - a.count || a.name.localeCompare(b.name))
        .filter((c) => !typed || foldText(c.name).includes(foldText(typed.trim())));
    const toggle = (slug: string) => onChange(selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug]);

    return (
        <div>
            <ListSearch value={typed} onChange={setTyped} label={t('searchPlace')} autoFocus={autoFocus} />
            {!typed && (
                <>
                    <button
                        type="button"
                        onClick={() => onChange([])}
                        aria-current={selected.length === 0 ? 'true' : undefined}
                        className={clsx('mt-1 flex min-h-11 w-full items-center justify-between rounded-xl px-2.5 text-left text-sm md:min-h-9', selected.length === 0 ? 'bg-tint font-semibold' : 'hover:bg-tint')}
                    >
                        {t('everywhere')}
                        <span className="text-xs text-foreground-muted">{counts.anyPlace}</span>
                    </button>
                    <div className="mx-2.5 my-1 border-t border-border" />
                </>
            )}
            {rows.map((c) => (
                <label key={c.slug} className={clsx('flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl px-2.5 text-sm hover:bg-tint md:min-h-9', c.count === 0 && !selected.includes(c.slug) && 'opacity-45')}>
                    <input type="checkbox" checked={selected.includes(c.slug)} onChange={() => toggle(c.slug)} className="size-4 shrink-0 accent-primary" />
                    <span className="min-w-0 flex-1 truncate">{c.name}</span>
                    <span className="text-xs text-foreground-muted">{c.count}</span>
                </label>
            ))}
            {rows.length === 0 && (
                <div className="px-2.5 py-3 text-sm">
                    <p className="italic text-foreground-muted">{t('nothingFound')}</p>
                    <p className="mt-1.5 text-xs text-foreground-muted">{t('placeHint')}</p>
                </div>
            )}
        </div>
    );
}
