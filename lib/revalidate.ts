import { revalidatePath } from 'next/cache';
import { LOCALES } from '@/lib/constants';
import { groupHref } from '@/lib/routes';

type Scope = 'page' | 'layout';

/** One group's page in one locale, then each of `pages` below it (`'events'`, `'settings'`, …) with the same scope. */
export function revalidateGroup(locale: string, l1Slug: string, slug: string, scope: Scope = 'page', pages: string[] = []): void {
    revalidatePath(`/${locale}${groupHref(l1Slug, slug)}`, scope);
    for (const page of pages) revalidatePath(`/${locale}${groupHref(l1Slug, slug, page)}`, scope);
}

/** The same, for every locale. */
export function revalidateGroupEveryLocale(l1Slug: string, slug: string, scope: Scope = 'page', pages: string[] = []): void {
    for (const locale of LOCALES) revalidateGroup(locale, l1Slug, slug, scope, pages);
}

/**
 * The group route's own pattern, for every group and locale (`/[locale]/[l1Slug]/group/[groupSlug]`);
 * given the group's slugs only the locale stays a pattern (`/[locale]/games/group/chess`).
 */
export function revalidateGroupPattern(scope: Scope, slugs?: { l1Slug: string; slug: string }): void {
    revalidatePath(`/[locale]${slugs ? groupHref(slugs.l1Slug, slugs.slug) : '/[l1Slug]/group/[groupSlug]'}`, scope);
}
