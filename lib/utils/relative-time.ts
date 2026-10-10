import type { useFormatter } from 'next-intl';

/**
 * "5 minutes ago" for something that already happened. `useNow` ticks only once a minute,
 * so an item that arrived after the last tick would otherwise read "in 14 seconds".
 */
export function relativeTo(format: ReturnType<typeof useFormatter>, date: Date, now: Date): string {
    return format.relativeTime(date, date > now ? date : now);
}
