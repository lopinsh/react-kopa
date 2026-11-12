import { notFound } from 'next/navigation';
import { redirect } from '@/i18n/routing';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { parseCities } from '@/lib/discovery-params';
import { hubPages } from '@/lib/hub-pages';
import { parseHubPath } from '@/lib/hub-path';
import { HubService } from '@/lib/services/hub.service';
import { ChatContextService } from '@/lib/services/chat-context.service';
import { CityHubService } from '@/lib/services/city-hub.service';
import { HubCityService } from '@/lib/services/hub-city.service';
import OverviewPage from '@/components/hubs/pages/OverviewPage';
import GroupsPage from '@/components/hubs/pages/GroupsPage';
import EventsPage from '@/components/hubs/pages/EventsPage';
import CityPages from '@/components/hubs/city/CityPages';
import NotesPage from '@/components/hubs/pages/NotesPage';
import ChatPage from '@/components/hubs/pages/ChatPage';

type Params = { locale: string; l1Slug: string; hub: string[] };
const isCityPage = (s: string): s is 'groups' | 'events' | 'messages' => s === 'groups' || s === 'events' || s === 'messages';
type Search = Record<string, string | string[] | undefined>;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const { locale, l1Slug, hub: segments } = await params;
    const city = await CityHubService.getContext(l1Slug, locale);
    if (city) {
        const t = await getTranslations({ locale, namespace: 'hub' });
        const name = t('city.name', { city: city.name });
        return { title: segments.length === 1 && isCityPage(segments[0]) ? `${name} | ${t(`pages.${segments[0]}`)}` : name };
    }
    const address = parseHubPath(segments);
    const hub = address && await HubService.getHubContext(l1Slug, address.l2Slug, address.middle.join('/'), locale);
    if (!address || !hub) return {};
    const t = await getTranslations({ locale, namespace: 'hub' });
    const base = t('name', { title: hub.title });
    const name = hub.local ? t('localName', { name: base, city: hub.local.cityName }) : base;
    return { title: address.page === 'overview' ? name : `${name} | ${t(`pages.${address.page}`)}` };
}

/** Dispatches to the page of the hub the address names (K1-03). Pārskats, Grupas, Pasākumi, Ziņas, Čats. */
export default async function HubPage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<Search> }) {
    const { locale, l1Slug, hub: segments } = await params;
    const sp = await searchParams;
    const session = await auth();
    const city = await CityHubService.getContext(l1Slug, locale);
    if (city) {
        const viewer = session?.user?.id ? { id: session.user.id, role: session.user.role } : undefined;
        return <CityPages city={city} segments={segments} sp={sp} locale={locale} viewer={viewer} />;
    }
    const address = parseHubPath(segments);
    if (!address) notFound();
    const hub = await HubService.getHubContext(l1Slug, address.l2Slug, address.middle.join('/'), locale);
    if (!hub) notFound();

    if (hub.unopenedCity) redirect({ href: `${hubPages(hub.topicHref).find((x) => x.key === address.page)?.href ?? hub.topicHref}?request=${hub.unopenedCity}`, locale });
    const asked = typeof sp.city === 'string' ? parseCities(sp.city) : [];
    if (!hub.local && asked.length > 0) {
        // An old `?city=` link (K1/K2 bookmarks): the first open topic x city hub among them, else the plain hub (K3-08).
        const kur = await HubCityService.kurOptions({ id: hub.id, l1Id: hub.l1Id, slug: hub.slug }, locale);
        const open = kur.find((o) => o.status === 'open' && asked.includes(o.slug));
        const base = open ? `${hub.topicHref}/${open.segment}` : hub.topicHref;
        redirect({ href: hubPages(base).find((x) => x.key === address.page)?.href ?? base, locale });
    }
    if (typeof sp.room === 'string' && sp.room) redirect({ href: await ChatContextService.roomHref({ id: hub.id, level: hub.level, topicHref: hub.topicHref }, sp.room.slice(0, 100), locale), locale });
    // The city is part of the address now: a topic x city hub fixes it for every query (K3-08).
    const cities = hub.local ? [hub.local.citySlug] : [];
    if (address.page === 'messages') return <NotesPage hub={hub} sp={sp} cities={cities} locale={locale} viewer={session?.user?.id ? { id: session.user.id, role: session.user.role } : undefined} />;
    if (address.page === 'chat') return <ChatPage hub={hub} locale={locale} view={typeof sp.view === 'string' ? sp.view : undefined} viewer={session?.user?.id ? { id: session.user.id, role: session.user.role } : undefined} />;
    if (address.page === 'events') return <EventsPage hub={hub} sp={sp} locale={locale} viewerId={session?.user?.id} />;
    if (address.page === 'overview') return <OverviewPage hub={hub} cities={cities} locale={locale} viewerId={session?.user?.id} viewerRole={session?.user?.role} />;
    return <GroupsPage hub={hub} cities={cities} tab={sp.tab === 'new' ? 'new' : 'all'} locale={locale} viewerId={session?.user?.id} />;
}
