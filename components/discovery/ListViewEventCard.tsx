import Link from 'next/link';
import { Users, MapPin, Calendar, Lock, UserCheck } from 'lucide-react';
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

export default function ListViewEventCard({ event, locale, l1Slug, groupSlug, accentColor = '#6366f1' }: Props) {
    const tCities = useTranslations('cities');
    const t = useTranslations('event');
    const isRequest = event.joinMode === 'REQUEST';
    const startDate = new Date(event.startDate);
    const formatter = useFormatter();

    return (
        <Link
            href={`/${l1Slug}/group/${groupSlug}/events/${event.slug}`}
            className="group relative flex h-14 items-center overflow-hidden rounded-xl border border-border bg-surface px-4 py-2 transition-all hover:border-[var(--accent)] hover:shadow-md soft-press"
            style={{ ['--accent' as string]: accentColor }}
        >
            {/* Date Box */}
            <div className="mr-4 flex flex-col items-center justify-center shrink-0 w-10">
                <span className="text-[9px] font-black uppercase tracking-widest text-foreground-muted">{formatter.dateTime(startDate, { month: 'short', timeZone: EVENT_TIME_ZONE })}</span>
                <span className="text-lg font-black leading-none text-foreground">{formatter.dateTime(startDate, { day: 'numeric', timeZone: EVENT_TIME_ZONE })}</span>
            </div>

            {/* Title & Group Line */}
            <div className="flex flex-1 items-center gap-3 overflow-hidden">
                <h3 className="truncate text-base font-bold text-foreground group-hover:text-[var(--accent)]">
                    {event.title}
                </h3>
                {event.isMembersOnly && <Lock className="h-3.5 w-3.5 shrink-0 text-foreground-muted" aria-label={t('membersOnly')} />}
                {isRequest && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-elevated px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-foreground-muted">
                        <UserCheck className="h-3 w-3" />
                        <span className="hidden sm:inline">{t('badgeRequest')}</span>
                    </span>
                )}
                {event.isFull && (
                    <span className="inline-flex shrink-0 items-center rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">{t('full')}</span>
                )}
                <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                    <span className="rounded-md bg-surface-elevated px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground-muted shadow-sm">
                        {event.group.name}
                    </span>
                </div>
            </div>

            {/* Metadata (Right aligned) */}
            <div className="ml-4 flex shrink-0 items-center justify-end gap-4 text-xs font-semibold text-foreground-muted">
                <div className="hidden items-center gap-1.5 sm:flex">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatter.dateTime(startDate, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: EVENT_TIME_ZONE })}
                </div>
                <div className="hidden items-center gap-1 md:flex max-w-[120px] truncate">
                    <MapPin className="h-3.5 w-3.5" />
                    {event.location || cityLabel(tCities, event.group.city)}
                </div>
                <div className="flex items-center gap-1.5 justify-end whitespace-nowrap font-bold text-foreground">
                    <Users className="h-3.5 w-3.5 text-foreground-muted" />
                    {isRequest ? t('approvedCount', { count: event.goingCount }) : t('goingCount', { count: event.goingCount })}
                </div>
            </div>
        </Link>
    );
}
