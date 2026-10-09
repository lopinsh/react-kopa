import sanitizeHtml from 'sanitize-html';

/**
 * Clean HTML written in the rich-text editor (TipTap) before rendering it.
 * Allows only what the editor produces; links get http(s)/mailto only and open safely.
 * Run at render time so content already in the database is covered too.
 */
export function sanitizeRichText(html: string | null | undefined): string {
    if (!html) return '';
    return sanitizeHtml(html, {
        allowedTags: [
            'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'code', 'pre',
            'h1', 'h2', 'h3', 'h4', 'blockquote', 'ul', 'ol', 'li', 'hr', 'a'
        ],
        allowedAttributes: { a: ['href', 'target', 'rel'] },
        allowedSchemes: ['http', 'https', 'mailto'],
        allowProtocolRelative: false,
        transformTags: {
            a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer nofollow' })
        }
    });
}

/** Serialise data for a <script type="application/ld+json"> block without letting `</script>` break out. */
export function jsonForScript(data: unknown): string {
    return JSON.stringify(data).replace(/</g, '\\u003c');
}
