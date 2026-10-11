import { useDateFormatter } from '@/lib/date-format';

type Style = 'bubble' | 'list';

/**
 * Message timestamps through the next-intl formatters, in the site's time zone.
 * Today: just the time. Older days: the date (in a chat bubble, with the time as well).
 */
export function useMessageTime() {
    const format = useDateFormatter();

    const dayKey = (date: Date) => format.dateTime(date, { year: 'numeric', month: 'numeric', day: 'numeric' });
    const year = (date: Date) => format.dateTime(date, { year: 'numeric' });
    const time = (date: Date) => format.dateTime(date, { hour: '2-digit', minute: '2-digit', hour12: false });

    return (value: Date | string, style: Style = 'bubble'): string => {
        const date = new Date(value);
        const now = new Date();
        if (dayKey(date) === dayKey(now)) return time(date);

        const day = format.dateTime(date, {
            day: 'numeric',
            month: 'short',
            ...(year(date) === year(now) ? {} : { year: 'numeric' as const })
        });
        return style === 'list' ? day : `${day}, ${time(date)}`;
    };
}
