import { promises as fs } from 'fs';
import path from 'path';

const DEVELOPMENT_DIR = path.join(process.cwd(), 'docs', 'development');

export const DESIGN_DRAWINGS = ['r18', 'r19', 'r20', 'r21'] as const;
export type DesignDrawingId = (typeof DESIGN_DRAWINGS)[number];

const DRAWING_FILES: Record<DesignDrawingId, string> = {
    r18: 'r18-group-cards.html',
    r19: 'r19-category-sidebar.html',
    r20: 'r20-board-heading.html',
    r21: 'r21-group-card.html',
};

/** The plan shown on the build-plan page: a spec rendered as markdown, then one tab per drawing. Drawings are plain HTML in `docs/development/kanali/`; the site's compiled CSS plus `_site.html` (theme variables, Tailwind CDN for NEW: classes) are injected into each `<head>`. */
export const PLAN = {
    spec: 'specs/kanali.md',
    drawings: [
        { id: 'hub', file: 'kanali/hub.html' },
        { id: 'l3', file: 'l3/categories.html' },
    ],
} as const;
export type PlanDrawingId = (typeof PLAN.drawings)[number]['id'];

/** The site's own compiled stylesheet(s) as /_next/static/... hrefs, read from the build on disk (names are hashed, so resolved per request). Empty under `next dev`, which keeps no files. The font-face-only sheet is skipped. */
async function siteStylesheetLinks(): Promise<string> {
    const dir = path.join(process.cwd(), '.next', 'static', 'chunks');
    const names = await fs.readdir(dir).catch(() => [] as string[]);
    const sheets = await Promise.all(
        names
            .filter((n) => n.endsWith('.css'))
            .map(async (n) => ({ n, css: await fs.readFile(path.join(dir, n), 'utf8') })),
    );
    return sheets
        .filter((s) => !s.css.startsWith('@font-face'))
        .map((s) => `<link rel="stylesheet" href="/_next/static/chunks/${s.n}">`)
        .join('');
}

export const DevelopmentService = {
    /** The plan's spec markdown, or null when the file is missing. */
    async getPlanSpec(): Promise<string | null> {
        return fs.readFile(path.join(DEVELOPMENT_DIR, PLAN.spec), 'utf8').catch(() => null);
    },

    /** One plan drawing as a complete HTML document with the shared site look injected into its head; null when missing. */
    async getPlanDrawing(id: PlanDrawingId): Promise<string | null> {
        const entry = PLAN.drawings.find((d) => d.id === id);
        if (!entry) return null;
        try {
            const [html, site, links] = await Promise.all([
                fs.readFile(path.join(DEVELOPMENT_DIR, entry.file), 'utf8'),
                fs.readFile(path.join(DEVELOPMENT_DIR, 'kanali', '_site.html'), 'utf8'),
                siteStylesheetLinks(),
            ]);
            return html.replace(/<head[^>]*>/i, (head) => head + links + site);
        } catch {
            return null;
        }
    },

    /** One approved drawing of the design handbook page: a complete HTML document with its own CSS and script, kept in `docs/development/`. */
    async getDrawing(id: DesignDrawingId): Promise<string> {
        return fs.readFile(path.join(DEVELOPMENT_DIR, DRAWING_FILES[id]), 'utf8');
    },
};
