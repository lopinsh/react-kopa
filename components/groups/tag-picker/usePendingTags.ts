'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { L1Category, PendingTagOption } from '@/lib/services/taxonomy.service';
import { getPendingTagOptions, submitPendingTag } from '@/actions/taxonomy-actions';
import type { TagSearch } from './useTagSearch';
import type { PendingTag } from './types';

type Args = {
    l1: L1Category;
    tagIds: string[];
    setTagIds: (next: string[]) => void;
    search: TagSearch;
    closeList: () => void;
};

/** Suggestions other people share, the ones this person made in the session, and the typed-text commit ("Done"). */
export function usePendingTags({ l1, tagIds, setTagIds, search, closeList }: Args) {
    const t = useTranslations('wizard');
    const locale = useLocale();
    const { query, setQuery, flatTags, mergedResults, searchResults } = search;

    const [wildcardMode, setWildcardMode] = useState(false);
    const [inlineWildcardParentId, setInlineWildcardParentId] = useState<string | null>(null);
    const [inlineWildcardText, setInlineWildcardText] = useState('');
    const [pendingById, setPendingById] = useState<Record<string, PendingTag>>({});
    const [isSubmittingPending, setIsSubmittingPending] = useState(false);
    // Pending sub-categories other people share with everyone (and the ones already on this group), per L1.
    const [pendingOptions, setPendingOptions] = useState<{ l1Id: string; items: PendingTagOption[] }>({ l1Id: '', items: [] });

    const tagIdsRef = useRef(tagIds);
    useEffect(() => {
        tagIdsRef.current = tagIds;
    });

    useEffect(() => {
        let cancelled = false;
        void getPendingTagOptions(l1.id, tagIdsRef.current, locale).then((result) => {
            if (!cancelled && result.success) setPendingOptions({ l1Id: l1.id, items: result.data ?? [] });
        });
        return () => {
            cancelled = true;
        };
    }, [l1.id, locale]);

    function resetTyping() {
        setQuery('');
        setInlineWildcardParentId(null);
        setInlineWildcardText('');
    }

    async function createPending(parentId: string, label: string) {
        const trimmed = label.trim();
        if (trimmed.length < 2 || isSubmittingPending) {
            return;
        }

        setIsSubmittingPending(true);
        const result = await submitPendingTag(trimmed, parentId, locale);
        setIsSubmittingPending(false);

        if (!result.success || !result.data) {
            return;
        }

        const pendingTag: PendingTag = { id: result.data.id, title: trimmed };

        setPendingById((prev) => ({ ...prev, [pendingTag.id]: pendingTag }));
        if (!tagIds.includes(pendingTag.id)) {
            setTagIds([...tagIds, pendingTag.id]);
        }

        resetTyping();
        setWildcardMode(false);
        closeList();
    }

    /**
     * Text typed but not yet added when "Done" is pressed: an existing sub-category with the same name
     * (case-insensitive) is selected, otherwise the text becomes a new pending one.
     */
    async function commitTypedText() {
        const typed = (inlineWildcardParentId === l1.id ? inlineWildcardText : query).trim();
        if (typed.length < 2) {
            closeList();
            return;
        }
        const key = typed.toLowerCase();
        const pendingMatch = Object.values(pendingById).find((p) => p.title.toLowerCase() === key && tagIds.includes(p.id));
        const known =
            flatTags.find((tag) => tag.title.toLowerCase() === key) ??
            searchResults.find((tag) => tag.title.toLowerCase() === key);

        // Search text the user already used to pick a result ("fot" → "Fotogrāfija") is a search, not a new name.
        const pickedFromSearch = inlineWildcardParentId !== l1.id && mergedResults.some((tag) => tagIds.includes(tag.id));

        if (!pendingMatch && known && !tagIds.includes(known.id)) {
            setTagIds([...tagIds, known.id]);
        } else if (!pendingMatch && !known && !pickedFromSearch) {
            await createPending(l1.id, typed);
            return;
        }
        resetTyping();
        closeList();
    }

    const sharedPending = useMemo(() => (pendingOptions.l1Id === l1.id ? pendingOptions.items : []), [pendingOptions, l1.id]);
    // Only suggestions shared by several people are offered as choices; the rest show only as the chip of whoever picked them.
    const offeredPending = sharedPending.filter((option) => option.isPublic);
    const pendingMatches = query.trim() ? offeredPending.filter((option) => option.title.toLowerCase().includes(query.trim().toLowerCase())) : [];

    const knownIds = new Set(flatTags.map((tag) => tag.id));
    const selectedPending: PendingTag[] = tagIds
        .filter((id) => !knownIds.has(id))
        .map((id) => pendingById[id] ?? { id, title: sharedPending.find((option) => option.id === id)?.title ?? t('pendingReview') });

    return {
        wildcardMode, setWildcardMode,
        inlineWildcardParentId, setInlineWildcardParentId,
        inlineWildcardText, setInlineWildcardText,
        isSubmittingPending, createPending, commitTypedText,
        offeredPending, pendingMatches, selectedPending,
    };
}

export type PendingTags = ReturnType<typeof usePendingTags>;
