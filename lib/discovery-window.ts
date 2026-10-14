import { DISCOVERY_DAY_RANGE_MAX } from '@/lib/constants';
import {
    addDays, addMonths, isThisWeek, mondayOf, monthOf, periodBounds, resolvePeriod,
    type DateChoice, type DayKey, type DayPeriod
} from '@/lib/discovery-dates';
import type { DiscoveryParams } from '@/lib/discovery-params';

type Bounds = { from: Date; to: Date };

/** Everything the Pasākumi page needs from the date choice and today (viewer's zone). */
export interface EventWindow {
    today: DayKey;
    /** 'This week' ranges are normalised to `{ kind: 'week' }`. */
    choice: DateChoice;
    /** The choice's days. */
    period: DayPeriod;
    /** The choice ended before today: the page redirects without `date` and `day`. */
    expired: boolean;
    /** Where the list starts: the later of the period's start, today and the strip's tapped day (when inside the period). */
    listFrom: DayKey;
    /** The list's and the facet counts' range. */
    bounds: Bounds;
    /** The strip's Monday. */
    week: DayKey;
    weekBounds: Bounds;
    /** The days the calendar's counts cover: this month and the next. */
    calendar: DayPeriod;
    calendarBounds: Bounds;
}

export function eventWindow(params: Pick<DiscoveryParams, 'date' | 'day'>, today: DayKey, zone: string): EventWindow {
    const choice: DateChoice = isThisWeek(params.date, today) ? { kind: 'week' } : params.date;
    const period = resolvePeriod(choice, today);
    const start = period.from > today ? period.from : today;
    const listFrom = params.day && params.day >= start && params.day <= period.to ? params.day : start;
    const week = mondayOf(listFrom);
    const first = monthOf(period.from) + '-01';
    const calFrom = first > today ? first : today;
    const lastOfNext = addDays(`${addMonths(monthOf(calFrom), 2)}-01`, -1);
    const cap = addDays(calFrom, DISCOVERY_DAY_RANGE_MAX - 1);
    const calendar = { from: calFrom, to: lastOfNext < cap ? lastOfNext : cap };
    return {
        today, choice, period,
        expired: period.to < today,
        listFrom,
        bounds: periodBounds({ from: listFrom, to: period.to }, zone),
        week,
        weekBounds: periodBounds({ from: week, to: addDays(week, 6) }, zone),
        calendar,
        calendarBounds: periodBounds(calendar, zone)
    };
}
