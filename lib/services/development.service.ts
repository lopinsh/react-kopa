import { promises as fs } from 'fs';
import path from 'path';
import { redesignMetaSchema, type RedesignMeta } from '@/lib/validations/development';

const DEVELOPMENT_DIR = path.join(process.cwd(), 'docs', 'development');

export interface RedesignPage {
    /** Our own HTML fragment, scoped under `.rd`, with `<!--rd-meta-->` where the version block goes. */
    html: string;
    meta: RedesignMeta;
}

export const DevelopmentService = {
    /** The redesign discussion page and its version data, both kept in `docs/development/`. */
    async getRedesign(): Promise<RedesignPage> {
        const [html, rawMeta] = await Promise.all([
            fs.readFile(path.join(DEVELOPMENT_DIR, 'redesign.html'), 'utf8'),
            fs.readFile(path.join(DEVELOPMENT_DIR, 'redesign.meta.json'), 'utf8'),
        ]);
        return { html, meta: redesignMetaSchema.parse(JSON.parse(rawMeta)) };
    },
};
