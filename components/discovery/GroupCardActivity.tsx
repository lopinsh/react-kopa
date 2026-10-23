import { CalendarDays, Megaphone, Scissors } from 'lucide-react';
import { useTimeZone, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import CardContact from './CardContact';
import Faces from '@/components/ui/Faces';
import { useDateFormatter } from '@/lib/date-format';
import { meetingLine } from '@/lib/event-when';
import { DEFAULT_TIME_ZONE } from '@/lib/time-zone';
import type { CardActivity } from '@/lib/services/card-activity';
import type { Face } from '@/lib/services/event-panel';

type Props = {
    activity?: CardActivity;
    /** Tear-off rows visible at rest (0 or 1) and on hover (0 to 2): `cardRows`. */
    rows: { rest: number; hover: number };
    /** The group's public events page: the "+N events" link goes there. */
    eventsHref: string;
    faces?: Face[];
    memberCount: number;
    /** "Sazināties" for this group, or null (the team, who have no one to write to). */
    contact: { groupId: string; groupName: string; allowJoin: boolean } | null;
};

const ROW = 'items-start gap-2 text-meta';
const NAME = 'line-clamp-2 weight-strong text-foreground';

/**
 * A group card's tear-off (R21-G): perforation and scissors on top, a tone tint below, exactly as tall as its rows. The rows: one meeting (running with a pulse, else the next)
 * with "+N events", the newest announcement; the first shows at rest only beside a one-line description, all on hover. Always: faces, the member count, the round contact button.
 */
export default function GroupCardActivity({ activity, rows, eventsHref, faces = [], memberCount, contact }: Props) {
    const t = useTranslations('discovery');
    const tEvent = useTranslations('event');
    const zone = useTimeZone() ?? DEFAULT_TIME_ZONE;
    const formatter = useDateFormatter();
    const event = activity?.event;
    const announcement = activity?.announcement;
    // The first row that exists is the one that may show at rest; the second is hover only.
    const eventAtRest = rows.rest > 0;
    const announcementAtRest = rows.rest > 0 && !event;
    const when = event && meetingLine({ at: event.at, until: event.until }, formatter, zone, { next: (date) => date, running: (until) => tEvent('runningUntil', { until }) });

    return (
        <div className="relative flex shrink-0 flex-col gap-2 rounded-b-2xl px-[var(--card-pad)] py-3 tab-tint text-foreground">
            <span aria-hidden="true" className="perforation" />
            <Scissors aria-hidden="true" className="tear-scissors size-4" />
            {event && (
                <div className={`${eventAtRest ? 'flex' : 'hidden live:flex'} ${ROW}`}>
                    {event.until
                        ? <span aria-hidden="true" className="mx-1 mt-1.5 size-2 shrink-0 rounded-full bg-[var(--c)] motion-safe:animate-pulse" />
                        : <CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--c)]" />}
                    <span className="min-w-0">
                        <span className={`block ${NAME}`}>{event.title}</span>
                        <span className="block text-foreground-muted">
                            {when}
                            {activity.moreEvents > 0 && <> · <Link href={eventsHref} className="relative z-10 weight-strong text-primary underline underline-offset-2">{t('moreEvents', { count: activity.moreEvents })}</Link></>}
                        </span>
                    </span>
                </div>
            )}
            {announcement && (
                <div className={`${announcementAtRest ? 'flex' : 'hidden live:flex'} ${ROW}`}>
                    <Megaphone aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--c)]" />
                    <span className="min-w-0">
                        <span className={`block ${NAME}`}>{announcement.title}</span>
                        <span className="block text-foreground-muted">{formatter.dateTime(announcement.at, { day: 'numeric', month: 'short' })}</span>
                    </span>
                </div>
            )}
            <div className="flex min-h-8 min-w-0 items-center gap-2 text-meta">
                <Faces faces={faces} size="sm" ring="ring-[color-mix(in_srgb,var(--c)_var(--tab-mix),var(--surface))]" />
                <span className="min-w-0 truncate text-foreground-muted">{t('participants', { count: memberCount })}</span>
                {contact && <CardContact {...contact} />}
            </div>
        </div>
    );
}
