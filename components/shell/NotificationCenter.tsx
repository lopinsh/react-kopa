'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/routing';
import { getNotifications, markAsRead, markAllAsRead } from '@/actions/notification-actions';
import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { lv, enUS } from 'date-fns/locale';

type Notification = {
    id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    read: boolean;
    createdAt: Date;
};

type Props = {
    locale: string;
};

function NotificationContent({ n, t, dateLocale }: { n: Notification, t: any, dateLocale: any }) {
    const parsed = JSON.parse(n.message);
    const title = t(`title_${n.type}`);
    const message = t(parsed.key, parsed.args || {});

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                    {t(`type_${n.type}`)}
                </span>
                <span className="text-[9px] text-foreground-muted font-medium">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: dateLocale })}
                </span>
            </div>
            <h4 className="text-sm font-bold text-foreground leading-tight">{title}</h4>
            <p className="text-xs text-foreground-muted leading-relaxed line-clamp-2">{message}</p>

            {n.link && (
                <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-primary opacity-80 group-hover:opacity-100 group-hover:underline">
                    <ExternalLink className="h-3 w-3" />
                    {t('viewDetails')}
                </div>
            )}
        </div>
    );
}

export default function NotificationCenter({ locale }: Props) {
    const t = useTranslations('notifications');
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const dateLocale = locale === 'lv' ? lv : enUS;
    const menuRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    useEffect(() => {
        const fetchNotifications = async () => {
            const data = await getNotifications();
            setNotifications(data as Notification[]);
        };
        fetchNotifications();

        if (session?.user?.id) {
            const { pusherClient } = require('@/lib/pusher');
            const channelName = `private-user-${session.user.id}`;
            const channel = pusherClient.subscribe(channelName);

            channel.bind('new-notification', (notification: Notification) => {
                setNotifications((current) => {
                    if (current.some(n => n.id === notification.id)) return current;
                    return [notification, ...current];
                });
            });

            return () => {
                pusherClient.unsubscribe(channelName);
                channel.unbind_all();
            };
        }
    }, [session?.user?.id]);

    const handleMarkAsRead = async (id: string) => {
        startTransition(async () => {
            const result = await markAsRead(id);
            if (result.success) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            }
        });
    };

    const handleMarkAllRead = async () => {
        startTransition(async () => {
            const result = await markAllAsRead();
            if (result.success) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            }
        });
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-elevated transition-colors hover:bg-surface active:scale-95"
                aria-label={t('title')}
            >
                <Bell className={clsx("h-5 w-5", unreadCount > 0 ? "text-primary animate-pulse" : "text-foreground-muted")} />
                {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ring-2 ring-surface">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="absolute right-0 mt-3 z-50 w-80 origin-top-right overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-100">
                        <div className="flex items-center justify-between border-b border-border bg-surface-elevated/50 p-4">
                            <h3 className="text-sm font-bold text-foreground">{t('title')}</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-[11px] font-bold text-primary hover:underline"
                                    disabled={isPending}
                                >
                                    {t('markAllRead')}
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-border/50">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={clsx(
                                                "group relative transition-colors hover:bg-surface-elevated/50",
                                                !n.read && "bg-primary/5 shadow-inner"
                                            )}
                                        >
                                            {n.link ? (
                                                <Link
                                                    href={n.link as any}
                                                    className="block p-4"
                                                    onClick={() => {
                                                        handleMarkAsRead(n.id);
                                                        setIsOpen(false);
                                                    }}
                                                >
                                                    <NotificationContent n={n} t={t} dateLocale={dateLocale} />
                                                </Link>
                                            ) : (
                                                <div className="p-4">
                                                    <NotificationContent n={n} t={t} dateLocale={dateLocale} />
                                                </div>
                                            )}

                                            {!n.read && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        handleMarkAsRead(n.id);
                                                    }}
                                                    className="absolute bottom-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary opacity-0 transition-opacity group-hover:opacity-100"
                                                    title="Mark as read"
                                                >
                                                    <Check className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                    <div className="mb-3 rounded-full bg-surface-elevated p-3 text-foreground-muted">
                                        <Bell className="h-6 w-6 opacity-20" />
                                    </div>
                                    <p className="text-sm text-foreground-muted italic">{t('empty')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
