/**
 * The type roles (design.md, Type) with today's values, the single source for the theme's type variables (`lib/theme/type-vars.ts`)
 * and the admin's Burti page. `app/globals.css` repeats the same literals as fallbacks; keep them equal.
 * Sizes are rem; a fluid role has `fluid` (the `clamp` middle: intercept in rem, slope in vw) and `size` is its min/max pair.
 */
export interface TypeRole {
    id: string;
    utility: string;
    /** Heading font and the style's heading weight. */
    heading: boolean;
    size: { min: number; max: number; fluid?: { rem: number; vw: number } };
    line: number | null;
    /** null: no default from the registry (heading roles read `--heading-weight`, human-note inherits). */
    weight: number | null;
    /** em; null = none. */
    tracking: number | null;
}

export const TYPE_ROLES = [
    { id: 'display', utility: 'text-display', heading: true, size: { min: 2, max: 3.25, fluid: { rem: 1.55, vw: 2 } }, line: 1.05, weight: null, tracking: -0.02 },
    { id: 'title', utility: 'text-title', heading: true, size: { min: 1.625, max: 2.25, fluid: { rem: 1.4, vw: 1 } }, line: 1.1, weight: null, tracking: -0.015 },
    { id: 'section', utility: 'text-section', heading: true, size: { min: 1.25, max: 1.5, fluid: { rem: 1.15, vw: 0.45 } }, line: 1.2, weight: null, tracking: -0.01 },
    { id: 'item', utility: 'text-item', heading: true, size: { min: 1.0625, max: 1.1875, fluid: { rem: 1, vw: 0.2 } }, line: 1.3, weight: null, tracking: null },
    { id: 'body', utility: 'text-body', heading: false, size: { min: 1, max: 1 }, line: 1.6, weight: 400, tracking: null },
    { id: 'body-sm', utility: 'text-body-sm', heading: false, size: { min: 0.9375, max: 0.9375 }, line: 1.5, weight: 400, tracking: null },
    { id: 'button', utility: 'text-button', heading: false, size: { min: 0.9375, max: 0.9375 }, line: 1.2, weight: 500, tracking: null },
    { id: 'button-sm', utility: 'text-button-sm', heading: false, size: { min: 0.875, max: 0.875 }, line: 1.2, weight: 500, tracking: null },
    { id: 'meta', utility: 'text-meta', heading: false, size: { min: 0.8125, max: 0.8125 }, line: 1.45, weight: 400, tracking: null },
    { id: 'tag', utility: 'text-tag', heading: false, size: { min: 0.75, max: 0.75 }, line: 1.2, weight: 600, tracking: 0.02 },
    { id: 'human-note', utility: 'human-note', heading: false, size: { min: 0.875, max: 0.875 }, line: null, weight: null, tracking: null },
] as const satisfies readonly TypeRole[];

export type TypeRoleId = (typeof TYPE_ROLES)[number]['id'];
export const TYPE_ROLE_IDS = TYPE_ROLES.map((r) => r.id) as [TypeRoleId, ...TypeRoleId[]];
