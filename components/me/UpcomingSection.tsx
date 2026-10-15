import EventDayList from '@/components/events/EventDayList';
import type { MyGroupsOverview } from '@/lib/types/own-area';

/** Tuvākie pasākumi (AR-54): the next 30 days of your groups' events, and of events you are going to, under day headings, two columns when wide. */
export default function UpcomingSection({ overview }: { overview: Pick<MyGroupsOverview, 'upcoming' | 'today'> }) {
    return <EventDayList days={overview.upcoming} today={overview.today} showGroup showCity columns />;
}
