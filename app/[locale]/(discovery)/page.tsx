import { cookies } from 'next/headers';
import { redirect } from '@/i18n/routing';
import { getTimeZone, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { GroupService } from '@/lib/services/group.service';
import { UserService } from '@/lib/services/user.service';
import { DiscoveryService } from '@/lib/services/discovery.service';
import { cardActivities } from '@/lib/services/card-activity';
import { cardFaces } from '@/lib/services/card-faces';
import { CityService } from '@/lib/services/city.service';
import { TaxonomyService } from '@/lib/services/taxonomy.service';
import { CitiesProvider } from '@/components/providers/CitiesContext';
import { DiscoveryProvider } from '@/components/providers/DiscoveryProvider';
import CategoryDrawer from '@/components/discovery/CategoryDrawer';
import TitleSwitch from '@/components/discovery/filter/TitleSwitch';
import FilterLine from '@/components/discovery/filter/FilterLine';
import AlsoMatchesLine from '@/components/discovery/filter/AlsoMatchesLine';
import GroupResults from '@/components/discovery/GroupResults';
import EventResults from '@/components/discovery/EventResults';
import { loadEvents } from './load-events';
import { buildAlsoMatches, wantsAlsoMatches } from './also-matches';
import { auth } from '@/lib/auth';
import { cityLabel } from '@/lib/city-label';
import { discoveryHref, parseDiscoveryParams } from '@/lib/discovery-params';
import { DISCOVERY_RAIL_COOKIE, LOCALES } from '@/lib/constants';
import { notFound } from 'next/navigation';
import { dayInZone } from '@/lib/discovery-dates';
import { eventWindow } from '@/lib/discovery-window';
import type { MembershipRole } from '@prisma/client';
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
    // `/.well-known/…` and other stray addresses land on this route with a segment that is no locale: a 404, not a crash in Intl.
    if (!(LOCALES as readonly string[]).includes(locale)) notFound();
    const p = parseDiscoveryParams(await searchParams);

    // Old links: a sub-category in `category` lands on its Tēma with its Veids chosen (a level-3 one: its level-2 parent,
    // since only level-2 Veidi show as chips); an unknown one is dropped.
    const found = p.category ? await GroupService.findCategoryBySlug(p.category) : null;
    if (found && found.level > 1) {
        const tags = [...new Set([...(found.veidsSlug ? [found.veidsSlug] : []), ...p.tags])];
        redirect({ href: discoveryHref(p, { category: found.l1Slug, tags }), locale });
    }
    if (!found) p.category = null;

    const tDiscovery = await getTranslations({ locale, namespace: 'discovery' });
    const session = await auth();
    const viewerId = session?.user?.id;

    // Pasākumi's dates: today in the viewer's zone, once, on the server. A choice that has ended redirects to Šonedēļ.
    const zone = await getTimeZone();
    const w = eventWindow(p, dayInZone(new Date(), zone), zone);
    if (p.kind === 'events' && w.expired) redirect({ href: discoveryHref(p, { date: { kind: 'week' }, day: null }), locale });

    const other = p.kind === 'groups' ? 'events' : 'groups';
    const [categories, tree, cities, counts, otherCounts, plain, groupsRes, events, cookieStore] = await Promise.all([
        DiscoveryService.getDiscoveryCategories(locale),
        TaxonomyService.getTaxonomy(locale),
        CityService.listActive(locale),
        DiscoveryService.getCounts({ kind: p.kind, cities: p.cities, l1Slug: p.category ?? undefined, tags: p.tags, query: p.q || undefined, ...(p.kind === 'events' ? w.bounds : {}) }, locale),
        // The other list's total under the same filters: the title's second count (Pasākumi's from Grupas = this week).
        DiscoveryService.getCounts({ kind: other, cities: p.cities, l1Slug: p.category ?? undefined, tags: p.tags, query: p.q || undefined, ...(other === 'events' ? w.bounds : {}) }, locale),
        // The same list without the word (cached): what choosing a theme or Veids "in place of the word" gives.
        wantsAlsoMatches(p.q, p.category)
            ? DiscoveryService.getCounts({ kind: p.kind, cities: p.cities, ...(p.kind === 'events' ? w.bounds : {}) }, locale)
            : Promise.resolve(null),
        p.kind === 'groups'
            ? DiscoveryService.getGroups({ query: p.q || undefined, cities: p.cities, categoryId: found?.id, tags: p.tags, take: p.limit }, locale)
            : Promise.resolve({ groups: [], hasMore: false }),
        p.kind === 'events'
            ? loadEvents(p, w, locale, zone, viewerId)
            : Promise.resolve(null),
        cookies()
    ]);

    // Each group's latest activity for the card's bottom line (C2): next meeting, else newest public announcement.
    // A group you belong to or wait for opens as its page, not the panel: those cards link straight to it (cmv9amjft).
    const [activity, faces, myRoles] = await Promise.all([
        cardActivities(groupsRes.groups, locale, viewerId),
        cardFaces(groupsRes.groups.map((g) => g.id), viewerId),
        viewerId && p.kind === 'groups' ? UserService.getMyGroupRoles(viewerId) : Promise.resolve<Record<string, MembershipRole>>({}),
    ]);

    const collator = new Intl.Collator(locale);
    const state: DiscoveryState = {
        kind: p.kind,
        params: p,
        categories: categories
            .map((c) => ({ ...c, count: counts.byCategory[c.slug] ?? 0 }))
            .sort((a, b) => collator.compare(a.title, b.title)),
        veidi: tree.flatMap((l1) => l1.subcategories.filter((s) => s.status === 'ACTIVE').map((s) => ({
            slug: s.slug, title: s.title, l1Slug: l1.slug, count: counts.bySubCategory[s.slug] ?? 0
        }))),
        counts: { total: counts.total, anyTopic: counts.anyTopic, anyPlace: counts.anyPlace, byCity: counts.byCity, online: counts.online },
        kindTotals: p.kind === 'groups' ? { groups: counts.total, events: otherCounts.total } : { groups: otherCounts.total, events: counts.total },
        alsoMatches: buildAlsoMatches(p.q, plain, tree, categories),
        dates: events ? { today: w.today, choice: w.choice, period: w.period, listFrom: w.listFrom, week: w.week, weekCounts: events.weekCounts, calendar: w.calendar, calendarCounts: events.calendarCounts } : undefined
    };

    return (
        <CitiesProvider cities={cities}>
            <DiscoveryProvider state={state}>
                <div className="flex min-h-full">
                    <CategoryDrawer folded={cookieStore.get(DISCOVERY_RAIL_COOKIE)?.value === '1'} />
                    <div className="min-w-0 flex-1 px-gutter pb-20 pt-4">
                        <div>
                            <h1 className="sr-only">{tDiscovery(p.kind === 'events' ? 'eventsPageTitle' : 'groupsPageTitle')}</h1>
                            <TitleSwitch />
                            <FilterLine />
                            <AlsoMatchesLine />
                            {p.kind === 'groups'
                                ? <GroupResults groups={groupsRes.groups} hasMore={groupsRes.hasMore} activity={activity} faces={faces} params={p} myRoles={myRoles} />
                                : events && <EventResults events={events.events} hasMore={events.hasMore} window={w} params={p} zone={zone} weekCounts={events.weekCounts} />}
                        </div>
                    </div>
                </div>
            </DiscoveryProvider>
        </CitiesProvider>
    );
}
