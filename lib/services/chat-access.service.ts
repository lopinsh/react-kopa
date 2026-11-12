import { prisma } from '@/lib/prisma';
import { ActionError } from '@/types/actions';
import { CityService } from './city.service';
import { ChatRoomService } from './chat-room.service';
import { openRef, type ChatRoomRef } from './chat-room-refs';
import { matrixConfig, MatrixRequestError } from './matrix-client';
import { MatrixService, type PublicLine } from './matrix.service';

/** What a person may do in a Čats room: log in from the browser (K5-05), join (K5-06), read signed out (K5-07). */

export interface ChatBrowserSession {
    userId: string;
    accessToken: string;
    refreshToken: string;
    expiresInMs: number;
    homeserverUrl: string;
    deviceId: string;
}

export interface HubKey { hubSlug: string; city?: string }

const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** The room behind a hub key, or null: unknown or inactive Veids, unknown city, or a topic x city hub that is not OPEN (K-144). */
export async function resolveKey(key: HubKey): Promise<ChatRoomRef | null> {
    const cat = await prisma.category.findFirst({ where: { slug: key.hubSlug, status: 'ACTIVE', level: { in: [2, 3] } }, select: { id: true } });
    if (!cat) return null;
    if (!key.city) return openRef(cat.id);
    const city = await CityService.bySegment(key.city, 'lv');
    return city ? openRef(cat.id, city.id) : null;
}

export const ChatAccessService = {
    /** A refreshable login for the browser (30 min tokens, F1b); the earlier token of the same device dies. */
    async session(userId: string, deviceId: string): Promise<ChatBrowserSession> {
        const cfg = matrixConfig();
        if (!cfg) throw new ActionError('CHAT_UNAVAILABLE');
        const s = await MatrixService.expiringSessionFor(userId, deviceId);
        return { ...s, userId: MatrixService.userMxid(userId), homeserverUrl: cfg.publicUrl, deviceId };
    },

    /** First open (K-33a): make the room if missing and join the person. A join rate limit is retried once after the wait Synapse names. */
    async open(userId: string, key: HubKey): Promise<{ roomId: string }> {
        if (!matrixConfig()) throw new ActionError('CHAT_UNAVAILABLE');
        const ref = await resolveKey(key);
        if (!ref) throw new ActionError('NOT_FOUND');
        const roomId = await ChatRoomService.ensure(ref);
        await MatrixService.ensureUser(userId);
        try {
            await MatrixService.joinAs(userId, roomId);
        } catch (e) {
            if (!(e instanceof MatrixRequestError && e.errcode === 'M_LIMIT_EXCEEDED')) throw e;
            await wait(Math.min(e.retryAfterMs ?? 1000, 5000));
            await MatrixService.joinAs(userId, roomId);
        }
        return { roomId };
    },

    /** Signed-out read (K-140, K-142): the last lines with names; `[]` when the room does not exist. */
    async read(key: HubKey): Promise<PublicLine[]> {
        if (!matrixConfig()) throw new ActionError('CHAT_UNAVAILABLE');
        const ref = await resolveKey(key);
        return ref ? ChatRoomService.readPublic(ref, 50) : [];
    },
};
