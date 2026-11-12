import { matrixConfig } from './matrix-client';
import { ChatAccessService, type HubKey } from './chat-access.service';
import { ChatPeopleService } from './chat-people.service';

/** The Čats block on Pārskats (K5-28, K-150): the room's last 3 lines and how many are online, read on the server for everyone (no SDK there). */

export interface ChatPreview { count: number; lines: { ts: number; name: string | null; body: string }[] }

const CACHE_MS = 30_000;
const LINES = 3;
const cache = new Map<string, { at: number; value: ChatPreview | null }>();

export const ChatPreviewService = {
    /** `null` when Matrix is unset or unreachable, or the room is not open: the block is then left out. Cached 30 s per room, failures too. */
    async preview(key: HubKey, locale: string): Promise<ChatPreview | null> {
        if (!matrixConfig()) return null;
        const id = `${key.hubSlug}/${key.city ?? ''}`;
        const hit = cache.get(id);
        if (hit && Date.now() - hit.at < CACHE_MS) return hit.value;
        let value: ChatPreview | null = null;
        try {
            const [lines, online] = await Promise.all([ChatAccessService.read(key), ChatPeopleService.online(key, locale, null)]);
            value = { count: online.count, lines: lines.slice(-LINES).map((l) => ({ ts: l.ts, name: l.name, body: l.body })) };
        } catch (e: unknown) {
            console.error('[chat-preview] read failed:', e);
        }
        cache.set(id, { at: Date.now(), value });
        return value;
    },
};
