'use client';

import { useTimeZone, useTranslations } from 'next-intl';
import { Bell } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import { dayInZone } from '@/lib/discovery-dates';
import type { NotificationView } from '@/lib/types/own-area';
import NotificationItem from './NotificationItem';

/** Rows under "Šodien" and "Agrāk" (the day in the viewer's zone), or the quiet empty state. Opening nothing here marks nothing (OD-22). */
export default function NotificationList({ rows, onRead }: { rows: NotificationView[]; onRead: (n: NotificationView) => void }) {
    const t = useTranslations('notifications');
    const zone = useTimeZone() ?? 'UTC';

    if (rows.length === 0) return <EmptyState icon={Bell} title={t('emptyTitle')} description={t('emptyText')} />;

    const today = dayInZone(new Date(), zone);
    const groups = [
        { key: 'today', title: t('today'), rows: rows.filter((n) => dayInZone(new Date(n.createdAt), zone) === today) },
        { key: 'earlier', title: t('earlier'), rows: rows.filter((n) => dayInZone(new Date(n.createdAt), zone) !== today) },
    ].filter((g) => g.rows.length > 0);

    return (
        <div>
            {groups.map((g) => (
                <section key={g.key} aria-labelledby={`nt-${g.key}`}>
                    <h3 id={`nt-${g.key}`} className="px-4 pb-1 pt-3 text-xs font-semibold text-foreground-muted">{g.title}</h3>
                    <ul className="divide-y divide-border">
                        {g.rows.map((n) => <NotificationItem key={n.id} n={n} onRead={onRead} />)}
                    </ul>
                </section>
            ))}
        </div>
    );
}
