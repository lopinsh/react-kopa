'use client';

import { X, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { L1Category } from '@/lib/services/taxonomy.service';
import PendingTagOption from './PendingTagOption';
import TagCheck from './TagCheck';
import type { PendingTags } from './usePendingTags';

type Props = {
    l1: L1Category;
    allowL3: boolean;
    tagIds: string[];
    onToggle: (id: string) => void;
    pending: PendingTags;
};

/** The open list with nothing typed: every sub-category (and its topics), shared suggestions, and "add a sub-topic". */
export default function TagBrowseList({ l1, allowL3, tagIds, onToggle, pending }: Props) {
    const t = useTranslations('wizard');
    const { offeredPending, inlineWildcardParentId, setInlineWildcardParentId, inlineWildcardText, setInlineWildcardText, createPending } = pending;

    return (
        <>
            {l1.subcategories.map((l2) => (
                <div key={l2.id} className="space-y-1">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onToggle(l2.id);
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-secondary/50 group"
                    >
                        <span className="text-body-sm text-foreground">{l2.title}</span>
                        <TagCheck selected={tagIds.includes(l2.id)} />
                    </button>

                    {allowL3 && l2.tags && l2.tags.length > 0 && (
                        <div className="ml-4 border-l border-border/50 pl-2 space-y-1">
                            {l2.tags.map((tag) => (
                                <button
                                    key={tag.id}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onToggle(tag.id);
                                    }}
                                    className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-left transition-colors hover:bg-secondary/30 group"
                                >
                                    <span className="text-meta text-foreground-muted group-hover:text-foreground">{tag.title}</span>
                                    <TagCheck selected={tagIds.includes(tag.id)} small muted />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ))}

            {offeredPending.length > 0 && (
                <div className="space-y-1 pt-1">
                    {offeredPending.map((option) => (
                        <PendingTagOption key={option.id} option={option} selected={tagIds.includes(option.id)} onToggle={onToggle} />
                    ))}
                </div>
            )}

            <div className="mt-1 pt-1 border-t border-border/50">
                {inlineWildcardParentId === l1.id ? (
                    <div className="flex items-center gap-2 rounded-lg bg-surface-elevated p-2 line mt-1">
                        <input
                            autoFocus
                            className="w-full bg-transparent text-body-sm focus:outline-none text-foreground"
                            placeholder={t('nameOfSubtopicPlaceholder')}
                            value={inlineWildcardText}
                            onChange={(e) => setInlineWildcardText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && inlineWildcardText.trim()) {
                                    e.preventDefault();
                                    createPending(l1.id, inlineWildcardText.trim());
                                } else if (e.key === 'Escape') {
                                    setInlineWildcardParentId(null);
                                }
                            }}
                        />
                        <button
                            type="button"
                            title={t('cancel')}
                            onClick={(e) => {
                                e.preventDefault();
                                setInlineWildcardParentId(null);
                            }}
                            className="hover:text-foreground text-foreground-muted"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            setInlineWildcardParentId(l1.id);
                            setInlineWildcardText('');
                        }}
                        className="flex w-full items-center gap-2 rounded-lg py-1.5 text-left transition-colors group"
                    >
                        <div className="flex h-5 w-5 items-center justify-center rounded bg-secondary text-foreground-muted group-hover:bg-foreground group-hover:text-background transition-colors">
                            <Plus className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-body-sm text-foreground-muted group-hover:text-foreground">{t('addSubtopic')}</span>
                    </button>
                )}
            </div>
        </>
    );
}
