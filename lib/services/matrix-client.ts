import { ActionError } from '@/types/actions';

/** Server only (no `server-only` package in this repo): the only place that talks HTTP to Synapse (K4, K-30). */

export interface MatrixConfig {
    homeserverUrl: string;
    publicUrl: string;
    serverName: string;
    asToken: string;
}

/** The Matrix settings, or null when any is unset (then the site runs without Matrix). */
export function matrixConfig(): MatrixConfig | null {
    const homeserverUrl = process.env.MATRIX_HOMESERVER_URL;
    const publicUrl = process.env.MATRIX_PUBLIC_URL;
    const serverName = process.env.MATRIX_SERVER_NAME;
    const asToken = process.env.MATRIX_AS_TOKEN;
    if (!homeserverUrl || !publicUrl || !serverName || !asToken) return null;
    return { homeserverUrl: homeserverUrl.replace(/\/$/, ''), publicUrl: publicUrl.replace(/\/$/, ''), serverName, asToken };
}

/** A Matrix error body (`errcode`), so callers can branch on M_USER_IN_USE, M_FORBIDDEN, M_NOT_FOUND. */
export class MatrixRequestError extends ActionError {
    constructor(public errcode: string, public status: number, detail?: string) {
        super('MATRIX_FAILED', detail ?? errcode);
    }
}

/** Who a request acts as: the appservice itself (default), a site user by identity assertion, a user's own token, or nobody. */
export type MatrixAuth = { asUser: string } | { token: string } | 'anonymous' | undefined;

export function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export const enc = encodeURIComponent;

/**
 * One JSON request to Synapse. Network error or 5xx is MATRIX_UNAVAILABLE; a 4xx with a Matrix body is a MatrixRequestError.
 * The result is `unknown`: callers read it through the small guards beside them.
 */
export async function matrixFetch(method: 'GET' | 'POST' | 'PUT', path: string, body?: unknown, auth?: MatrixAuth): Promise<unknown> {
    const cfg = matrixConfig();
    if (!cfg) throw new ActionError('MATRIX_FAILED', 'not configured');
    const asUser = auth !== undefined && auth !== 'anonymous' && 'asUser' in auth ? auth.asUser : undefined;
    const url = `${cfg.homeserverUrl}${path}${asUser ? `${path.includes('?') ? '&' : '?'}user_id=${enc(asUser)}` : ''}`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth === undefined || asUser) headers.Authorization = `Bearer ${cfg.asToken}`;
    else if (auth !== 'anonymous' && 'token' in auth) headers.Authorization = `Bearer ${auth.token}`;
    let res: Response;
    try {
        res = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(10_000), cache: 'no-store' });
    } catch {
        throw new ActionError('MATRIX_UNAVAILABLE');
    }
    if (res.status >= 500) throw new ActionError('MATRIX_UNAVAILABLE');
    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) {
        const errcode = isRecord(json) && typeof json.errcode === 'string' ? json.errcode : null;
        if (!errcode) throw new ActionError('MATRIX_FAILED');
        throw new MatrixRequestError(errcode, res.status, isRecord(json) && typeof json.error === 'string' ? json.error : undefined);
    }
    return json;
}

/** The errcode of a failed call, or 'OK' when it unexpectedly succeeded (used by the checks). */
export async function errcodeOf(run: () => Promise<unknown>): Promise<string> {
    try {
        await run();
        return 'OK';
    } catch (e) {
        return e instanceof MatrixRequestError ? e.errcode : 'MATRIX_UNAVAILABLE';
    }
}
