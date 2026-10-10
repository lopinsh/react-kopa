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
        window.addEventListener(MESSAGES_READ, refresh);
        return () => window.removeEventListener(MESSAGES_READ, refresh);
    }, [refresh]);

    usePusher(userId ? `private-user-${userId}` : '', 'new-message', refresh);

    return <UnreadMessagesContext.Provider value={userId ? count : 0}>{children}</UnreadMessagesContext.Provider>;
}

export function useUnreadMessages() {
    return useContext(UnreadMessagesContext);
}
