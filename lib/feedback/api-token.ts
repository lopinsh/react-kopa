import { checkBearerToken, type TokenCheck } from '@/lib/secret-header';

export type { TokenCheck };

/** Checks the `Authorization: Bearer <token>` header against FEEDBACK_API_TOKEN ('disabled' when unset: the routes answer 404). */
export function checkFeedbackToken(request: Request): TokenCheck {
    return checkBearerToken(request, 'FEEDBACK_API_TOKEN');
}
