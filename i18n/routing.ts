import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    locales: ['lv', 'en'],
    defaultLocale: 'lv',
});

// Locale-aware navigation utilities (typed to our locales)
export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing);
