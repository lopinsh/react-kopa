/** The admin tool panel (R23): one cookie holds the open tab, a few localStorage keys hold the place. */
export const ADMIN_PANEL_COOKIE = 'admin_panel';

export const ADMIN_PANEL_TABS = ['feedback', 'translate', 'design', 'group'] as const;
export type AdminPanelTab = (typeof ADMIN_PANEL_TABS)[number];

export function isAdminPanelTab(value: unknown): value is AdminPanelTab {
    return typeof value === 'string' && (ADMIN_PANEL_TABS as readonly string[]).includes(value);
}

export const ADMIN_PANEL_STORAGE = {
    place: 'ek.adminPanel.place',
    sheet: 'ek.adminPanel.sheet',
    lastTab: 'ek.adminPanel.lastTab',
    /** One-shot (sessionStorage): what the Grupa tab focuses when it opens (R25-3 sets it). */
    focus: 'ek.adminPanel.focus',
} as const;

/** The cookies the two separate modes used before the panel; cleared whenever the panel is set. */
export const LEGACY_PANEL_COOKIES = ['feedback_mode', 'translate_mode'] as const;

/** Rows "Citās lapās" lists before it links to all notes. */
export const PANEL_OTHER_PAGES_MAX = 8;

export const ADMIN_PANEL_FOCUS = ['hideReason', 'restore', 'reports'] as const;
export type AdminPanelFocus = (typeof ADMIN_PANEL_FOCUS)[number];

export function isAdminPanelFocus(value: unknown): value is AdminPanelFocus {
    return typeof value === 'string' && (ADMIN_PANEL_FOCUS as readonly string[]).includes(value);
}

/** The Grupa tab's lists: last log entries and open reports. */
export const GROUP_PANEL_LOG_MAX = 5;
export const GROUP_PANEL_REPORTS_MAX = 5;
