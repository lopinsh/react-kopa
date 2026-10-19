'use client';

import { useState, useMemo, useEffect } from 'react';
import { useLocale } from 'next-intl';
import type { L1Category, L2SearchResult } from '@/lib/services/taxonomy.service';
import { searchL2Tags } from '@/actions/taxonomy-actions';
import type { FlatTag } from './types';

/** The category's own sub-topics (and topics when allowed) plus the debounced server search for the typed text. */
export function useTagSearch(l1: L1Category, allowL3: boolean) {
    const locale = useLocale();
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<L2SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const flatTags = useMemo<FlatTag[]>(() => {
        const result: FlatTag[] = [];
        for (const l2 of l1.subcategories) {
            result.push({ id: l2.id, title: l2.title, slug: l2.slug, l2Id: l2.id, l2Title: l2.title, level: 2 });

            if (allowL3 && l2.tags) {
                for (const tag of l2.tags) {
                    result.push({ id: tag.id, title: tag.title, slug: tag.slug, l2Id: l2.id, l2Title: l2.title, level: 3 });
                }
            }
        }
        return result;
    }, [l1, allowL3]);

    const localResults = useMemo<FlatTag[]>(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        return flatTags.filter((tag) =>
            tag.title.toLowerCase().includes(q) || (allowL3 && tag.l2Title.toLowerCase().includes(q))
        );
    }, [query, flatTags, allowL3]);

    const mergedResults = useMemo<FlatTag[]>(() => {
        const byId = new Map<string, FlatTag>();
        for (const local of localResults) {
            byId.set(local.id, local);
        }
        for (const remote of searchResults) {
            const existing = byId.get(remote.id);
            if (existing) {
                byId.set(remote.id, { ...existing });
            } else {
                byId.set(remote.id, {
                    id: remote.id,
                    title: remote.title,
                    slug: remote.slug,
                    l2Id: remote.id,
                    l2Title: remote.title,
                    level: 2,
                });
            }
        }

        return Array.from(byId.values());
    }, [localResults, searchResults]);

    useEffect(() => {
        if (!query.trim() || query.trim().length < 2) {
            return;
        }

        let cancelled = false;
        // setIsSearching is done in the handlers to avoid a synchronous update inside the effect

        const timer = setTimeout(async () => {
            const result = await searchL2Tags(query, l1.id, locale);
            if (!cancelled) {
                setSearchResults(result.success ? result.data ?? [] : []);
                setIsSearching(false);
            }
        }, 500);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [query, l1.id, locale]);

    /** Typing: keeps the list in step with the text (short text clears the results). */
    function changeQuery(val: string) {
        setQuery(val);
        if (val.trim().length < 2) {
            setSearchResults([]);
            setIsSearching(false);
        } else {
            setIsSearching(true);
        }
    }

    function clearQuery() {
        setQuery('');
        setSearchResults([]);
        setIsSearching(false);
    }

    return { query, setQuery, changeQuery, clearQuery, searchResults, isSearching, flatTags, mergedResults };
}

export type TagSearch = ReturnType<typeof useTagSearch>;
