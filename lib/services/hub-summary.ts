import { prisma } from '@/lib/prisma';
import { HUB_CARD_CHIPS } from '@/lib/constants';
import { pickTitle } from '@/lib/utils/localized-title';
import { resolveEventText, toTextLang, type TextLang } from '@/lib/translations';
import { hubHref } from '@/lib/hub-path';
import { TaxonomyResolver } from './taxonomy-resolver.service';
import { eventWhere } from './discovery-query';
import { hubGroupWhere, hubMemberCount } from './hub-query';
import { groupWhere } from './discovery-query';
import { CityHubService, type CityHubContext } from './city-hub.service';
import { citySegment } from './city.service';

const TITLES = { select: { lang: true, title: true } } as const;

export interface HubSummary {
    /** A Veids hub, or the city hub paired with it when one city is chosen (K3-23). */
    kind: 'topic' | 'city';
    slug: string;
    level: 2 | 3;
    /** The L2 above an L3 (null on an L2): lets the card see that one chosen Veids is the parent of another. */
    parentSlug: string | null;
    title: string;
    /** The open topic x city hub's city name (K3-24): the card names it "Kopiena <Veids> · <pilsēta>". */
    cityName: string | null;
    /** Without locale. */
    href: string;
    accentColor: string;
    stats: { memberCount: number; groupCount: number };
    nextEvent: { title: string; startsAt: Date } | null;
    lastActivityAt: Date | null;
    /** The first `HUB_CARD_CHIPS` sub-veidi (most groups first) and how many more there are. */
    subTopics: Array<{ slug: string; title: string; href: string }>;
    moreCount: number;
}

/**
 * What the board's hub card shows for the chosen Veidi (K1-26): one summary per slug in `slugs` that is an active level-2 or level-3 category under `l1Slug`
 * (others are dropped, so an L1 alone gives none, K-06). Every source is read once per hub with the hub's own `hubGroupWhere`; the number of hubs is the number of chosen chips.
 */
