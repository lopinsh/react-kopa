import { capitalizeFirst, type DateFormatter } from '@/lib/date-format';
import { dayNoon, isThisWeek, type DateChoice, type DayKey } from '@/lib/discovery-dates';

const SHORT = { day: 'numeric', month: 'short', timeZone: 'UTC' } as const;

/** The date choice as the filter line says it: "Šonedēļ", "Šodien", "Nedēļas nogalē", "15. okt.", "15.–18. okt.", "Novembris". */
export function dateChoiceLabel(
    choice: DateChoice,
    today: DayKey,
    format: DateFormatter,
    words: { week: string; today: string; weekend: string }
): string {
    switch (choice.kind) {
        case 'week': return words.week;
        case 'today': return words.today;
        case 'weekend': return words.weekend;
        case 'day': return format.dateTime(dayNoon(choice.day), SHORT);
        case 'range':
            return isThisWeek(choice, today) ? words.week : format.dateTimeRange(dayNoon(choice.from), dayNoon(choice.to), SHORT);
        case 'month': {
            const thisYear = choice.month.slice(0, 4) === today.slice(0, 4);
            return capitalizeFirst(format.dateTime(dayNoon(`${choice.month}-01`), { month: 'long', ...(thisYear ? {} : { year: 'numeric' }), timeZone: 'UTC' }));
        }
    }
}
