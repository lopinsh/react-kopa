'use client';

import type { Ref } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { GroupPanelData } from '@/lib/services/group-panel';

/** Up to five open reports on this group. `labelRef` takes the shield's "reports" focus request. */
export default function GroupTabReports({ reports, labelRef }: { reports: GroupPanelData['reports']; labelRef: Ref<HTMLParagraphElement> }) {
    const t = useTranslations('admin.panel.group');
    const format = useFormatter();
    return (
        <section className="flex flex-col gap-2 px-4 py-3">
            <p ref={labelRef} tabIndex={-1} className="text-meta weight-strong text-foreground-muted outline-none">{t('reportsTitle')}</p>
            {reports.items.length === 0 ? (
                <p className="text-meta text-foreground-muted">{t('reportsNone')}</p>
            ) : (
                <ul className="flex flex-col gap-2">
                    {reports.items.map((r) => (
                        <li key={r.id} className="flex flex-col">
                            <span className="line-clamp-2 text-meta text-foreground [overflow-wrap:anywhere]">{r.reason}</span>
                            <span className="text-meta text-foreground-muted">{format.dateTime(r.createdAt, { dateStyle: 'medium' })}</span>
                        </li>
                    ))}
                </ul>
            )}
            <Link href="/admin/reports" className="text-meta text-primary hover:underline">{t('reportsAll')}</Link>
        </section>
    );
}
