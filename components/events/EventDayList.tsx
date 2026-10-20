import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import EventRow from './EventRow';
import { capitalizeFirst, EVENT_DAY, useDateFormatter } from '@/lib/date-format';
import { addDays, dayNoon, type DayKey } from '@/lib/discovery-dates';
import type { EventRowData } from '@/lib/services/event-row';

type Props = {
    days: Array<{ day: DayKey; rows: EventRowData[] }>;
    today: DayKey;
    showGroup: boolean;
    showCity: boolean;
    /** Two columns (read down, then across) when the list itself is at least 48 rem wide. */
    columns?: boolean;
    /** Sits centred under the last day (the "next week" link, the "cut" note). */
    footer?: ReactNode;
    /** The search word, marked in the titles. */
    highlight?: string;
    /** Rows replace the history entry (the search's results). */
    replace?: boolean;
    /** Marks the title links for the search's arrow keys. */
    searchItem?: boolean;
    /** No surface, corners or side padding: it already sits on one (the search panel). */
    flat?: boolean;
};

/** Events under day headings on one surface (AR-54): "Šodien · pirmd., 12. okt.", "Rīt · …", then the capitalised date. Days without events have no heading. */
export default function EventDayList({ days, today, showGroup, showCity, columns = false, footer, highlight, replace, searchItem, flat = false }: Props) {
    const t = useTranslations('discovery');
    const format = useDateFormatter();
    const heading = (day: DayKey) => {
        const date = format.dateTime(dayNoon(day), { ...EVENT_DAY, timeZone: 'UTC' });
        if (day === today) return t('dayToday', { date });
        return day === addDays(today, 1) ? t('dayTomorrow', { date }) : capitalizeFirst(date);
    };
    return (
        <div className={flat ? '@container/events' : '@container/events rounded-2xl bg-surface px-3.5 pb-2.5 shadow-card frame'}>
            {days.map(({ day, rows }) => (
                <section key={day} className="border-t border-border first:border-t-0">
                    <h3 className="pb-0.5 pt-3 text-[13px] font-semibold text-foreground-muted">{heading(day)}</h3>
                    <div className={columns ? '@3xl/events:columns-2 @3xl/events:gap-x-6' : undefined}>
                        {rows.map((event) => <EventRow key={event.id} event={event} showGroup={showGroup} showCity={showCity} headingDay={day} highlight={highlight} replace={replace} searchItem={searchItem} />)}
                    </div>
                </section>
            ))}
            {footer && <div className="pb-1 pt-3 text-center">{footer}</div>}
        </div>
    );
}
