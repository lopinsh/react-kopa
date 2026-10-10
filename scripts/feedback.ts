/**
 * Reads and answers feedback notes left by site admins (feedback mode), through the token-protected API.
 *
 *   npm run feedback                       compact list of open notes, grouped by page and heading
 *   npm run feedback -- show <id>          full detail for one open note (selector, box, scope HTML, reply thread)
 *   npm run feedback -- done <id> "reply"  mark done (reply optional; added to the thread, nothing is overwritten)
 *   npm run feedback -- doing <id>
 *   npm run feedback -- wontdo <id> "reply"
 *   npm run feedback -- delete <id>        delete a note for good
 *
 * Needs FEEDBACK_API_TOKEN (and optionally FEEDBACK_API_URL, default https://ejam.lumm.eu) in .env or the environment.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DEFAULT_URL = 'https://ejam.lumm.eu';

interface Note {
    id: string;
    kind: string;
    status: string;
    text: string;
    path: string;
    locale: string;
    viewportW: number;
    viewportH: number;
    theme: string;
    selector: string;
    elementText: string;
    component: string | null;
    breadcrumb?: string | null;
    outerHtml?: string | null;
    commit?: string | null;
    heading?: string | null;
    box?: { x: number; y: number; w: number; h: number } | null;
    replies: { text: string; byAgent: boolean; authorName: string | null; createdAt: string }[];
    createdAt: string;
    authorName: string | null;
}

const STATUS_FOR_COMMAND: Record<string, string> = { done: 'DONE', doing: 'DOING', wontdo: 'WONT_DO' };

/** Minimal .env reader (KEY=value, optional quotes); real environment variables win. */
function loadEnv(): void {
    const file = join(process.cwd(), '.env');
    if (!existsSync(file)) return;
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
        const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
        if (!match || line.trim().startsWith('#')) continue;
        const value = match[2].replace(/^(['"])(.*)\1$/, '$2');
        if (process.env[match[1]] === undefined) process.env[match[1]] = value;
    }
}

function fail(message: string): never {
    console.error(message);
    process.exit(1);
}

async function call(path: string, init?: RequestInit): Promise<Response> {
    const token = process.env.FEEDBACK_API_TOKEN;
    if (!token) fail('FEEDBACK_API_TOKEN is not set. Add it to .env (the same value as on the server).');
    const base = (process.env.FEEDBACK_API_URL || DEFAULT_URL).replace(/\/$/, '');

    let res: Response;
    try {
        res = await fetch(`${base}${path}`, {
            ...init,
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        fail(`Could not reach ${base}: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (res.status === 404 && path === '/api/feedback') fail(`${base} answered 404: the feedback API is not enabled there (FEEDBACK_API_TOKEN unset on the server) or is not deployed yet.`);
    if (res.status === 401) fail('401: the token was rejected. Check FEEDBACK_API_TOKEN.');
    return res;
}

function printNote(note: Note): void {
    const date = note.createdAt.slice(0, 16).replace('T', ' ');
    console.log(`## ${note.id} · ${note.kind} · ${note.status}`);
    console.log(`- Page: /${note.locale}${note.path === '/' ? '' : note.path}`);
    if (note.component) console.log(`- Component: ${note.component}`);
    console.log(`- Element: \`${note.selector}\`${note.elementText ? ` ("${note.elementText}")` : ''}`);
    if (note.breadcrumb) console.log(`- Breadcrumb: ${note.breadcrumb}`);
    if (note.heading) console.log(`- Under heading: "${note.heading}"`);
    if (note.box) {
        const share = note.viewportW > 0 ? Math.round((note.box.w / note.viewportW) * 100) : 0;
        console.log(`- Box: x ${note.box.x}, y ${note.box.y}, ${note.box.w}x${note.box.h} px (page coordinates), ${share}% of viewport width`);
    }
    if (note.commit) console.log(`- Built from commit: ${note.commit}`);
    console.log(`- Viewport: ${note.viewportW}x${note.viewportH}, ${note.theme} theme`);
    console.log(`- By: ${note.authorName ?? 'unknown'}, ${date} UTC`);
    console.log(`\n${note.text}\n`);
    for (const r of note.replies) {
        console.log(`> Reply by ${r.byAgent ? 'agent' : r.authorName ?? 'admin'}, ${r.createdAt.slice(0, 16).replace('T', ' ')} UTC:\n> ${r.text.replace(/\n/g, '\n> ')}\n`);
    }
    if (note.outerHtml) console.log(`Scope HTML:\n\`\`\`html\n${note.outerHtml}\n\`\`\`\n`);
}

const HEADING_SEPARATOR = ' › ';
const ELEMENT_TEXT_MAX = 120;

function truncate(value: string, max: number): string {
    const flat = value.replace(/\s+/g, ' ').trim();
    return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

function pageOf(note: Note): string {
    return `/${note.locale}${note.path === '/' ? '' : note.path}`;
}

function printCompactNote(note: Note, sub: string): void {
    console.log(`- ${note.id} · ${note.kind} · ${note.status}`);
    if (sub) console.log(`  Sub-heading: ${sub}`);
    if (note.elementText) console.log(`  On: "${truncate(note.elementText, ELEMENT_TEXT_MAX)}"`);
    console.log(`  ${note.text.replace(/\n/g, '\n  ')}`);
}

/** Compact overview: notes grouped by page, then by the top-level heading. */
function printCompact(notes: Note[]): void {
    const pages = new Map<string, Map<string, { note: Note; sub: string }[]>>();
    for (const note of notes) {
        const [top = '', ...rest] = (note.heading ?? '').split(HEADING_SEPARATOR);
        const page = pages.get(pageOf(note)) ?? new Map();
        const group = page.get(top) ?? [];
        group.push({ note, sub: rest.join(HEADING_SEPARATOR) });
        page.set(top, group);
        pages.set(pageOf(note), page);
    }
    for (const [page, headings] of pages) {
        console.log(`## ${page}`);
        for (const [heading, items] of headings) {
            console.log(`### ${heading || '(no heading)'}`);
            items.forEach(({ note, sub }) => printCompactNote(note, sub));
        }
        console.log('');
    }
    console.log(`${notes.length} open note${notes.length === 1 ? '' : 's'}. Details: npm run feedback -- show <id>`);
}

async function fetchOpen(): Promise<Note[]> {
    const res = await call('/api/feedback?status=OPEN');
    if (!res.ok) fail(`List failed: HTTP ${res.status}`);
    return ((await res.json()) as { notes: Note[] }).notes;
}

async function list(): Promise<void> {
    const notes = await fetchOpen();
    if (notes.length === 0) { console.log('No open feedback notes.'); return; }
    console.log(`# Open feedback (${notes.length})\n`);
    printCompact(notes);
}

async function show(id: string | undefined): Promise<void> {
    if (!id) fail('Usage: npm run feedback -- show <id>');
    // No single-note endpoint: fetch the open list and filter.
    const note = (await fetchOpen()).find((n) => n.id === id);
    if (!note) fail(`No open note with id ${id}.`);
    printNote(note);
}

async function update(command: string, id: string | undefined, reply: string | undefined): Promise<void> {
    if (!id) fail(`Usage: npm run feedback -- ${command} <id> ${command === 'doing' ? '' : '"reply"'}`.trim());
    const res = await call(`/api/feedback/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: STATUS_FOR_COMMAND[command], ...(reply ? { reply } : {}) }),
    });
    if (res.status === 404) {
        // The route answers 404 with an empty body when the API is disabled, and { error: 'NOT_FOUND' } for an unknown id.
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        fail(body?.error === 'NOT_FOUND' ? `No note with id ${id}.` : 'The feedback API answered 404: not enabled there (FEEDBACK_API_TOKEN unset on the server) or not deployed yet.');
    }
    if (!res.ok) fail(`Update failed: HTTP ${res.status}`);
    console.log(`${id} -> ${STATUS_FOR_COMMAND[command]}`);
}

async function remove(id: string | undefined): Promise<void> {
    if (!id) fail('Usage: npm run feedback -- delete <id>');
    const res = await call(`/api/feedback/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (res.status === 404) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        fail(body?.error === 'NOT_FOUND' ? `No note with id ${id}.` : 'The feedback API answered 404: not enabled there (FEEDBACK_API_TOKEN unset on the server) or not deployed yet.');
    }
    if (!res.ok) fail(`Delete failed: HTTP ${res.status}`);
    console.log(`${id} deleted`);
}

async function main(): Promise<void> {
    loadEnv();
    const [command = 'list', id, reply] = process.argv.slice(2);
    if (command === 'list') await list();
    else if (command === 'show') await show(id);
    else if (command === 'delete') await remove(id);
    else if (Object.hasOwn(STATUS_FOR_COMMAND, command)) await update(command, id, reply);
    else fail(`Unknown command "${command}". Use: list, show <id>, done <id> "reply", doing <id>, wontdo <id> "reply", delete <id>.`);
}

main().catch((error: unknown) => fail(`Feedback script failed: ${error instanceof Error ? error.message : String(error)}`));
