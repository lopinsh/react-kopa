import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
    // Validate the incoming locale
    let locale = await requestLocale;

    if (!locale || !routing.locales.includes(locale as 'lv' | 'en')) {
        locale = routing.defaultLocale;
    }

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default,
        timeZone: 'UTC', // Required to avoid ENVIRONMENT_FALLBACK errors
    };
});
