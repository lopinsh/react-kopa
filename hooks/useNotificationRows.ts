'use client';

import { useCallback, useState, useTransition } from 'react';
import { markAllAsRead, markManyAsRead } from '@/actions/notification-actions';
import { OWN_COUNTS_CHANGED } from '@/lib/constants/events';
import type { NotificationView } from '@/lib/types/own-area';

/**
 * A list of notification rows (the bell's, Paziņojumi) with the two ways to read them: one row (a tap on it or its ✓) and a whole tab.
 * A row turns read at once and the menus recount; a failed save puts the rows back. Opening a list marks nothing (OD-22).
 */
export function useNotificationRows(initial: NotificationView[]) {
    const [rows, setRows] = useState(initial);
    const [isPending, startTransition] = useTransition();

    const markRead = useCallback((row: NotificationView) => {
        if (row.read) return;
        const before = rows;
        setRows((prev) => prev.map((n) => (n.id === row.id ? { ...n, read: true, ids: [n.id], moreCount: 0 } : n)));
        startTransition(async () => {
            const res = await markManyAsRead(row.ids);
            if (res.success) window.dispatchEvent(new Event(OWN_COUNTS_CHANGED));
            else setRows(before);
        });
    }, [rows]);

    const markAll = useCallback((audience: 'USER' | 'ADMIN') => {
        if (isPending) return;
        const before = rows;
        setRows((prev) => prev.map((n) => (n.audience === audience ? { ...n, read: true, ids: [n.id], moreCount: 0 } : n)));
        startTransition(async () => {
            const res = await markAllAsRead(audience);
            if (res.success) window.dispatchEvent(new Event(OWN_COUNTS_CHANGED));
            else setRows(before);
        });
    }, [rows, isPending]);

    return { rows, setRows, markRead, markAll, isPending };
}
