import { NextResponse } from 'next/server';
import { checkSecretHeader } from '@/lib/secret-header';
import { EmailDigestService } from '@/lib/services/email-digest.service';

export const dynamic = 'force-dynamic';

/** Called every 5 minutes by the home server's cron (deploy/email-digest.cron). 404 without CRON_SECRET; answers counts only, never user data. */
export async function POST(request: Request) {
    const check = checkSecretHeader(request, 'x-cron-secret', 'CRON_SECRET');
    if (check === 'disabled') return new NextResponse(null, { status: 404 });
    if (check === 'denied') return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    try {
        return NextResponse.json(await EmailDigestService.run());
    } catch (error) {
        console.error('[email-digest] run failed', error);
        return NextResponse.json({ error: 'DIGEST_FAILED' }, { status: 500 });
    }
}
