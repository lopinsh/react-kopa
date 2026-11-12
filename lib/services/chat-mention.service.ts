import { prisma } from '@/lib/prisma';
import { hubHref } from '@/lib/hub-path';
import { pickTitle } from '@/lib/utils/localized-title';
import { ActionError } from '@/types/actions';
import { enc, isRecord, matrixConfig, matrixFetch } from './matrix-client';
import { MatrixService } from './matrix.service';
import { ChatRoomService } from './chat-room.service';
import { resolveKey, type HubKey } from './chat-access.service';
import { NotificationService } from './notification.service';

/** @mentions in Čats (K5-24, K-145): one bell notice per room until read. The site trusts only an event the caller sent, a moment ago. */

const V3 = '/_matrix/client/v3';
const MAX_MENTIONS = 5;
const MAX_AGE_MS = 2 * 60_000;
const TITLES = { select: { lang: true, title: true } } as const;

/** The mentioned site user ids in an event's `m.mentions.user_ids` (at most 5). */
function mentionedIds(content: unknown): string[] {
    const mentions = isRecord(content) && isRecord(content['m.mentions']) ? content['m.mentions'].user_ids : undefined;
    const ids = Array.isArray(mentions) ? mentions.flatMap((m) => (typeof m === 'string' ? (/^@u_([a-z0-9]+):/.exec(m)?.[1] ?? []) : [])) : [];
    return [...new Set(ids)].slice(0, MAX_MENTIONS);
}

/** The room's Čats address and its title in both languages. */
async function roomInfo(key: HubKey): Promise<{ href: string; roomLv: string; roomEn: string } | null> {
    const cat = await prisma.category.findFirst({
        where: { slug: key.hubSlug, status: 'ACTIVE', level: { in: [2, 3] } },
        select: { slug: true, level: true, titles: TITLES, parent: { select: { slug: true, parent: { select: { slug: true } } } } },
    });
    const city = key.city ? await prisma.city.findFirst({ where: { slug: { equals: key.city, mode: 'insensitive' } }, select: { nameLv: true, nameEn: true } }) : null;
    const l1 = cat?.level === 2 ? cat.parent?.slug : cat?.parent?.parent?.slug;
    const l2 = cat?.level === 2 ? cat.slug : cat?.parent?.slug;
    if (!cat || !l1 || !l2) return null;
    const title = (lang: string) => `${pickTitle(cat.titles, lang, cat.slug)}${city ? ` · ${lang === 'en' ? city.nameEn : city.nameLv}` : ''}`;
    return { href: hubHref(l1, l2, cat.level === 3 ? cat.slug : undefined, 'chat', key.city?.toLowerCase()), roomLv: title('lv'), roomEn: title('en') };
}

export const ChatMentionService = {
    /** Notifies the people mentioned in a line `senderId` just sent. Returns how many notices it created. */
    async notify(senderId: string, key: HubKey, eventId: string): Promise<number> {
        if (!matrixConfig()) throw new ActionError('CHAT_UNAVAILABLE');
        const ref = await resolveKey(key);
        const roomId = ref ? await ChatRoomService.roomIdFor(ref) : null;
        const info = roomId ? await roomInfo(key) : null;
        if (!roomId || !info) throw new ActionError('NOT_FOUND');
        const event = await matrixFetch('GET', `${V3}/rooms/${enc(roomId)}/event/${enc(eventId)}`);
        if (!isRecord(event) || event.type !== 'm.room.message' || event.sender !== MatrixService.userMxid(senderId)) throw new ActionError('FORBIDDEN');
        if (typeof event.origin_server_ts !== 'number' || Date.now() - event.origin_server_ts > MAX_AGE_MS) throw new ActionError('FORBIDDEN');

        const ids = mentionedIds(event.content).filter((id) => id !== senderId);
        if (ids.length === 0) return 0;
        const [sender, targets, unread] = await Promise.all([
            prisma.user.findUnique({ where: { id: senderId }, select: { name: true } }),
            prisma.user.findMany({ where: { id: { in: ids }, chatMentionNotify: true }, select: { id: true } }),
            prisma.notification.findMany({ where: { userId: { in: ids }, type: 'CHAT_MENTION', read: false, link: info.href, audience: 'USER' }, select: { userId: true } }),
        ]);
        const skip = new Set(unread.map((n) => n.userId));
        const to = targets.map((u) => u.id).filter((id) => !skip.has(id));
        await Promise.all(to.map((userId) => NotificationService.notify({
            userId, type: 'CHAT_MENTION', translationKey: 'CHAT_MENTION',
            args: { authorName: sender?.name ?? '', room: info.roomLv, roomLv: info.roomLv, roomEn: info.roomEn }, link: info.href,
        })));
        return to.length;
    },
};
