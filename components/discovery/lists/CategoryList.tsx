'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { clsx } from 'clsx';
import ListSearch from './ListSearch';
import CategoryRow from './CategoryRow';
import { useDiscovery } from '@/components/providers/DiscoveryProvider';
import { useDiscoveryNav } from '@/hooks/useDiscoveryNav';
import { discoveryHref } from '@/lib/discovery-params';
import { foldText } from '@/lib/text-fold';

type Props = {
    folded?: boolean;
    /** `drawer`: the side column (quiet search). `menu`: the Tēma drop-down (edged search). */
    place?: 'drawer' | 'menu';
    /** A choice was made (the drop-down closes). */
    onChoose?: () => void;
    /** Nothing matches the typed word: the owner opens the suggestion dialog (it must outlive this list). */
    onSuggest: (word: string) => void;
    autoFocus?: boolean;
};

/** The category index (R19): "Visas", the 15 Tēmas (alphabetical, with counts), and when something is typed, matching Tēmas and Veidi. Used by the drawer, its folded rail and the Tēma drop-down. */
export default function CategoryList({ folded = false, place = 'menu', onChoose, onSuggest, autoFocus = false }: Props) {
    const t = useTranslations('discovery');
    const tIndex = useTranslations('discovery.topicIndex');
    const { categories, veidi, counts } = useDiscovery();
    const { params } = useDiscoveryNav();
    const [typed, setTyped] = useState('');

    // The folded rail has no search field, so a word typed before folding does not narrow it.
    const word = folded ? '' : typed.trim();
    const needle = foldText(word);
    const rows = categories.filter((c) => !word || foldText(c.title).includes(needle));
    const veidiRows = word
        ? veidi.filter((v) => foldText(v.title).includes(needle)).map((v) => ({ ...v, parent: categories.find((c) => c.slug === v.l1Slug) })).filter((v) => v.parent)
        : [];

    return (
        <nav aria-label={tIndex('heading')}>
            {!folded && (place === 'drawer'
                ? <div className="mb-4 mt-3 flex h-9 items-center"><ListSearch variant="quiet" value={typed} onChange={setTyped} label={tIndex('search')} autoFocus={autoFocus} /></div>
                : <ListSearch variant="field" value={typed} onChange={setTyped} label={tIndex('search')} autoFocus={autoFocus} />)}
            <ul className={clsx(folded ? 'mt-2 flex flex-col items-start gap-1' : 'mb-1')}>
                {!word && (
                    <>
                        <li>
                            <CategoryRow href={discoveryHref(params, { category: null, tags: [] })} title={t('allCategories')} count={counts.anyTopic} current={!params.category} folded={folded} onChoose={onChoose} />
                        </li>
                        <li role="presentation" aria-hidden="true" className={clsx('my-1 border-t border-dashed border-border', folded ? 'mx-1 w-8' : 'mx-2')} />
                    </>
                )}
                {rows.map((c) => (
                    <li key={c.slug}>
                        <CategoryRow href={discoveryHref(params, { category: c.slug, tags: [] })} title={c.title} count={c.count} slug={c.slug} color={c.color} current={params.category === c.slug} folded={folded} needle={needle} onChoose={onChoose} />
                    </li>
                ))}
                {veidiRows.length > 0 && (
                    <li aria-hidden="true" className="px-2 pb-1 pt-3 text-tag uppercase text-foreground-muted">{tIndex('veidi')}</li>
                )}
                {veidiRows.map((v) => v.parent && (
                    <li key={v.slug}>
                        <CategoryRow href={discoveryHref(params, { category: v.l1Slug, tags: [v.slug] })} title={v.title} count={v.count} slug={v.parent.slug} color={v.parent.color} parentTitle={v.parent.title} needle={needle} onChoose={onChoose} />
                    </li>
                ))}
            </ul>
            {word && rows.length === 0 && veidiRows.length === 0 && (
                <>
                    <p className="px-2 pb-1 pt-2 text-body-sm text-foreground-muted">{t('nothingFound')}</p>
                    <button /* ui-allow: row-shaped suggestion, same box as the category rows */
                        type="button"
                        onClick={() => { onSuggest(word); onChoose?.(); }}
                        className="flex min-h-11 w-full items-start gap-3 rounded-item px-2 py-2 text-left text-body-sm weight-strong text-primary transition-colors duration-quick hover:bg-tint focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary md:min-h-[var(--list-row)]"
                    >
                        <Plus aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span className="min-w-0">{tIndex('suggest', { word })}</span>
                    </button>
                </>
            )}
        </nav>
    );
}
