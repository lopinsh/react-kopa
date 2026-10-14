import { capitalizeFirst, type DateFormatter } from '@/lib/date-format';
import { dayNoon, isThisWeek, monthOf, type DateChoice, type DayKey } from '@/lib/discovery-dates';

const SHORT = { day: 'numeric', month: 'short', timeZone: 'UTC' } as const;

/**
 * "15.–18. okt." / "15–18 Oct", or "30. okt. – 2. nov." across months. Built from single dates (not `dateTimeRange`) because the
 * server's and the browser's ICU write the range differently and the page would not hydrate.
 */
function shortRange(format: DateFormatter, from: DayKey, to: DayKey): string {
    const [a, b] = [format.dateTime(dayNoon(from), SHORT), format.dateTime(dayNoon(to), SHORT)];
    if (monthOf(from) !== monthOf(to)) return `${a} – ${b}`;
    const month = format.dateTime(dayNoon(from), { month: 'short', timeZone: 'UTC' });
    return `${a.replace(month, '').trim()}–${b}`;
}

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
            return isThisWeek(choice, today) ? words.week : shortRange(format, choice.from, choice.to);
        case 'month': {
            const thisYear = choice.month.slice(0, 4) === today.slice(0, 4);
            return capitalizeFirst(format.dateTime(dayNoon(`${choice.month}-01`), { month: 'long', ...(thisYear ? {} : { year: 'numeric' }), timeZone: 'UTC' }));
        }
    }
}
