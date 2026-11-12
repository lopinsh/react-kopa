import { notFound } from 'next/navigation';
import type { CityHubContext } from '@/lib/services/city-hub.service';
import type { HubScope } from '@/lib/services/hub-query';
import GroupsPage from '@/components/hubs/pages/GroupsPage';
import EventsPage from '@/components/hubs/pages/EventsPage';
import CityNotesPage from './CityNotesPage';
import CityRoomsPage from './CityRoomsPage';

type Search = Record<string, string | string[] | undefined>;

/**
 * The city hub's pages below Pārskats (K-133): Grupas and Pasākumi are the topic hub's pages with the city fixed and no Tēma (no Kur), Ziņas is read-only, `rooms` is the city's Katalogs (K5-23).
 * Any other address is a 404.
 */
export default function CityPages({ city, segments, sp, locale, viewer }: { city: CityHubContext; segments: string[]; sp: Search; locale: string; viewer?: { id: string; role?: string | null } }) {
    const scope: HubScope = { l1Id: null, l1Slug: null, slug: null, href: city.href, local: { citySlug: city.slug } };
    const [page] = segments;
    if (segments.length !== 1) notFound();
    if (page === 'groups') return <GroupsPage hub={scope} cities={[city.slug]} tab={sp.tab === 'new' ? 'new' : 'all'} locale={locale} viewerId={viewer?.id} />;
    if (page === 'events') return <EventsPage hub={scope} sp={sp} locale={locale} viewerId={viewer?.id} />;
    if (page === 'messages') return <CityNotesPage city={city} sp={sp} locale={locale} viewer={viewer} />;
    if (page === 'rooms') return <CityRoomsPage city={city} locale={locale} />;
    notFound();
}
