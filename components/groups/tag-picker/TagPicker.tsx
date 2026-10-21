'use client';

import { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import type { L1Category } from '@/lib/services/taxonomy.service';
import { useFormContext } from 'react-hook-form';
import { MAX_GROUP_TAGS } from '@/lib/constants';
import type { GroupFormValues } from '@/lib/validations/group';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useTagSearch } from './useTagSearch';
import { usePendingTags } from './usePendingTags';
import SelectedTags from './SelectedTags';
import TagResults from './TagResults';

type Props = {
    l1: L1Category;
    allowL3?: boolean;
    /** A legacy group that already has more tags than the limit may keep (and swap within) that many; never above the limit otherwise. */
    maxTags?: number;
};

export default function TagPicker({ l1, allowL3 = false, maxTags = MAX_GROUP_TAGS }: Props) {
    const t = useTranslations('wizard');
    const {
        watch,
        setValue,
        formState: { errors },
    } = useFormContext<GroupFormValues>();
    const tagIds = watch('tagIds') || [];

    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const setTagIds = (next: string[]) => setValue('tagIds', next, { shouldValidate: true });
    const search = useTagSearch(l1, allowL3);
    const pending = usePendingTags({ l1, tagIds, setTagIds, search, closeList: () => setIsOpen(false) });
    const { query, changeQuery, clearQuery, flatTags } = search;

    useClickOutside(containerRef, () => {
        setIsOpen(false);
        pending.setWildcardMode(false);
    });

    function toggleTag(tagId: string) {
        setTagIds(tagIds.includes(tagId) ? tagIds.filter((id) => id !== tagId) : [...tagIds, tagId]);
        inputRef.current?.focus();
    }

    const removeTag = (tagId: string) => setTagIds(tagIds.filter((id) => id !== tagId));

    const selectedTags = tagIds
        .map((id) => flatTags.find((tag) => tag.id === id))
        .filter((tag): tag is NonNullable<typeof tag> => tag !== undefined);

    const tagLimit = Math.max(MAX_GROUP_TAGS, maxTags);
    const limitReached = tagIds.length >= tagLimit;

    return (
        <div ref={containerRef} className="relative w-full mt-6 space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-button-sm text-foreground">
                    {allowL3 ? t('tagsAndSubtopics') : t('subtopics')} <span className="text-tag text-danger">*</span>
                </label>
            </div>

            <div
                className={clsx(
                    'flex flex-col gap-2 rounded-xl border-2 bg-surface px-3 py-2 transition-shadow',
                    isOpen ? 'border-primary' : errors.tagIds ? 'border-danger/40' : 'border-border'
                )}
            >
                <SelectedTags tags={selectedTags} pending={pending.selectedPending} onRemove={removeTag} />

                <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 shrink-0 text-foreground-muted" strokeWidth={1.75} />
                    <input /* ui-allow: sits inside the wrapper that carries the edge and ring */
                        ref={inputRef}
                        type="text"
                        className="flex-1 bg-transparent text-body md:text-body-sm text-foreground placeholder:text-foreground-muted focus:outline-none"
                        placeholder={t('searchTopicsPlaceholder', { category: l1.title })}
                        disabled={limitReached}
                        value={query}
                        onChange={(e) => {
                            changeQuery(e.target.value);
                            setIsOpen(true);
                            pending.setWildcardMode(false);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                            }
                        }}
                        onFocus={() => setIsOpen(true)}
                        aria-expanded={isOpen}
                        role="combobox"
                        aria-autocomplete="list"
                        aria-controls="tag-picker-results"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                clearQuery();
                                inputRef.current?.focus();
                            }}
                            className="text-foreground-muted hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {limitReached && !errors.tagIds && <p className="text-meta text-foreground-muted">{t('tagLimitHint', { max: tagLimit })}</p>}
            {errors.tagIds && <p className="text-meta text-danger">{t(errors.tagIds.message === 'TOPIC_LIMIT' ? 'TOPIC_LIMIT' : 'TOPIC_REQUIRED', { max: tagLimit })}</p>}

            {isOpen && !limitReached && (
                <TagResults l1={l1} allowL3={allowL3} tagIds={tagIds} onToggle={toggleTag} search={search} pending={pending} />
            )}
        </div>
    );
}
