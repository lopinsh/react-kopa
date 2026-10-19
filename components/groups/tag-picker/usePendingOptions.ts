'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { PendingTagOption } from '@/lib/services/taxonomy.service';
import { getPendingTagOptions } from '@/actions/taxonomy-actions';

/** Pending sub-categories other people share with everyone (and the ones already on this group), per L1. */
export function usePendingOptions(l1Id: string, tagIds: string[], locale: string) {
    const [pendingOptions, setPendingOptions] = useState<{ l1Id: string; items: PendingTagOption[] }>({ l1Id: '', items: [] });

    const tagIdsRef = useRef(tagIds);
    useEffect(() => {
        tagIdsRef.current = tagIds;
    });

    useEffect(() => {
        let cancelled = false;
        void getPendingTagOptions(l1Id, tagIdsRef.current, locale).then((result) => {
            if (!cancelled && result.success) setPendingOptions({ l1Id, items: result.data ?? [] });
        });
        return () => {
            cancelled = true;
        };
    }, [l1Id, locale]);

    const sharedPending = useMemo(() => (pendingOptions.l1Id === l1Id ? pendingOptions.items : []), [pendingOptions, l1Id]);
    return { sharedPending };
}
