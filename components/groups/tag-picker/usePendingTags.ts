'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { L1Category } from '@/lib/services/taxonomy.service';
import { submitPendingTag } from '@/actions/taxonomy-actions';
import { usePendingOptions } from './usePendingOptions';
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
    const { sharedPending } = usePendingOptions(l1.id, tagIds, locale);

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

        // Under a Veids it is a sub-veids: its Veids is tagged with it (D3).
        const isSub = parentId !== l1.id;
        const pendingTag: PendingTag = isSub ? { id: result.data.id, title: trimmed, level: 3, parentId } : { id: result.data.id, title: trimmed, level: 2 };

        setPendingById((prev) => ({ ...prev, [pendingTag.id]: pendingTag }));
        if (!tagIds.includes(pendingTag.id)) {
            setTagIds([...tagIds, ...(isSub && !tagIds.includes(parentId) ? [parentId] : []), pendingTag.id]);
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
        const typed = (inlineWildcardParentId ? inlineWildcardText : query).trim();
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
        const pickedFromSearch = !inlineWildcardParentId && mergedResults.some((tag) => tagIds.includes(tag.id));

        if (!pendingMatch && known && !tagIds.includes(known.id)) {
            setTagIds([...tagIds, known.id]);
        } else if (!pendingMatch && !known && !pickedFromSearch) {
            await createPending(inlineWildcardParentId ?? l1.id, typed);
            return;
        }
        resetTyping();
        closeList();
    }

    // Only suggestions shared by several people are offered as choices; the rest show only as the chip of whoever picked them.
    const offeredPending = sharedPending.filter((option) => option.isPublic);
    const pendingMatches = query.trim() ? offeredPending.filter((option) => option.title.toLowerCase().includes(query.trim().toLowerCase())) : [];

    const knownIds = new Set(flatTags.map((tag) => tag.id));
    const selectedPending: PendingTag[] = tagIds
        .filter((id) => !knownIds.has(id))
        .map((id): PendingTag => {
            if (pendingById[id]) return pendingById[id];
            const shared = sharedPending.find((option) => option.id === id);
            if (!shared) return { id, title: t('pendingReview') };
            return shared.level === 3 ? { id, title: shared.title, level: 3, parentId: shared.parentId } : { id, title: shared.title, level: 2 };
        });

    /** Level and Veids of a suggestion (own or shared), for the limits and the auto-tag. */
    function pendingInfo(id: string): { level: 2 | 3; parentId: string | null } | undefined {
        const own = pendingById[id] ?? selectedPending.find((tag) => tag.id === id);
        if (own) return { level: own.level ?? 2, parentId: own.parentId ?? null };
        const shared = sharedPending.find((option) => option.id === id);
        return shared ? { level: shared.level, parentId: shared.level === 3 ? shared.parentId : null } : undefined;
    }

    return {
        wildcardMode, setWildcardMode,
        inlineWildcardParentId, setInlineWildcardParentId,
        inlineWildcardText, setInlineWildcardText,
        isSubmittingPending, createPending, commitTypedText,
        offeredPending, pendingMatches, selectedPending, pendingInfo,
    };
}

export type PendingTags = ReturnType<typeof usePendingTags>;
