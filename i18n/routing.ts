import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { LOCALES, DEFAULT_LOCALE } from '@/lib/constants';

export const routing = defineRouting({
    locales: [...LOCALES],
    defaultLocale: DEFAULT_LOCALE,
    // The language choice stays on the device across browser restarts (AR-15).
    localeCookie: { maxAge: 60 * 60 * 24 * 365 },
});

// Locale-aware navigation utilities (typed to our locales)
export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing);
