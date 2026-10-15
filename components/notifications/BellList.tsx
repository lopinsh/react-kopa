'use client';

import { useCallback, useEffect, useState, type KeyboardEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { getNotifications } from '@/actions/notification-actions';
import { useNotificationRows } from '@/hooks/useNotificationRows';
import { useRealtimeEvent } from '@/components/providers/RealtimeProvider';
import { useOwnCounts } from '@/components/providers/OwnCountsProvider';
import { DropdownFooter, DropdownHead } from '@/components/shell/DropdownParts';
import { LoadingRegion, SkeletonRow } from '@/components/ui/Skeleton';
import { DROPDOWN_ROWS } from '@/lib/constants';
import NotificationList from './NotificationList';

type Audience = 'USER' | 'ADMIN';

/**
 * What the bell opens (AR-65, cmv9ahbt5): the last five of a tab, "Atzīmēt visus kā izlasītus", for a site admin the two tabs with their
 * counts, and "Visi paziņojumi". Fetched when it opens, again on a tab change or a live notification. Opening marks nothing (OD-22).
 */
export default function BellList({ headingId, isAdmin }: { headingId: string; isAdmin: boolean }) {
    const t = useTranslations('notifications');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const counts = useOwnCounts().notifications;
    const [tab, setTab] = useState<Audience>('USER');
    const [loaded, setLoaded] = useState<Audience | 'failed' | null>(null);
    const { rows, setRows, markRead, markAll, isPending } = useNotificationRows([]);
    const unread = tab === 'ADMIN' ? counts.admin : counts.user;

    const load = useCallback((audience: Audience) => {
        void getNotifications(locale, { audience, take: DROPDOWN_ROWS }).then((res) => {
            if (res.success && res.data) {
                setRows(res.data.rows);
                setLoaded(audience);
            } else setLoaded('failed');
        });
    }, [locale, setRows]);

    useEffect(() => { load(tab); }, [load, tab]);
    useRealtimeEvent('new-notification', () => load(tab));

    const onTabKey = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            setTab((current) => (current === 'USER' ? 'ADMIN' : 'USER'));
        }
    };

    return (
        <>
            <DropdownHead
                id={headingId}
                title={t('title')}
                action={unread > 0 && (
                    <button type="button" disabled={isPending} onClick={() => markAll(tab)} className="text-xs font-semibold text-primary hover:underline disabled:opacity-50">{t('markAllRead')}</button>
                )}
            />
            {isAdmin && (
                <div role="tablist" aria-label={t('title')} onKeyDown={onTabKey} className="flex gap-4 border-b border-border px-4">
                    {(['USER', 'ADMIN'] as const).map((audience) => {
                        const count = audience === 'ADMIN' ? counts.admin : counts.user;
                        const selected = tab === audience;
                        return (
                            <button
                                key={audience}
                                type="button"
                                role="tab"
                                aria-selected={selected}
                                tabIndex={selected ? 0 : -1}
                                onClick={() => setTab(audience)}
                                className={clsx('-mb-px border-b-2 pb-2 pt-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary', selected ? 'border-primary font-semibold text-foreground' : 'border-transparent text-foreground-muted hover:text-foreground')}
                            >
                                {t(audience === 'ADMIN' ? 'tabAdmin' : 'tabPersonal')}
                                {count > 0 && <span className="ml-1 tabular-nums">{count}</span>}
                            </button>
                        );
                    })}
                </div>
            )}
            <div role={isAdmin ? 'tabpanel' : undefined} className="max-h-[min(70vh,28rem)] overflow-y-auto">
                {loaded === 'failed' ? (
                    <p className="px-4 py-6 text-center text-sm text-foreground-muted">{t('loadFailed')}</p>
                ) : loaded !== tab ? (
                    <LoadingRegion label={tCommon('loading')}>
                        <div className="px-4 py-2">{Array.from({ length: 3 }, (_, i) => <SkeletonRow key={i} />)}</div>
                    </LoadingRegion>
                ) : (
                    <NotificationList rows={rows} onRead={markRead} />
                )}
            </div>
            <DropdownFooter href={tab === 'ADMIN' ? { pathname: '/notifications', query: { tab: 'admin' } } : '/notifications'} label={t('all')} />
        </>
    );
}
