import { createFormatter, useLocale, useTimeZone } from 'next-intl';

/**
 * Dates and times use the European style in both site languages for now (owner, 2026-10-11):
 * day before month, 24-hour time. Latvian already does; English formats with British conventions
 * ("Sun 11 Oct", "11 Oct 2026, 17:00") instead of the US ones next-intl's `en` would give.
 * Later the viewer may pick a format in settings.
 */
export function dateLocale(locale: string): string {
    return locale === 'en' ? 'en-GB' : locale;
}

/** A next-intl formatter for dates and times in the viewer's zone and the site's date style. */
export function createDateFormatter(locale: string, timeZone: string | undefined) {
    return createFormatter({ locale: dateLocale(locale), timeZone });
}

/** "Svētd., 18. okt." / "Sun, 18 Oct": the date of an event, with the weekday (AR-11). */
export const EVENT_DAY = { weekday: 'short', day: 'numeric', month: 'short' } as const;
/** "Svētd., 18. okt. 17:00" / "Sun, 18 Oct, 17:00": 24-hour time in the viewer's zone. */
export const EVENT_DAY_TIME = { ...EVENT_DAY, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' } as const;
/** "Svētd., 17:00": weekday and time, next to a date tile. */
export const EVENT_WEEKDAY_TIME = { weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' } as const;

/** Sentence case for a formatted date: Latvian writes weekdays in lower case inside a date ("svētd., …"). */
export function capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export type DateFormatter = ReturnType<typeof createDateFormatter>;

/**
 * Use instead of `useFormatter()` for dates and times (works in Server and Client Components).
 * Async Server Components: `createDateFormatter(await getLocale(), await getTimeZone())`.
 */
export function useDateFormatter(): DateFormatter {
    return createDateFormatter(useLocale(), useTimeZone());
}
