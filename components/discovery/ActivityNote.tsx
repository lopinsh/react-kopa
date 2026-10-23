import { CalendarDays, Megaphone } from 'lucide-react';
import { useTimeZone, useTranslations } from 'next-intl';
import { useDateFormatter } from '@/lib/date-format';
import { meetingLine } from '@/lib/event-when';
import { DEFAULT_TIME_ZONE } from '@/lib/time-zone';
import type { CardActivity } from '@/lib/services/card-activity';

/**
 * The one-line note of a group's tab or chip: a running meeting (pulse), the next meeting (both name the event; the title shortens, the time never), the newest public announcement, else "Ko meklējam?".
 * Renders nothing when there is none.
 */
export default function ActivityNote({ activity, lookingFor }: { activity?: CardActivity; lookingFor: string | null }) {
    const t = useTranslations('discovery');
    const zone = useTimeZone() ?? DEFAULT_TIME_ZONE;
    const formatter = useDateFormatter();

    const ev = activity?.event;
    if (ev) {
        const running = !!ev.until;
        const when = meetingLine(ev, formatter, zone, { next: (date) => date, running: (until) => t('noteRunning', { until }) });
        return (
            <p className="flex min-w-0 items-center gap-1.5">
                {running
                    ? <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-primary motion-safe:animate-pulse" />
                    : <CalendarDays aria-hidden="true" className="size-3.5 shrink-0 text-foreground-muted" />}
                <span className="min-w-0 truncate">{ev.title}</span>
                <span className="shrink-0">· {when}</span>
            </p>
        );
    }
    const text = activity?.announcement ? t('latestAnnouncement', { title: activity.announcement.title }) : lookingFor;
    if (!text) return null;
    return (
        <p className="flex min-w-0 items-center gap-1.5">
            <Megaphone aria-hidden="true" className="size-3.5 shrink-0 text-foreground-muted" />
            <span className="truncate">{text}</span>
        </p>
    );
}