export async function hubSummaries(l1Slug: string, slugs: string[], locale: string, citySlug?: string): Promise<HubSummary[]> {
    const lang = toTextLang(locale);
    const city = citySlug ? await CityHubService.getContext(citySegment(citySlug), locale) : null;
    const l1 = { slug: l1Slug, level: 1, status: 'ACTIVE' as const };
    const cats = await prisma.category.findMany({
        where: { slug: { in: slugs }, level: { in: [2, 3] }, status: 'ACTIVE', OR: [{ parent: l1 }, { parent: { parent: l1 } }] },
        select: {
            id: true, slug: true, level: true, color: true, titles: TITLES,
            parent: { select: { id: true, slug: true, color: true, titles: TITLES, parent: { select: { id: true, slug: true } } } },
            children: { where: { status: 'ACTIVE' }, select: { slug: true, titles: TITLES } },
        },
    });
    const l1Id = (c: (typeof cats)[number]) => (c.level === 2 ? c.parent?.id : c.parent?.parent?.id);
    const title = (c: { slug: string; titles: Array<{ lang: string; title: string }> }) => pickTitle(c.titles, lang, c.slug);
    const ordered = slugs.flatMap((s) => cats.filter((c) => c.slug === s));

    const topics = await Promise.all(ordered.map(async (c): Promise<HubSummary> => {
        const l2Slug = c.level === 2 ? c.slug : c.parent?.slug ?? c.slug;
        const base = {
            kind: 'topic' as const,
            cityName: null,
            slug: c.slug,
            level: c.level as 2 | 3,
            parentSlug: c.level === 3 ? c.parent?.slug ?? null : null,
            title: title(c),
            href: hubHref(l1Slug, l2Slug, c.level === 3 ? c.slug : undefined),
            accentColor: TaxonomyResolver.resolve(c).accentColor,
        };

        // One city chosen and this Veids has an open hub there: its name, address and numbers are the city's (K3-24); otherwise the nationwide ones (K1-30).
        const open = city ? await prisma.hubCity.findFirst({ where: { categoryId: c.id, cityId: city.cityId, status: 'OPEN' }, select: { id: true } }) : null;
        const inCity = open && city ? [city.slug] : [];
        const where = hubGroupWhere({ l1Id: l1Id(c) ?? '', slug: c.slug }, inCity, lang);
        const inGroup = { group: where };
        const [groupCount, memberCount, next, g, m, p, e, kids] = await Promise.all([
            prisma.group.count({ where }),
            hubMemberCount(where),
            prisma.event.findFirst({
                where: { AND: [eventWhere({ category: l1Slug, tags: [c.slug], cities: inCity }), { visibility: 'PUBLIC', startDate: { gte: new Date() } }] },
                orderBy: [{ startDate: 'asc' }, { id: 'asc' }],
                select: { startDate: true, originalLang: true, translations: { select: { lang: true, title: true, description: true } } },
            }),
            prisma.group.aggregate({ where, _max: { createdAt: true } }),
            prisma.membership.aggregate({ where: { role: { not: 'PENDING' }, ...inGroup }, _max: { joinedAt: true } }),
            prisma.post.aggregate({ where: { visibility: 'PUBLIC', archivedAt: null, ...inGroup }, _max: { createdAt: true } }),
            prisma.event.aggregate({ where: { visibility: 'PUBLIC', ...inGroup }, _max: { createdAt: true } }),
            Promise.all(c.level === 2 ? c.children.map(async (k) => ({
                slug: k.slug, title: title(k), href: hubHref(l1Slug, l2Slug, k.slug),
                n: await prisma.group.count({ where: hubGroupWhere({ l1Id: l1Id(c) ?? '', slug: k.slug }, [], lang) }),
            })) : []),
        ]);
        const times = [g._max.createdAt, m._max.joinedAt, p._max.createdAt, e._max.createdAt].filter((d): d is Date => d !== null);
        const sorted = kids.sort((a, b) => b.n - a.n || a.title.localeCompare(b.title, locale));
        return {
            ...base,
            ...(open && city ? { cityName: city.name, href: hubHref(l1Slug, l2Slug, c.level === 3 ? c.slug : undefined, 'overview', city.segment) } : {}),
            stats: { memberCount, groupCount },
            nextEvent: next ? { title: resolveEventText(next.translations.map((t) => ({ ...t, instructions: null })), lang, next.originalLang, true).title, startsAt: next.startDate } : null,
            lastActivityAt: times.length ? new Date(Math.max(...times.map((d) => d.getTime()))) : null,
            subTopics: sorted.slice(0, HUB_CARD_CHIPS).map(({ slug, title: t, href }) => ({ slug, title: t, href })),
            moreCount: Math.max(0, sorted.length - HUB_CARD_CHIPS),
        };
    }));
    if (!city || topics.length === 0) return topics;
    return [...topics, await citySummary(city, topics[0].accentColor, lang)];
}

/** The city hub as the card's last entry (K3-23): "Kopiena Jelgava", its numbers and latest activity, no next event and no chips. */
async function citySummary(city: CityHubContext, accentColor: string, lang: TextLang): Promise<HubSummary> {
    const where = groupWhere({ cities: [city.slug] }, lang);
    const inGroup = { group: where };
    const [g, m, p, e] = await Promise.all([
        prisma.group.aggregate({ where, _max: { createdAt: true } }),
        prisma.membership.aggregate({ where: { role: { not: 'PENDING' }, ...inGroup }, _max: { joinedAt: true } }),
        prisma.post.aggregate({ where: { visibility: 'PUBLIC', archivedAt: null, ...inGroup }, _max: { createdAt: true } }),
        prisma.event.aggregate({ where: { visibility: 'PUBLIC', ...inGroup }, _max: { createdAt: true } }),
    ]);
    const times = [g._max.createdAt, m._max.joinedAt, p._max.createdAt, e._max.createdAt].filter((d): d is Date => d !== null);
    return {
        kind: 'city', slug: city.slug, level: 2, parentSlug: null, title: city.name, cityName: null, href: city.href, accentColor, stats: city.stats,
        nextEvent: null, lastActivityAt: times.length ? new Date(Math.max(...times.map((d) => d.getTime()))) : null, subTopics: [], moreCount: 0,
    };
}
