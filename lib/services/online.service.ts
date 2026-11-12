import { getPusherServer, PRESENCE_CHANNEL } from '@/lib/pusher';

/** Who is online now (K5-15): the members of Soketi's `presence-site` channel, i.e. signed-in people with a site tab open. Nothing is stored. */

const CACHE_MS = 10_000;
let cache: { at: number; ids: Set<string> } | null = null;

export const OnlineService = {
    /** Site user ids online now, cached 10 s per process. Soketi down or the channel empty: an empty set. */
    async onlineIds(): Promise<Set<string>> {
        if (cache && Date.now() - cache.at < CACHE_MS) return cache.ids;
        let ids = new Set<string>();
        try {
            const res = await getPusherServer().get({ path: `/channels/${PRESENCE_CHANNEL}/users` });
            if (res.ok) {
                const body: unknown = await res.json();
                const users = typeof body === 'object' && body !== null && 'users' in body && Array.isArray(body.users) ? body.users : [];
                ids = new Set(users.flatMap((u: unknown) => (typeof u === 'object' && u !== null && 'id' in u && typeof u.id === 'string' ? [u.id] : [])));
            }
        } catch (e: unknown) {
            console.error('[online] presence read failed:', e);
        }
        cache = { at: Date.now(), ids };
        return ids;
    },
};
