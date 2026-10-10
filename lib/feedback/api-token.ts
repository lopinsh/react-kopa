import { createHash, timingSafeEqual } from 'node:crypto';

export type TokenCheck = 'disabled' | 'denied' | 'ok';

const digest = (value: string) => createHash('sha256').update(value).digest();

/**
 * Checks the `Authorization: Bearer <token>` header against FEEDBACK_API_TOKEN.
 * 'disabled' when the variable is unset (the routes then answer 404). Both sides are hashed first so the
 * buffers always have the same length and the comparison takes the same time whatever the input.
 */
export function checkFeedbackToken(request: Request): TokenCheck {
    const expected = process.env.FEEDBACK_API_TOKEN;
    if (!expected) return 'disabled';

    const match = /^Bearer (.+)$/.exec(request.headers.get('authorization') ?? '');
    if (!match) return 'denied';
    return timingSafeEqual(digest(match[1]), digest(expected)) ? 'ok' : 'denied';
}
