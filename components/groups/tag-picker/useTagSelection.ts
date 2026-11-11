'use client';

import { useState } from 'react';
import { MAX_GROUP_SUBTAGS, MAX_GROUP_TAGS } from '@/lib/constants';
import type { FlatTag } from './types';
import type { PendingTags } from './usePendingTags';

type Args = {
    tagIds: string[];
    setTagIds: (next: string[]) => void;
    flatTags: FlatTag[];
    pending: PendingTags;
};

type Info = { level: 2 | 3; parentId: string | null };

/**
 * What picking means: a sub-veids brings its Veids (D3), un-picking a Veids drops its sub-veidi, and Veidi and
 * sub-veidi count against their own limits. A group saved with more than the limit may keep what it had (per level).
 * The service enforces all of it again; this is the convenience.
 */
export function useTagSelection({ tagIds, setTagIds, flatTags, pending }: Args) {
    const [initial] = useState(tagIds);
    const [announcement, setAnnouncement] = useState('');

    function infoOf(id: string): Info | undefined {
        const flat = flatTags.find((tag) => tag.id === id);
        if (flat) return { level: flat.level === 3 ? 3 : 2, parentId: flat.level === 3 ? flat.l2Id : null };
        return pending.pendingInfo(id);
    }

    const countLevel = (ids: string[], level: 2 | 3) => ids.filter((id) => infoOf(id)?.level === level).length;
    const veidiLimit = Math.max(MAX_GROUP_TAGS, countLevel(initial, 2));
    const subLimit = Math.max(MAX_GROUP_SUBTAGS, countLevel(initial, 3));
    const veidiCount = countLevel(tagIds, 2);
    const subCount = countLevel(tagIds, 3);
    const veidiFull = veidiCount >= veidiLimit;
    const subFull = subCount >= subLimit;

    /** An unchecked row is off while its level is full (a sub-veids also when its Veids would not fit). */
    function isDisabled(id: string): boolean {
        if (tagIds.includes(id)) return false;
        const info = infoOf(id);
        if (!info) return false;
        if (info.level === 2) return veidiFull;
        return subFull || (!!info.parentId && !tagIds.includes(info.parentId) && veidiFull);
    }

    /** The "+ Cits" row under a Veids: a new sub-veids needs a free sub-veids slot and a Veids that is or fits. */
    function canSuggestUnder(veidsId: string): boolean {
        return !subFull && (tagIds.includes(veidsId) || !veidiFull);
    }

    function childrenOf(veidsId: string): string[] {
        return tagIds.filter((id) => infoOf(id)?.parentId === veidsId);
    }

    function toggle(id: string) {
        setAnnouncement('');
        const info = infoOf(id);
        if (tagIds.includes(id)) {
            const dropped = new Set([id, ...(info?.level === 2 ? childrenOf(id) : [])]);
            setTagIds(tagIds.filter((tagId) => !dropped.has(tagId)));
            return;
        }
        if (isDisabled(id)) return;
        if (info?.level === 3 && info.parentId && !tagIds.includes(info.parentId)) {
            setTagIds([...tagIds, info.parentId, id]);
            setAnnouncement(info.parentId);
            return;
        }
        setTagIds([...tagIds, id]);
    }

    return { toggle, isDisabled, canSuggestUnder, veidiFull, subFull, veidiLimit, subLimit, announcedParentId: announcement };
}

export type TagSelection = ReturnType<typeof useTagSelection>;
