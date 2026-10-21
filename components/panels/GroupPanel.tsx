import { CalendarDays } from 'lucide-react';
import { getLocale, getTimeZone, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import CategoryLine from '@/components/ui/CategoryLine';
import EventDayList from '@/components/events/EventDayList';
import { cityLabel } from '@/lib/city-label';
import { dayInZone, type DayKey } from '@/lib/discovery-dates';
import { capitalizeFirst, createDateFormatter, EVENT_DAY_TIME } from '@/lib/date-format';
import { meetingLine } from '@/lib/event-when';
import { langAttr } from '@/lib/translations';
import { UI } from '@/lib/constants';
import type { GroupPanelData } from '@/lib/services/group-panel';
import PanelPicture from './PanelPicture';
import PanelBody, { PANEL_LINK, PanelTitle } from './PanelBody';
import ContactButton from './ContactButton';
import FullPageLink from './FullPageLink';

/** The opened group card (AR-44): picture, name, category line, place and members, the next meeting, the first words, and the one step. */
export default async function GroupPanel({ data }: { data: GroupPanelData }) {
    const locale = await getLocale();
    const t = await getTranslations('discovery');
    const tEvent = await getTranslations('event');
    const tCities = await getTranslations('cities');
    const zone = await getTimeZone();
    const formatter = createDateFormatter(locale, zone);
    const base = `/${data.l1Slug}/group/${data.slug}`;
    const { viewer, nextMeeting } = data;
    // A home text short enough to be the card's tagline shows as the tagline; a longer one shows once as the text (it opens with
    // the tagline's words, so both would repeat them). The next meeting line only when that event is not among the rows below.
    const shortText = !!data.tagline && data.text === data.tagline;
    // The upcoming public events under their day headings (the same rows as every event list).
    const days: Array<{ day: DayKey; rows: GroupPanelData['events'] }> = [];
    for (const row of data.events) {
        const day = dayInZone(new Date(row.startDate), zone);
        const last = days[days.length - 1];
        if (last?.day === day) last.rows.push(row);
        else days.push({ day, rows: [row] });
    }
    const pageLink = <FullPageLink path={base} className={`justify-self-center ${PANEL_LINK}`}>{t('panel.openPage')}</FullPageLink>;

    return (
        <div data-ui={UI.groupPanel} style={{ ['--c' as string]: data.category.color }}>
            <PanelPicture image={data.image} l1Slug={data.l1Slug} />
            <PanelBody>
                <PanelTitle>{data.name}</PanelTitle>
                <CategoryLine color={data.category.color} category={data.category.l1Title} subCategories={data.category.subCategories} l1Slug={data.l1Slug} subSlugs={data.category.subCategorySlugs} />
                <p className="text-body-sm text-foreground-muted">{cityLabel(tCities, data.city)} · {t('memberCount', { count: data.memberCount })}</p>
                {data.lookingFor && <p className="text-body-sm italic text-primary">{data.lookingFor}</p>}
                {shortText && <p lang={langAttr(data.textLang, locale)} className="text-body-sm text-foreground">{data.tagline}</p>}
                {nextMeeting && !data.events.some((e) => e.slug === nextMeeting.slug) && (
                    <Link href={`${base}/events/${nextMeeting.slug}`} scroll={false} className="flex items-start gap-1.5 text-body-sm italic text-primary hover:underline">
                        <CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                        <span>{meetingLine(
                            { at: nextMeeting.startDate, until: nextMeeting.running ? nextMeeting.endDate : null }, formatter, zone,
                            { next: (date) => t('nextMeeting', { date: capitalizeFirst(date) }), running: (until) => tEvent('runningUntil', { until }) }, EVENT_DAY_TIME
                        )}</span>
                    </Link>
                )}
                {data.text && !shortText && <p lang={langAttr(data.textLang, locale)} className="text-body-sm text-foreground">{data.text}</p>}
                {days.length > 0 && <EventDayList days={days} today={dayInZone(new Date(), zone)} showGroup={false} showCity />}
                {viewer.canContact && <ContactButton groupId={data.id} groupName={data.name} allowJoin={viewer.isAcceptingMembers} />}
                {pageLink}
            </PanelBody>
        </div>
    );
}
