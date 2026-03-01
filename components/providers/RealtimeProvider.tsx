'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { usePusher } from '@/hooks/usePusher';
import { useRouter } from '@/i18n/routing';
import { X, Bell } from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';

type NotificationEvent = {
    id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
};

export default function RealtimeProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [toast, setToast] = useState<NotificationEvent | null>(null);

    const handleNotification = useCallback((data: NotificationEvent) => {
        setToast(data);
        // Revalidate layout to update notification badge
        router.refresh();

        // Auto-hide after 5 seconds
        setTimeout(() => {
            setToast((current) => (current?.id === data.id ? null : current));
        }, 5000);
    }, [router]);

    usePusher(
        session?.user?.id ? `private-user-${session.user.id}` : '',
        'new-notification',
        handleNotification
    );

    return (
        <>
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
                                <p className="text-sm font-semibold text-foreground truncate">
                                    {toast.title}
                                </p>
                                <p className="mt-1 text-sm text-foreground-muted line-clamp-2">
                                    {toast.message}
                                </p>
                                {toast.link && (
                                    <Link
                                        href={toast.link}
                                        className="mt-2 text-xs font-semibold text-primary hover:underline inline-block"
                                        onClick={() => setToast(null)}
                                    >
                                        View details
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
        </>
    );
}
