import { useTranslations } from 'next-intl';
import { capitalizeFirst, EVENT_DAY, useDateFormatter } from '@/lib/date-format';
import { addDays, dayNoon, type DayKey } from '@/lib/discovery-dates';

/** The heading of a day in an events list: "Šodien · pirmd., 12. okt.", "Rīt · …", then the capitalised date. */
export function useDayHeading(today: DayKey): (day: DayKey) => string {
    const t = useTranslations('discovery');
    const format = useDateFormatter();
    return (day) => {
        const date = format.dateTime(dayNoon(day), { ...EVENT_DAY, timeZone: 'UTC' });
        if (day === today) return t('dayToday', { date });
        return day === addDays(today, 1) ? t('dayTomorrow', { date }) : capitalizeFirst(date);
    };
}
