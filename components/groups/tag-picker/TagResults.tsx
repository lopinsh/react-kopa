'use client';

import { Check, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { L1Category } from '@/lib/services/taxonomy.service';
import PendingTagOption from './PendingTagOption';
import TagBrowseList from './TagBrowseList';
import TagResultRow from './TagResultRow';
import type { TagSearch } from './useTagSearch';
import type { PendingTags } from './usePendingTags';

type Props = {
    l1: L1Category;
    allowL3: boolean;
    tagIds: string[];
    onToggle: (id: string) => void;
    search: TagSearch;
    pending: PendingTags;
};

/** The open dropdown: browse list, search results, the "create sub-topic" step and "Done". */
export default function TagResults({ l1, allowL3, tagIds, onToggle, search, pending }: Props) {
    const t = useTranslations('wizard');
    const c = useTranslations('common');
    const { query, isSearching, mergedResults } = search;
    const { wildcardMode, setWildcardMode, isSubmittingPending, createPending, commitTypedText, pendingMatches } = pending;
    const hasResults = mergedResults.length > 0 || pendingMatches.length > 0;

    return (
        <div
            id="tag-picker-results"
            className="absolute left-0 right-0 top-full z-50 mt-1.5 rounded-xl line bg-surface shadow-premium max-h-[300px] overflow-y-auto"
        >
            {wildcardMode ? (
                <div className="p-3">
                    <p className="mb-2 text-body-sm text-foreground-muted">{t('confirmCreateSubtopic', { name: query, category: l1.title })}</p>
                    <button
                        type="button"
                        onClick={() => createPending(l1.id, query)}
                        disabled={isSubmittingPending}
                        className="w-full flex items-center justify-between rounded-pill p-2 text-left text-button-sm transition-colors text-primary-foreground bg-primary disabled:opacity-60"
                    >
                        <span>{t('createSubtopic')}</span>
                        <Check className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <>
                    <div className="p-2 space-y-1">
                        {!query.trim() ? (
                            <TagBrowseList l1={l1} allowL3={allowL3} tagIds={tagIds} onToggle={onToggle} pending={pending} />
                        ) : (
                            <>
                                {isSearching && (
                                    <div className="p-4 text-center">
                                        <p className="text-meta text-foreground-muted">{c('loading')}</p>
                                    </div>
                                )}

                                {hasResults ? (
                                    <>
                                        {pendingMatches.map((option) => (
                                            <PendingTagOption key={option.id} option={option} selected={tagIds.includes(option.id)} onToggle={onToggle} />
                                        ))}
                                        {mergedResults.map((tag) => (
                                            <TagResultRow key={tag.id} tag={tag} l1Title={l1.title} selected={tagIds.includes(tag.id)} onToggle={onToggle} />
                                        ))}
                                    </>
                                ) : (
                                    <div className="p-4 text-center">
                                        <p className="text-body-sm text-foreground-muted">{t('noTopicsFound', { category: l1.title })}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {query.trim().length >= 2 && (
                        <div className="border-t border-border p-2">
                            <button
                                type="button"
                                onClick={() => setWildcardMode(true)}
                                className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-secondary"
                            >
                                <div className="flex flex-col">
                                    <span className="text-body-sm text-primary">
                                        {t('createSubtopic')} &quot;{query}&quot;
                                    </span>
                                    <span className="text-meta text-foreground-muted">{t('proposeAsNewSubtopic')}</span>
                                </div>
                                <Plus className="h-4 w-4 text-primary" />
                            </button>
                        </div>
                    )}

                    <div className="border-t border-border p-2 bg-surface sticky bottom-0">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                void commitTypedText();
                            }}
                            disabled={isSubmittingPending}
                            className="w-full rounded-pill bg-primary py-2 text-button-sm text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                        >
                            {c('done')}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
