import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import SwipeWeek from './SwipeWeek';
import { Link } from '@/i18n/routing';
import { capitalizeFirst, useDateFormatter } from '@/lib/date-format';
import { addDays, dayNoon, mondayOf, weekRange, weekdayIndex, type DayKey } from '@/lib/discovery-dates';
import { discoveryHref, type DiscoveryParams } from '@/lib/discovery-params';
import type { EventWindow } from '@/lib/discovery-window';
import { UI } from '@/lib/constants';

type Props = { window: EventWindow; params: DiscoveryParams; counts: Record<DayKey, number> };

const KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

/** The week as seven days (AR-39): Monday first, the month between ‹ and ›, a dot under days with events, weekends tinted, the list's first day filled. */
export default function DayStrip({ window: w, params, counts }: Props) {
    const t = useTranslations('discovery');
    const tDays = useTranslations('common.weekdayInitials');
    const format = useDateFormatter();
    const thisMonday = mondayOf(w.today);
    // The choice's first selectable day is where the list starts by default; a tap on it needs no `day`.
    const start = w.period.from > w.today ? w.period.from : w.today;
    const weekHref = (monday: DayKey, day: DayKey | null) => discoveryHref(params, { date: monday === thisMonday ? { kind: 'week' } : weekRange(monday), day });
    const prev = w.week > thisMonday ? weekHref(addDays(w.week, -7), null) : null;
    const next = weekHref(addDays(w.week, 7), null);
    const month = capitalizeFirst(format.dateTimeRange(dayNoon(w.week), dayNoon(addDays(w.week, 6)), { month: 'long', year: 'numeric', timeZone: 'UTC' }));
    const arrow = 'grid size-9 place-items-center rounded-pill text-foreground-muted hover:bg-tint';

    return (
        <nav data-ui={UI.dayStrip} aria-label={t('days')} className="mb-3 rounded-2xl bg-surface p-2 pb-1.5 line shadow-card">
            <div className="mb-1 flex items-center justify-between">
                {prev ? <Link href={prev} scroll={false} aria-label={t('previousWeek')} className={arrow}><ChevronLeft aria-hidden="true" className="size-4" /></Link>
                    : <span aria-hidden="true" className={clsx(arrow, 'opacity-35')}><ChevronLeft className="size-4" /></span>}
                <p className="font-heading text-sm font-semibold text-foreground">{month}</p>
                <Link href={next} scroll={false} aria-label={t('nextWeek')} className={arrow}><ChevronRight aria-hidden="true" className="size-4" /></Link>
            </div>
            <SwipeWeek prev={prev} next={next}>
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 7 }, (_, i) => addDays(w.week, i)).map((day) => {
                        const n = counts[day] ?? 0;
                        const chosen = day === w.listFrom;
                        const past = day < w.today;
                        const inChoice = day >= w.period.from && day <= w.period.to;
                        const label = t('dayEvents', { date: format.dateTime(dayNoon(day), { dateStyle: 'full', timeZone: 'UTC' }), count: n });
                        const body = (
                            <>
                                <span className={clsx('text-[10px] font-semibold', chosen ? 'text-primary-foreground' : 'text-foreground-muted')}>{tDays(KEYS[weekdayIndex(day)])}</span>
                                <span className={clsx('font-heading text-[17px] font-semibold tabular-nums', !n && !chosen && 'opacity-60')}>{Number(day.slice(8))}</span>
                                <span aria-hidden="true" className={clsx('size-[5px] rounded-full', n && !past ? (chosen ? 'bg-primary-foreground' : 'bg-primary') : 'invisible')} />
                            </>
                        );
                        const look = clsx(
                            'flex min-h-11 flex-col items-center justify-center rounded-xl py-1',
                            chosen ? 'bg-primary text-primary-foreground' : clsx(weekdayIndex(day) >= 5 && 'bg-tint/40', day === w.today && 'bg-background ring-[1.5px] ring-inset ring-border')
                        );
                        if (past) return <span key={day} aria-disabled="true" aria-label={label} className={clsx(look, 'opacity-45')}>{body}</span>;
                        const href = inChoice
                            ? discoveryHref(params, { day: day === start ? null : day })
                            : weekHref(mondayOf(day), day === mondayOf(day) ? null : day);
                        return (
                            <Link key={day} href={href} scroll={false} aria-label={label} aria-current={chosen ? 'true' : day === w.today ? 'date' : undefined} className={clsx(look, !chosen && 'hover:bg-tint')}>{body}</Link>
                        );
                    })}
                </div>
            </SwipeWeek>
        </nav>
    );
}
