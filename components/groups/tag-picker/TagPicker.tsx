'use client';

import { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import type { L1Category } from '@/lib/services/taxonomy.service';
import { useFormContext } from 'react-hook-form';
import type { GroupFormValues } from '@/lib/validations/group';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useTagSearch } from './useTagSearch';
import { usePendingTags } from './usePendingTags';
import { useTagSelection } from './useTagSelection';
import SelectedTags from './SelectedTags';
import TagResults from './TagResults';

type Props = {
    l1: L1Category;
};

/** The tag picker: Veidi and their sub-veidi, a sub-veids bringing its Veids. Per-level limits come from the constants (a legacy group keeps what it had). */
export default function TagPicker({ l1 }: Props) {
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
    const search = useTagSearch(l1);
    const pending = usePendingTags({ l1, tagIds, setTagIds, search, closeList: () => setIsOpen(false) });
    const { query, changeQuery, clearQuery, flatTags } = search;

    useClickOutside(containerRef, () => {
        setIsOpen(false);
        pending.setWildcardMode(false);
    });

    const selection = useTagSelection({ tagIds, setTagIds, flatTags, pending });

    function toggleTag(tagId: string) {
        selection.toggle(tagId);
        inputRef.current?.focus();
    }

    const titleOf = (id: string | undefined) => flatTags.find((tag) => tag.id === id)?.title ?? '';
    const selectedFlat = tagIds
        .map((id) => flatTags.find((tag) => tag.id === id))
        .filter((tag): tag is NonNullable<typeof tag> => tag !== undefined);
    // A chosen sub-veids shows as "Veids › sub-veids"; its Veids is not repeated as a chip of its own.
    const covered = new Set([...selectedFlat.filter((tag) => tag.level === 3).map((tag) => tag.l2Id), ...pending.selectedPending.map((tag) => tag.parentId)]);
    const selectedTags = selectedFlat.filter((tag) => !covered.has(tag.id));
    const selectedSubs = selectedFlat.filter((tag) => tag.level === 3).map((tag) => ({ ...tag, title: `${tag.l2Title} › ${tag.title}` }));
    const selectedPending = pending.selectedPending.map((tag) => (tag.parentId ? { ...tag, title: `${titleOf(tag.parentId)} › ${tag.title}` } : tag));
    const { veidiFull, subFull, veidiLimit, subLimit } = selection;

    return (
        <div ref={containerRef} className="relative w-full mt-6 space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-button-sm text-foreground">
                    {t('tagsAndSubtopics')} <span className="text-tag text-danger">*</span>
                </label>
            </div>

            <div
                className={clsx(
                    'flex flex-col gap-2 rounded-xl border-2 bg-surface px-3 py-2 transition-shadow',
                    isOpen ? 'border-primary' : errors.tagIds ? 'border-danger/40' : 'border-border'
                )}
            >
                <SelectedTags tags={[...selectedTags, ...selectedSubs]} pending={selectedPending} onRemove={selection.toggle} />

                <div className="flex items-center gap-2">
                    <Search className="size-4 shrink-0 text-foreground-muted" />
                    <input /* ui-allow: sits inside the wrapper that carries the edge and ring */
                        ref={inputRef}
                        type="text"
                        className="flex-1 bg-transparent text-body md:text-body-sm text-foreground placeholder:text-foreground-muted focus:outline-none"
                        placeholder={t('searchTopicsPlaceholder', { category: l1.title })}
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
                            <X className="size-4" />
                        </button>
                    )}
                </div>
            </div>

            <p className="sr-only" role="status" aria-live="polite">
                {selection.announcedParentId ? t('addedParent', { veids: titleOf(selection.announcedParentId) }) : ''}
            </p>
            {!errors.tagIds && veidiFull && <p className="text-meta text-foreground-muted">{t('tagLimitHint', { max: veidiLimit })}</p>}
            {!errors.tagIds && subFull && <p className="text-meta text-foreground-muted">{t('subLimitHint', { max: subLimit })}</p>}
            {errors.tagIds && <p className="text-meta text-danger">{t(errors.tagIds.message === 'TOPIC_LIMIT' ? 'TOPIC_LIMIT' : 'TOPIC_REQUIRED', { max: veidiLimit })}</p>}

            {isOpen && <TagResults l1={l1} tagIds={tagIds} onToggle={toggleTag} search={search} pending={pending} selection={selection} />}
        </div>
    );
}
