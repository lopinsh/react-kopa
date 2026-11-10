import EventDayList from '@/components/events/EventDayList';
import { useDayHeading } from '@/components/events/day-heading';
import HubEventCard from './HubEventCard';
import type { DayKey } from '@/lib/discovery-dates';
import type { EventRowData } from '@/lib/services/event-row';

type Props = { days: Array<{ day: DayKey; rows: EventRowData[] }>; today: DayKey; showCity: boolean };

/** Events under day headings (K1-15, K1-18): rows on one surface below `lg`; from `lg` cards in the board's `auto-fill` grid under each heading. */
export default function HubEventDays({ days, today, showCity }: Props) {
    const heading = useDayHeading(today);
    return (
        <>
            <div className="lg:hidden"><EventDayList days={days} today={today} showGroup showCity={showCity} /></div>
            <div className="hidden gap-section lg:grid">
                {days.map(({ day, rows }) => (
                    <section key={day}>
                        <h3 className="pb-2 text-item text-foreground">{heading(day)}</h3>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-[calc(1.25rem+var(--shadow-room))]">
                            {rows.map((event) => <HubEventCard key={event.id} event={event} />)}
                        </div>
                    </section>
                ))}
            </div>
        </>
    );
}
