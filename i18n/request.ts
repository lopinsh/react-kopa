import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { MessageOverrideService } from '@/lib/services/message-override.service';
import { isTranslateModeActive } from '@/lib/translate-mode/server';
import { markMessages } from '@/lib/translate-mode/marker';

export default getRequestConfig(async ({ requestLocale }) => {
    // Validate the incoming locale
    let locale = await requestLocale;

    if (!locale || !routing.locales.includes(locale as 'lv' | 'en')) {
        locale = routing.defaultLocale;
    }

    // Shipped messages plus admin edits (translation mode). Cached as plain text; markers are added per request.
    const merged = await MessageOverrideService.getMergedMessages(locale as 'lv' | 'en');
    const messages = (await isTranslateModeActive()) ? markMessages(merged) : merged;

    return {
        locale,
        messages,
        timeZone: 'UTC', // Required to avoid ENVIRONMENT_FALLBACK errors
    };
});
