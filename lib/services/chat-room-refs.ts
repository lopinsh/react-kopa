import { prisma } from '@/lib/prisma';
import { pickTitle } from '@/lib/utils/localized-title';

/** One Čats room (K5-01): a hub room (L2 or L3, `cityId` absent) or a topic x city room. Names are Latvian, as Matrix stores them. */
export interface ChatRoomRef {
    categoryId: string;
    l2Id: string;
    l2Name: string;
    cityId?: string;
    cityName?: string;
    name: string;
}

const TITLES = { select: { lang: true, title: true } } as const;
const CATEGORY = { id: true, slug: true, level: true, titles: TITLES, parent: { select: { id: true, slug: true, titles: TITLES } } } as const;

interface CategoryRow {
    id: string;
    slug: string;
    level: number;
    titles: { lang: string; title: string }[];
    parent: { id: string; slug: string; titles: { lang: string; title: string }[] } | null;
}

function toRef(c: CategoryRow, city?: { id: string; nameLv: string }): ChatRoomRef | null {
    const l2 = c.level === 2 ? c : c.parent;
    if (!l2 || (c.level !== 2 && c.level !== 3)) return null;
    const title = pickTitle(c.titles, 'lv', c.slug);
    return {
        categoryId: c.id,
        l2Id: l2.id,
        l2Name: pickTitle(l2.titles, 'lv', l2.slug),
        cityId: city?.id,
        cityName: city?.nameLv,
        name: city ? `${title} · ${city.nameLv}` : title,
    };
}

/** The alias local part of a room (K5-01): ids, never slugs. */
export function roomAlias(r: Pick<ChatRoomRef, 'categoryId' | 'cityId'>): string {
    return r.cityId ? `ejk_room_${r.categoryId}_${r.cityId}` : `ejk_room_${r.categoryId}`;
}
export const l2SpaceAlias = (l2Id: string): string => `ejk_hub_${l2Id}`;
export const citySpaceAlias = (cityId: string): string => `ejk_city_${cityId}`;

/** The room for an ACTIVE L2/L3 (and a city when given), or null. It does not check that the topic x city hub is OPEN: callers that need it use `openRef`. */
export async function roomRef(categoryId: string, cityId?: string): Promise<ChatRoomRef | null> {
    const [cat, city] = await Promise.all([
        prisma.category.findFirst({ where: { id: categoryId, status: 'ACTIVE', level: { in: [2, 3] } }, select: CATEGORY }),
        cityId ? prisma.city.findUnique({ where: { id: cityId }, select: { id: true, nameLv: true } }) : null,
    ]);
    if (!cat || (cityId && !city)) return null;
    return toRef(cat, city ?? undefined);
}

/** Like `roomRef`, but a topic x city room only when that hub is OPEN (K-144: a closed hub has no room). */
export async function openRef(categoryId: string, cityId?: string): Promise<ChatRoomRef | null> {
    if (cityId && !(await prisma.hubCity.count({ where: { categoryId, cityId, status: 'OPEN' } }))) return null;
    return roomRef(categoryId, cityId);
}

/** Every room that should exist: the ACTIVE hub rooms and the OPEN topic x city rooms. */
export async function allRoomRefs(): Promise<ChatRoomRef[]> {
    const [cats, hubs] = await Promise.all([
        prisma.category.findMany({ where: { status: 'ACTIVE', level: { in: [2, 3] } }, select: CATEGORY }),
        prisma.hubCity.findMany({ where: { status: 'OPEN', category: { status: 'ACTIVE', level: { in: [2, 3] } } }, select: { city: { select: { id: true, nameLv: true } }, category: { select: CATEGORY } } }),
    ]);
    const refs = [...cats.map((c) => toRef(c)), ...hubs.map((h) => toRef(h.category, h.city))];
    return refs.filter((r): r is ChatRoomRef => r !== null);
}
