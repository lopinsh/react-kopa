'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { useTranslations, useFormatter, useNow, useLocale } from 'next-intl';
import { Bell, Check } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/routing';
import { getNotifications, markManyAsRead, markAllAsRead } from '@/actions/notification-actions';
import { clsx } from 'clsx';
import { useRealtimeEvent } from '@/components/providers/RealtimeProvider';
import { relativeTo } from '@/lib/utils/relative-time';
import { formatNotificationText } from '@/lib/utils/notification-text';
import { useClickOutside } from '@/hooks/useClickOutside';

type Notification = {
    id: string;
    type: string;
    message: string;
    link: string | null;
    read: boolean;
    /** USER = personal tab, ADMIN = admin tab (site admins only). */
    audience: 'USER' | 'ADMIN';
    createdAt: Date;
    /** The group the notification is about, with its category line; null when it is not about a group. */
    group: { name: string; categoryTitle: string } | null;
    /** Ids this row stands for (grouped unread notifications of one type and target). */
    ids?: string[];
    /** How many more unread ones are folded into this row. */
    moreCount?: number;
};

type Audience = Notification['audience'];

/** Context line (group · time), one headline (who did what), then the content itself. */
function NotificationContent({ n }: { n: Notification }) {
    const t = useTranslations('notifications');
    const locale = useLocale();
    const format = useFormatter();
    const now = useNow({ updateInterval: 60_000 });

    const { headline, detail, groupName } = formatNotificationText(t, n.type, n.message, locale);

    return (
        <div className="flex flex-col gap-0.5 pr-6">
            <div className="flex items-baseline justify-between gap-2 text-[10px] text-foreground-muted">
                <span className="truncate font-semibold">{n.group ? (n.group.categoryTitle ? `${n.group.name} · ${n.group.categoryTitle}` : n.group.name) : groupName}</span>
                <span className="shrink-0">{relativeTo(format, new Date(n.createdAt), now)}</span>
            </div>
            <p className="text-[13px] font-bold text-foreground leading-snug">{headline}</p>
            {!n.read && (n.moreCount ?? 0) > 0 && <p className="text-[11px] font-semibold text-primary">{t('more', { count: n.moreCount ?? 0 })}</p>}
            {detail !== undefined && (
                <p className="text-[11px] text-foreground-muted leading-snug line-clamp-2 break-words">
                    {detail}
                </p>
            )}
        </div>
    );
}

export default function NotificationCenter({ isAdmin = false }: { isAdmin?: boolean }) {
    const t = useTranslations('notifications');
    const { data: session } = useSession();
    const locale = useLocale();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const menuRef = useRef<HTMLDivElement>(null);

    const [tab, setTab] = useState<Audience>('USER');
    // Admin notifications are only ever shown to site admins, whatever the list holds.
    const activeTab: Audience = isAdmin ? tab : 'USER';
    const countUnread = (audience: Audience) => notifications.filter(n => n.audience === audience && !n.read).reduce((sum, n) => sum + (n.ids?.length ?? 1), 0);
    const unreadUser = countUnread('USER');
    const unreadAdmin = isAdmin ? countUnread('ADMIN') : 0;
    const unreadCount = unreadUser + unreadAdmin;
    const visible = notifications.filter(n => n.audience === activeTab);
    const visibleUnread = activeTab === 'ADMIN' ? unreadAdmin : unreadUser;

    useClickOutside(menuRef, () => setIsOpen(false), isOpen);

    useEffect(() => {
        const fetchNotifications = async () => {
            const result = await getNotifications(locale);
            if (result.success && result.data) {
                setNotifications(result.data as Notification[]);
            }
        };
        fetchNotifications();

    }, [session?.user?.id, locale]);

    useRealtimeEvent<Notification>('new-notification', (notification) => {
        // The pushed row has no group line yet; show it at once, then fill the line in from the server.
        setNotifications((current) => current.some(n => n.id === notification.id) ? current : [{ ...notification, audience: notification.audience ?? 'USER', group: null }, ...current]);
        getNotifications(locale).then((result) => {
            if (result.success && result.data) setNotifications(result.data as Notification[]);
        });
    });

    const handleMarkAsRead = async (row: Notification) => {
        const ids = row.ids ?? [row.id];
        startTransition(async () => {
            const result = await markManyAsRead(ids);
            if (result.success) {
                setNotifications(prev => prev.map(n => n.id === row.id ? { ...n, read: true, ids: [n.id], moreCount: 0 } : n));
            }
        });
    };

    const handleMarkAllRead = async () => {
        startTransition(async () => {
            const audience = activeTab;
            const result = await markAllAsRead(audience);
            if (result.success) {
                setNotifications(prev => prev.map(n => n.audience === audience ? { ...n, read: true } : n));
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
                    <div data-ui="dropdown-menu" className="fixed inset-x-4 top-16 z-50 sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-3 sm:w-96 origin-top-right overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-100">
                        <div className="flex items-center justify-between border-b border-border bg-surface-elevated/50 px-4 py-3">
                            <h3 className="text-sm font-bold text-foreground">{t('title')}</h3>
                            {visibleUnread > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-[11px] font-bold text-primary hover:underline"
                                    disabled={isPending}
                                >
                                    {t('markAllRead')}
                                </button>
                            )}
                        </div>

                        {isAdmin && (
                            <div role="tablist" aria-label={t('title')} className="flex gap-1 border-b border-border px-3 py-2">
                                {(['USER', 'ADMIN'] as const).map((audience) => {
                                    const count = audience === 'ADMIN' ? unreadAdmin : unreadUser;
                                    const selected = activeTab === audience;
                                    return (
                                        <button
                                            key={audience}
                                            type="button"
                                            role="tab"
                                            aria-selected={selected}
                                            onClick={() => setTab(audience)}
                                            className={clsx(
                                                'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors',
                                                selected ? 'bg-primary/10 text-primary' : 'text-foreground-muted hover:bg-surface-elevated'
                                            )}
                                        >
                                            {t(audience === 'ADMIN' ? 'tabAdmin' : 'tabPersonal')}
                                            {count > 0 && (
                                                <span className="rounded-full bg-primary px-1.5 text-[10px] leading-4 text-white">{count > 9 ? '9+' : count}</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <div className="max-h-[min(400px,60vh)] overflow-y-auto">
                            {visible.length > 0 ? (
                                <div className="divide-y divide-border/50">
                                    {visible.map((n) => (
                                        <div
                                            key={n.id}
                                            data-ui="notification-item"
                                            className={clsx(
                                                "group relative transition-colors hover:bg-surface-elevated/50",
                                                !n.read && "bg-primary/5 shadow-inner"
                                            )}
                                        >
                                            {n.link ? (
                                                <Link
                                                    href={n.link}
                                                    className="block px-4 py-2.5"
                                                    onClick={() => {
                                                        handleMarkAsRead(n);
                                                        setIsOpen(false);
                                                    }}
                                                >
                                                    <NotificationContent n={n} />
                                                </Link>
                                            ) : (
                                                <div className="px-4 py-2.5">
                                                    <NotificationContent n={n} />
                                                </div>
                                            )}

                                            {!n.read && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        handleMarkAsRead(n);
                                                    }}
                                                    className="absolute bottom-2.5 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary opacity-0 transition-opacity group-hover:opacity-100"
                                                    title={t('markRead')}
                                                    aria-label={t('markRead')}
                                                >
                                                    <Check className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
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
