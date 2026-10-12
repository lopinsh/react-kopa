'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { usePusher } from '@/hooks/usePusher';
import { Link, useRouter } from '@/i18n/routing';
import { X, Bell } from 'lucide-react';
import { clsx } from 'clsx';
import { formatNotificationText } from '@/lib/utils/notification-text';

type NotificationEvent = {
    id: string;
    type: string;
    message: string;
    link?: string;
};

type MessageEvent = {
    id: string;
    content: string;
    senderId: string;
    conversationId: string;
    sender: { name: string | null; image: string | null };
};

/** Events on the signed-in person's private channel. This provider is their only owner: it binds each once and passes it on. */
type RealtimeEvents = {
    'new-message': unknown;
    'new-notification': unknown;
};
type Subscribe = <E extends keyof RealtimeEvents>(event: E, handler: (data: unknown) => void) => () => void;

const RealtimeContext = createContext<Subscribe | null>(null);

/**
 * Listen to a live event of the signed-in person ('new-message', 'new-notification') from any component
 * below `RealtimeProvider`. The handler may change on every render; it is called once per event.
 */
export function useRealtimeEvent<T>(event: keyof RealtimeEvents, handler: (data: T) => void) {
    const subscribe = useContext(RealtimeContext);
    const handlerRef = useRef(handler);
    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);
    useEffect(() => {
        if (!subscribe) return;
        return subscribe(event, (data) => handlerRef.current(data as T));
    }, [subscribe, event]);
}

export default function RealtimeProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const t = useTranslations('notifications');
    const locale = useLocale();
    const router = useRouter();
    const [toast, setToast] = useState<{ id: string; type: string; title: string; message: string; link?: string } | null>(null);

    const handleNotification = useCallback((data: NotificationEvent) => {
        // Same headline and detail as the bell. Admin notices skip the viewer's own actions on the server.
        const text = formatNotificationText(t, data.type, data.message, locale);
        setToast({ id: data.id, type: data.type, link: data.link, title: text.headline, message: text.detail ?? '' });
        // Revalidate layout to update notification badge
        router.refresh();

        // Auto-hide after 5 seconds
        setTimeout(() => {
            setToast((current) => (current?.id === data.id ? null : current));
        }, 5000);
    }, [router, t, locale]);

    const handleNewMessage = useCallback((data: MessageEvent) => {
        // Don't show toast on the messages page or while the messages drawer is open
        if (typeof window !== 'undefined' && window.location.pathname.includes('/messages')) return;
        if (typeof document !== 'undefined' && document.querySelector('[data-messages-drawer]')) return;
        // Don't show toast if it's our own message
        if (data.senderId === session?.user?.id) return;

        setToast({
            id: data.id,
            type: 'MESSAGE',
            title: data.sender.name || t('toastNewMessage'),
            message: data.content,
            link: `/messages?c=${data.conversationId}`
        });

        // Auto-hide after 5 seconds
        setTimeout(() => {
            setToast((current) => (current?.id === data.id ? null : current));
        }, 5000);
    }, [session?.user?.id, t]);

    // One listener list per event; the provider binds each event once and calls everyone below.
    const listeners = useRef<{ [E in keyof RealtimeEvents]: Set<(data: unknown) => void> }>({
        'new-message': new Set(),
        'new-notification': new Set(),
    });
    const subscribe = useMemo<Subscribe>(() => (event, handler) => {
        const set = listeners.current[event];
        set.add(handler);
        return () => { set.delete(handler); };
    }, []);

    const channel = session?.user?.id ? `private-user-${session.user.id}` : '';
    usePusher<NotificationEvent>(channel, 'new-notification', (data) => {
        handleNotification(data);
        listeners.current['new-notification'].forEach((listener) => listener(data));
    });
    usePusher<MessageEvent>(channel, 'new-message', (data) => {
        handleNewMessage(data);
        listeners.current['new-message'].forEach((listener) => listener(data));
    });

    return (
        <RealtimeContext.Provider value={subscribe}>
            {children}

            {/* Global Toast Container */}
            <div className="fixed bottom-20 md:bottom-6 right-4 z-[100] flex flex-col items-end pointer-events-none">
                <div
                    className={clsx(
                        'pointer-events-auto flex w-full max-w-sm rounded-xl border border-border bg-surface p-4 shadow-2xl transition-all duration-500 ease-out',
                        toast ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                    )}
                >
                    {toast && (
                        <div className="flex w-full items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Bell className="h-5 w-5" />
                            </div>
                            <div className="flex-1 pt-0.5 min-w-0">
                                <p className="text-sm font-semibold text-foreground line-clamp-2">
                                    {toast.title}
                                </p>
                                {toast.message !== '' && (
                                    <p className="mt-1 text-sm text-foreground-muted line-clamp-2">
                                        {toast.message}
                                    </p>
                                )}
                                {toast.link && (
                                    <Link
                                        href={toast.link}
                                        className="mt-2 text-xs font-semibold text-primary hover:underline inline-block"
                                        onClick={() => setToast(null)}
                                    >
                                        {t('toastOpen')}
                                    </Link>
                                )}
                            </div>
                            <button
                                onClick={() => setToast(null)}
                                className="shrink-0 p-1 text-foreground-muted hover:text-foreground transition-colors rounded-lg hover:bg-surface-elevated"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </RealtimeContext.Provider>
    );
}
