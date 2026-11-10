import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { parseDiscoveryParams } from '@/lib/discovery-params';
import { parseHubPath } from '@/lib/hub-path';
import { HubService } from '@/lib/services/hub.service';
import GroupsPage from '@/components/hubs/pages/GroupsPage';
import EventsPage from '@/components/hubs/pages/EventsPage';

type Params = { locale: string; l1Slug: string; hub: string[] };
type Search = Record<string, string | string[] | undefined>;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const { locale, l1Slug, hub: segments } = await params;
    const address = parseHubPath(segments);
    const hub = address && await HubService.getHubContext(l1Slug, address.l2Slug, address.l3Slug, locale);
    if (!address || !hub) return {};
    const t = await getTranslations({ locale, namespace: 'hub' });
    const name = t('name', { title: hub.title });
    return { title: address.page === 'overview' ? name : `${name} | ${t(`pages.${address.page}`)}` };
}

/** Dispatches to the page of the hub the address names (K1-03). Pārskats shows the Grupas list until K1-3 builds it; Pasākumi is built in K1-2. */
export default async function HubPage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<Search> }) {
    const { locale, l1Slug, hub: segments } = await params;
    const address = parseHubPath(segments);
    if (!address) notFound();
    const hub = await HubService.getHubContext(l1Slug, address.l2Slug, address.l3Slug, locale);
    if (!hub) notFound();

    const sp = await searchParams;
    const { cities } = parseDiscoveryParams(sp);
    if (address.page === 'events') return <EventsPage />;
    const session = await auth();
    return <GroupsPage hub={hub} cities={cities} tab={sp.tab === 'new' ? 'new' : 'all'} locale={locale} viewerId={session?.user?.id} />;
}
