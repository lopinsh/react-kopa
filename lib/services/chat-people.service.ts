import { prisma } from '@/lib/prisma';
import { isSiteAdmin } from '@/lib/site-role';
import { plainExcerpt } from '@/lib/text-excerpt';
import { toTextLang } from '@/lib/translations';
import { ActionError } from '@/types/actions';
import { matrixConfig } from './matrix-client';
import { MatrixService } from './matrix.service';
import { ChatRoomService } from './chat-room.service';
import { resolveKey, type HubKey } from './chat-access.service';
import { hubGroupWhere } from './hub-query';
import { OnlineService } from './online.service';
import { TaxonomyResolver } from './taxonomy-resolver.service';

/** Names, flair and the online list of a Čats room (K5-16, K5-17). Names come from the site, never from Matrix (F5). */

export interface ChatGroupFlair { name: string; href: string }
export interface ChatLineName { name: string; mod: boolean; group: string | null }
/** A row of the online list. Signed out (K-149): `id` null, no picture, status or group; the name is plain text. */
export interface OnlinePerson { id: string | null; name: string; mod: boolean; image: string | null; avatarSeed: string | null; status: string | null; group: ChatGroupFlair | null }
export interface OnlineList { people: OnlinePerson[]; count: number }

const CHAIN = { select: { id: true, slug: true, level: true, color: true, parent: { select: { id: true, slug: true, level: true, color: true, parent: { select: { id: true, slug: true, level: true, color: true } } } } } } as const;
const STATUS_MAX = 60;

/** The hub's Tēma and slug, and the room's city name: what "a group of this community" means (K-33a). */
async function scopeOf(key: HubKey): Promise<{ l1Id: string; slug: string; city: string | null } | null> {
    const cat = await prisma.category.findFirst({
        where: { slug: key.hubSlug, status: 'ACTIVE', level: { in: [2, 3] } },
        select: { slug: true, level: true, parent: { select: { id: true, parent: { select: { id: true } } } } },
    });
    const l1Id = cat?.level === 2 ? cat.parent?.id : cat?.parent?.parent?.id;
    if (!cat || !l1Id) return null;
    const city = key.city ? await prisma.city.findFirst({ where: { slug: { equals: key.city, mode: 'insensitive' } }, select: { nameLv: true } }) : null;
    return { l1Id, slug: cat.slug, city: city?.nameLv ?? null };
}

/** Each person's oldest public ACTIVE group among the hub's groups, the room's city first on a city room (K-33a flair). */
async function flairOf(ids: string[], key: HubKey, locale: string): Promise<Map<string, ChatGroupFlair>> {
    const flair = new Map<string, ChatGroupFlair>();
    const scope = ids.length ? await scopeOf(key) : null;
    if (!scope) return flair;
    const rows = await prisma.membership.findMany({
        where: { userId: { in: ids }, role: { not: 'PENDING' }, group: { AND: [hubGroupWhere(scope, [], toTextLang(locale)), { type: 'PUBLIC', hiddenAt: null }] } },
        orderBy: { joinedAt: 'asc' },
        select: { userId: true, group: { select: { name: true, slug: true, city: true, category: CHAIN } } },
    });
    const local = new Set<string>();
    for (const r of rows) {
        const isLocal = !!scope.city && r.group.city === scope.city;
        if (flair.has(r.userId) && (local.has(r.userId) || !isLocal)) continue;
        flair.set(r.userId, { name: r.group.name, href: `/${TaxonomyResolver.resolve(r.group.category).l1Slug}/group/${r.group.slug}` });
        if (isLocal) local.add(r.userId);
    }
    return flair;
}

export const ChatPeopleService = {
    /** Name, Mod and the community group for the meta lines (K-101): people the caller already checked belong to the room. */
    async lineNames(ids: string[], key: HubKey, locale: string): Promise<Record<string, ChatLineName>> {
        if (ids.length === 0) return {};
        const [users, flair] = await Promise.all([
            prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, role: true } }),
            flairOf(ids, key, locale),
        ]);
        return Object.fromEntries(users.map((u) => [u.id, { name: u.name ?? '', mod: isSiteAdmin(u.role), group: flair.get(u.id)?.name ?? null }]));
    },

    /** Names for the senders of lines the SDK delivered (F5: never the SDK's `u_<id>`), only for people who are in this room: not a lookup of any user id. */
    async roomNames(key: HubKey, ids: string[], locale: string): Promise<Record<string, ChatLineName>> {
        if (!matrixConfig()) throw new ActionError('CHAT_UNAVAILABLE');
        const ref = await resolveKey(key);
        const roomId = ref ? await ChatRoomService.roomIdFor(ref) : null;
        if (!roomId) return {};
        const members = new Set(await MatrixService.joinedSiteIds(roomId));
        return this.lineNames(ids.filter((id) => members.has(id)), key, locale);
    },

    /**
     * Online now (K5-15) and in this room (K-82, K-34): Moderatori first, then A-Z. Signed out gets plain names only (K-149).
     * The signed-in viewer asking has the room open (and is joined on open), so they count at once, before their socket and join reach the 10 s cache.
     */
    async online(key: HubKey, locale: string, viewerId: string | null): Promise<OnlineList> {
        const signedIn = !!viewerId;
        if (!matrixConfig()) throw new ActionError('CHAT_UNAVAILABLE');
        const ref = await resolveKey(key);
        const roomId = ref ? await ChatRoomService.roomIdFor(ref) : null;
        if (!roomId) return { people: [], count: 0 };
        const [members, online] = await Promise.all([MatrixService.joinedSiteIds(roomId), OnlineService.onlineIds()]);
        const ids = members.filter((id) => online.has(id) && id !== viewerId).slice(0, 300);
        if (viewerId) ids.push(viewerId);
        const [users, flair] = await Promise.all([
            prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, role: true, image: true, avatarSeed: true, bio: true, isProfilePublic: true } }),
            signedIn ? flairOf(ids, key, locale) : new Map<string, ChatGroupFlair>(),
        ]);
        const people = users.map((u): OnlinePerson => ({
            id: signedIn ? u.id : null,
            name: u.name ?? '',
            mod: isSiteAdmin(u.role),
            image: signedIn ? u.image : null,
            avatarSeed: signedIn ? u.avatarSeed : null,
            status: signedIn && u.isProfilePublic ? plainExcerpt(u.bio, STATUS_MAX) : null,
            group: flair.get(u.id) ?? null,
        })).sort((a, b) => Number(b.mod) - Number(a.mod) || a.name.localeCompare(b.name, 'lv'));
        return { people, count: people.length };
    },
};
