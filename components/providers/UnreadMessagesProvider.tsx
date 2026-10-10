'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getUnreadCount } from '@/actions/message-actions';
import { usePusher } from '@/hooks/usePusher';
import { MESSAGES_READ } from '@/lib/constants/events';

const UnreadMessagesContext = createContext(0);

/** Number of chats with something unread; recounted on load, on every live message and when a chat is read. */
export function UnreadMessagesProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const [count, setCount] = useState(0);

    const refresh = useCallback(() => {
        if (!userId) return;
        void getUnreadCount().then((result) => {
            if (result.success) setCount(result.data ?? 0);
        });
    }, [userId]);

    useEffect(() => {
        refresh();
        // A chat read in another tab sends no event here, so recount when this tab comes back into view.
        const onVisible = () => {
            if (document.visibilityState === 'visible') refresh();
        };
        window.addEventListener(MESSAGES_READ, refresh);
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            window.removeEventListener(MESSAGES_READ, refresh);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [refresh]);

    usePusher(userId ? `private-user-${userId}` : '', 'new-message', refresh);

    return <UnreadMessagesContext.Provider value={userId ? count : 0}>{children}</UnreadMessagesContext.Provider>;
}

export function useUnreadMessages() {
    return useContext(UnreadMessagesContext);
}
