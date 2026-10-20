import { CalendarDays } from 'lucide-react';
import { useTranslations } from 'next-intl';
import DayStrip from './dates/DayStrip';
import EmptyState from '@/components/ui/EmptyState';
import TextLink from '@/components/ui/TextLink';
import EventDayList from '@/components/events/EventDayList';
import { addDays, isThisWeek, isWeekChoice, weekRange, type DayKey } from '@/lib/discovery-dates';
import { discoveryHref, type DiscoveryParams } from '@/lib/discovery-params';
import { groupByDay } from '@/lib/event-days';
import type { EventWindow } from '@/lib/discovery-window';
import type { EventRowData } from '@/lib/services/event-row';
import { DISCOVERY_EVENTS_MAX_LIMIT } from '@/lib/constants';

type Props = {
    events: EventRowData[];
    hasMore: boolean;
    window: EventWindow;
    params: DiscoveryParams;
    zone: string;
    /** Events per day of the strip's week. */
    weekCounts: Record<DayKey, number>;
};

/** Pasākumi (AR-54): the day strip, then the events under day headings; a week choice ends with "Rādīt nākamo nedēļu", a cut list with a quiet note. */
export default function EventResults({ events, hasMore, window: w, params, zone, weekCounts }: Props) {
    const t = useTranslations('discovery');
    const nextWeek = isWeekChoice(w.choice) ? (
        <TextLink href={discoveryHref(params, { date: weekRange(addDays(w.week, 7)), day: null })}>{t('showNextWeek')}</TextLink>
    ) : null;

    return (
        <>
            <DayStrip window={w} params={params} counts={weekCounts} />
            {events.length === 0 ? (
                <>
                    <EmptyState icon={CalendarDays} title={isThisWeek(w.choice, w.today) ? t('noEventsThisWeek') : t('noEventsInPeriod')} description={t('adjustFilters')} />
                    {nextWeek && <div className="text-center">{nextWeek}</div>}
                </>
            ) : (
                <EventDayList
                    days={groupByDay(events, w.bounds.from, zone)}
                    today={w.today}
                    showGroup
                    showCity={params.cities.length !== 1}
                    columns
                    highlight={params.q}
                    footer={hasMore ? <p className="text-meta text-foreground-muted">{t('eventsCut', { count: DISCOVERY_EVENTS_MAX_LIMIT })}</p> : nextWeek}
                />
            )}
        </>
    );
}
