'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import CheckRow from './CheckRow';
import ListSearch from './ListSearch';
import { useDiscovery } from '@/components/providers/DiscoveryProvider';
import { isVeidsChosen, onlySub, onlyVeids, toggleSub, toggleVeids } from '@/components/discovery/filter/veids-choice';
import { foldText } from '@/lib/text-fold';

type Props = {
    l1Slug: string;
    selected: string[];
    onChange: (tags: string[]) => void;
    /** A click on a name: only that one (a sub-veids in place of its Veids), and the list closes. */
    onPick: (tags: string[]) => void;
    autoFocus: boolean;
};

const byCount = (a: { count: number; title: string }, b: { count: number; title: string }) => b.count - a.count || a.title.localeCompare(b.title);

/**
 * "Veids": the Tēma's Veidi with tick boxes and counts, by count then name, each with its sub-veidi one step in; zero rows faded.
 * The search looks in both: a Veids whose sub-veids matches stays as a bare header over it.
 */
export default function VeidsList({ l1Slug, selected, onChange, onPick, autoFocus }: Props) {
    const t = useTranslations('discovery');
    const { veidi } = useDiscovery();
    const [typed, setTyped] = useState('');

    const needle = foldText(typed.trim());
    const matches = (title: string) => !needle || foldText(title).includes(needle);
    const rows = veidi
        .filter((v) => v.l1Slug === l1Slug)
        .sort(byCount)
        .flatMap((v) => {
            const own = matches(v.title);
            const subs = [...v.subs].sort(byCount).filter((s) => own || matches(s.title));
            return own || subs.length > 0 ? [{ v, own, subs }] : [];
        });

    return (
        <div>
            <ListSearch value={typed} onChange={setTyped} label={t('searchVeids')} autoFocus={autoFocus} />
            <div className="mt-1">
                {rows.map(({ v, own, subs }) => (
                    <div key={v.slug}>
                        {own ? (
                            <CheckRow name={v.title} count={v.count} checked={isVeidsChosen(selected, v)} faded={v.count === 0} onToggle={() => onChange(toggleVeids(selected, v))} onPick={() => onPick(onlyVeids(v))} />
                        ) : (
                            <p className="px-3 py-1.5 text-meta text-foreground-muted">{v.title}</p>
                        )}
                        {subs.length > 0 && (
                            <div role="group" aria-label={t('subtypesOf', { veids: v.title })}>
                                {subs.map((s) => (
                                    <CheckRow key={s.slug} indent name={s.title} count={s.count} checked={selected.includes(s.slug)} faded={s.count === 0} onToggle={() => onChange(toggleSub(selected, v, s.slug))} onPick={() => onPick(onlySub(s.slug))} />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                {rows.length === 0 && <p className="px-3 py-3 text-body-sm italic text-foreground-muted">{t('nothingFound')}</p>}
            </div>
        </div>
    );
}
