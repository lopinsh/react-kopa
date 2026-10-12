import { NextResponse } from 'next/server';
import { HealthService } from '@/lib/services/health.service';

export const dynamic = 'force-dynamic';

/** GET /api/health — 200 when the app is up and the database answers, 503 otherwise. No auth, no data. */
export async function GET() {
    const health = await HealthService.check();
    return NextResponse.json(health, {
        status: health.ok ? 200 : 503,
        headers: { 'Cache-Control': 'no-store' },
    });
}
