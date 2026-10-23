import { promises as fs } from 'fs';
import path from 'path';

const DEVELOPMENT_DIR = path.join(process.cwd(), 'docs', 'development');

export const DESIGN_DRAWINGS = ['r18', 'r19', 'r20'] as const;
export type DesignDrawingId = (typeof DESIGN_DRAWINGS)[number];

const DRAWING_FILES: Record<DesignDrawingId, string> = {
    r18: 'r18-group-cards.html',
    r19: 'r19-category-sidebar.html',
    r20: 'r20-board-heading.html',
};

export const DevelopmentService = {
    /** One approved drawing of the design handbook page: a complete HTML document with its own CSS and script, kept in `docs/development/`. */
    async getDrawing(id: DesignDrawingId): Promise<string> {
        return fs.readFile(path.join(DEVELOPMENT_DIR, DRAWING_FILES[id]), 'utf8');
    },
};
