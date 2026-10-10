/**
 * Reads and answers feedback notes left by site admins (feedback mode), through the token-protected API.
 *
 *   npm run feedback                       list open notes as markdown
 *   npm run feedback -- done <id> "reply"  mark done (reply optional)
 *   npm run feedback -- doing <id>
 *   npm run feedback -- wontdo <id> "reply"
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
    reply: string | null;
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
    console.log(`- Page: ${note.locale ? `/${note.locale}` : ''}${note.path}`);
    console.log(`- Element: \`${note.selector}\`${note.elementText ? ` ("${note.elementText}")` : ''}`);
    console.log(`- Viewport: ${note.viewportW}x${note.viewportH}, ${note.theme} theme`);
    console.log(`- By: ${note.authorName ?? 'unknown'}, ${date}`);
    if (note.reply) console.log(`- Reply: ${note.reply}`);
    console.log(`\n${note.text}\n`);
}

async function list(): Promise<void> {
    const res = await call('/api/feedback?status=OPEN');
    if (!res.ok) fail(`List failed: HTTP ${res.status}`);
    const body = (await res.json()) as { notes: Note[] };
    if (body.notes.length === 0) { console.log('No open feedback notes.'); return; }
    console.log(`# Open feedback (${body.notes.length})\n`);
    body.notes.forEach(printNote);
}

async function update(command: string, id: string | undefined, reply: string | undefined): Promise<void> {
    if (!id) fail(`Usage: npm run feedback -- ${command} <id> ${command === 'doing' ? '' : '"reply"'}`.trim());
    const res = await call(`/api/feedback/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: STATUS_FOR_COMMAND[command], ...(reply ? { reply } : {}) }),
    });
    if (res.status === 404) fail(`No note with id ${id}.`);
    if (!res.ok) fail(`Update failed: HTTP ${res.status}`);
    console.log(`${id} -> ${STATUS_FOR_COMMAND[command]}`);
}

async function main(): Promise<void> {
    loadEnv();
    const [command = 'list', id, reply] = process.argv.slice(2);
    if (command === 'list') await list();
    else if (command in STATUS_FOR_COMMAND) await update(command, id, reply);
    else fail(`Unknown command "${command}". Use: list, done <id> "reply", doing <id>, wontdo <id> "reply".`);
}

void main();
