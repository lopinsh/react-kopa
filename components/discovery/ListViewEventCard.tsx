import { Link } from '@/i18n/routing';
import { Users, MapPin, Calendar, Lock, UserCheck } from 'lucide-react';
import { UI, NEUTRAL_ACCENT } from '@/lib/constants';
import { useTranslations } from 'next-intl';
import { cityLabel } from '@/lib/city-label';
import type { DiscoverableEvent } from '@/lib/services/event.service';
import FallbackLangLabel from '@/components/ui/FallbackLangLabel';
import Badge from '@/components/ui/Badge';
import { langAttr } from '@/lib/translations';
import { capitalizeFirst, EVENT_WEEKDAY_TIME, useDateFormatter } from '@/lib/date-format';

type Props = {
    event: DiscoverableEvent;
    locale: string;
    l1Slug: string;
    groupSlug: string;
    accentColor?: string;
};

export default function ListViewEventCard({ event, locale, l1Slug, groupSlug, accentColor = NEUTRAL_ACCENT }: Props) {
    const tCities = useTranslations('cities');
    const t = useTranslations('event');
    const isRequest = event.joinMode === 'REQUEST';
    const startDate = new Date(event.startDate);
    const formatter = useDateFormatter();

    return (
        <Link
            href={`/${l1Slug}/group/${groupSlug}/events/${event.slug}`}
            data-ui={UI.eventListRow}
            className="group relative flex h-14 items-center overflow-hidden rounded-xl border border-border bg-surface px-4 py-2 transition-all hover:border-primary hover:shadow-md soft-press"
            style={{ ['--accent' as string]: accentColor }}
        >
            {/* Date Box */}
            <div className="mr-4 flex flex-col items-center justify-center shrink-0 w-10">
                <span className="text-[11px] font-semibold text-foreground-muted">{formatter.dateTime(startDate, { month: 'short' })}</span>
                <span className="text-lg font-semibold leading-none text-foreground">{formatter.dateTime(startDate, { day: 'numeric' })}</span>
            </div>

            {/* Title & Group Line */}
            <div className="flex flex-1 items-center gap-3 overflow-hidden">
                <h3 lang={langAttr(event.titleLang, locale)} className="truncate text-base font-bold text-foreground group-hover:text-primary">
                    {event.title}
                </h3>
                {langAttr(event.titleLang, locale) && <FallbackLangLabel lang={event.titleLang} />}
                {event.isMembersOnly && <Lock className="h-3.5 w-3.5 shrink-0 text-foreground-muted" aria-label={t('membersOnly')} />}
                {isRequest && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-elevated px-2 py-0.5 text-[11px] font-semibold text-foreground-muted">
                        <UserCheck className="h-3 w-3" />
                        <span className="hidden sm:inline">{t('badgeRequest')}</span>
                    </span>
                )}
                {event.isFull && (
                    <Badge tone="outline">{t('full')}</Badge>
                )}
                <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                    <span className="rounded-md bg-surface-elevated px-1.5 py-0.5 text-[11px] font-bold text-foreground-muted shadow-sm">
                        {event.group.name}
                    </span>
                </div>
            </div>

            {/* Metadata (Right aligned) */}
            <div className="ml-4 flex shrink-0 items-center justify-end gap-4 text-xs font-semibold text-foreground-muted">
                <div className="hidden items-center gap-1.5 sm:flex">
                    <Calendar className="h-3.5 w-3.5" />
                    {capitalizeFirst(formatter.dateTime(startDate, EVENT_WEEKDAY_TIME))}
                </div>
                <div className="hidden items-center gap-1 md:flex max-w-[120px] truncate">
                    <MapPin className="h-3.5 w-3.5" />
                    {event.isOnline ? t('online') : event.location || cityLabel(tCities, event.city)}
                </div>
                <div className="flex items-center gap-1.5 justify-end whitespace-nowrap font-bold text-foreground">
                    <Users className="h-3.5 w-3.5 text-foreground-muted" />
                    {isRequest ? t('approvedCount', { count: event.goingCount }) : t('goingCount', { count: event.goingCount })}
                </div>
            </div>
        </Link>
    );
}
