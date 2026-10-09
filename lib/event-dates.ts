import { EVENT_TIME_ZONE } from '@/lib/constants';

/** The instant today began (midnight) in Latvian time. */
export function startOfTodayInRiga(now: Date = new Date()): Date {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: EVENT_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(now);
    const get = (type: string) => Number(parts.find(p => p.type === type)?.value);
    const utcMidnight = Date.UTC(get('year'), get('month') - 1, get('day'));
    // Offset of Riga from UTC at that midnight, e.g. "GMT+03:00".
    const offsetName = new Intl.DateTimeFormat('en-US', { timeZone: EVENT_TIME_ZONE, timeZoneName: 'longOffset' })
        .formatToParts(new Date(utcMidnight)).find(p => p.type === 'timeZoneName')?.value ?? 'GMT';
    const match = offsetName.match(/([+-])(\d{2}):(\d{2})/);
    const offsetMinutes = match ? (match[1] === '-' ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3])) : 0;
    return new Date(utcMidnight - offsetMinutes * 60_000);
}

/**
 * An event is past once its last day (end date, or start date) is before today in Latvian time.
 * During the event's own day it stays active: people can still join or arrive late.
 */
export function isEventPast(event: { startDate: Date | string; endDate?: Date | string | null }, now: Date = new Date()): boolean {
    const last = new Date(event.endDate ?? event.startDate);
    return last < startOfTodayInRiga(now);
}
