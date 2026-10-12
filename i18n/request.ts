import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { MessageOverrideService } from '@/lib/services/message-override.service';
import { isTranslateModeActive } from '@/lib/translate-mode/server';
import { markMessages } from '@/lib/translate-mode/marker';
import { CityService } from '@/lib/services/city.service';
import { cookies } from 'next/headers';
import { DEFAULT_TIME_ZONE, TIME_ZONE_COOKIE, isValidTimeZone } from '@/lib/time-zone';

export default getRequestConfig(async ({ requestLocale }) => {
    // Validate the incoming locale
    let locale = await requestLocale;

    if (!locale || !routing.locales.includes(locale as 'lv' | 'en')) {
        locale = routing.defaultLocale;
    }

    // Read the request (cookie) before touching the database: it marks the render as dynamic first,
    // so a build without a database never queries it.
    const translateMode = await isTranslateModeActive();
    // Shipped messages plus admin edits (translation mode). Cached as plain text; markers are added per request.
    const merged = await MessageOverrideService.getMergedMessages(locale as 'lv' | 'en');
    const marked = translateMode ? markMessages(merged) : merged;
    // City names live in the database (admins add and rename them), so the `cities` namespace is filled from there (never marked: not editable as messages).
    const messages = { ...marked, cities: await CityService.getNames(locale) };

    // The viewer's browser zone, sent back by the client in a cookie; Riga until the first visit has set it.
    const zoneCookie = (await cookies()).get(TIME_ZONE_COOKIE)?.value;
    const timeZone = isValidTimeZone(zoneCookie) ? zoneCookie : DEFAULT_TIME_ZONE;

    return {
        locale,
        messages,
        timeZone,
    };
});
