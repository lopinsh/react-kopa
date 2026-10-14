import { DEFAULT_TIME_ZONE as EVENT_TIME_ZONE } from '@/lib/time-zone';
import { dayInZone, zonedDayStart } from '@/lib/discovery-dates';

// "Past" is one fact for everyone, so it is decided at the Latvian day boundary, not per viewer zone.

/** The instant today began (midnight) in Latvian time. */
export function startOfTodayInRiga(now: Date = new Date()): Date {
    return zonedDayStart(dayInZone(now, EVENT_TIME_ZONE), EVENT_TIME_ZONE);
}

/**
 * An event is past once its last day (end date, or start date) is before today in Latvian time.
 * During the event's own day it stays active: people can still join or arrive late.
 */
export function isEventPast(event: { startDate: Date | string; endDate?: Date | string | null }, now: Date = new Date()): boolean {
    const last = new Date(event.endDate ?? event.startDate);
    return last < startOfTodayInRiga(now);
}
