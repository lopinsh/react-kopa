/** A contact value that is, as a whole, one email, phone number or http(s) URL becomes a link; anything else stays plain text. */
export function contactHref(value: string): { href: string; external: boolean } | null {
    const v = value.trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return { href: `mailto:${v}`, external: false };
    if (/^\+?[\d\s()-]{7,20}$/.test(v)) {
        const digits = v.replace(/\D/g, '');
        if (digits.length >= 7) return { href: `tel:${v.startsWith('+') ? '+' : ''}${digits}`, external: false };
    }
    if (/^https?:\/\/\S+$/i.test(v)) {
        try {
            return { href: new URL(v).href, external: true };
        } catch {
            return null;
        }
    }
    return null;
}
