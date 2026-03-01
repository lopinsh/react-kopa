import { auth } from '@/lib/auth';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const intlMiddleware = createIntlMiddleware(routing);

const LOCALES = ['lv', 'en'] as const;
const DEFAULT_LOCALE = 'lv';

/** Extract locale prefix from a pathname, falling back to default locale. */
function getLocale(pathname: string): string {
    const firstSegment = pathname.split('/')[1];
    return (LOCALES as readonly string[]).includes(firstSegment)
        ? firstSegment
        : DEFAULT_LOCALE;
}

/** Paths that are exempt from the username onboarding intercept. */
function isExempt(pathname: string): boolean {
    return (
        pathname.includes('/onboarding/username') ||
        pathname.startsWith('/api/') ||
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/auth/')
    );
}

export default auth(async function proxy(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const locale = getLocale(pathname);

    // @ts-expect-error — auth() augments req with `auth` property
    const session = req.auth as { user?: { id?: string; username?: string | null } } | null;

    if (session?.user) {
        const hasUsername = Boolean(session.user.username);

        // Existing user visiting onboarding page: redirect away.
        if (hasUsername && pathname.includes('/onboarding/username')) {
            return NextResponse.redirect(new URL(`/${locale}/profile`, req.url));
        }

        // New user (no username): redirect to onboarding, unless already exempt.
        if (!hasUsername && !isExempt(pathname)) {
            return NextResponse.redirect(
                new URL(`/${locale}/onboarding/username`, req.url),
            );
        }
    }

    // Delegate all other routing (including locale detection) to next-intl.
    return intlMiddleware(req);
});

export const config = {
    // Match all pathnames except:
    // - /api/* routes (NextAuth session, signout, server actions)
    // - _next internals
    // - Static files (svg, png, jpg, etc.)
    // - favicon.ico
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
