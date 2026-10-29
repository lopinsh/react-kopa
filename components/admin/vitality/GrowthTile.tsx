import { useFormatter, useTranslations } from 'next-intl';
import type { VitalitySeries } from '@/lib/services/vitality.service';
import WeeklyBars from './WeeklyBars';

/** One growth number: total, the last 7 and 30 days, the change against the 30 days before, and 12 weekly bars. */
export default function GrowthTile({ series }: { series: VitalitySeries }) {
    const t = useTranslations('admin.vitality');
    const format = useFormatter();
    const label = t(`series.${series.key}`);
    const delta = series.last30 - series.prev30;
    const signed = format.number(delta, { signDisplay: 'exceptZero' });

    let change: string;
    if (delta === 0) change = t('noChange');
    else if (series.prev30 === 0) change = t('changeNoBase', { delta: signed });
    else change = t('change', { delta: signed, percent: format.number(delta / series.prev30, { style: 'percent', maximumFractionDigits: 0, signDisplay: 'exceptZero' }) });

    return (
        <div className="min-w-0 space-y-1">
            <p className="text-meta text-foreground-muted">{label}</p>
            <p className="text-title tabular-nums">{format.number(series.total)}</p>
            <p className="text-meta">{t('recent', { week: format.number(series.last7), month: format.number(series.last30) })}</p>
            <p className="text-meta text-foreground-muted">{change}</p>
            <div className="pt-2"><WeeklyBars label={label} weeks={series.weeks} /></div>
        </div>
    );
}
