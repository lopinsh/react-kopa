import { CATEGORY_TONE_SLUGS, type CategoryToneSlug } from '@/lib/constants';
import { hexColorSchema } from '@/lib/validations/theme';

export function isCategoryToneSlug(slug: string): slug is CategoryToneSlug {
    return (CATEGORY_TONE_SLUGS as readonly string[]).includes(slug);
}

/**
 * The CSS colour of a main category: its theme tone (`var(--cat-<slug>)`, light and dark set by the site theme
 * on the server), else the stored `Category.color`, else the quiet text colour. Safe inside a `<style>` block.
 */
export function categoryColor(l1Slug: string | null | undefined, fallback?: string | null): string {
    if (l1Slug && isCategoryToneSlug(l1Slug)) return `var(--cat-${l1Slug})`;
    if (fallback && hexColorSchema.safeParse(fallback).success) return fallback;
    return 'var(--foreground-muted)';
}
