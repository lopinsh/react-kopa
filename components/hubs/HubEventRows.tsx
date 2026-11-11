import { CalendarDays } from 'lucide-react';
import { getTimeZone, getTranslations } from 'next-intl/server';
import { cityLabel } from '@/lib/city-label';
import { createDateFormatter, EVENT_DAY_TIME } from '@/lib/date-format';
import { langAttr } from '@/lib/translations';
import type { EventRowData } from '@/lib/services/event-row';
import AccordionRow from './AccordionRow';

/** The next events as accordion rows (K-79): the Pasākumi block of Pārskats and the desktop rail of Ziņas. */
export default async function HubEventRows({ events, locale }: { events: EventRowData[]; locale: string }) {
    const zone = await getTimeZone();
    const [t, tCities, tEvent] = await Promise.all([
        getTranslations({ locale, namespace: 'hub' }),
        getTranslations({ locale, namespace: 'cities' }),
        getTranslations({ locale, namespace: 'event' }),
    ]);
    const format = createDateFormatter(locale, zone);
    if (events.length === 0) return <p className="py-4 text-body-sm text-foreground-muted">{t('events.empty')}</p>;
    return events.map((e) => (
        <AccordionRow
            key={e.id}
            icon={<CalendarDays />}
            title={e.title}
            lang={langAttr(e.titleLang, locale)}
            sub={e.group.name}
            when={format.dateTime(new Date(e.startDate), EVENT_DAY_TIME)}
            body={e.excerpt}
            clamp={3}
            meta={<span>{e.isOnline ? tEvent('online') : cityLabel(tCities, e.city)}</span>}
            action={{ href: `/${e.category.l1Slug}/group/${e.group.slug}/events/${e.slug}`, label: t('events.open') }}
        />
    ));
}
