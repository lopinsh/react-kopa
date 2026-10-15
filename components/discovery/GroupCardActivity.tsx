import { CalendarDays, Megaphone } from 'lucide-react';
import { useTimeZone, useTranslations } from 'next-intl';
import { useDateFormatter } from '@/lib/date-format';
import { meetingLine } from '@/lib/event-when';
import type { CardActivity } from '@/lib/services/card-activity';

/**
 * A group card's bottom line (C2): the next meeting, else the newest public announcement, else the group's "Ko meklējam?" line;
 * with none of them nothing is drawn (the card ends without the line, and without its space). The note under the thin line.
 */
export default function GroupCardActivity({ activity, lookingFor }: { activity?: CardActivity; lookingFor: string | null }) {
    const t = useTranslations('discovery');
    const tEvent = useTranslations('event');
    const zone = useTimeZone() ?? 'Europe/Riga';
    const formatter = useDateFormatter();
    if (!activity && !lookingFor) return null;

    return (
        <div className="col-start-1 row-start-2 mx-3.5 mt-2 border-t border-border pb-[11px] pt-2 text-[13px] leading-snug">
            {activity?.kind === 'event' ? (
                <p className="flex min-h-[2lh] items-start gap-1.5 italic text-primary">
                    <CalendarDays aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                    <span className="line-clamp-2">{meetingLine(activity, formatter, zone, { next: (date) => t('nextMeeting', { date }), running: (until) => tEvent('runningUntil', { until }) })}</span>
                </p>
            ) : activity?.kind === 'announcement' ? (
                <p className="flex min-h-[2lh] items-start gap-1.5 italic text-primary">
                    <Megaphone aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                    <span className="line-clamp-2">{t('latestAnnouncement', { title: activity.title })}</span>
                </p>
            ) : (
                <p className="line-clamp-2 min-h-[2lh] italic text-primary">{lookingFor}</p>
            )}
        </div>
    );
}
