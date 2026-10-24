import { ADMIN_PANEL_STORAGE, isAdminPanelTab, type AdminPanelTab } from '@/lib/constants';

export interface PanelPlace {
    x: number;
    y: number;
    docked: boolean;
}

export const SHEET_SIZES = ['bar', 'half', 'full'] as const;
export type SheetSize = (typeof SHEET_SIZES)[number];

const isSheetSize = (v: unknown): v is SheetSize => typeof v === 'string' && (SHEET_SIZES as readonly string[]).includes(v);

/** Every localStorage access goes through here: private mode, blocked site data or a bad value fall back to the default. */
function read(key: string): unknown {
    try {
        const raw = window.localStorage.getItem(key);
        return raw === null ? null : (JSON.parse(raw) as unknown);
    } catch {
        return null;
    }
}

function write(key: string, value: unknown): void {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Private mode or quota: the panel just forgets its place.
    }
}

export function readPlace(): PanelPlace | null {
    const v = read(ADMIN_PANEL_STORAGE.place);
    if (typeof v !== 'object' || v === null) return null;
    const { x, y, docked } = v as Record<string, unknown>;
    if (typeof x !== 'number' || typeof y !== 'number' || !Number.isFinite(x) || !Number.isFinite(y)) return null;
    return { x, y, docked: docked === true };
}

export const writePlace = (place: PanelPlace): void => write(ADMIN_PANEL_STORAGE.place, place);

export function readSheet(): SheetSize {
    const v = read(ADMIN_PANEL_STORAGE.sheet);
    return isSheetSize(v) ? v : 'half';
}

export const writeSheet = (size: SheetSize): void => write(ADMIN_PANEL_STORAGE.sheet, size);

export function readLastTab(): AdminPanelTab {
    const v = read(ADMIN_PANEL_STORAGE.lastTab);
    return isAdminPanelTab(v) ? v : 'feedback';
}

export const writeLastTab = (tab: AdminPanelTab): void => write(ADMIN_PANEL_STORAGE.lastTab, tab);
