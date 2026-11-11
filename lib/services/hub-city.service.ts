import { prisma } from '@/lib/prisma';
import { ActionError } from '@/types/actions';
import { HUB_CITY_OPEN_AT } from '@/lib/constants';
import { toTextLang } from '@/lib/translations';
import { pickTitle } from '@/lib/utils/localized-title';
import { hubHref } from '@/lib/hub-path';
import { CityService } from './city.service';
import { hubCityCounts, hubGroupWhere } from './hub-query';
import { createNoteTx } from './hub-note.service';
import { ModerationService } from './moderation.service';
import { isSiteAdminUser } from './site-role.service';
import type { HubContext } from './hub.service';

/** One open topic x city hub in the city hub's Pilsētas istabas (K3-20): "Šahs · Jelgava" with its numbers. */
export interface CityRoom {
    slug: string;
    title: string;
    /** Without locale. */
    href: string;
    groupCount: number;
    lastActivityAt: Date | null;
}

export interface KurOption {
    slug: string;
    segment: string;
    name: string;
    status: 'open' | 'requested' | 'none';
    groupCount: number;
    requestCount: number;
    viewerRequested: boolean;
}

/** Topic x city hubs (K3): what the Kur switcher lists, requesting one, closing one. The city hub itself is derived from `City` and needs no rows. */
export const HubCityService = {
    /**
     * The OPEN topic x city hubs of a city (K3-20), last activity first (newest of a group's update or an event's creation among the room's groups; none last, then by title).
     * A CLOSED or REQUESTED hub is not listed (invariant).
     */
    async openInCity(city: { id: string; slug: string; segment: string }, locale: string): Promise<CityRoom[]> {
        const lang = toTextLang(locale);
        const rows = await prisma.hubCity.findMany({
            where: { cityId: city.id, status: 'OPEN', category: { status: 'ACTIVE', level: { in: [2, 3] } } },
            select: { category: { select: { id: true, slug: true, level: true, titles: { select: { lang: true, title: true } }, parent: { select: { id: true, slug: true, parent: { select: { id: true, slug: true } } } } } } },
        });
        const rooms = await Promise.all(rows.map(async ({ category: c }): Promise<CityRoom | null> => {
            const l1 = c.level === 2 ? c.parent : c.parent?.parent;
            const l2Slug = c.level === 2 ? c.slug : c.parent?.slug;
            if (!l1 || !l2Slug) return null;
            const where = hubGroupWhere({ l1Id: l1.id, slug: c.slug }, [city.slug], lang);
            const [groupCount, g, e] = await Promise.all([
                prisma.group.count({ where }),
                prisma.group.aggregate({ where, _max: { updatedAt: true } }),
                prisma.event.aggregate({ where: { visibility: 'PUBLIC', group: where }, _max: { createdAt: true } }),
            ]);
            const times = [g._max.updatedAt, e._max.createdAt].filter((d): d is Date => d !== null);
            return {
                slug: c.slug,
                title: pickTitle(c.titles, lang, c.slug),
                href: hubHref(l1.slug, l2Slug, c.level === 3 ? c.slug : undefined, 'overview', city.segment),
                groupCount,
                lastActivityAt: times.length ? new Date(Math.max(...times.map((d) => d.getTime()))) : null,
            };
        }));
        const collator = new Intl.Collator(lang);
        return rooms.filter((r): r is CityRoom => r !== null).sort((a, b) => (b.lastActivityAt?.getTime() ?? 0) - (a.lastActivityAt?.getTime() ?? 0) || collator.compare(a.title, b.title));
    },

    /**
     * Every ACTIVE city for the topic hub's Kur switcher (K3-06): open ones first (most groups), then the rest by name.
     * A CLOSED hub reads as none; requests are counts, never names.
     */
    async kurOptions(hub: Pick<HubContext, 'id' | 'l1Id' | 'slug'>, locale: string, viewerId?: string): Promise<KurOption[]> {
        const [cities, counts, rows] = await Promise.all([
            CityService.listActive(locale),
            hubCityCounts(hubGroupWhere({ l1Id: hub.l1Id, slug: hub.slug }, [], toTextLang(locale))),
            prisma.hubCity.findMany({
                where: { categoryId: hub.id },
                select: { status: true, city: { select: { slug: true } }, requests: { select: { userId: true } } },
            }),
        ]);
        const bySlug = new Map(rows.map((r) => [r.city.slug, r]));
        const options = cities.map((c): KurOption => {
            const row = bySlug.get(c.slug);
            const live = row && row.status !== 'CLOSED' ? row : undefined;
            return {
                slug: c.slug,
                segment: c.slug.toLowerCase(),
                name: c.name,
                status: live?.status === 'OPEN' ? 'open' : live ? 'requested' : 'none',
                groupCount: counts.byCity[c.slug] ?? 0,
                requestCount: live?.requests.length ?? 0,
                viewerRequested: !!viewerId && !!live?.requests.some((r) => r.userId === viewerId),
            };
        });
        const collator = new Intl.Collator(toTextLang(locale));
        const open = options.filter((o) => o.status === 'open').sort((a, b) => b.groupCount - a.groupCount || collator.compare(a.name, b.name));
        return [...open, ...options.filter((o) => o.status !== 'open')];
    },

    /**
     * "Pieprasīt" (K3-05): one request per person per topic x city; the second distinct person opens the hub, once, under a lock.
     * The optional note is a public Ziņa made in the same transaction, so it counts against the 3-note limit (HUB_NOTE_LIMIT aborts all).
     * `notifyUserIds` are the earlier requesters when this call opened it.
     */
    async request(o: { hubSlug: string; citySegment: string; userId: string; note?: string; locale: string }): Promise<{ opened: boolean; href: string; names: Record<'hubNameLv' | 'hubNameEn' | 'cityNameLv' | 'cityNameEn', string>; notifyUserIds: string[] }> {
        const city = await CityService.bySegment(o.citySegment, o.locale);
        if (!city) throw new ActionError('NOT_FOUND');
        const topic = await prisma.category.findFirst({
            where: { slug: o.hubSlug, level: { in: [2, 3] }, status: 'ACTIVE' },
            select: { id: true, slug: true, level: true, titles: { select: { lang: true, title: true } }, parent: { select: { slug: true, parent: { select: { slug: true } } } } },
        });
        const l1 = topic?.level === 2 ? topic.parent?.slug : topic?.parent?.parent?.slug;
        const l2 = topic?.level === 2 ? topic.slug : topic?.parent?.slug;
        if (!topic || !l1 || !l2) throw new ActionError('NOT_FOUND');
        const href = hubHref(l1, l2, topic.level === 3 ? topic.slug : undefined, 'overview', city.segment);
        const hubId = topic.id;
        const names = { hubNameLv: pickTitle(topic.titles, 'lv', topic.slug), hubNameEn: pickTitle(topic.titles, 'en', topic.slug), cityNameLv: city.nameLv, cityNameEn: city.nameEn };
        return prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`hub-city:${hubId}:${city.id}`}))`;
            const found = await tx.hubCity.findUnique({ where: { categoryId_cityId: { categoryId: hubId, cityId: city.id } }, include: { requests: { select: { userId: true } } } });
            const row = found ?? { ...(await tx.hubCity.create({ data: { categoryId: hubId, cityId: city.id } })), requests: [] };
            if (row.status === 'CLOSED') await tx.hubCity.update({ where: { id: row.id }, data: { status: 'REQUESTED', closedAt: null, closedById: null } });
            const isOpen = row.status === 'OPEN';
            if (row.requests.some((r) => r.userId === o.userId)) throw new ActionError('HUB_CITY_REQUESTED');

            const note = o.note ? await createNoteTx(tx, o.userId, { categoryId: hubId, cityId: city.id, content: o.note }) : null;
            if (isOpen) {
                return { opened: true, href, names, notifyUserIds: [] };
            }
            await tx.hubCityRequest.create({ data: { hubCityId: row.id, userId: o.userId, noteId: note?.id ?? null } });
            const opens = row.requests.length + 1 >= HUB_CITY_OPEN_AT;
            if (opens) await tx.hubCity.update({ where: { id: row.id }, data: { status: 'OPEN', openedAt: new Date() } });
            return { opened: opens, href, names, notifyUserIds: opens ? row.requests.map((r) => r.userId) : [] };
        });
    },

    /** Closes an OPEN hub (K3-05, site admins only, checked here too): requests go, notes stay; two new requests reopen it. */
    async close(hubCityId: string, adminId: string): Promise<void> {
        if (!(await isSiteAdminUser(adminId))) throw new ActionError('FORBIDDEN');
        const row = await prisma.hubCity.findUnique({
            where: { id: hubCityId },
            select: { id: true, status: true, city: { select: { nameLv: true } }, category: { select: { slug: true, titles: { select: { lang: true, title: true } } } } },
        });
        if (!row || row.status !== 'OPEN') throw new ActionError('NOT_FOUND');
        const targetName = `${pickTitle(row.category.titles, 'lv', row.category.slug)} · ${row.city.nameLv}`;
        await prisma.$transaction(async (tx) => {
            await tx.hubCityRequest.deleteMany({ where: { hubCityId } });
            await tx.hubCity.update({ where: { id: hubCityId }, data: { status: 'CLOSED', closedAt: new Date(), closedById: adminId } });
            await ModerationService.logAction(adminId, 'HUB_CITY_CLOSE', 'HubCity', hubCityId, undefined, tx, targetName);
        });
    },
};
