import type { DateTimeFormatOptions } from 'use-intl';
import { dayInZone } from '@/lib/discovery-dates';
import { EVENT_DAY, type DateFormatter } from '@/lib/date-format';

/**
 * The one wording of "the next meeting" (card, group panel, Informācija box). A running event says how long it goes on,
 * not the date it started: "Notiek tagad · līdz 19:00" (same day) or "… līdz svētd., 18. okt." (a later day). The day check
 * compares start with end, never with "now", so a client card renders the same text the server did.
 */
export function meetingLine(
    meeting: { at: Date | string; until: Date | string | null },
    formatter: DateFormatter,
    timeZone: string,
    words: { next: (when: string) => string; running: (until: string) => string },
    nextFormat: DateTimeFormatOptions = EVENT_DAY
): string {
    if (!meeting.until) return words.next(formatter.dateTime(new Date(meeting.at), nextFormat));
    const start = new Date(meeting.at);
    const end = new Date(meeting.until);
    const sameDay = dayInZone(start, timeZone) === dayInZone(end, timeZone);
    return words.running(sameDay ? formatter.dateTime(end, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }) : formatter.dateTime(end, EVENT_DAY));
}
