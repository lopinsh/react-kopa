import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { LOCALES, DEFAULT_LOCALE } from '@/lib/constants';

export const routing = defineRouting({
    locales: [...LOCALES],
    defaultLocale: DEFAULT_LOCALE,
});

// Locale-aware navigation utilities (typed to our locales)
export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing);
