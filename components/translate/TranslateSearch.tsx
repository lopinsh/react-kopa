'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import { searchTranslations } from '@/actions/translation-actions';
import type { TranslationSearchHit } from '@/lib/services/message-override.service';

import { Input } from '@/components/ui/Input';
type Props = {
    onPick: (key: string) => void;
    onClose: () => void;
};

/** Finds texts by key or content, for strings that can't be clicked on the page (placeholders, tooltips, toasts, titles). */
export default function TranslateSearch({ onPick, onClose }: Props) {
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
        <div data-translate-ignore className="fixed inset-x-3 bottom-32 z-[65] flex max-h-[60vh] flex-col rounded-2xl line bg-surface p-4 shadow-dialog md:bottom-16 md:left-auto md:right-4 md:w-[28rem]">
            <div className="mb-3 flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
                    <Input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('searchPlaceholder')}
                        className="pl-9 pr-3"
                    />
                </div>
                <button type="button" onClick={onClose} aria-label={t('cancel')} className="rounded-pill p-2 text-foreground-muted hover:bg-surface-elevated">
                    <X className="size-4" />
                </button>
            </div>
            <p className="mb-2 text-meta text-foreground-muted">{t('searchHint')}</p>
            <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto">
                {active && hits.map((hit) => (
                    <li key={hit.key}>
                        <button type="button" onClick={() => onPick(hit.key)} className="w-full rounded-xl px-3 py-2 text-left transition-colors hover:bg-surface-elevated">
                            <span className="block break-all font-mono text-meta text-foreground-muted">{hit.key}</span>
                            <span className="block truncate text-body-sm text-foreground">{hit.lv}</span>
                            <span className="block truncate text-body-sm text-foreground-muted">{hit.en}</span>
                        </button>
                    </li>
                ))}
                {active && searched && hits.length === 0 && (
                    <li className="px-3 py-2 text-body-sm text-foreground-muted">{t('noResults')}</li>
                )}
            </ul>
        </div>
    );
}
