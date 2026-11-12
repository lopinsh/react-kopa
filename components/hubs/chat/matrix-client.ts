import type { MatrixClient } from 'matrix-js-sdk';
import { chatSession } from '@/actions/chat-actions';

/**
 * The browser's one Matrix client (K5-10): a module singleton, so a room change keeps its sync loop. Client-only. matrix-js-sdk is loaded by dynamic import
 * here and nowhere else, so only Čats pages carry it. Tokens live in this module's memory; the device id alone is kept in localStorage (K-139, F1b).
 *
 * matrix-js-sdk v45 has no `tokenRefreshFunction` (its refresh is OAuth2-only), so the refresh is ours: `refreshToken` + `setAccessToken` on a timer 2 min
 * before expiry, and again after a soft logout, then `startClient()` once more because the sync loop stops on `M_UNKNOWN_TOKEN` (K5.md 2.4).
 */

const DEVICE_KEY = 'ejk.chat.device';
const REFRESH_AHEAD_MS = 120_000;
const SYNC_WAIT_MS = 20_000;
const START = { initialSyncLimit: 30, lazyLoadMembers: true } as const;

interface Live { siteUserId: string; client: MatrixClient | null; refreshToken: string; timer: number | undefined; ready: Promise<MatrixClient>; stopped: boolean }
let live: Live | null = null;

function deviceId(): string {
    const kept = localStorage.getItem(DEVICE_KEY);
    if (kept && /^EJKW_[A-Z0-9]{10}$/.test(kept)) return kept;
    const bytes = crypto.getRandomValues(new Uint8Array(10));
    const made = `EJKW_${Array.from(bytes, (b) => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[b % 36]).join('')}`;
    localStorage.setItem(DEVICE_KEY, made);
    return made;
}

async function login() {
    const res = await chatSession({ deviceId: deviceId() });
    if (!res.success || !res.data) throw new Error(res.success ? 'CHAT_UNAVAILABLE' : res.error);
    return res.data;
}

function schedule(entry: Live, expiresInMs: number): void {
    window.clearTimeout(entry.timer);
    if (entry.stopped) return;
    entry.timer = window.setTimeout(() => { void refresh(entry, false); }, Math.max(expiresInMs - REFRESH_AHEAD_MS, 5_000));
}

/** A new access token for a running client; one silent new login if the refresh token is refused (K5.md Risks 4). */
async function refresh(entry: Live, restart: boolean): Promise<void> {
    const client = entry.client;
    if (!client || entry.stopped) return;
    let next: { accessToken: string; refreshToken: string; expiresInMs: number };
    try {
        const r = await client.refreshToken(entry.refreshToken);
        next = { accessToken: r.access_token, refreshToken: r.refresh_token, expiresInMs: r.expires_in_ms };
    } catch {
        const s = await login();
        next = { accessToken: s.accessToken, refreshToken: s.refreshToken, expiresInMs: s.expiresInMs };
    }
    client.setAccessToken(next.accessToken);
    entry.refreshToken = next.refreshToken;
    schedule(entry, next.expiresInMs);
    if (restart && !entry.stopped) {
        client.stopClient();
        await client.startClient(START);
    }
}

async function start(entry: Live): Promise<MatrixClient> {
    const { createClient, ClientEvent, HttpApiEvent, SyncState } = await import('matrix-js-sdk');
    const s = await login();
    const client = createClient({ baseUrl: s.homeserverUrl, userId: s.userId, deviceId: s.deviceId, accessToken: s.accessToken });
    entry.client = client;
    entry.refreshToken = s.refreshToken;
    schedule(entry, s.expiresInMs);
    client.on(HttpApiEvent.SessionLoggedOut, () => { void refresh(entry, true).catch(() => undefined); });
    const prepared = new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error('CHAT_UNAVAILABLE')), SYNC_WAIT_MS);
        const onSync = (state: string) => {
            if (state !== SyncState.Prepared) return;
            window.clearTimeout(timeout);
            client.off(ClientEvent.Sync, onSync);
            resolve();
        };
        client.on(ClientEvent.Sync, onSync);
    });
    await client.startClient(START);
    await prepared;
    return client;
}

/** The running client for this person; starts it on first use. A failed start clears itself so the next call tries again. */
export function connectChat(siteUserId: string): Promise<MatrixClient> {
    if (live && live.siteUserId === siteUserId && !live.stopped) return live.ready;
    void logoutChat();
    const entry: Live = { siteUserId, client: null, refreshToken: '', timer: undefined, ready: Promise.resolve(null as never), stopped: false };
    entry.ready = start(entry).catch((e: unknown) => {
        entry.client?.stopClient();
        entry.stopped = true;
        window.clearTimeout(entry.timer);
        if (live === entry) live = null;
        throw e;
    });
    live = entry;
    return entry.ready;
}

/** Stops the loop and logs the device out of Synapse, best effort (site sign-out, K5.md 2.4). */
export async function logoutChat(): Promise<void> {
    const entry = live;
    live = null;
    if (!entry) return;
    entry.stopped = true;
    window.clearTimeout(entry.timer);
    const client = entry.client;
    if (!client) return;
    client.stopClient();
    await client.logout(true).catch(() => undefined);
}
