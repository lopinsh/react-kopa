/**
 * Viewer time zone. Times are stored in UTC and shown in the viewer's browser zone.
 * The browser tells the server through the `tz` cookie (see TimeZoneSync); until it has, the
 * default below is used so a first visit still reads sensibly for a Latvian audience.
 */
export const TIME_ZONE_COOKIE = 'tz';
export const DEFAULT_TIME_ZONE = 'Europe/Riga';

/** True when the runtime knows the IANA zone name (cookie values are user-controlled input). */
export function isValidTimeZone(value: string | null | undefined): value is string {
    if (!value || value.length > 64) return false;
    try {
        new Intl.DateTimeFormat('en', { timeZone: value });
        return true;
    } catch {
        return false;
    }
}
