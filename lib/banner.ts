import { UNSPLASH_UTM } from '@/lib/constants';
import { ActionError } from '@/types/actions';
import type { BannerCredit } from '@/lib/validations/banner';

export const UNSPLASH_HOME_URL = `https://unsplash.com/?utm_source=${UNSPLASH_UTM}&utm_medium=referral`;
const UNSPLASH_IMAGE_HOST = 'images.unsplash.com';

/** A photo as the picker shows it; `url` is the form that gets stored. */
export interface UnsplashPick {
    id: string;
    url: string;
    thumb: string;
    alt: string;
    credit: { name: string; username: string };
}

/** `https://images.unsplash.com/<rawOrPath>?<params>`; keeps an existing query (Unsplash's `ixid`). */
export function unsplashImageUrl(rawOrPath: string, params: string): string {
    const base = rawOrPath.startsWith('http') ? rawOrPath : `https://${UNSPLASH_IMAGE_HOST}/${rawOrPath}`;
    return `${base}${base.includes('?') ? '&' : '?'}${params}`;
}

export function unsplashProfileUrl(username: string): string {
    return `https://unsplash.com/@${encodeURIComponent(username)}?utm_source=${UNSPLASH_UTM}&utm_medium=referral`;
}

export function isUnsplashImageUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    try {
        const u = new URL(url);
        return u.protocol === 'https:' && u.hostname === UNSPLASH_IMAGE_HOST;
    } catch {
        return false;
    }
}

/**
 * Raw URLs are a site-admin power (R26 invariant 3): anyone else may save no image, an Unsplash URL,
 * or the value that is already stored (so legacy banners survive an unrelated save).
 */
export function assertBannerAllowed(
    next: string | null | undefined,
    opts: { current: string | null | undefined; isSiteAdmin: boolean },
): void {
    if (!next || opts.isSiteAdmin || next === opts.current || isUnsplashImageUrl(next)) return;
    throw new ActionError('BANNER_URL_NOT_ALLOWED');
}

/** The two credit columns for a banner write: kept only for an Unsplash image, otherwise both null (invariant 4). */
export function bannerCreditColumns(
    url: string | null | undefined,
    credit: BannerCredit | undefined,
): { bannerCreditName: string | null; bannerCreditUser: string | null } {
    if (!credit || !isUnsplashImageUrl(url)) return { bannerCreditName: null, bannerCreditUser: null };
    return { bannerCreditName: credit.name, bannerCreditUser: credit.username };
}

export function toBannerCredit(name: string | null, user: string | null): BannerCredit {
    return name && user ? { name, username: user } : null;
}
