import { getTimeZone, getTranslations } from 'next-intl/server';
import { HUB_PREVIEW_ROWS } from '@/lib/constants';
import { discoveryHref, parseDiscoveryParams } from '@/lib/discovery-params';
import { CityHubService, type CityHubContext } from '@/lib/services/city-hub.service';
import ActivityFeed from '@/components/hubs/ActivityFeed';
import HubSection from '@/components/hubs/HubSection';
import OverviewTabs from '@/components/hubs/OverviewTabs';
import NoteRow from '@/components/hubs/notes/NoteRow';
import CityRequestPicker from './CityRequestPicker';
import CityRooms from './CityRooms';

const BOX = 'rounded-2xl bg-surface shadow-card frame';

/**
 * Pārskats of a city hub (K3-18..20): the tab row, then Aktivitāte (the city's groups, whatever their Veids), Ziņas (three rows, read-only) and
 * Pilsētas istabas. Grid: one column; two from `xl`, three from `2xl` (K-124). Public, so signed out sees the same without names (K3-21).
 */
export default async function CityOverviewPage({ city, locale, viewer }: { city: CityHubContext; locale: string; viewer?: { id: string; role?: string | null } }) {
    const zone = await getTimeZone();
    const [t, tCity, periods, notes, rooms, requestable] = await Promise.all([
        getTranslations({ locale, namespace: 'hub' }),
        getTranslations({ locale, namespace: 'hub.city' }),
        CityHubService.activity(city, locale, zone),
        CityHubService.notes(city, { q: '', take: HUB_PREVIEW_ROWS }, locale, viewer),
        CityHubService.rooms(city, locale),
        CityHubService.requestable(city, locale, viewer?.id),
    ]);
    const boardHref = discoveryHref(parseDiscoveryParams(new URLSearchParams()), { cities: [city.slug] });

    return (
        <>
            <OverviewTabs items={[{ id: 'hub-activity', label: tCity('tabs.activity') }, { id: 'hub-notes', label: tCity('tabs.notes') }, { id: 'hub-rooms', label: tCity('tabs.rooms') }]} />
            <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-section xl:grid-cols-2 2xl:grid-cols-3">
                <HubSection id="hub-activity" title={t('activity.title')} link={{ href: boardHref, label: tCity('allGroups', { city: city.name }) }}>
                    <div className={`${BOX} p-4`}><ActivityFeed periods={periods} locale={locale} /></div>
                </HubSection>
                <HubSection id="hub-notes" title={tCity('tabs.notes')} count={notes.total} link={{ href: `${city.href}/messages`, label: t('notes.all') }}>
                    <div className={`${BOX} px-4`}>
                        {notes.rows.length === 0 ? <p className="py-4 text-body-sm text-foreground-muted">{tCity('notesEmpty')}</p> : notes.rows.map((n) => <NoteRow key={n.id} note={n} readOnly />)}
                    </div>
                </HubSection>
                <HubSection id="hub-rooms" title={tCity('tabs.rooms')} count={rooms.length}>
                    {rooms.length === 0 ? (
                        <div className={`${BOX} grid justify-items-start gap-3 p-4`}>
                            <p className="text-body-sm text-foreground-muted">{tCity('roomsEmpty', { city: city.name })}</p>
                            {requestable.length > 0 && <CityRequestPicker topics={requestable} cityName={city.name} citySegment={city.segment} />}
                        </div>
                    ) : <CityRooms rooms={rooms} cityName={city.name} />}
                </HubSection>
            </div>
        </>
    );
}
