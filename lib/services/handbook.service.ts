import { promises as fs } from 'fs';
import path from 'path';

/** The chapters of the Handbook, in reading order. Each is a file `docs/handbook/<slug>.md`. */
export const HANDBOOK_CHAPTERS = ['values', 'why', 'principles', 'voice', 'behaviour', 'roles', 'design'] as const;

export type ChapterSlug = (typeof HANDBOOK_CHAPTERS)[number];

/** The index page is `docs/handbook/README.md`. */
const INDEX_FILE = 'README';

export interface HandbookHeading {
    id: string;
    text: string;
}

export interface HandbookChapterLink {
    slug: ChapterSlug;
    title: string;
}

export interface HandbookPage {
    /** `null` for the index page. */
    slug: ChapterSlug | null;
    title: string;
    markdown: string;
    headings: HandbookHeading[];
}

const HANDBOOK_DIR = path.join(process.cwd(), 'docs', 'handbook');

export function isChapterSlug(value: string): value is ChapterSlug {
    return (HANDBOOK_CHAPTERS as readonly string[]).includes(value);
}

/** Plain text of a heading line: markdown emphasis and code marks removed. */
export function plainHeadingText(raw: string): string {
    return raw.replace(/[`*_~]/g, '').trim();
}

/** Anchor id for a heading; the page renderer and the table of contents both use this. */
export function headingId(text: string): string {
    return plainHeadingText(text)
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function readSource(file: string): Promise<string> {
    const raw = await fs.readFile(path.join(HANDBOOK_DIR, `${file}.md`), 'utf8');
    return raw.replace(/\r\n/g, '\n');
}

function parse(markdown: string): { title: string; headings: HandbookHeading[] } {
    let title = '';
    const headings: HandbookHeading[] = [];
    let inFence = false;
    for (const line of markdown.split('\n')) {
        if (line.startsWith('```')) inFence = !inFence;
        if (inFence) continue;
        const h1 = /^# (.+)$/.exec(line);
        if (h1 && !title) title = plainHeadingText(h1[1]);
        const h2 = /^## (.+)$/.exec(line);
        if (h2) headings.push({ id: headingId(h2[1]), text: plainHeadingText(h2[1]) });
    }
    return { title, headings };
}

export const HandbookService = {
    /** Chapter list for navigation; titles come from each file's first heading. */
    async listChapters(): Promise<HandbookChapterLink[]> {
        return Promise.all(
            HANDBOOK_CHAPTERS.map(async (slug) => ({ slug, title: parse(await readSource(slug)).title || slug }))
        );
    },

    /** One page of the Handbook: a chapter, or the index when `slug` is null. */
    async getPage(slug: ChapterSlug | null): Promise<HandbookPage> {
        const markdown = await readSource(slug ?? INDEX_FILE);
        const { title, headings } = parse(markdown);
        return { slug, title, markdown, headings };
    },
};
