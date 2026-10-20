'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { getNotifications } from '@/actions/notification-actions';
import { useNotificationRows } from '@/hooks/useNotificationRows';
import { useRealtimeEvent } from '@/components/providers/RealtimeProvider';
import { useOwnCounts } from '@/components/providers/OwnCountsProvider';
import { LoadingRegion, SkeletonRow } from '@/components/ui/Skeleton';
import { DROPDOWN_ROWS } from '@/lib/constants';
import BellPanel, { type Audience } from './BellPanel';
import NotificationList from './NotificationList';

/**
 * What the bell opens (AR-65, cmv9ahbt5): the last five of a tab. Fetched when it opens, again on a tab change or a live notification.
 * Opening marks nothing (OD-22): a row is read when it is tapped, a tab with "Atzīmēt visus kā izlasītus".
 */
export default function BellList({ headingId, isAdmin }: { headingId: string; isAdmin: boolean }) {
    const t = useTranslations('notifications');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const counts = useOwnCounts().notifications;
    const [tab, setTab] = useState<Audience>('USER');
    const [loaded, setLoaded] = useState<Audience | 'failed' | null>(null);
    const { rows, setRows, markRead, markAll, isPending } = useNotificationRows([]);

    // Only the newest request may fill the list: a quick tab switch must not show the other tab's rows under it.
    const latest = useRef(0);

    const load = useCallback((audience: Audience) => {
        const request = ++latest.current;
        void getNotifications(locale, { audience, take: DROPDOWN_ROWS }).then((res) => {
            if (request !== latest.current) return;
            if (res.success && res.data) {
                setRows(res.data.rows);
                setLoaded(audience);
            } else setLoaded('failed');
        });
    }, [locale, setRows]);

    useEffect(() => { load(tab); }, [load, tab]);
    useRealtimeEvent('new-notification', () => load(tab));

    return (
        <BellPanel headingId={headingId} isAdmin={isAdmin} tab={tab} onTab={setTab} counts={counts} onMarkAll={() => markAll(tab)} markAllDisabled={isPending}>
            {loaded === 'failed' ? (
                <p className="px-4 py-6 text-center text-body-sm text-foreground-muted">{t('loadFailed')}</p>
            ) : loaded !== tab ? (
                <LoadingRegion label={tCommon('loading')}>
                    <div className="px-4 py-2">{Array.from({ length: 3 }, (_, i) => <SkeletonRow key={i} />)}</div>
                </LoadingRegion>
            ) : (
                <NotificationList rows={rows} onRead={markRead} />
            )}
        </BellPanel>
    );
}
