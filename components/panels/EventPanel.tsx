import { CalendarDays, MapPin } from 'lucide-react';
import { getLocale, getTimeZone, getTranslations } from 'next-intl/server';
import CategoryLine from '@/components/ui/CategoryLine';
import JoinStep from '@/components/events/JoinStep';
import FacesLine from '@/components/events/FacesLine';
import { cityLabel } from '@/lib/city-label';
import { capitalizeFirst, createDateFormatter, EVENT_DAY_TIME } from '@/lib/date-format';
import { langAttr } from '@/lib/translations';
import { UI } from '@/lib/constants';
import type { EventPanelData } from '@/lib/services/event-panel';
import PanelPicture from './PanelPicture';
import PanelBody, { PANEL_LINK, PanelTitle } from './PanelBody';
import Fact from './Fact';
import FullPageLink from './FullPageLink';

/** The event panel (AR-55): when, where, the first words, who is going, the one step and "Visa informācija", and who organises it. */
export default async function EventPanel({ event, l1Slug }: { event: EventPanelData; l1Slug: string }) {
    const locale = await getLocale();
    const t = await getTranslations('event');
    const tCities = await getTranslations('cities');
    const formatter = createDateFormatter(locale, await getTimeZone());
    const start = new Date(event.startDate);
    const end = event.endDate ? new Date(event.endDate) : null;
    const when = end ? formatter.dateTimeRange(start, end, EVENT_DAY_TIME) : formatter.dateTime(start, EVENT_DAY_TIME);
    const groupPath = `/${l1Slug}/group/${event.group.slug}`;
    const where = event.isOnline ? t('online') : [cityLabel(tCities, event.city), event.location].filter(Boolean).join(', ');

    return (
        <div data-ui={UI.eventPanel} style={{ ['--c' as string]: event.category.color }}>
            <PanelPicture image={event.image} l1Slug={event.category.l1Slug} credit={event.imageCredit} />
            <PanelBody>
                <PanelTitle lang={langAttr(event.titleLang, locale)}>{event.title}</PanelTitle>
                <CategoryLine color={event.category.color} category={event.category.l1Title} subCategories={event.subCategories} />
                <Fact icon={CalendarDays}>{capitalizeFirst(when)}</Fact>
                {where && <Fact icon={MapPin}>{where}</Fact>}
                {event.membersOnly && <p className="text-body-sm text-foreground">{t('membersOnly')}</p>}
                {event.text && <p lang={langAttr(event.textLang, locale)} className="text-body-sm text-foreground">{event.text}</p>}
                <FacesLine going={event.going} ended={event.join.ended} />
                <JoinStep join={event.join} trailing={<FullPageLink path={`${groupPath}/events/${event.slug}`} className={PANEL_LINK}>{t('panel.allInfo')}</FullPageLink>} />
                <p className="text-meta text-foreground-muted">
                    {t('panel.organisedBy')}{' '}
                    <FullPageLink path={groupPath} className="weight-strong text-foreground hover:underline">{event.group.name}</FullPageLink>
                    {' · '}{cityLabel(tCities, event.group.city)}
                </p>
            </PanelBody>
        </div>
    );
}
