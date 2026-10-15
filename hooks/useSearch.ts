'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { usePathname } from '@/i18n/routing';
import { discoveryHref, parseDiscoveryParams, type DiscoveryKind } from '@/lib/discovery-params';
import { reviveSearchResults, type SearchResults } from '@/lib/types/search';
import { SEARCH_DEBOUNCE_MS, SEARCH_MIN_CHARS } from '@/lib/constants';
import type { ActionResponse } from '@/types/actions';

type Options = {
    /** Fetches only while the search is open. */
    active: boolean;
    initialWord: string;
    initialCities: string[];
    /** The page's own category (its L1 slug): the search starts with that theme chosen. */
    initialTheme: string | null;
    /** The page the search was opened on (Pasākumi lands on Pasākumi when it found events). */
    kind: DiscoveryKind;
};

/**
 * The search's state and its one request (R7): the word, one theme and the places, `GET /api/search` after each change.
 * A word change waits SEARCH_DEBOUNCE_MS; a theme or place change goes at once. A newer request aborts the older one and
 * a response that is not the newest is dropped, so the latest query wins. The old results stay while a newer one runs.
 */
export function useSearch({ active, initialWord, initialCities, initialTheme, kind }: Options) {
    const locale = useLocale();
    const pathname = usePathname();
    const current = useSearchParams();
    const [word, setWordState] = useState(initialWord);
    const [theme, setThemeState] = useState<string | null>(initialTheme);
    // A chosen Veids (its Tēma is `theme`): carried to "Rādīt visus rezultātus", where it filters the list.
    const [tag, setTag] = useState<string | null>(null);
    const setTheme = useCallback((next: string | null | ((cur: string | null) => string | null)) => { setTag(null); setThemeState(next); }, []);
    const [cities, setCities] = useState(initialCities);
    const [results, setResults] = useState<SearchResults | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const now = useRef(false);
    const last = useRef<{ q: string; theme: string | null; cities: string } | null>(null);

    // Under SEARCH_MIN_CHARS letters the word searches nothing, so typing the first letter does not fetch again.
    const q = word.trim().length < SEARCH_MIN_CHARS ? '' : word.trim();
    const cityKey = cities.join(',');

    useEffect(() => {
        if (!active) return;
        const prev = last.current;
        last.current = { q, theme, cities: cityKey };
        const typing = !!prev && prev.theme === theme && prev.cities === cityKey && prev.q !== q && !now.current;
        now.current = false;
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({ q, city: cityKey, locale, kind });
                if (theme) params.set('theme', theme);
                const res = await fetch(`/api/search?${params}`, { signal: controller.signal });
                const body = (await res.json()) as ActionResponse<SearchResults>;
                if (controller.signal.aborted) return;
                if (body.success && body.data) {
                    // A page category the search does not know (a sub-category slug, a stale link) is dropped, so no hidden theme is left to clear.
                    if (theme && body.data.theme !== theme) setTheme(null);
                    setResults(reviveSearchResults(body.data));
                    setError(false);
                } else {
                    setError(true);
                }
                setLoading(false);
            } catch {
                if (controller.signal.aborted) return;
                setError(true);
                setLoading(false);
            }
        }, typing ? SEARCH_DEBOUNCE_MS : 0);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [active, q, theme, cityKey, locale, kind, setTheme]);

    const total = results?.total;
    const landing: DiscoveryKind = total && total.events > 0 && (total.groups === 0 || kind === 'events') ? 'events' : 'groups';
    const base = parseDiscoveryParams(new URLSearchParams());
    const showAllHref = discoveryHref(base, { q, cities, category: theme, tags: tag ? [tag] : [], kind: landing });
    // Already on that discovery list: "Rādīt visus rezultātus" only closes the search.
    const here = pathname === '/' && discoveryHref(parseDiscoveryParams(current), {}) === showAllHref;

    return {
        word,
        /** `immediately`: search without waiting (a recent word was picked). */
        setWord: useCallback((next: string, immediately = false) => { now.current = immediately; setWordState(next); }, []),
        theme,
        /** One theme at a time: choosing replaces, choosing the chosen one clears. */
        toggleTheme: useCallback((slug: string) => setTheme((cur) => (cur === slug ? null : slug)), [setTheme]),
        tag,
        /** A matching Veids: chooses its Tēma too; choosing the chosen one clears just the Veids. */
        toggleVeids: useCallback((slug: string, l1Slug: string) => { setThemeState(l1Slug); setTag((cur) => (cur === slug ? null : slug)); }, []),
        cities,
        setCities,
        results,
        loading,
        error,
        showAllHref,
        here,
        /** The address changed under the search: start from the new page's word, places and category. */
        reset: useCallback((nextWord: string, nextCities: string[], nextTheme: string | null) => { setWordState(nextWord); setTheme(nextTheme); setCities(nextCities); setResults(null); }, [setTheme])
    };
}

export type SearchModel = ReturnType<typeof useSearch>;
