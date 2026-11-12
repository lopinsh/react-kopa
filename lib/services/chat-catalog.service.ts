import { prisma } from '@/lib/prisma';
import { hubHref } from '@/lib/hub-path';
import { pickTitle } from '@/lib/utils/localized-title';
import { enc, isRecord, matrixConfig, matrixFetch } from './matrix-client';
import { MatrixService } from './matrix.service';
import { ChatRoomService } from './chat-room.service';
import { family, type RoomRef } from './chat-context.service';
import { OnlineService } from './online.service';

/** Katalogs (K5-21, K-88): the rooms of a community or a city with their activity. Rows come from the DB; activity is best effort and cached 60 s per room. */

export interface CatalogRow extends RoomRef {
    /** Joined and online now; null when Matrix gave nothing (down, or the room does not exist yet). */
    online: number | null;
    /** The last line's time (ms), or null for a quiet or not yet created room. */
    lastTs: number | null;
}

const CACHE_MS = 60_000;
const PARALLEL = 8;
const cache = new Map<string, { at: number; online: number | null; lastTs: number | null }>();

async function activityOf(r: RoomRef, online: Set<string>): Promise<{ online: number | null; lastTs: number | null }> {
    if (!r.categoryId) return { online: null, lastTs: null };
    const hit = cache.get(r.key);
    if (hit && Date.now() - hit.at < CACHE_MS) return hit;
    let out: { online: number | null; lastTs: number | null } = { online: null, lastTs: null };
    try {
        const roomId = await ChatRoomService.roomIdFor({ categoryId: r.categoryId, cityId: r.cityId });
        if (roomId) {
            const [res, members] = await Promise.all([matrixFetch('GET', `/_matrix/client/v3/rooms/${enc(roomId)}/messages?dir=b&limit=1`), MatrixService.joinedSiteIds(roomId)]);
            const chunk = isRecord(res) && Array.isArray(res.chunk) ? res.chunk : [];
            const last = chunk.find((e): e is Record<string, unknown> => isRecord(e) && e.type === 'm.room.message');
            out = { online: members.filter((id) => online.has(id)).length, lastTs: last && typeof last.origin_server_ts === 'number' ? last.origin_server_ts : null };
        }
    } catch (e: unknown) {
        console.error('[chat-catalog] activity failed:', e);
        return out;
    }
    cache.set(r.key, { at: Date.now(), ...out });
    return out;
}

/** Newest last line first; rooms with no line last, then by title. */
async function withActivity(rooms: RoomRef[], locale: string): Promise<CatalogRow[]> {
    const online = matrixConfig() ? await OnlineService.onlineIds() : new Set<string>();
    const rows: CatalogRow[] = [];
    for (let i = 0; i < rooms.length; i += PARALLEL) {
        const part = matrixConfig() ? await Promise.all(rooms.slice(i, i + PARALLEL).map((r) => activityOf(r, online))) : rooms.slice(i, i + PARALLEL).map(() => ({ online: null, lastTs: null }));
        part.forEach((a, j) => rows.push({ ...rooms[i + j], ...a }));
    }
    return rows.sort((a, b) => (b.lastTs ?? 0) - (a.lastTs ?? 0) || a.title.localeCompare(b.title, locale));
}

export const ChatCatalogService = {
    /** The L2's room, its ACTIVE L3 rooms and its OPEN topic x city rooms (K-88); an L3 or topic x city hub shows its L2's family. */
    async forFamily(l2Id: string, locale: string): Promise<CatalogRow[]> {
        return withActivity(await family(l2Id, locale), locale);
    },

    /** The OPEN topic x city rooms of one city (K5-23), each linking to its Čats. */
    async forCity(city: { id: string; segment: string; name: string }, locale: string): Promise<CatalogRow[]> {
        const hubs = await prisma.hubCity.findMany({
            where: { cityId: city.id, status: 'OPEN', category: { status: 'ACTIVE', level: { in: [2, 3] } } },
            select: { category: { select: { id: true, slug: true, level: true, titles: { select: { lang: true, title: true } }, parent: { select: { slug: true, parent: { select: { slug: true } } } } } } },
        });
        const rooms = hubs.flatMap(({ category: c }): RoomRef[] => {
            const l1 = c.level === 2 ? c.parent?.slug : c.parent?.parent?.slug;
            const l2 = c.level === 2 ? c.slug : c.parent?.slug;
            if (!l1 || !l2) return [];
            return [{ key: `${c.id}:${city.segment}`, title: `${pickTitle(c.titles, locale, c.slug)} · ${city.name}`, kind: 'city', href: hubHref(l1, l2, c.level === 3 ? c.slug : undefined, 'chat', city.segment), categoryId: c.id, cityId: city.id }];
        });
        return withActivity(rooms, locale);
    },
};
