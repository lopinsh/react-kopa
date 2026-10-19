import { prisma } from '@/lib/prisma';
import { DiscoveryService } from './discovery.service';
import { TaxonomyService } from './taxonomy.service';
import { CityService } from './city.service';
import { groupWhere, eventWhere } from './discovery-query';
import { matchingEventIds, matchingGroupIds } from './discovery-text';
import { GROUP_CARD_SELECT, toGroupCard } from './group-card';
import { EVENT_ROW_INCLUDE, tagOf, toEventRow } from './event-row';
import { matchTopics, toTopicSources } from '@/lib/search-topics';
import { toTextLang } from '@/lib/translations';
import { SEARCH_IDLE_THEMES, SEARCH_MIN_CHARS, SEARCH_ROWS_MAX } from '@/lib/constants';
import type { SearchResults, SearchTheme, SearchVeids } from '@/lib/types/search';

export interface SearchInput {
    /** Trimmed, at most SEARCH_WORD_MAX letters. */
    word: string;
    /** City slugs; empty = Visur. */
    cities: string[];
    /** One theme (L1) slug, or null. */
    theme: string | null;
}

/** The viewer's own "Eju"/"Gaida" tags for these events (nothing for a signed-out visitor). */
async function myTags(eventIds: string[], viewerId: string | undefined) {
    if (!viewerId || eventIds.length === 0) return new Map<string, ReturnType<typeof tagOf>>();
    const mine = await prisma.attendance.findMany({
        where: { userId: viewerId, eventId: { in: eventIds }, status: { in: ['GOING', 'PENDING', 'WAITLISTED'] } },
        select: { eventId: true, status: true }
    });
    return new Map(mine.map((a) => [a.eventId, tagOf(a.status)]));
}

/**
 * The whole search in one call (R7): themes for the chip row, up to SEARCH_ROWS_MAX group rows and event rows, the counts behind
 * "Rādīt visus rezultātus (N)" and the Kur list. Everything anyone may see and nothing more: groups through `groupWhere`
 * (public, not hidden, active category, public sections only), events through `eventWhere` (public groups) plus PUBLIC visibility.
 * The rows are never cached (one entry per typed word would fill the cache); the word is never logged.
 */
export async function runSearch({ word, cities, theme: askedTheme }: SearchInput, locale: string, viewerId?: string): Promise<SearchResults> {
    const lang = toTextLang(locale);
    const short = word.length < SEARCH_MIN_CHARS;
    const query = short ? undefined : word;

    const [tree, categories] = await Promise.all([TaxonomyService.getTaxonomy(locale), DiscoveryService.getDiscoveryCategories(locale)]);
    const chosen = categories.find((c) => c.slug === askedTheme) ?? null;
    const theme = chosen?.slug ?? null;

    const [g, e, cityList] = await Promise.all([
        DiscoveryService.getCounts({ kind: 'groups', cities, l1Slug: theme ?? undefined, query }, locale),
        DiscoveryService.getCounts({ kind: 'events', cities, l1Slug: theme ?? undefined, query }, locale),
        CityService.listActive(locale)
    ]);

    const countOf = (slug: string) => (g.byCategory[slug] ?? 0) + (e.byCategory[slug] ?? 0);
    const byBusiest = (a: SearchTheme, b: SearchTheme) => b.count - a.count || a.title.localeCompare(b.title, locale);
    const toTheme = (c: { slug: string; title: string; color: string }): SearchTheme => ({ slug: c.slug, title: c.title, color: c.color, count: countOf(c.slug) });
    const matched = short
        ? categories
        : matchTopics(word, toTopicSources(tree, categories)).filter((m) => m.kind === 'theme').flatMap((m) => categories.filter((c) => c.slug === m.slug));
    let themes = matched.map(toTheme).filter((t) => t.count > 0).sort(byBusiest);
    if (short) themes = themes.slice(0, SEARCH_IDLE_THEMES);
    // The chosen theme is a choice, not a match: it stays in the row.
    if (chosen && !themes.some((t) => t.slug === chosen.slug)) themes = [toTheme(chosen), ...themes];

    const veidi: SearchVeids[] = short
        ? []
        : matchTopics(word, toTopicSources(tree, categories))
              .filter((m) => m.kind === 'veids' && (!theme || m.l1Slug === theme))
              .map((m) => ({ slug: m.slug, title: m.title, color: m.color, l1Slug: m.l1Slug, count: (g.bySubCategory[m.slug] ?? 0) + (e.bySubCategory[m.slug] ?? 0) }))
              .filter((v) => v.count > 0)
              .sort(byBusiest);

    const places = { cities: cityList, byCity: g.byCity, anyPlace: g.anyPlace };
    if (short && !theme) {
        return { word, theme, cities, themes, veidi: [], groups: [], events: [], total: { groups: 0, events: 0 }, elsewhere: 0, places };
    }

    const [groupIds, eventIds] = query ? await Promise.all([matchingGroupIds(query, lang), matchingEventIds(query)]) : [undefined, undefined];
    const [groupRows, eventRows] = await Promise.all([
        prisma.group.findMany({
            where: groupWhere({ query, queryIds: groupIds, cities, categoryId: chosen?.id }, lang),
            select: GROUP_CARD_SELECT(lang),
            orderBy: { createdAt: 'desc' },
            take: SEARCH_ROWS_MAX
        }),
        prisma.event.findMany({
            where: { AND: [eventWhere({ search: query, searchIds: eventIds, cities, category: theme ?? undefined }), { visibility: 'PUBLIC' }] },
            include: EVENT_ROW_INCLUDE(lang),
            orderBy: { startDate: 'asc' },
            take: SEARCH_ROWS_MAX
        })
    ]);
    const mine = await myTags(eventRows.map((r) => r.id), viewerId);

    return {
        word,
        theme,
        cities,
        themes,
        veidi,
        groups: groupRows.map((r) => toGroupCard(r, lang)),
        events: eventRows.map((r) => toEventRow(r, lang, null)).map((r) => ({ ...r, tag: mine.get(r.id) ?? null })),
        total: { groups: g.total, events: e.total },
        elsewhere: cities.length > 0 ? g.anyPlace - g.total + (e.anyPlace - e.total) : 0,
        places
    };
}
