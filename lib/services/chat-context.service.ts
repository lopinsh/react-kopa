import { prisma } from '@/lib/prisma';
import { hubHref } from '@/lib/hub-path';
import { isSiteAdmin } from '@/lib/site-role';
import { pickTitle } from '@/lib/utils/localized-title';
import { matrixConfig } from './matrix-client';
import { ChatAccessService, type HubKey } from './chat-access.service';
import type { PublicLine } from './matrix.service';

/** What the Čats page hands to `ChatProvider` (K5-09). Built from the DB; only a signed-out visitor's lines come from Synapse. */

export type RoomKind = 'hub' | 'sub' | 'city';
/** `categoryId` and `cityId` name the Matrix room (K5-01); the Katalogs reads activity through them. */
export interface RoomRef { key: string; title: string; kind: RoomKind; href: string; categoryId?: string; cityId?: string }

export interface ChatPageContext {
    /** False when `MATRIX_*` is unset or the read failed: the page shows `hub.chat.unavailable` (K5-14). */
    configured: boolean;
    room: { key: string; hubKey: HubKey; title: string; kind: RoomKind; memberLine: string };
    family: RoomRef[];
    viewer: { id: string; isMod: boolean } | null;
    /** Signed out only (K-140). */
    lines?: PublicLine[];
    l2Id: string;
}

interface HubInput { id: string; slug: string; level: 2 | 3; title: string; local: { segment: string; cityName: string } | null }

const TITLES = { select: { lang: true, title: true } } as const;

/** The L2's rooms for the switcher and tabs (K-81): the L2 room, each sub-veids room, then the open topic x city rooms. Titles in the viewer's language. */
export async function family(l2Id: string, locale: string): Promise<RoomRef[]> {
    const l2 = await prisma.category.findUnique({
        where: { id: l2Id },
        select: {
            slug: true, titles: TITLES, parent: { select: { slug: true } },
            children: { where: { status: 'ACTIVE', level: 3 }, select: { id: true, slug: true, titles: TITLES }, orderBy: { slug: 'asc' } },
        },
    });
    if (!l2?.parent) return [];
    const l1 = l2.parent.slug;
    const hubs = [{ id: l2Id, slug: l2.slug, l3: undefined as string | undefined, title: pickTitle(l2.titles, locale, l2.slug), kind: 'hub' as RoomKind },
        ...l2.children.map((c) => ({ id: c.id, slug: c.slug, l3: c.slug as string | undefined, title: pickTitle(c.titles, locale, c.slug), kind: 'sub' as RoomKind }))];
    const open = await prisma.hubCity.findMany({
        where: { status: 'OPEN', categoryId: { in: hubs.map((h) => h.id) } },
        select: { categoryId: true, city: { select: { id: true, slug: true, nameLv: true, nameEn: true } } },
    });
    const cityRooms = open.flatMap((o): RoomRef[] => {
        const h = hubs.find((x) => x.id === o.categoryId);
        if (!h) return [];
        const city = locale === 'en' ? o.city.nameEn : o.city.nameLv;
        return [{ key: `${h.id}:${o.city.slug.toLowerCase()}`, title: `${h.title} · ${city}`, kind: 'city', href: hubHref(l1, l2.slug, h.l3, 'chat', o.city.slug.toLowerCase()), categoryId: h.id, cityId: o.city.id }];
    }).sort((a, b) => a.title.localeCompare(b.title, locale));
    return [...hubs.map((h) => ({ key: h.id, title: h.title, kind: h.kind, href: hubHref(l1, l2.slug, h.l3, 'chat'), categoryId: h.id })), ...cityRooms];
}

export const ChatContextService = {
    /**
     * Where `?room=<slug>` on a hub leads (K5-27, K-57): an OPEN topic x city room with that city segment, else an ACTIVE L3's room, else the hub's own Čats.
     * The address carries no locale (the caller adds it).
     */
    async roomHref(hub: { id: string; level: 2 | 3; topicHref: string }, room: string, locale: string): Promise<string> {
        const own = await prisma.category.findUnique({ where: { id: hub.id }, select: { parentId: true } });
        const rooms = await family(hub.level === 2 ? hub.id : own?.parentId ?? hub.id, locale);
        const want = room.toLowerCase();
        const hit = rooms.find((r) => r.kind === 'city' && r.categoryId === hub.id && r.key.endsWith(`:${want}`))
            ?? rooms.find((r) => r.kind === 'sub' && r.href.split('/').at(-2) === want)
            ?? rooms.find((r) => r.categoryId === hub.id && r.kind !== 'city');
        return hit?.href ?? `${hub.topicHref}/chat`;
    },

    /** Built for the hub the Čats page is on (K5-09). A signed-out visitor gets the last 50 lines now; a failed read marks chat unavailable instead of throwing (K5-14). */
    async pageContext(hub: HubInput, viewer: { id: string; role?: string | null } | null, memberLine: string, locale: string): Promise<ChatPageContext> {
        const own = await prisma.category.findUnique({ where: { id: hub.id }, select: { parentId: true } });
        const l2Id = hub.level === 2 ? hub.id : own?.parentId ?? hub.id;
        const key = hub.local ? `${hub.id}:${hub.local.segment}` : hub.id;
        const hubKey: HubKey = hub.local ? { hubSlug: hub.slug, city: hub.local.segment } : { hubSlug: hub.slug };
        const kind: RoomKind = hub.local ? 'city' : hub.level === 2 ? 'hub' : 'sub';
        const title = hub.local ? `${hub.title} · ${hub.local.cityName}` : hub.title;
        let configured = !!matrixConfig();
        let lines: PublicLine[] | undefined;
        if (configured && !viewer) {
            try {
                lines = await ChatAccessService.read(hubKey);
            } catch (e: unknown) {
                console.error('[chat] public read failed:', e);
                configured = false;
            }
        }
        return {
            configured,
            room: { key, hubKey, title, kind, memberLine },
            family: await family(l2Id, locale),
            viewer: viewer ? { id: viewer.id, isMod: isSiteAdmin(viewer.role) } : null,
            lines,
            l2Id,
        };
    },
};
