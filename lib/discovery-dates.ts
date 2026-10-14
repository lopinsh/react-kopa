import { DISCOVERY_DAY_RANGE_MAX } from '@/lib/constants';

/** A plain calendar day, 'YYYY-MM-DD'. All day maths here is on these strings (UTC calendar arithmetic, never a local-zone getter). */
export type DayKey = string;
export type DateChoice =
    | { kind: 'week' }
    | { kind: 'today' }
    | { kind: 'weekend' }
    | { kind: 'day'; day: DayKey }
    | { kind: 'range'; from: DayKey; to: DayKey }
    | { kind: 'month'; month: string };
export interface DayPeriod { from: DayKey; to: DayKey }

const MS_PER_DAY = 86_400_000;
const DAY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const pad = (n: number) => String(n).padStart(2, '0');
const keyOf = (ms: number): DayKey => new Date(ms).toISOString().slice(0, 10);
const msOf = (day: DayKey): number => {
    const m = DAY_RE.exec(day);
    return m ? Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : NaN;
};

/** True for a real calendar date ('2026-02-30' is not). */
export function isDayKey(s: string): boolean {
    const ms = msOf(s);
    return Number.isFinite(ms) && keyOf(ms) === s;
}

export function addDays(day: DayKey, n: number): DayKey {
    return keyOf(msOf(day) + n * MS_PER_DAY);
}

/** 0 = Monday … 6 = Sunday. */
export function weekdayIndex(day: DayKey): number {
    return (new Date(msOf(day)).getUTCDay() + 6) % 7;
}

export function mondayOf(day: DayKey): DayKey {
    return addDays(day, -weekdayIndex(day));
}

/** The day `at` falls on in `zone`. */
export function dayInZone(at: Date, zone: string): DayKey {
    return new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(at);
}

function offsetMinutes(at: number, zone: string): number {
    const name = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'longOffset' })
        .formatToParts(new Date(at)).find((p) => p.type === 'timeZoneName')?.value ?? 'GMT';
    const m = /([+-])(\d{2}):(\d{2})/.exec(name);
    return m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0;
}

/** The instant `day` begins in `zone` (a clock change between UTC and local midnight is corrected; a skipped midnight gives the first instant of the day). */
export function zonedDayStart(day: DayKey, zone: string): Date {
    const guess = msOf(day);
    let at = guess - offsetMinutes(guess, zone) * 60_000;
    const again = guess - offsetMinutes(at, zone) * 60_000;
    if (again !== at) at = again;
    if (dayInZone(new Date(at), zone) === day) return new Date(at);
    // Local midnight does not exist: the first instant whose local day is `day`.
    let lo = at - MS_PER_DAY, hi = at + MS_PER_DAY;
    while (hi - lo > 1) {
        const mid = Math.floor((lo + hi) / 2);
        if (dayInZone(new Date(mid), zone) >= day) hi = mid; else lo = mid;
    }
    return new Date(hi);
}

/** The URL's `date` value as a choice: junk → this week, a reversed range swapped, a long range cut to DISCOVERY_DAY_RANGE_MAX days. */
export function parseDateChoice(raw: string | undefined): DateChoice {
    const s = (raw ?? '').trim();
    if (s === 'today') return { kind: 'today' };
    if (s === 'weekend') return { kind: 'weekend' };
    if (isDayKey(s)) return { kind: 'day', day: s };
    if (/^\d{4}-(0[1-9]|1[0-2])$/.test(s)) return { kind: 'month', month: s };
    const [a, b, ...rest] = s.split('..');
    if (b !== undefined && rest.length === 0 && isDayKey(a) && isDayKey(b)) {
        const [from, to] = a <= b ? [a, b] : [b, a];
        if (from === to) return { kind: 'day', day: from };
        const last = addDays(from, DISCOVERY_DAY_RANGE_MAX - 1);
        return { kind: 'range', from, to: to > last ? last : to };
    }
    return { kind: 'week' };
}

/** The URL's `date` value, or null for this week (the default is never written). */
export function serializeDateChoice(c: DateChoice): string | null {
    switch (c.kind) {
        case 'week': return null;
        case 'today': case 'weekend': return c.kind;
        case 'day': return c.day;
        case 'range': return `${c.from}..${c.to}`;
        case 'month': return c.month;
    }
}

/** The days a choice covers (inclusive), for a given today. */
export function resolvePeriod(c: DateChoice, today: DayKey): DayPeriod {
    switch (c.kind) {
        case 'week': { const mon = mondayOf(today); return { from: mon, to: addDays(mon, 6) }; }
        case 'today': return { from: today, to: today };
        case 'weekend': {
            const sat = addDays(mondayOf(today), 5);
            return { from: today > sat ? today : sat, to: addDays(sat, 1) };
        }
        case 'day': return { from: c.day, to: c.day };
        case 'range': return { from: c.from, to: c.to };
        case 'month': {
            const [y, m] = c.month.split('-').map(Number);
            return { from: `${c.month}-01`, to: keyOf(Date.UTC(y, m, 0)) };
        }
    }
}

/** [start of `from`, start of the day after `to`) in `zone`. */
export function periodBounds(p: DayPeriod, zone: string): { from: Date; to: Date } {
    return { from: zonedDayStart(p.from, zone), to: zonedDayStart(addDays(p.to, 1), zone) };
}

/** Šonedēļ: the week choice, or the range Monday–Sunday of today's week. */
export function isThisWeek(c: DateChoice, today: DayKey): boolean {
    if (c.kind === 'week') return true;
    const w = resolvePeriod({ kind: 'week' }, today);
    return c.kind === 'range' && c.from === w.from && c.to === w.to;
}

export function weekRange(monday: DayKey): DateChoice {
    return { kind: 'range', from: monday, to: addDays(monday, 6) };
}

/** A day as a Date at 12:00 UTC, for the formatters (always with `timeZone: 'UTC'`). */
export function dayNoon(day: DayKey): Date {
    return new Date(msOf(day) + 12 * 3_600_000);
}

/** 'YYYY-MM' of a day. */
export function monthOf(day: DayKey): string {
    return day.slice(0, 7);
}

/** The month `n` months from `month` ('YYYY-MM'). */
export function addMonths(month: string, n: number): string {
    const [y, m] = month.split('-').map(Number);
    const total = y * 12 + (m - 1) + n;
    return `${Math.floor(total / 12)}-${pad((total % 12) + 1)}`;
}

/** A whole week as the choice: Šonedēļ, or a Monday–Sunday range. */
export function isWeekChoice(c: DateChoice): boolean {
    return c.kind === 'week' || (c.kind === 'range' && weekdayIndex(c.from) === 0 && c.to === addDays(c.from, 6));
}
