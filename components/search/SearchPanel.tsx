'use client';

import type { KeyboardEvent, RefObject } from 'react';
import { useTranslations } from 'next-intl';
import SearchChips from './SearchChips';
import RecentSearches from './RecentSearches';
import SearchResults from './SearchResults';
import { searchItems } from './search-items';
import { SEARCH_MIN_CHARS, UI } from '@/lib/constants';
import type { SearchModel } from '@/hooks/useSearch';

type Props = {
    search: SearchModel;
    mode: 'desktop' | 'phone';
    inputRef: RefObject<HTMLInputElement | null>;
    requestClose: () => void;
};

/** The printable keys send you back to the field (Space stays with the button it is pressed on). */
const typing = (e: KeyboardEvent) => !e.ctrlKey && !e.metaKey && !e.altKey && ((e.key.length === 1 && e.key !== ' ') || e.key === 'Backspace');

/**
 * The open search's body, the same on computers and phones (AR-41): the Kur button and theme chips, then your recent searches
 * (empty field) or the results. It fetches nothing itself. Arrow keys move through `[data-search-item]`; a letter on an item returns to the field.
 */
export default function SearchPanel({ search, mode, inputRef, requestClose }: Props) {
    const t = useTranslations('discovery');
    const tSearch = useTranslations('discovery.search');
    const tErrors = useTranslations('errors');
    const { word, theme, results, loading, error, setWord } = search;
    const idle = word.trim().length < SEARCH_MIN_CHARS && !theme;

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        const items = searchItems(e.currentTarget);
        const at = items.indexOf(e.target as HTMLElement);
        if (at < 0) return;
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const next = items[at + (e.key === 'ArrowDown' ? 1 : -1)];
            if (next) next.focus();
            else if (e.key === 'ArrowUp') inputRef.current?.focus();
        } else if (typing(e)) {
            inputRef.current?.focus();
        }
    };

    const settled = results && !loading ? results.total.groups + results.total.events : null;
    return (
        <div data-ui={UI.searchPanel} onKeyDown={onKeyDown} aria-busy={loading} className="flex min-h-0 flex-col">
            <SearchChips search={search} />
            <div className={mode === 'desktop' ? 'min-h-0 flex-1 overflow-y-auto' : undefined}>
                {error
                    ? <p className="px-0.5 py-4 text-sm text-foreground-muted">{tErrors('ACTION_FAILED')}</p>
                    : idle
                        ? <RecentSearches onPick={(w) => { setWord(w, true); inputRef.current?.focus(); }} inputRef={inputRef} />
                        : <SearchResults search={search} requestClose={requestClose} />}
            </div>
            <p aria-live="polite" className="sr-only">
                {!idle && settled !== null && (settled > 0 ? tSearch('resultCount', { count: settled }) : t('nothingFound'))}
            </p>
        </div>
    );
}
