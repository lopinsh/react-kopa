import { auth } from '@/lib/auth';
import { MessageOverrideService } from '@/lib/services/message-override.service';

/** Downloads every edited text as `{ lv: {...}, en: {...} }` in the nested structure of messages/*.json. Site admins only. */
export async function GET() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
        return new Response('Not found', { status: 404 });
    }

    const result = await MessageOverrideService.exportNested(session.user.id);
    if (!result.success) return new Response('Not found', { status: 404 });

    return new Response(JSON.stringify(result.data, null, 2) + '\n', {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Disposition': 'attachment; filename="message-overrides.json"',
            'Cache-Control': 'no-store',
        },
    });
}
