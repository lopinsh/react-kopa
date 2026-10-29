import { createHmac, timingSafeEqual } from 'node:crypto';
import { siteUrl } from '@/lib/email/site-url';

/** Signed unsubscribe links (R33): the signature proves the link came from one of our emails. No expiry; rotating AUTH_SECRET voids old links. */
export function signUnsubscribe(userId: string): string {
    return createHmac('sha256', process.env.AUTH_SECRET ?? '').update(`unsubscribe:${userId}`).digest('base64url');
}

export function verifyUnsubscribe(userId: string, sig: string): boolean {
    if (!process.env.AUTH_SECRET) return false;
    const expected = Buffer.from(signUnsubscribe(userId));
    const given = Buffer.from(sig);
    return given.length === expected.length && timingSafeEqual(given, expected);
}


export function unsubscribeUrl(userId: string, locale: string): string {
    return `${siteUrl()}/${locale}/email/unsubscribe?u=${encodeURIComponent(userId)}&s=${signUnsubscribe(userId)}`;
}

export function unsubscribePostUrl(userId: string): string {
    return `${siteUrl()}/api/email/unsubscribe?u=${encodeURIComponent(userId)}&s=${signUnsubscribe(userId)}`;
}
