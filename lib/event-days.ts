import { dayInZone, type DayKey } from '@/lib/discovery-dates';

/**
 * Rows grouped under the day they show on, in the order of the rows: an event that started before `from` sits under `from`'s day
 * (the same rule as the per-day counts, so a strip dot and a heading never disagree).
 */
export function groupByDay<T extends { startDate: Date }>(rows: T[], from: Date, zone: string): Array<{ day: DayKey; rows: T[] }> {
    const days: Array<{ day: DayKey; rows: T[] }> = [];
    for (const row of rows) {
        const at = Math.max(row.startDate.getTime(), from.getTime());
        const day = dayInZone(new Date(at), zone);
        const last = days[days.length - 1];
        if (last && last.day === day) last.rows.push(row);
        else days.push({ day, rows: [row] });
    }
    return days;
}
