const MAX_TITLE_LENGTH = 80;

/**
 * Posts written before announcements had titles: the first line stands in as the title.
 * If it fits, the body is the rest of the text; if it is long, the body stays complete.
 */
export function legacyTitle(content: string): { title: string; body: string } {
    const text = content.trim();
    const [firstLine, ...rest] = text.split('\n');
    const line = firstLine.trim();
    if (line.length <= MAX_TITLE_LENGTH) {
        return { title: line, body: rest.join('\n').trim() };
    }
    return { title: `${line.slice(0, MAX_TITLE_LENGTH - 1).trimEnd()}…`, body: text };
}
