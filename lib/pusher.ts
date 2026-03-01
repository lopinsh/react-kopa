import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

export const pusherServer = new PusherServer({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
    host: process.env.NEXT_PUBLIC_PUSHER_HOST || '127.0.0.1',
    port: process.env.NEXT_PUBLIC_PUSHER_PORT || '6001',
    useTLS: process.env.NEXT_PUBLIC_PUSHER_TLS === 'true',
});

export const pusherClient = new PusherClient(
    process.env.NEXT_PUBLIC_PUSHER_KEY!,
    {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
        wsHost: process.env.NEXT_PUBLIC_PUSHER_HOST || '127.0.0.1',
        wsPort: process.env.NEXT_PUBLIC_PUSHER_PORT ? parseInt(process.env.NEXT_PUBLIC_PUSHER_PORT) : 6001,
        forceTLS: process.env.NEXT_PUBLIC_PUSHER_TLS === 'true',
        disableStats: true,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: '/api/pusher/auth',
    }
);
