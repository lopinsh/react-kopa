import { THEME_FONTS, THEME_STYLES, TYPE_ROLES, snapWeight, type ThemeFontId, type ThemeStyleKey, type TypeRoleId } from '@/lib/constants';
import { roleFontId, typeRoleParts } from '@/lib/theme/type-vars';
import type { ThemeType } from '@/lib/validations/theme';

type Role = (typeof TYPE_ROLES)[number];
type RoleOverride = NonNullable<NonNullable<ThemeType['roles']>[TypeRoleId]>;
export type FontCtx = { headingFont: ThemeFontId; bodyFont: ThemeFontId; styleKey: ThemeStyleKey };
export interface ResolvedRole { id: TypeRoleId; heading: boolean; minPx: number; maxPx: number; weight: number; font: 'heading' | 'body' | ThemeFontId; overridden: boolean }

const half = (n: number) => Math.round(n * 2) / 2;
const own = (r: Role): 'heading' | 'body' => (r.heading ? 'heading' : 'body');

function resolveRole(type: ThemeType | undefined, r: Role, { headingFont, bodyFont, styleKey }: FontCtx): ResolvedRole {
    const o = type?.roles?.[r.id];
    const p = typeRoleParts(type, r);
    const scaledFixed = !r.heading && !p.fluid && type?.base !== undefined;
    let minPx = (scaledFixed ? Math.round(p.min * 16) : p.min * 16);
    let maxPx = (scaledFixed ? Math.round(p.max * 16) : p.max * 16);
    if (o?.size !== undefined) minPx = maxPx = o.size;
    if (o?.min !== undefined) minPx = o.min;
    if (o?.max !== undefined) maxPx = o.max;
    const font = o?.font ?? own(r);
    const face = roleFontId(font, headingFont, bodyFont);
    const fixed = THEME_FONTS.find((f) => f.id === headingFont);
    let weight: number;
    if (r.id === 'human-note') weight = o?.weight !== undefined ? snapWeight(face, o.weight) : 400;
    else if (o?.weight !== undefined) weight = snapWeight(face, o.weight);
    else if (!r.heading) weight = r.weight ?? 400;
    else if (fixed && 'weight' in fixed) weight = fixed.weight;
    else weight = snapWeight(headingFont, type?.headingWeight ?? THEME_STYLES[styleKey].headingWeight);
    return { id: r.id, heading: r.heading, minPx: half(Math.max(minPx, 8)), maxPx: half(Math.max(maxPx, 8)), weight, font, overridden: !!o && Object.keys(o).length > 0 };
}

/** What each role shows after the stored type (same maths as the CSS), for the Burti list and the sample labels. */
export function resolveTypeRoles(type: ThemeType | undefined, headingFont: ThemeFontId, bodyFont: ThemeFontId, styleKey: ThemeStyleKey): ResolvedRole[] {
    return TYPE_ROLES.map((r) => resolveRole(type, r, { headingFont, bodyFont, styleKey }));
}

/**
 * Merges a patch into the stored type and drops everything that equals today's default, so an untouched page stores what it stored before.
 * Without `ctx` the weight defaults are not compared (sizes and fonts are).
 */
export function patchType(prev: ThemeType | undefined, patch: Partial<Omit<ThemeType, 'v'>>, ctx?: FontCtx): ThemeType | undefined {
    const m: ThemeType = { ...prev, ...patch, v: 1 };
    if (m.base === 16 || m.base === undefined) delete m.base;
    if (m.contrast === 1 || m.contrast === undefined) delete m.contrast;
    if (m.headingWeight === undefined) delete m.headingWeight;
    if (m.leading === 'normal' || m.leading === undefined) delete m.leading;
    if (m.tagCase === 'none' || m.tagCase === undefined) delete m.tagCase;
    if (m.roles) {
        const roles: NonNullable<ThemeType['roles']> = {};
        const bare: ThemeType = { ...m, roles: undefined };
        for (const r of TYPE_ROLES) {
            const o = m.roles[r.id];
            if (!o) continue;
            const def = ctx ? resolveRole(bare, r, ctx) : undefined;
            const p = typeRoleParts(bare, r);
            const next: RoleOverride = { ...o };
            if (next.font === own(r)) delete next.font;
            for (const k of ['min', 'max', 'size'] as const) {
                const dflt = k === 'max' ? (def?.maxPx ?? p.max * 16) : (def?.minPx ?? p.min * 16);
                if (next[k] !== undefined && Math.abs(next[k] - dflt) < 0.01 && (k !== 'size' || def?.minPx === def?.maxPx)) delete next[k];
            }
            if (def && next.weight !== undefined && next.weight === def.weight && !next.font) delete next.weight;
            if (Object.keys(next).length) roles[r.id] = next;
        }
        if (Object.keys(roles).length) m.roles = roles;
        else delete m.roles;
    }
    return Object.keys(m).length === 1 ? undefined : m;
}
