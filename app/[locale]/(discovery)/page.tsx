import { cookies } from 'next/headers';
import { redirect } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { GroupService } from '@/lib/services/group.service';
import { DiscoveryService } from '@/lib/services/discovery.service';
import { EventService } from '@/lib/services/event.service';
import { nextMeetingDates } from '@/lib/services/next-meetings';
import { CityService } from '@/lib/services/city.service';
import { TaxonomyService } from '@/lib/services/taxonomy.service';
import { CitiesProvider } from '@/components/providers/CitiesContext';
import { DiscoveryProvider } from '@/components/providers/DiscoveryProvider';
import CategoryDrawer from '@/components/discovery/CategoryDrawer';
import FilterLine from '@/components/discovery/filter/FilterLine';
import GroupResults from '@/components/discovery/GroupResults';
import EventResults from '@/components/discovery/EventResults';
import { auth } from '@/lib/auth';
import { cityLabel } from '@/lib/city-label';
import { discoveryHref, parseDiscoveryParams } from '@/lib/discovery-params';
import { DISCOVERY_RAIL_COOKIE } from '@/lib/constants';
import type { DiscoveryState } from '@/lib/types/discovery';

type SearchParams = Record<string, string | string[] | undefined>;
type Props = { params: Promise<{ locale: string }>; searchParams: Promise<SearchParams> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { locale } = await params;
    const p = parseDiscoveryParams(await searchParams);
    const t = await getTranslations({ locale, namespace: 'discovery' });
    let title = p.kind === 'events' ? t('eventsPageTitle') : t('groupsPageTitle');

    if (p.q) {
        title = `"${p.q}"`;
    } else if (p.category) {
        const displayName = await DiscoveryService.getCategoryDisplayName(p.category, locale);
        title = displayName || p.category.charAt(0).toUpperCase() + p.category.slice(1);
    }
    if (p.cities.length > 0) {
        const tCities = await getTranslations({ locale, namespace: 'cities' });
        title += ` ${t('inCity')} ${p.cities.map((c) => cityLabel(tCities, c)).join(', ')}`;
    }
    return { title, description: t('metaDescription') };
}

export default async function DiscoveryPage({ params, searchParams }: Props) {
    const { locale } = await params;
    const p = parseDiscoveryParams(await searchParams);

    // Old links: a sub-category in `category` lands on its Tēma with that Veids chosen; an unknown one is dropped.
    const found = p.category ? await GroupService.findCategoryBySlug(p.category) : null;
    if (found && found.level > 1) redirect({ href: discoveryHref(p, { category: found.l1Slug, tags: [found.slug, ...p.tags] }), locale });
    if (!found) p.category = null;

    const session = await auth();
    const viewerId = session?.user?.id;

    const [categories, tree, cities, counts, groupsRes, eventsRes, cookieStore] = await Promise.all([
        DiscoveryService.getDiscoveryCategories(locale),
        TaxonomyService.getTaxonomy(locale),
        CityService.listActive(locale),
        DiscoveryService.getCounts({ kind: p.kind, cities: p.cities, l1Slug: p.category ?? undefined, tags: p.tags, query: p.q || undefined }, locale),
        p.kind === 'groups'
            ? DiscoveryService.getGroups({ query: p.q || undefined, cities: p.cities, categoryId: found?.id, tags: p.tags, take: p.limit }, locale)
            : Promise.resolve({ groups: [], hasMore: false }),
        p.kind === 'events'
            ? EventService.getDiscoverableEvents({ category: p.category ?? undefined, cities: p.cities, tags: p.tags, search: p.q || undefined, status: 'upcoming' }, locale, viewerId)
            : Promise.resolve({ events: [], hasMore: false }),
        cookies()
    ]);

    // Each group's next meeting (only the date is shown), for groups without a "Ko meklējam?" line.
    const nextMeetings = await nextMeetingDates(groupsRes.groups, locale, viewerId);

    const collator = new Intl.Collator(locale);
    const state: DiscoveryState = {
        kind: p.kind,
        categories: categories
            .map((c) => ({ ...c, count: counts.byCategory[c.slug] ?? 0 }))
            .sort((a, b) => collator.compare(a.title, b.title)),
        veidi: tree.flatMap((l1) => l1.subcategories.filter((s) => s.status === 'ACTIVE').map((s) => ({
            slug: s.slug, title: s.title, l1Slug: l1.slug, count: counts.bySubCategory[s.slug] ?? 0
        }))),
        counts: { total: counts.total, anyTopic: counts.anyTopic, anyPlace: counts.anyPlace, byCity: counts.byCity, online: counts.online }
    };

    return (
        <CitiesProvider cities={cities}>
            <DiscoveryProvider state={state}>
                <div className="flex min-h-full">
                    <CategoryDrawer folded={cookieStore.get(DISCOVERY_RAIL_COOKIE)?.value === '1'} />
                    <div className="min-w-0 flex-1 pb-20 pt-3 md:pt-4">
                        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
                            <FilterLine />
                            {p.kind === 'groups'
                                ? <GroupResults groups={groupsRes.groups} hasMore={groupsRes.hasMore} nextMeetings={nextMeetings} params={p} />
                                : <EventResults events={eventsRes.events} />}
                        </div>
                    </div>
                </div>
            </DiscoveryProvider>
        </CitiesProvider>
    );
}
