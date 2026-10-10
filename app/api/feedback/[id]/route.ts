import { NextResponse } from 'next/server';
import { checkFeedbackToken } from '@/lib/feedback/api-token';
import { FeedbackService } from '@/lib/services/feedback.service';

export const dynamic = 'force-dynamic';

/** PATCH /api/feedback/<id> with { status, reply? } — an agent reports on a note. Token only, no cookies or session. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const check = checkFeedbackToken(request);
    if (check === 'disabled') return new NextResponse(null, { status: 404 });
    if (check === 'denied') return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    const body: unknown = await request.json().catch(() => null);
    const { id } = await params;
    const result = await FeedbackService.updateForAgent(id, body);
    if (result.success) return NextResponse.json({ note: result.data });

    const status = result.error === 'NOT_FOUND' ? 404 : result.error === 'VALIDATION_FAILED' ? 400 : 500;
    return NextResponse.json({ error: result.error }, { status });
}

/** DELETE /api/feedback/<id> — an agent removes a note that is no longer relevant. Token only. */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const check = checkFeedbackToken(request);
    if (check === 'disabled') return new NextResponse(null, { status: 404 });
    if (check === 'denied') return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    const { id } = await params;
    const result = await FeedbackService.removeForAgent(id);
    if (result.success) return NextResponse.json({ ok: true });
    return NextResponse.json({ error: result.error }, { status: result.error === 'NOT_FOUND' ? 404 : 500 });
}
