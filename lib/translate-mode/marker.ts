/**
 * Invisible key markers for translation mode.
 * A marked message is START + bits(key) + END + original text, where each bit is a zero-width character.
 * The marker sits outside any ICU argument, so formatting of the original text is unaffected.
 */

export const TRANSLATE_COOKIE = 'translate_mode';

export const MARKER_START = '⁣';
export const MARKER_END = '⁤';
const BIT_ZERO = '​';
const BIT_ONE = '‌';

export type MessageTree = { [key: string]: string | MessageTree };

export function encodeKey(key: string): string {
    let bits = '';
    for (const byte of new TextEncoder().encode(key)) {
        for (let i = 7; i >= 0; i--) bits += (byte >> i) & 1 ? BIT_ONE : BIT_ZERO;
    }
    return MARKER_START + bits + MARKER_END;
}

function decodeBits(bits: string): string | null {
    if (bits.length === 0 || bits.length % 8 !== 0) return null;
    const bytes = new Uint8Array(bits.length / 8);
    for (let i = 0; i < bits.length; i++) {
        if (bits[i] === BIT_ONE) bytes[i >> 3] |= 1 << (7 - (i & 7));
        else if (bits[i] !== BIT_ZERO) return null;
    }
    return new TextDecoder().decode(bytes);
}

export interface FoundMarker {
    key: string;
    /** Index of the marker's first character. */
    start: number;
    /** Index just after the marker (where the visible text begins). */
    textStart: number;
}

export function findMarkers(text: string): FoundMarker[] {
    const found: FoundMarker[] = [];
    let from = 0;
    for (;;) {
        const start = text.indexOf(MARKER_START, from);
        if (start === -1) break;
        const end = text.indexOf(MARKER_END, start + 1);
        if (end === -1) break;
        const key = decodeBits(text.slice(start + 1, end));
        if (key) found.push({ key, start, textStart: end + 1 });
        from = end + 1;
    }
    return found;
}

export function stripMarkers(text: string): string {
    // Markers are only ever made of these four characters.
    return text.replace(/⁣[​‌]*⁤/g, '');
}

/** Marks every string in a messages tree with its dotted key. Returns a new tree. */
export function markMessages(tree: MessageTree, prefix = ''): MessageTree {
    const out: MessageTree = {};
    for (const [name, value] of Object.entries(tree)) {
        const key = prefix ? `${prefix}.${name}` : name;
        out[name] = typeof value === 'string' ? encodeKey(key) + value : markMessages(value, key);
    }
    return out;
}
