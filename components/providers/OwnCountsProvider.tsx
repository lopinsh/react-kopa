'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getOwnCounts } from '@/actions/user-actions';
import { OWN_COUNTS_CHANGED } from '@/lib/constants/events';
import type { OwnCounts } from '@/lib/types/own-area';
import { useRealtimeEvent } from './RealtimeProvider';

type OwnCountsValue = OwnCounts & { refresh: () => void };

const NONE: OwnCounts = { myGroupsNew: 0, notifications: { user: 0, admin: 0 } };
const OwnCountsContext = createContext<OwnCountsValue>({ ...NONE, refresh: () => {} });

/**
 * The numbers in the menus (AR-14): what is new in Manas grupas and the unread notifications. Counted on load, when the tab comes back
 * into view, on every live notification and after anything that changes them (`OWN_COUNTS_CHANGED`). They are hints; the lists are the truth.
 */
export function OwnCountsProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const [counts, setCounts] = useState<OwnCounts>(NONE);

    const refresh = useCallback(() => {
        if (!userId) return;
        void getOwnCounts().then((result) => {
            if (result.success && result.data) setCounts(result.data);
        });
    }, [userId]);

    useEffect(() => {
        refresh();
        const onVisible = () => {
            if (document.visibilityState === 'visible') refresh();
        };
        window.addEventListener(OWN_COUNTS_CHANGED, refresh);
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            window.removeEventListener(OWN_COUNTS_CHANGED, refresh);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [refresh]);

    useRealtimeEvent('new-notification', refresh);

    const value = useMemo(() => ({ ...(userId ? counts : NONE), refresh }), [userId, counts, refresh]);
    return <OwnCountsContext.Provider value={value}>{children}</OwnCountsContext.Provider>;
}

export function useOwnCounts(): OwnCountsValue {
    return useContext(OwnCountsContext);
}
