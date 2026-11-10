import { CalendarDays } from 'lucide-react';
import { getTimeZone, getTranslations } from 'next-intl/server';
import { HUB_PREVIEW_ROWS } from '@/lib/constants';
import { cityLabel } from '@/lib/city-label';
import { createDateFormatter, EVENT_DAY_TIME } from '@/lib/date-format';
import { hubPages } from '@/lib/hub-pages';
import { langAttr } from '@/lib/translations';
import { HubService, type HubContext } from '@/lib/services/hub.service';
import GroupRow from '@/components/discovery/GroupRow';
import ActivityFeed from '@/components/hubs/ActivityFeed';
import AccordionRow from '@/components/hubs/AccordionRow';
import HubSection from '@/components/hubs/HubSection';
import SubTopicChips from '@/components/hubs/SubTopicChips';

const BOX = 'rounded-2xl bg-surface shadow-card frame';

/**
 * Pārskats of a hub (K1-19..25), no tab row and no title (K-110): Aktivitāte and Pasākumi side by side from `xl` (one column below), Grupas as a full row, then the
 * sub-veidi chips (K-89, K-91 Variant B). Everything is public, so signed out sees the same page (K-24b); only faces and role tags need the viewer.
 */
export default async function OverviewPage({ hub, cities, locale, viewerId }: { hub: HubContext; cities: string[]; locale: string; viewerId?: string }) {
    const zone = await getTimeZone();
    const [t, tCities, tEvent, periods, preview, groups] = await Promise.all([
        getTranslations({ locale, namespace: 'hub' }),
        getTranslations({ locale, namespace: 'cities' }),
        getTranslations({ locale, namespace: 'event' }),
        HubService.getActivity(hub, { cities }, locale, zone),
        HubService.getEventPreview(hub, { cities, take: HUB_PREVIEW_ROWS }, locale, viewerId),
        HubService.getGroups(hub, { cities, tab: 'all', take: HUB_PREVIEW_ROWS }, locale, viewerId),
    ]);
    const format = createDateFormatter(locale, zone);
    const pages = hubPages(hub.href, cities);
    const hrefOf = (key: 'groups' | 'events') => pages.find((p) => p.key === key)?.href ?? hub.href;

    return (
        <div className="grid items-start gap-section xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <HubSection id="hub-activity" title={t('activity.title')}>
                <div className={`${BOX} p-4`}><ActivityFeed periods={periods} locale={locale} /></div>
            </HubSection>
            <HubSection id="hub-events" title={t('pages.events')} count={preview.total} link={{ href: hrefOf('events'), label: t('events.all') }}>
                <div className={`${BOX} px-4`}>
                    {preview.events.length === 0 ? <p className="py-4 text-body-sm text-foreground-muted">{t('events.empty')}</p> : preview.events.map((e) => (
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
                    ))}
                </div>
            </HubSection>
            <div className="xl:col-span-full">
                <HubSection id="hub-groups" title={t('pages.groups')} count={groups.total} link={{ href: hrefOf('groups'), label: t('groups.all', { n: groups.total }) }}>
                    {groups.groups.length === 0 ? <p className="text-body-sm text-foreground-muted">{t('groups.empty')}</p> : (
                        <div className={`${BOX} px-4`}>
                            {groups.groups.map((g) => <GroupRow key={g.id} group={g} activity={groups.activity[g.id]} fullPage={!!groups.myRoles[g.id]} role={groups.myRoles[g.id]} showMember />)}
                        </div>
                    )}
                </HubSection>
            </div>
            {hub.subTopics.length > 0 && (
                <div className="xl:col-span-full">
                    <HubSection id="hub-subtopics" title={t('subTopics.title')} count={hub.subTopics.length}><SubTopicChips hub={hub} locale={locale} /></HubSection>
                </div>
            )}
        </div>
    );
}
