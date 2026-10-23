/** A description of at most this many characters fits one line of the narrowest card (16rem), so a tear-off row may show beside it at rest. */
export const SHORT_DESCRIPTION = 32;

/** Characters of sub-categories the card's one line holds in the narrowest card; the rest becomes "+N". */
const SUB_LINE_CHARS = 34;

/**
 * Which rows the group card shows and how many description lines are left for them (R21-G), decided on the server from the text lengths, never by measuring.
 * `rest`: tear-off rows visible at rest (0 or 1, only beside a one-line description); `hover`: rows on hover (0 to 2, the event first). Description lines:
 * 4 at rest with no row and 1 with one; on hover 7, 4 or 2 for 0, 1 or 2 rows.
 */
export function cardRows(description: string | null, hasEvent: boolean, hasAnnouncement: boolean) {
    const hover = (hasEvent ? 1 : 0) + (hasAnnouncement ? 1 : 0);
    const rest = hover > 0 && (description?.length ?? 0) <= SHORT_DESCRIPTION ? 1 : 0;
    return { rest, hover, restLines: rest ? 1 : 4, hoverLines: [7, 4, 2][hover] };
}

/** The sub-categories that fit the card's one line (always the first), and how many are left over. */
export function fitSubCategories<T>(items: Array<{ title: string; value: T }>): { shown: Array<{ title: string; value: T }>; more: number } {
    let used = 0;
    const shown: Array<{ title: string; value: T }> = [];
    for (const item of items) {
        const next = used + item.title.length + (shown.length > 0 ? 2 : 0);
        if (shown.length > 0 && next > SUB_LINE_CHARS) break;
        shown.push(item);
        used = next;
    }
    return { shown, more: items.length - shown.length };
}
