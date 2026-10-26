'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { AdminActionEntry } from '@/lib/services/moderation.service';

/** The last log entries on this group. */
export default function GroupTabLog({ log, groupId }: { log: AdminActionEntry[]; groupId: string }) {
    const t = useTranslations('admin.panel.group');
    const tMod = useTranslations('moderation');
    const format = useFormatter();
    return (
        <section className="flex flex-col gap-2 px-4 py-3">
            <p className="text-meta weight-strong text-foreground-muted">{tMod('logTitle')}</p>
            {log.length === 0 ? (
                <p className="text-meta text-foreground-muted">{t('logNone')}</p>
            ) : (
                <ul className="flex flex-col gap-2">
                    {log.map((e) => (
                        <li key={e.id} className="flex flex-col">
                            <span className="text-meta text-foreground">
                                {tMod.has(`action_${e.action}`) ? tMod(`action_${e.action}` as 'action_GROUP_HIDE') : tMod('logAction')}
                                {e.adminName ? ` · ${e.adminName}` : ''}
                            </span>
                            <span className="text-meta text-foreground-muted">{format.dateTime(e.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            {e.reason && <span className="line-clamp-1 text-meta text-foreground-muted">{e.reason}</span>}
                        </li>
                    ))}
                </ul>
            )}
            <Link href={`/admin?tab=moderation&group=${groupId}`} className="text-meta text-primary hover:underline">{t('logAll')}</Link>
        </section>
    );
}
