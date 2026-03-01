import { auth } from '@/lib/auth';
import { pusherServer } from '@/lib/pusher';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const data = await req.formData();
        const socketId = data.get('socket_id') as string;
        const channelName = data.get('channel_name') as string;

        if (!socketId || !channelName) {
            return new NextResponse('Missing parameters', { status: 400 });
        }

        // Security Check: Ensure users can ONLY subscribe to their OWN private channel
        const expectedChannel = `private-user-${session.user.id}`;
        if (channelName !== expectedChannel) {
            console.warn(`[Pusher Auth] User ${session.user.id} attempted to subscribe to unauthorized channel ${channelName}`);
            return new NextResponse('Forbidden', { status: 403 });
        }

        const authResponse = pusherServer.authorizeChannel(socketId, channelName);
        return NextResponse.json(authResponse);
    } catch (error) {
        console.error('[Pusher Auth] Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
