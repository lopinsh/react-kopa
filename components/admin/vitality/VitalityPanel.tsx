import { useFormatter, useTranslations } from 'next-intl';
import type { VitalitySnapshot } from '@/lib/services/vitality.service';
import DemoToggle from './DemoToggle';
import GrowthTile from './GrowthTile';
import GroupHealth from './GroupHealth';
import PresenceCard from './PresenceCard';

const CARD = 'space-y-4 rounded-2xl border border-border bg-surface p-4 sm:p-6';

/** The top of Admin > Aktivitāte (R31): is the site alive. Counts only. */
export default function VitalityPanel({ snapshot }: { snapshot: VitalitySnapshot }) {
    const t = useTranslations('admin.vitality');
    const format = useFormatter();
    const p = snapshot.participation;
    const n = (v: number) => format.number(v);
    const window = (week: number, month: number) => t('perWindow', { week: n(week), month: n(month) });
    const inGroup = format.number(p.users === 0 ? 0 : p.inGroup / p.users, { style: 'percent', maximumFractionDigits: 0 });
    const rows = [
        [t('inGroup'), t('inGroupValue', { percent: inGroup, none: Math.max(0, p.users - p.inGroup) })],
        [t('avgMembers'), format.number(p.avgMembers, { maximumFractionDigits: 1, minimumFractionDigits: 1 })],
        [t('groupsMin3'), n(p.groupsMin3)],
        [t('messages'), window(p.messages7, p.messages30)],
        [t('posts'), window(p.posts7, p.posts30)],
    ];

    return (
        <div className="space-y-section">
            <DemoToggle on={snapshot.includeDemo} />
            {snapshot.presence && <PresenceCard presence={snapshot.presence} now={new Date()} />}
            <section className={CARD} aria-labelledby="vitality-growth">
                <h2 id="vitality-growth" className="text-section">{t('growth')}</h2>
                <div className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 lg:grid-cols-3">
                    {snapshot.series.map((s) => <GrowthTile key={s.key} series={s} />)}
                </div>
            </section>
            <section className={CARD} aria-labelledby="vitality-participation">
                <h2 id="vitality-participation" className="text-section">{t('participation')}</h2>
                <dl className="divide-y divide-border">
                    {rows.map(([label, value]) => (
                        <div key={label} className="flex items-baseline justify-between gap-4 py-2 text-body-sm">
                            <dt className="min-w-0">{label}</dt>
                            <dd className="shrink-0 text-right tabular-nums">{value}</dd>
                        </div>
                    ))}
                </dl>
            </section>
            <GroupHealth health={snapshot.health} />
        </div>
    );
}
