import { useTranslations } from 'next-intl';
import { useDateFormatter } from '@/lib/date-format';

const W = 120;
const H = 32;
const GAP = 2;
const WEEK_DATE = { day: 'numeric', month: 'short' } as const;

type Props = { label: string; weeks: { week: string; count: number }[] };

/** Twelve weekly bars as inline SVG: the shape only, scaled to the series' own maximum; the tile text carries the numbers. */
export default function WeeklyBars({ label, weeks }: Props) {
    const t = useTranslations('admin.vitality');
    const format = useDateFormatter();
    const max = Math.max(1, ...weeks.map((w) => w.count));
    const barW = (W - GAP * (weeks.length - 1)) / weeks.length;
    const values = weeks.map((w) => w.count).join(', ');

    return (
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={t('chartLabel', { series: label, values })} className="h-8 w-full">
            {weeks.map((w, i) => {
                const last = i === weeks.length - 1;
                const h = w.count === 0 ? 1 : Math.max(1, (w.count / max) * H);
                const date = format.dateTime(new Date(`${w.week}T12:00:00Z`), WEEK_DATE);
                return (
                    <rect
                        key={w.week}
                        x={i * (barW + GAP)}
                        y={H - h}
                        width={barW}
                        height={h}
                        className={w.count === 0 ? 'fill-[var(--border)]' : last ? 'fill-[var(--foreground-muted)]' : 'fill-[var(--primary)]'}
                    >
                        <title>{last ? t('weekBarPartial', { count: w.count }) : t('weekBar', { date, count: w.count })}</title>
                    </rect>
                );
            })}
        </svg>
    );
}
