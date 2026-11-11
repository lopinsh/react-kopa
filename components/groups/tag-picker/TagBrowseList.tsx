'use client';

import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import type { L1Category } from '@/lib/services/taxonomy.service';
import InlineSuggest from './InlineSuggest';
import PendingTagOption from './PendingTagOption';
import TagCheck from './TagCheck';
import type { PendingTags } from './usePendingTags';
import type { TagSelection } from './useTagSelection';

type Props = {
    l1: L1Category;
    tagIds: string[];
    onToggle: (id: string) => void;
    pending: PendingTags;
    selection: TagSelection;
};

/** The open list with nothing typed: every Veids with its sub-veidi, shared suggestions, and "add a sub-topic". */
export default function TagBrowseList({ l1, tagIds, onToggle, pending, selection }: Props) {
    const t = useTranslations('wizard');
    const { offeredPending } = pending;
    const { isDisabled } = selection;

    return (
        <>
            {l1.subcategories.map((l2) => {
                const subPending = offeredPending.filter((option) => option.level === 3 && option.parentId === l2.id);
                return (
                    <div key={l2.id} className="space-y-1">
                        <button
                            type="button"
                            disabled={isDisabled(l2.id)}
                            onClick={(e) => {
                                e.preventDefault();
                                onToggle(l2.id);
                            }}
                            className={clsx(
                                'group flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-secondary/50',
                                isDisabled(l2.id) && 'opacity-50'
                            )}
                        >
                            <span className="text-body-sm text-foreground">{l2.title}</span>
                            <TagCheck selected={tagIds.includes(l2.id)} />
                        </button>

                        {/* Every Veids opens its sub-veidi list, so "+ Cits" can suggest the first one (owner decision, L3-12). */}
                        <div role="group" aria-label={t('subtypesOf', { veids: l2.title })} className="ml-4 space-y-1 border-l border-border/50 pl-2">
                                {l2.tags.map((tag) => (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        disabled={isDisabled(tag.id)}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onToggle(tag.id);
                                        }}
                                        className={clsx(
                                            'group flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-secondary/50',
                                            isDisabled(tag.id) && 'opacity-50'
                                        )}
                                    >
                                        <span className="text-body-sm text-foreground">{tag.title}</span>
                                        <TagCheck selected={tagIds.includes(tag.id)} />
                                    </button>
                                ))}
                                {subPending.map((option) => (
                                    <PendingTagOption key={option.id} option={option} selected={tagIds.includes(option.id)} onToggle={onToggle} />
                                ))}
                                <InlineSuggest parentId={l2.id} kind="sub" pending={pending} disabled={!selection.canSuggestUnder(l2.id)} />
                            </div>
                    </div>
                );
            })}

            {offeredPending.some((option) => option.level === 2) && (
                <div className="space-y-1 pt-1">
                    {offeredPending
                        .filter((option) => option.level === 2)
                        .map((option) => (
                            <PendingTagOption key={option.id} option={option} selected={tagIds.includes(option.id)} onToggle={onToggle} />
                        ))}
                </div>
            )}

            <div className="mt-1 border-t border-border/50 pt-1">
                <InlineSuggest parentId={l1.id} kind="veids" pending={pending} disabled={selection.veidiFull} />
            </div>
        </>
    );
}
