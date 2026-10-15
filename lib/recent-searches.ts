import { SEARCH_MIN_CHARS, SEARCH_RECENT_KEY, SEARCH_RECENT_MAX } from '@/lib/constants';
import { foldText } from '@/lib/text-fold';

/**
 * The last search words, on this device only (D16): never sent anywhere, never required. Client-side functions: every
 * `localStorage` access sits in try/catch (private windows and blocked storage throw) and a failure is silent.
 */
export function readRecent(): string[] {
    try {
        const raw: unknown = JSON.parse(window.localStorage.getItem(SEARCH_RECENT_KEY) ?? '[]');
        return Array.isArray(raw) ? raw.filter((w): w is string => typeof w === 'string').slice(0, SEARCH_RECENT_MAX) : [];
    } catch {
        return [];
    }
}

function write(words: string[]): void {
    try {
        window.localStorage.setItem(SEARCH_RECENT_KEY, JSON.stringify(words));
    } catch {
        // Storage is blocked or full: the search works without it.
    }
}

/** Puts the word first; the same word in other letter case or marks moves up instead of doubling. Words under SEARCH_MIN_CHARS letters are not kept. */
export function saveRecent(word: string): void {
    const w = word.trim();
    if (w.length < SEARCH_MIN_CHARS) return;
    write([w, ...readRecent().filter((r) => foldText(r) !== foldText(w))].slice(0, SEARCH_RECENT_MAX));
}

export function removeRecent(word: string): void {
    write(readRecent().filter((r) => r !== word));
}
