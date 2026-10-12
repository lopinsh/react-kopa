/**
 * Picks the title in the viewer's language, falling back to any other language the category has.
 * A user-suggested (pending) sub-category is stored only in the language it was typed in, so the
 * viewer's own language can be missing. Use this wherever a category title is chosen from a list.
 */
export function pickTitle(titles: ReadonlyArray<{ lang: string; title: string }>, lang: string, fallback: string): string {
    return titles.find((t) => t.lang === lang)?.title ?? titles[0]?.title ?? fallback;
}
