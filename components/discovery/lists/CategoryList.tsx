'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { LayoutGrid, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import ListSearch from './ListSearch';
import { CategoryDisc } from '@/components/ui/CategoryIcon';
import { useDiscovery } from '@/components/providers/DiscoveryProvider';
import { useDiscoveryNav } from '@/hooks/useDiscoveryNav';
import { discoveryHref } from '@/lib/discovery-params';
import { foldText } from '@/lib/text-fold';

type Props = {
    folded?: boolean;
    /** A choice was made (the drop-down closes). */
    onChoose?: () => void;
    /** Nothing matches the typed word: the owner opens the suggestion dialog (it must outlive this list). */
    onSuggest: (word: string) => void;
    autoFocus?: boolean;
};

const ROW = 'flex min-h-11 w-full items-center gap-3 rounded-xl px-2 text-left text-body-sm md:min-h-9';

/** The categories as links: "Visas", the 15 Tēmas (alphabetical, with counts), and when something is typed, matching Veidi. Used by the drawer and the Tēma drop-down. */
export default function CategoryList({ folded = false, onChoose, onSuggest, autoFocus = false }: Props) {
    const t = useTranslations('discovery');
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
    const allCurrent = !params.category;
    const row = (current: boolean) => clsx(ROW, current ? 'bg-tint weight-strong' : 'hover:bg-tint');

    return (
        <nav aria-label={t('categories')}>
            {!folded && <ListSearch value={typed} onChange={setTyped} label={t('searchCategory')} autoFocus={autoFocus} />}
            <ul className={clsx('mt-1', folded && 'flex flex-col items-center gap-1')}>
                {!word && (
                    <li>
                        <Link href={discoveryHref(params, { category: null, tags: [] })} scroll={false} onClick={onChoose} aria-current={allCurrent ? 'true' : undefined} title={folded ? `${t('allCategories')} · ${counts.anyTopic}` : undefined} aria-label={folded ? t('allCategories') : undefined} className={clsx(row(allCurrent), folded && 'size-9 min-h-0 justify-center px-0')}>
                            <span className="grid size-[26px] shrink-0 place-items-center rounded-full bg-tint text-foreground-muted"><LayoutGrid aria-hidden="true" className="size-3.5" /></span>
                            {!folded && <><span className="min-w-0 flex-1 truncate">{t('allCategories')}</span><span className="text-meta text-foreground-muted">{counts.anyTopic}</span></>}
                        </Link>
                    </li>
                )}
                {rows.map((c) => {
                    const current = params.category === c.slug;
                    return (
                        <li key={c.slug} className={c.count === 0 && !current ? 'opacity-45' : undefined}>
                            <Link href={discoveryHref(params, { category: c.slug, tags: [] })} scroll={false} onClick={onChoose} aria-current={current ? 'true' : undefined} title={folded ? `${c.title} · ${c.count}` : undefined} aria-label={folded ? c.title : undefined} className={clsx(row(current), folded && 'size-9 min-h-0 justify-center px-0')}>
                                <CategoryDisc slug={c.slug} color={c.color} />
                                {!folded && <><span className="min-w-0 flex-1 truncate">{c.title}</span><span className="text-meta text-foreground-muted">{c.count}</span></>}
                            </Link>
                        </li>
                    );
                })}
                {veidiRows.map((v) => (
                    <li key={v.slug} className={v.count === 0 ? 'opacity-45' : undefined}>
                        <Link href={discoveryHref(params, { category: v.l1Slug, tags: [v.slug] })} scroll={false} onClick={onChoose} className={row(false)}>
                            {v.parent && <CategoryDisc slug={v.parent.slug} color={v.parent.color} />}
                            <span className="min-w-0 flex-1 truncate">{v.parent?.title} → {v.title}</span>
                            <span className="text-meta text-foreground-muted">{v.count}</span>
                        </Link>
                    </li>
                ))}
            </ul>
            {word && rows.length === 0 && veidiRows.length === 0 && (
                <div className="px-2 py-2 text-body-sm">
                    <p className="italic text-foreground-muted">{t('nothingFound')}</p>
                    <button type="button" onClick={() => { onSuggest(word); onChoose?.(); }} className={clsx(ROW, 'mt-1 weight-medium text-primary hover:bg-tint')}>
                        <Plus aria-hidden="true" className="size-4 shrink-0" />
                        <span className="min-w-0">{t('suggestCategory', { word })}</span>
                    </button>
                </div>
            )}
        </nav>
    );
}
