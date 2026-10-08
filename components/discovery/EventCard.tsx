import { Calendar, MapPin, Users, ArrowRight, Lock, UserCheck } from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { EVENT_TIME_ZONE } from '@/lib/constants';
import { useFormatter, useTranslations } from 'next-intl';
import { cityLabel } from '@/lib/city-label';
import type { DiscoverableEvent } from '@/lib/services/event.service';

type Props = {
    event: DiscoverableEvent;
    locale: string;
    l1Slug: string;
    groupSlug: string;
    accentColor?: string;
};

export default function EventCard({ event, locale, l1Slug, groupSlug, accentColor = '#6366f1' }: Props) {
    const tCities = useTranslations('cities');
    const t = useTranslations('event');
    const isRequest = event.joinMode === 'REQUEST';
    const startDate = new Date(event.startDate);
    const formatter = useFormatter();

    return (
        <Link
            href={`/${l1Slug}/group/${groupSlug}/events/${event.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-border bg-surface transition-all hover:-translate-y-1 hover:border-border-hover hover:shadow-2xl"
        >
            {/* Banner Image */}
            <div className="relative aspect-[16/9] w-full overflow-hidden">
                {event.bannerImage || event.group.bannerImage ? (
                    <img
                        src={event.bannerImage || event.group.bannerImage || undefined}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-surface-elevated">
                        <Calendar className="h-10 w-10 text-foreground-muted/20" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

                {/* Date Badge Overlay */}
                <div className="absolute top-4 left-4 flex flex-col items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 px-2 py-1.5 sm:px-3 sm:py-2 text-white">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{formatter.dateTime(startDate, { month: 'short', timeZone: EVENT_TIME_ZONE })}</span>
                    <span className="text-xl font-black leading-none">{formatter.dateTime(startDate, { day: 'numeric', timeZone: EVENT_TIME_ZONE })}</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-foreground-muted">
                        <span className="h-1 w-1 rounded-full bg-[var(--accent)]" style={{ backgroundColor: accentColor }} />
                        {event.group.name}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold leading-tight text-foreground group-hover:text-[var(--accent)] transition-colors line-clamp-2" style={{ '--accent': accentColor } as React.CSSProperties}>
                        {event.title}
                    </h3>
                    {(event.isMembersOnly || isRequest || event.isFull) && (
                        <div className="flex flex-wrap gap-1.5">
                            {event.isMembersOnly && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-surface-elevated px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-foreground-muted">
                                    <Lock className="h-3 w-3" />{t('membersOnly')}
                                </span>
                            )}
                            {isRequest && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-surface-elevated px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-foreground-muted">
                                    <UserCheck className="h-3 w-3" />{t('badgeRequest')}
                                </span>
                            )}
                            {event.isFull && (
                                <span className="inline-flex items-center rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white" style={{ backgroundColor: accentColor }}>{t('full')}</span>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-auto space-y-2 sm:space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs text-foreground-muted">
                        <div className="flex min-w-0 items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{event.location || cityLabel(tCities, event.group.city)}</span>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5 whitespace-nowrap pl-2">
                            <Users className="h-3.5 w-3.5" />
                            <span>{isRequest ? t('approvedCount', { count: event.goingCount }) : t('goingCount', { count: event.goingCount })}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                            <Calendar className="h-3.5 w-3.5 text-foreground-muted" />
                            {formatter.dateTime(startDate, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: EVENT_TIME_ZONE })}
                        </div>
                        <div className="rounded-full bg-surface-elevated p-2 text-foreground transition-all group-hover:bg-[var(--accent)] group-hover:text-white" style={{ '--accent': accentColor } as React.CSSProperties}>
                            <ArrowRight className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
