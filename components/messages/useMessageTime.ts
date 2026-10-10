import { useFormatter } from 'next-intl';
import { EVENT_TIME_ZONE } from '@/lib/constants';

type Style = 'bubble' | 'list';

/**
 * Message timestamps through the next-intl formatters, in the site's time zone.
 * Today: just the time. Older days: the date (in a chat bubble, with the time as well).
 */
export function useMessageTime() {
    const format = useFormatter();

    const dayKey = (date: Date) => format.dateTime(date, { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: EVENT_TIME_ZONE });
    const year = (date: Date) => format.dateTime(date, { year: 'numeric', timeZone: EVENT_TIME_ZONE });
    const time = (date: Date) => format.dateTime(date, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: EVENT_TIME_ZONE });

    return (value: Date | string, style: Style = 'bubble'): string => {
        const date = new Date(value);
        const now = new Date();
        if (dayKey(date) === dayKey(now)) return time(date);

        const day = format.dateTime(date, {
            day: 'numeric',
            month: 'short',
            ...(year(date) === year(now) ? {} : { year: 'numeric' as const }),
            timeZone: EVENT_TIME_ZONE
        });
        return style === 'list' ? day : `${day}, ${time(date)}`;
    };
}
