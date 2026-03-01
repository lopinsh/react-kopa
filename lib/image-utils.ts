/**
 * Smart Image Utility
 * Handles image URL normalization and optimization proxying for arbitrary external hostnames.
 */

const WHITELISTED_HOSTS = [
    'images.unsplash.com',
    'plus.unsplash.com',
    'api.dicebear.com',
    'lh3.googleusercontent.com',
    'avatars.githubusercontent.com'
];

/**
 * Returns a proxied image URL if the hostname is not whitelisted.
 * Uses images.weserv.nl for reliable, high-performance image proxying/caching.
 */
export function getSmartImageUrl(url: string | null | undefined): string {
    if (!url) return '';

    // If it's a relative path or already proxied, return as is
    if (url.startsWith('/') || url.startsWith('.') || url.includes('wsrv.nl')) {
        return url;
    }

    try {
        const parsedUrl = new URL(url);
        const isWhitelisted = WHITELISTED_HOSTS.some(host => parsedUrl.hostname.includes(host));

        if (isWhitelisted) {
            return url;
        }

        // Proxy unrecognized external URLs
        return `https://wsrv.nl/?url=${encodeURIComponent(url)}&default=${encodeURIComponent(url)}`;
    } catch (e) {
        return url;
    }
}

/**
 * Determines if an image can use Next.js native optimization.
 */
export function canOptimize(url: string | null | undefined): boolean {
    if (!url) return false;
    if (url.startsWith('/') || url.startsWith('.')) return true;

    try {
        const parsedUrl = new URL(url);
        return WHITELISTED_HOSTS.some(host => parsedUrl.hostname.includes(host));
    } catch {
        return false;
    }
}
