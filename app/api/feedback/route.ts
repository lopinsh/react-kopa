import { NextResponse } from 'next/server';
import { checkFeedbackToken } from '@/lib/feedback/api-token';
import { FeedbackService } from '@/lib/services/feedback.service';
import { feedbackFilterSchema } from '@/lib/validations/feedback';

export const dynamic = 'force-dynamic';

/** GET /api/feedback?status=OPEN — notes for AI agents. Token only, no cookies or session. */
export async function GET(request: Request) {
    const check = checkFeedbackToken(request);
    if (check === 'disabled') return new NextResponse(null, { status: 404 });
    if (check === 'denied') return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    const status = feedbackFilterSchema.parse({ status: new URL(request.url).searchParams.get('status') ?? undefined }).status;
    const notes = await FeedbackService.listForAgent(status);
    return NextResponse.json({ notes });
}
