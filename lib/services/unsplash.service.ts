import 'server-only';
import { BANNER_IMG_PARAMS, BANNER_THUMB_PARAMS, UNSPLASH_LIMITS as L } from '@/lib/constants';
import { isUnsplashImageUrl, unsplashImageUrl, type UnsplashPick } from '@/lib/banner';
import { ActionError } from '@/types/actions';

const API = 'https://api.unsplash.com';

/** Everything below is in-memory per app process (R26 "Request budget"); the demo key allows 50 requests/hour in all. */
const cache = new Map<string, { at: number; value: SearchResult }>();
const requestTimes: number[] = [];
const userSearches = new Map<string, number[]>();
const pings = new Map<string, number>();
let lastRemaining: { value: number; at: number } | null = null;

export interface SearchResult {
    photos: UnsplashPick[];
    hasMore: boolean;
}

interface RawPhoto {
    id: string;
    alt_description: string | null;
    premium?: boolean;
    plus?: boolean;
    urls: { raw: string };
    user: { name: string; username: string };
}

function accessKey(): string | undefined {
    return process.env.UNSPLASH_ACCESS_KEY || undefined;
}

export function isUnsplashSearchEnabled(): boolean {
    return Boolean(accessKey());
}

function recent(times: number[], windowMs: number, now: number): number {
    while (times.length > 0 && now - times[0] >= windowMs) times.shift();
    return times.length;
}

async function call(path: string, key: string): Promise<Response> {
    requestTimes.push(Date.now());
    const res = await fetch(`${API}${path}`, {
        headers: { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' },
        cache: 'no-store',
        signal: AbortSignal.timeout(6000),
    });
    const remaining = Number(res.headers.get('x-ratelimit-remaining'));
    if (res.headers.has('x-ratelimit-remaining') && Number.isFinite(remaining)) lastRemaining = { value: remaining, at: Date.now() };
    return res;
}

function toPick(p: RawPhoto): UnsplashPick | null {
    if (p.premium || p.plus || !isUnsplashImageUrl(p.urls.raw)) return null;
    return {
        id: p.id,
        url: unsplashImageUrl(p.urls.raw, BANNER_IMG_PARAMS),
        thumb: unsplashImageUrl(p.urls.raw, BANNER_THUMB_PARAMS),
        alt: p.alt_description ?? '',
        credit: { name: p.user.name, username: p.user.username },
    };
}

export async function searchPhotos(input: { query: string; page: number }, locale: string, userId: string): Promise<SearchResult> {
    const key = accessKey();
    if (!key) throw new ActionError('SEARCH_UNAVAILABLE');
    const now = Date.now();
    const query = input.query.trim().toLowerCase().replace(/\s+/g, ' ');
    const cacheKey = `${locale === 'lv' ? 'lv' : 'en'}|${query}|${input.page}`;

    const hit = cache.get(cacheKey);
    if (hit && now - hit.at < L.cacheMs) {
        cache.delete(cacheKey);
        cache.set(cacheKey, hit); // LRU: most recently used last
        return hit.value;
    }

    const mine = userSearches.get(userId) ?? [];
    if (recent(mine, L.userWindowMs, now) >= L.userSearches) throw new ActionError('SEARCH_RATE_LIMITED');
    if (recent(requestTimes, L.windowMs, now) >= L.processBudget - L.trackReserve) throw new ActionError('SEARCH_UNAVAILABLE');
    if (lastRemaining && lastRemaining.value <= L.remainingFloor && now - lastRemaining.at < L.windowMs) throw new ActionError('SEARCH_UNAVAILABLE');

    mine.push(now);
    userSearches.set(userId, mine);
    const params = new URLSearchParams({ query, page: String(input.page), per_page: String(L.perPage), orientation: 'landscape', content_filter: 'high' });
    if (locale === 'lv') params.set('lang', 'lv');
    let res: Response;
    try {
        res = await call(`/search/photos?${params}`, key);
    } catch {
        throw new ActionError('SEARCH_UNAVAILABLE');
    }
    if (!res.ok) throw new ActionError('SEARCH_UNAVAILABLE');
    const body = (await res.json()) as { total_pages?: number; results?: RawPhoto[] };
    const photos = (body.results ?? []).map(toPick).filter((p): p is UnsplashPick => p !== null);
    const value: SearchResult = { photos, hasMore: input.page < L.maxPage && input.page < (body.total_pages ?? 0) };
    cache.set(cacheKey, { at: now, value });
    if (cache.size > L.cacheEntries) cache.delete(cache.keys().next().value as string);
    return value;
}

/** Unsplash asks for a ping when a photo is picked. Never blocks a pick: failures are swallowed. */
export async function trackDownload(photoId: string): Promise<void> {
    const key = accessKey();
    if (!key) return;
    const now = Date.now();
    const last = pings.get(photoId);
    if (last !== undefined && now - last < L.windowMs) return;
    if (recent(requestTimes, L.windowMs, now) >= L.processBudget) return;
    if (lastRemaining && lastRemaining.value <= L.trackReserve && now - lastRemaining.at < L.windowMs) return;
    pings.set(photoId, now);
    try {
        const res = await call(`/photos/${encodeURIComponent(photoId)}/download`, key);
        if (!res.ok) console.warn(`Unsplash download ping failed: ${res.status}`);
    } catch (e) {
        console.warn('Unsplash download ping failed', e);
    }
}
