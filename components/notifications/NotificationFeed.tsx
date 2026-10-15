'use client';

import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import { useNotificationRows } from '@/hooks/useNotificationRows';
import { useOwnCounts } from '@/components/providers/OwnCountsProvider';
import { buttonClass } from '@/components/ui/Button';
import { UI } from '@/lib/constants';
import type { NotificationView } from '@/lib/types/own-area';
import NotificationList from './NotificationList';

type Tab = 'user' | 'admin';

/**
 * Paziņojumi, the page (AR-65): the same rows as the bell, thirty a page, for a site admin the two tabs as links (`?tab=`). "Rādīt vēl" is a
 * link to the next page (`?page=`) that renders the first 30·n rows, so Back returns to the shorter list. Phones open this page from the bell.
 */
export default function NotificationFeed({ rows: initial, hasMore, tab, isAdmin, page }: { rows: NotificationView[]; hasMore: boolean; tab: Tab; isAdmin: boolean; page: number }) {
    const t = useTranslations('notifications');
    const counts = useOwnCounts().notifications;
    const { rows, markRead, markAll, isPending } = useNotificationRows(initial);
    const audience = tab === 'admin' ? 'ADMIN' : 'USER';
    const unread = tab === 'admin' ? counts.admin : counts.user;
    const query = tab === 'admin' ? { tab: 'admin' } : {};

    return (
        <div data-ui={UI.notificationFeed} className="overflow-hidden rounded-2xl bg-surface">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 pt-1">
                {isAdmin ? (
                    <nav aria-label={t('title')} className="flex gap-4">
                        {(['user', 'admin'] as const).map((key) => (
                            <Link
                                key={key}
                                href={key === 'admin' ? { pathname: '/notifications', query: { tab: 'admin' } } : '/notifications'}
                                scroll={false}
                                aria-current={tab === key ? 'page' : undefined}
                                className={clsx('-mb-px border-b-2 pb-2 pt-2.5 text-sm', tab === key ? 'border-primary font-semibold text-foreground' : 'border-transparent text-foreground-muted hover:text-foreground')}
                            >
                                {t(key === 'admin' ? 'tabAdmin' : 'tabPersonal')}
                                {counts[key] > 0 && <span className="ml-1 tabular-nums">{counts[key]}</span>}
                            </Link>
                        ))}
                    </nav>
                ) : <span />}
                {unread > 0 && (
                    <button type="button" disabled={isPending} onClick={() => markAll(audience)} className="py-2.5 text-xs font-semibold text-primary hover:underline disabled:opacity-50">{t('markAllRead')}</button>
                )}
            </div>
            <NotificationList rows={rows} onRead={markRead} />
            {hasMore && (
                <div className="flex justify-center border-t border-border p-3">
                    <Link href={{ pathname: '/notifications', query: { ...query, page: page + 1 } }} scroll={false} className={buttonClass('quiet')}>{t('showMore')}</Link>
                </div>
            )}
        </div>
    );
}
