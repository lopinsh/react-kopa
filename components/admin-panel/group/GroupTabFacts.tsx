'use client';

import { useFormatter, useTranslations } from 'next-intl';
import type { GroupPanelData } from '@/lib/services/group-panel';

/** Five facts about the group, as a definition list. */
export default function GroupTabFacts({ data }: { data: GroupPanelData }) {
    const t = useTranslations('admin.panel.group.facts');
    const format = useFormatter();
    const rows: [string, string][] = [
        [t('owner'), data.ownerName ?? '–'],
        [t('created'), format.dateTime(data.createdAt, { dateStyle: 'medium' })],
        [t('members'), format.number(data.memberCount)],
        [t('access'), data.isPrivate ? t('private') : t('public')],
        [t('openReports'), format.number(data.reports.total)],
    ];
    return (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 px-4 py-3 text-meta">
            {rows.map(([label, value]) => (
                <div key={label} className="contents">
                    <dt className="text-foreground-muted">{label}</dt>
                    <dd className="text-right text-foreground [overflow-wrap:anywhere]">{value}</dd>
                </div>
            ))}
        </dl>
    );
}
