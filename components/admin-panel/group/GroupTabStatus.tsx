'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
import type { GroupPanelData } from '@/lib/services/group-panel';

/** Top of the Grupa tab: the group's title, theme and whether it is visible. */
export default function GroupTabStatus({ data }: { data: GroupPanelData }) {
    const t = useTranslations('admin.panel.group');
    const format = useFormatter();
    const { status } = data;
    const theme = [data.theme.l1, ...data.theme.l2].join(' · ');

    return (
        <section className="flex flex-col gap-1 px-4 py-3">
            <div className="flex items-start justify-between gap-2">
                <Link href={data.href} className="min-w-0 text-title text-foreground [overflow-wrap:anywhere] hover:underline">{data.title}</Link>
                <span className={clsx('shrink-0 rounded-pill px-2 text-meta', status.hidden ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary')}>
                    {status.hidden ? t('hidden') : t('visible')}
                </span>
            </div>
            <p className="text-meta text-foreground-muted [overflow-wrap:anywhere]">{theme}</p>
            {status.hidden && (
                <>
                    {status.reason && <p className="text-meta text-foreground [overflow-wrap:anywhere]">{status.reason}</p>}
                    <p className="text-meta text-foreground-muted">
                        {t('hiddenMeta', { who: status.by ?? t('unknownAdmin'), when: format.dateTime(status.at, { dateStyle: 'medium', timeStyle: 'short' }) })}
                    </p>
                </>
            )}
        </section>
    );
}
