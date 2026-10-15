'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import CheckRow from './CheckRow';
import ListSearch from './ListSearch';
import { useDiscovery } from '@/components/providers/DiscoveryProvider';
import { foldText } from '@/lib/text-fold';

type Props = {
    l1Slug: string;
    selected: string[];
    onChange: (tags: string[]) => void;
    /** A click on a Veids name: only that one, and the list closes. */
    onPick: (slug: string) => void;
    autoFocus: boolean;
};

/** "Veids": the Tēma's Veidi with tick boxes and counts, by count then name; zero rows faded. */
export default function VeidsList({ l1Slug, selected, onChange, onPick, autoFocus }: Props) {
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
                {rows.map((v) => <CheckRow key={v.slug} name={v.title} count={v.count} checked={selected.includes(v.slug)} faded={v.count === 0} onToggle={() => toggle(v.slug)} onPick={() => onPick(v.slug)} />)}
                {rows.length === 0 && <p className="px-2.5 py-3 text-sm italic text-foreground-muted">{t('nothingFound')}</p>}
            </div>
        </div>
    );
}
