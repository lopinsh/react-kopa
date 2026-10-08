/**
 * Helpers for sending logged-out visitors to the localized sign-in page and
 * back again. Only same-origin relative paths are ever honoured as a return
 * target, so a crafted `callbackUrl` cannot become an open redirect.
 */

/** Sign-in URL that returns to `returnPath` (a path without locale prefix, e.g. `/create`). */
export function signInUrl(locale: string, returnPath: string): string {
    const callbackUrl = `/${locale}${returnPath === '/' ? '' : returnPath}`;
    return `/${locale}/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

/**
 * Returns `raw` if it is a safe same-origin relative path (or an absolute URL
 * on `origin`, reduced to its path), otherwise `fallback`.
 */
export function safeCallbackPath(raw: string | null | undefined, fallback: string, origin?: string): string {
    if (!raw) return fallback;

    let candidate = raw;
    if (origin && raw.startsWith(origin)) {
        candidate = raw.slice(origin.length) || '/';
    }

    const isRelative = candidate.startsWith('/') && !candidate.startsWith('//');
    // Backslashes and control characters are normalised by browsers into other
    // separators (`/\evil.com` -> `//evil.com`), so reject them outright.
    // eslint-disable-next-line no-control-regex
    if (!isRelative || /[\u0000-\u001f\\]/.test(candidate)) return fallback;

    return candidate;
}
