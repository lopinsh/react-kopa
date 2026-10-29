import { createHash, timingSafeEqual } from 'node:crypto';

export type TokenCheck = 'disabled' | 'denied' | 'ok';

const digest = (value: string) => createHash('sha256').update(value).digest();

/** Both sides are hashed first so the buffers always have the same length and the comparison takes the same time whatever the input. */
function sameSecret(given: string, expected: string): boolean {
    return timingSafeEqual(digest(given), digest(expected));
}

/**
 * Checks the `Authorization: Bearer <token>` header against the env variable `envName`.
 * 'disabled' when the variable is unset (the routes then answer 404).
 */
export function checkBearerToken(request: Request, envName: string): TokenCheck {
    const expected = process.env[envName];
    if (!expected) return 'disabled';

    const match = /^Bearer (.+)$/.exec(request.headers.get('authorization') ?? '');
    if (!match) return 'denied';
    return sameSecret(match[1], expected) ? 'ok' : 'denied';
}

/** Checks a plain secret header (e.g. `x-cron-secret`) against the env variable `envName`; 'disabled' when it is unset. */
export function checkSecretHeader(request: Request, headerName: string, envName: string): TokenCheck {
    const expected = process.env[envName];
    if (!expected) return 'disabled';

    const given = request.headers.get(headerName);
    if (!given) return 'denied';
    return sameSecret(given, expected) ? 'ok' : 'denied';
}
