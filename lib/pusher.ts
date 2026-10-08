import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

let _pusherServer: PusherServer | null = null;
let _pusherClient: PusherClient | null = null;

export function getPusherServer(): PusherServer {
    if (!_pusherServer) {
        // Server → Soketi goes over the internal network (Docker: soketi:6001, plain HTTP).
        // Read at runtime; NEXT_PUBLIC_* values are baked in at build time for the browser.
        _pusherServer = new PusherServer({
            appId: process.env.PUSHER_APP_ID!,
            key: process.env.PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY!,
            secret: process.env.PUSHER_SECRET!,
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
            host: process.env.PUSHER_HOST || process.env.NEXT_PUBLIC_PUSHER_HOST || '127.0.0.1',
            port: process.env.PUSHER_PORT || process.env.NEXT_PUBLIC_PUSHER_PORT || '6001',
            useTLS: (process.env.PUSHER_TLS ?? process.env.NEXT_PUBLIC_PUSHER_TLS) === 'true',
        });
    }
    return _pusherServer;
}

export function getPusherClient(): PusherClient {
    if (!_pusherClient) {
        // Browser → Soketi goes through the public site (production: wss://ejam.lumm.eu/app/…,
        // routed to Soketi by the reverse proxy). Values are baked in at build time.
        const port = process.env.NEXT_PUBLIC_PUSHER_PORT ? parseInt(process.env.NEXT_PUBLIC_PUSHER_PORT) : 6001;
        _pusherClient = new PusherClient(
            process.env.NEXT_PUBLIC_PUSHER_KEY!,
            {
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
                wsHost: process.env.NEXT_PUBLIC_PUSHER_HOST || '127.0.0.1',
                wsPort: port,
                wssPort: port,
                forceTLS: process.env.NEXT_PUBLIC_PUSHER_TLS === 'true',
                disableStats: true,
                enabledTransports: ['ws', 'wss'],
                authEndpoint: '/api/pusher/auth',
            }
        );
    }
    return _pusherClient;
}

// Keep backward-compatible exports for any existing imports
export const pusherServer = new Proxy({} as PusherServer, {
    get: (_, prop) => getPusherServer()[prop as keyof PusherServer],
});

export const pusherClient = new Proxy({} as PusherClient, {
    get: (_, prop) => getPusherClient()[prop as keyof PusherClient],
});
/**
 * Sends a realtime event. Best-effort: the data is already saved, so a Soketi
 * outage or misconfiguration is logged and must not fail the user's action.
 */
export async function triggerRealtime(channel: string, event: string, data: unknown): Promise<void> {
    try {
        await getPusherServer().trigger(channel, event, data);
    } catch (error) {
        console.error(`[realtime] ${event} on ${channel} failed:`, error);
    }
}
