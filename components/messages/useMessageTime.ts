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

/** The pieces of a chat's timeline: the time inside a bubble, a key that changes with the day, and the label of the day divider. */
export function useChatTimeline() {
    const format = useDateFormatter();
    const time = (value: Date | string) => format.dateTime(new Date(value), { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    const dayKey = (value: Date | string) => format.dateTime(new Date(value), { year: 'numeric', month: 'numeric', day: 'numeric' });
    const dayLabel = (value: Date | string) => {
        const date = new Date(value);
        const sameYear = format.dateTime(date, { year: 'numeric' }) === format.dateTime(new Date(), { year: 'numeric' });
        return format.dateTime(date, { day: 'numeric', month: 'long', ...(sameYear ? {} : { year: 'numeric' as const }) });
    };
    return { time, dayKey, dayLabel };
}
