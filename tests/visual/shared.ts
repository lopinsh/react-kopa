import path from 'node:path';

export const AUTH_FILE = path.join(__dirname, '.auth.json');
/** The server's frozen "now" (tests/visual/freeze-time.cjs): Thursday 22 Oct 2026, 12:00 Riga. */
export const FROZEN_NOW = new Date('2026-10-22T09:00:00Z');
