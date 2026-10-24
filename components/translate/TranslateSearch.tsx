'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { searchTranslations } from '@/actions/translation-actions';
import type { TranslationSearchHit } from '@/lib/services/message-override.service';
import { Input } from '@/components/ui/Input';

/** Finds texts by key or content, for strings that can't be clicked on the page (placeholders, tooltips, toasts, titles). Inline in the Tulkot tab. */
export default function TranslateSearch({ onPick }: { onPick: (key: string) => void }) {
    const t = useTranslations('translateMode');
    const [query, setQuery] = useState('');
    const [hits, setHits] = useState<TranslationSearchHit[]>([]);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        if (query.trim().length < 2) return;
        let cancelled = false;
        const timer = window.setTimeout(() => {
            searchTranslations(query).then((res) => {
                if (cancelled) return;
                setHits(res.success ? res.data ?? [] : []);
                setSearched(true);
            });
        }, 250);
        return () => { cancelled = true; window.clearTimeout(timer); };
    }, [query]);

    const active = query.trim().length >= 2;

    return (
        <div className="space-y-2">
            <div className="relative">
                <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
                <Input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    aria-label={t('searchPlaceholder')}
                    className="pl-9 pr-3"
                />
            </div>
            {active && (
                <ul className="max-h-48 space-y-1 overflow-y-auto">
                    {hits.map((hit) => (
                        <li key={hit.key}>
                            <button type="button" onClick={() => { onPick(hit.key); setQuery(''); setHits([]); setSearched(false); }} className="w-full rounded-xl px-2 py-1 text-left transition-colors hover:bg-surface-elevated">
                                <span className="block break-all font-mono text-meta text-foreground-muted">{hit.key}</span>
                                <span className="block truncate text-body-sm text-foreground">{hit.lv}</span>
                                <span className="block truncate text-body-sm text-foreground-muted">{hit.en}</span>
                            </button>
                        </li>
                    ))}
                    {searched && hits.length === 0 && <li className="px-2 py-1 text-body-sm text-foreground-muted">{t('noResults')}</li>}
                </ul>
            )}
        </div>
    );
}
