/** A line as the log shows it (K5-11), whether it came from the SDK or from the server read. */
export interface ChatEntry {
    id: string;
    /** The site user id (live) or the name (signed out): lines of one sender in a row form a run. */
    sender: string;
    name: string | null;
    mod: boolean;
    own: boolean;
    ts: number;
    body: string;
}

/** Lines of one sender, no other line between and at most this far apart, form a run (K-81). */
export const RUN_GAP_MS = 10 * 60_000;

export interface ChatRun { id: string; day: string; entries: ChatEntry[] }

/** Local calendar day, `2026-11-12`, for the day separators. */
export function dayKey(ts: number): string {
    const d = new Date(ts);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function toRuns(entries: ChatEntry[]): ChatRun[] {
    const runs: ChatRun[] = [];
    for (const e of entries) {
        const last = runs[runs.length - 1];
        const prev = last?.entries[last.entries.length - 1];
        if (last && prev && prev.sender === e.sender && last.day === dayKey(e.ts) && e.ts - prev.ts <= RUN_GAP_MS) last.entries.push(e);
        else runs.push({ id: e.id, day: dayKey(e.ts), entries: [e] });
    }
    return runs;
}

const URL_RE = /https?:\/\/[^\s<>"']*[^\s<>"'.,;:!?)\]]/g;

/** Plain text split into text and link parts: no HTML, no markdown; trailing punctuation stays outside the link. */
export function linkParts(body: string): Array<{ text: string; href?: string }> {
    const parts: Array<{ text: string; href?: string }> = [];
    let at = 0;
    for (const m of body.matchAll(URL_RE)) {
        if (m.index > at) parts.push({ text: body.slice(at, m.index) });
        parts.push({ text: m[0], href: m[0] });
        at = m.index + m[0].length;
    }
    if (at < body.length) parts.push({ text: body.slice(at) });
    return parts;
}
