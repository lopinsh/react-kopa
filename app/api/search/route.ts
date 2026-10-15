import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { DiscoveryService } from '@/lib/services/discovery.service';
import { parseCities } from '@/lib/discovery-params';
import { searchQuerySchema } from '@/lib/validations/search';

export const dynamic = 'force-dynamic';

// The answer holds the viewer's own "Eju"/"Gaida" tags, so no shared cache may keep it.
const HEADERS = { 'Cache-Control': 'private, no-store' };

/** The header search (R7). A read, so a route handler and not a Server Action: actions queue one at a time and cannot be cancelled. */
export async function GET(request: NextRequest) {
    const parsed = searchQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
    if (!parsed.success) return NextResponse.json({ success: false, error: 'VALIDATION_FAILED' }, { status: 400, headers: HEADERS });
    const { q, city, theme, locale } = parsed.data;

    try {
        const session = await auth();
        const data = await DiscoveryService.search({ word: q, cities: parseCities(city), theme: theme ?? null }, locale, session?.user?.id);
        return NextResponse.json({ success: true, data }, { headers: HEADERS });
    } catch (error) {
        console.error('[api/search] failed:', error);
        return NextResponse.json({ success: false, error: 'ACTION_FAILED' }, { status: 500, headers: HEADERS });
    }
}
