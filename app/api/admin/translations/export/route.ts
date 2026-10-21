import { auth } from '@/lib/auth';
import { MessageOverrideService } from '@/lib/services/message-override.service';
import { isSiteAdmin } from '@/lib/site-role';

/** Downloads every edited text as `{ lv: {...}, en: {...} }` in the nested structure of messages/*.json. Site admins only. */
export async function GET() {
    const session = await auth();
    if (!session?.user?.id || !isSiteAdmin(session.user.role)) {
        return new Response('Not found', { status: 404 });
    }

    const result = await MessageOverrideService.exportNested(session.user.id).catch(() => null);
    if (!result) return new Response('Not found', { status: 404 });

    return new Response(JSON.stringify(result, null, 2) + '\n', {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Disposition': 'attachment; filename="message-overrides.json"',
            'Cache-Control': 'no-store',
        },
    });
}
