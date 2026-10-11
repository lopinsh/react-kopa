/**
 * Helpers for the event date and time fields. Values are "local" strings in the viewer's browser zone:
 * date "YYYY-MM-DD", time "HH:mm", together "YYYY-MM-DDTHH:mm" (what `new Date(...)` reads as local time).
 */

const pad = (n: number) => String(n).padStart(2, '0');

export const TIME_STEP_MINUTES = 15;

/** Local "YYYY-MM-DDTHH:mm" of an instant (ISO string or Date) in the browser's zone. */
export function toLocalValue(value: Date | string | null | undefined): string {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function splitLocal(value: string): { date: string; time: string } {
    const [date = '', time = ''] = value.split('T');
    return { date, time: time.slice(0, 5) };
}

export function joinLocal(date: string, time: string): string {
    return date ? `${date}T${time || '00:00'}` : '';
}

/** The local value `minutes` after `value`. */
export function addMinutesLocal(value: string, minutes: number): string {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return toLocalValue(new Date(d.getTime() + minutes * 60_000));
}

/** Minutes between two local values (end minus start); null when either is not a date. */
export function minutesBetween(start: string, end: string): number | null {
    const a = new Date(start).getTime();
    const b = new Date(end).getTime();
    return Number.isNaN(a) || Number.isNaN(b) ? null : Math.round((b - a) / 60_000);
}

/** Next full hour after `now`, as a local value (13:00 at 12:14; 13:00 at 12:00 too, never in the past). */
export function nextFullHourLocal(now: Date = new Date()): string {
    const d = new Date(now);
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return toLocalValue(d);
}

/** All times of a day in 15-minute steps: "00:00" .. "23:45". */
export const TIME_OPTIONS: string[] = Array.from({ length: (24 * 60) / TIME_STEP_MINUTES }, (_, i) => {
    const minutes = i * TIME_STEP_MINUTES;
    return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
});

/** "dd.mm.yyyy" for a "YYYY-MM-DD" date (European style in both languages). */
export function formatDateText(date: string): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    return m ? `${m[3]}.${m[2]}.${m[1]}` : '';
}

/** Reads typed text such as "5.3.2026", "05.03.2026", "05/03/2026" into "YYYY-MM-DD"; null when it is not a real date. */
export function parseDateText(text: string): string | null {
    const m = /^\s*(\d{1,2})[./-](\d{1,2})[./-](\d{4})\s*$/.exec(text);
    if (!m) return null;
    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = Number(m[3]);
    const probe = new Date(Date.UTC(year, month - 1, day));
    if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) return null;
    return `${year}-${pad(month)}-${pad(day)}`;
}
