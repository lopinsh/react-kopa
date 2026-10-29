import { UserService } from '@/lib/services/user.service';
import { unsubscribeLinkSchema } from '@/lib/validations/email';
import { verifyUnsubscribe } from '@/lib/email/unsubscribe-token';

export const dynamic = 'force-dynamic';

/** One-click unsubscribe (RFC 8058): mail clients POST here from the List-Unsubscribe header. Always 200, so a bad pair tells nothing. */
export async function POST(request: Request) {
    const params = new URL(request.url).searchParams;
    const parsed = unsubscribeLinkSchema.safeParse({ u: params.get('u'), s: params.get('s') });
    if (parsed.success && verifyUnsubscribe(parsed.data.u, parsed.data.s)) {
        try {
            await UserService.updateEmailSettings(parsed.data.u, { emailNotifications: false });
        } catch (error) {
            console.error('[unsubscribe] failed', error);
        }
    }
    return new Response(null, { status: 200 });
}
