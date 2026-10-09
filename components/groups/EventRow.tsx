import { getFormatter, getTranslations } from 'next-intl/server';
import { Clock, Lock, MapPin, UserCheck, Users } from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import EventParticipation from '@/components/events/EventParticipation';
import { EVENT_TIME_ZONE, type EventJoinModeValue } from '@/lib/constants';
import type { AttendanceStatus } from '@prisma/client';

type Props = {
    event: {
        id: string;
        title: string;
        startDate: Date;
        endDate: Date | null;
        location: string | null;
        maxParticipants: number | null;
        isMembersOnly: boolean;
        joinMode: EventJoinModeValue;
        isFull: boolean;
        goingCount: number;
        myStatus: AttendanceStatus | null;
        canManage: boolean;
        pendingCount: number;
    };
    locale: string;
    href: string;
    /** Set for logged-out visitors. */
    requireSignIn?: boolean;
    isPast: boolean;
};


const BADGE = 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide';

/** One compact line per event: date · what/when/where · people · one action. */
export default async function EventRow({ event, locale, href, requireSignIn, isPast }: Props) {
    const t = await getTranslations('event');
    const formatter = await getFormatter();
    const start = new Date(event.startDate);
    const end = event.endDate ? new Date(event.endDate) : null;
    const time = { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: EVENT_TIME_ZONE } as const;
    const isRequest = event.joinMode === 'REQUEST';

    const people = [
        isPast ? (event.goingCount > 0 ? t('wentCount', { count: event.goingCount }) : null) : isRequest ? t('approvedCount', { count: event.goingCount }) : t('goingCount', { count: event.goingCount }),
        !isPast && event.maxParticipants ? t('aboutPeople', { count: event.maxParticipants }) : null
    ].filter(Boolean).join(' · ');

    return (
        <article className={clsx(
            'flex flex-col gap-3 rounded-2xl border border-border p-4 transition-colors hover:border-[var(--accent)] sm:flex-row sm:items-center sm:gap-5',
            isPast ? 'bg-surface-elevated/50' : 'bg-surface'
        )}>
            <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className={clsx(
                    'flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl',
                    isPast ? 'bg-surface-elevated text-foreground-muted' : 'bg-[var(--accent)]/10 text-[var(--accent)]'
                )}>
                    <span className="text-xl font-black leading-none">{formatter.dateTime(start, { day: 'numeric', timeZone: EVENT_TIME_ZONE })}</span>
                    <span className="mt-0.5 text-[10px] font-black uppercase">{formatter.dateTime(start, { month: 'short', timeZone: EVENT_TIME_ZONE })}</span>
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h3 className={clsx('min-w-0 text-base font-bold leading-snug', isPast ? 'text-foreground-muted' : 'text-foreground')}>
                            <Link href={href} className="hover:text-[var(--accent)] hover:underline">{event.title}</Link>
                        </h3>
                        {event.isMembersOnly && (
                            <span className={clsx(BADGE, 'bg-surface-elevated text-foreground-muted')}>
                                <Lock className="h-3 w-3" />
                                {t('membersOnly')}
                            </span>
                        )}
                        {isRequest && (
                            <span className={clsx(BADGE, 'bg-surface-elevated text-foreground-muted')}>
                                <UserCheck className="h-3 w-3" />
                                {t('badgeRequest')}
                            </span>
                        )}
                        {event.isFull && !isPast && (
                            <span className={clsx(BADGE, 'bg-[var(--accent)] text-white')}>{t('full')}</span>
                        )}
                    </div>

                    <p className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm text-foreground-muted">
                        <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            {formatter.dateTime(start, time)}{end ? `–${formatter.dateTime(end, time)}` : ''}
                        </span>
                        {event.location && (
                            <span className="inline-flex min-w-0 items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{event.location}</span>
                            </span>
                        )}
                    </p>

                    {people && (
                        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground-muted">
                            <Users className="h-3.5 w-3.5 shrink-0" />
                            {people}
                        </p>
                    )}
                </div>
            </div>

            {!isPast && (
                <div className="w-full shrink-0 sm:w-48">
                    {isRequest && event.canManage ? (
                        <Link
                            href={href}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs font-black uppercase tracking-wide text-foreground hover:border-[var(--accent)]"
                        >
                            {t('manage')}
                            {event.pendingCount > 0 && (
                                <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] text-white">
                                    {t('requestsWaiting', { count: event.pendingCount })}
                                </span>
                            )}
                        </Link>
                    ) : (
                        <EventParticipation
                            compact
                            eventId={event.id}
                            joinMode={event.joinMode}
                            isFull={event.isFull}
                            myStatus={event.myStatus}
                            locale={locale}
                            requireSignIn={requireSignIn}
                        />
                    )}
                </div>
            )}
        </article>
    );
}
