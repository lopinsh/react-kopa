/**
 * Group and event addresses without locale, like `hubHref` (`lib/hub-path.ts`).
 * next-intl's `Link`, `redirect` and `router` add the locale themselves; code that needs the full path
 * (`loadFullPage`, `revalidatePath`, absolute URLs) prefixes `/${locale}` itself.
 */

/** `/games/group/chess-club`, with a page below it: `/games/group/chess-club/events`. */
export function groupHref(l1Slug: string, groupSlug: string, page?: string): string {
    return `/${l1Slug}/group/${groupSlug}${page ? `/${page}` : ''}`;
}

/** `/games/group/chess-club/events/friday-night`. */
export function eventHref(l1Slug: string, groupSlug: string, eventSlug: string): string {
    return `${groupHref(l1Slug, groupSlug, 'events')}/${eventSlug}`;
}
