import { CalendarDays, MapPin } from 'lucide-react';
import { getLocale, getTimeZone, getTranslations } from 'next-intl/server';
import Fact from '@/components/panels/Fact';
import AddToCalendar from '@/components/events/AddToCalendar';
import Badge from '@/components/ui/Badge';
import { TEXT_LINK_CLASS } from '@/components/ui/TextLink';
import { cityLabel } from '@/lib/city-label';
import { capitalizeFirst, createDateFormatter, EVENT_DAY_TIME } from '@/lib/date-format';
import { plainExcerpt } from '@/lib/text-excerpt';
import { DEFAULT_TIME_ZONE } from '@/lib/time-zone';
import type { EventPageData } from '@/lib/services/event-page';

const LINK = `${TEXT_LINK_CLASS} ml-1 whitespace-nowrap`;

/** When and where (AR-59): the time in the viewer's zone (named when it is not Latvian time) with "Pievienot kalendāram" or the running tag; the place with its map or join link. */
export default async function EventFacts({ event }: { event: EventPageData }) {
    const locale = await getLocale();
    const zone = await getTimeZone();
    const t = await getTranslations('event');
    const tCities = await getTranslations('cities');
    const formatter = createDateFormatter(locale, zone);
    const start = new Date(event.startDate);
    const end = event.endDate ? new Date(event.endDate) : null;
    const when = capitalizeFirst(end ? formatter.dateTimeRange(start, end, EVENT_DAY_TIME) : formatter.dateTime(start, EVENT_DAY_TIME));
    // Times are in the viewer's zone; name it when it is not Latvian time, so travellers and online guests are not misled.
    const zoneName = zone !== DEFAULT_TIME_ZONE ? formatter.dateTime(start, { timeZoneName: 'short' }).split(' ').pop() : null;

    const city = cityLabel(tCities, event.city);
    const place = event.isOnline ? t('online') : [city, event.location].filter(Boolean).join(', ') || t('tba');
    // Only a real web link is ever made clickable.
    const onlineLink = event.isOnline && event.location && /^https?:\/\//i.test(event.location.trim()) ? event.location.trim() : null;
    const mapLink = !event.isOnline && event.location ? `https://maps.google.com/?q=${encodeURIComponent([event.location, city].filter(Boolean).join(', '))}` : null;
    const external = { target: '_blank', rel: 'noopener noreferrer' } as const;

    return (
        <div className="grid gap-2.5">
            <Fact icon={CalendarDays}>
                {when}{zoneName && ` (${zoneName})`}
                {event.timing === 'running' && <Badge tone="tag" className="ml-2 align-middle">{t('runningNow')}</Badge>}
                {event.timing === 'upcoming' && (
                    <AddToCalendar event={{
                        title: event.title,
                        description: plainExcerpt(event.description, 1000) ?? '',
                        location: event.isOnline ? (onlineLink ?? '') : [event.location, city].filter(Boolean).join(', '),
                        startDate: start,
                        endDate: end ?? undefined
                    }} />
                )}
            </Fact>
            <Fact icon={MapPin}>
                {place}
                {onlineLink && <a href={onlineLink} {...external} className={LINK}>{t('joinLink')}</a>}
                {mapLink && <a href={mapLink} {...external} className={LINK}>{t('openInMaps')}</a>}
                {event.onlineLinkLocked && <span className="block">{t('onlineLinkLocked')}</span>}
            </Fact>
        </div>
    );
}
