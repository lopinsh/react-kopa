import { THEME_FONTS, TYPE_ROLES, snapWeight, type ThemeFontId } from '@/lib/constants';
import type { ThemeType } from '@/lib/validations/theme';

type Vars = Record<string, string>;
type Role = (typeof TYPE_ROLES)[number];

const MIN_PX = 11;
const MIN_REM = MIN_PX / 16;
const LEADING = { compact: 0.9, normal: 1, airy: 1.1 } as const;

const num = (n: number, digits = 4) => String(Number(n.toFixed(digits)));
const rem = (n: number) => `${num(Math.max(n, MIN_REM))}rem`;
const step = (n: number) => Math.round(n * 16) / 16; // 1 px steps

/**
 * The site's type tuning (R22) as `--type-<role>-*` variables, which the type utilities in globals.css read.
 * Only keys derived from set values are returned: unset (or `{v:1}`) gives `{}` and the page stays as the literals in globals.css.
 * Every value here is a number or enum checked by `themeTypeSchema`; sizes never go under 11 px.
 */
export function themeTypeVars(type: ThemeType | undefined, headingFont: ThemeFontId, bodyFont: ThemeFontId): Vars {
    if (!type) return {};
    const vars: Vars = {};
    const { base, contrast, leading, headingWeight, tagCase, roles } = type;
    const body = TYPE_ROLES.find((r) => r.id === 'body')?.size.min ?? 1;
    const k = base === undefined ? 1 : base / 16;
    const bodySize = body * k;
    const c = contrast ?? 1;

    // Size parts of a role (rem) after base and contrast: min, max and, for a fluid role, its middle.
    const parts = (r: Role) => {
        const grow = (x: number) => (r.heading ? bodySize + (x * k - bodySize) * c : x * k);
        const fl = 'fluid' in r.size ? r.size.fluid : undefined;
        return { min: grow(r.size.min), max: grow(r.size.max), fluid: fl ? { rem: grow(fl.rem), vw: fl.vw * (r.heading ? c : 1) } : undefined };
    };
    const clampOf = (min: number, max: number, fl: { rem: number; vw: number }) => {
        const lo = Math.max(min, MIN_REM);
        return `clamp(${num(lo)}rem, ${num(fl.rem)}rem + ${num(fl.vw)}vw, ${num(Math.max(max, lo))}rem)`;
    };

    for (const r of TYPE_ROLES) {
        const o = roles?.[r.id];
        const p = parts(r);
        if (o?.size !== undefined) vars[`--type-${r.id}-size`] = rem(o.size / 16);
        else if (o?.min !== undefined || o?.max !== undefined) {
            const min = o.min !== undefined ? o.min / 16 : p.min;
            const max = o.max !== undefined ? o.max / 16 : p.max;
            vars[`--type-${r.id}-size`] = p.fluid ? clampOf(min, max, p.fluid) : rem(o.min !== undefined ? min : max);
        } else if (base !== undefined || (r.heading && contrast !== undefined)) {
            vars[`--type-${r.id}-size`] = p.fluid ? clampOf(p.min, p.max, p.fluid) : rem(r.heading ? p.min : step(p.min));
        }

        // Leading: text roles with a line of their own; buttons are single-line controls.
        if (!r.heading && r.line !== null && !r.id.startsWith('button') && leading && leading !== 'normal') vars[`--type-${r.id}-line`] = num(r.line * LEADING[leading], 3);

        if (o?.weight !== undefined) {
            const useHeading = o.font ? o.font === 'heading' : r.heading;
            vars[`--type-${r.id}-weight`] = String(snapWeight(useHeading ? headingFont : bodyFont, o.weight));
        }
        if (o?.font) vars[`--type-${r.id}-font`] = o.font === 'heading' ? 'var(--font-heading)' : 'var(--font-sans)';
    }

    const fixed = THEME_FONTS.find((f) => f.id === headingFont);
    if (headingWeight !== undefined && !(fixed && 'weight' in fixed)) vars['--heading-weight'] = String(snapWeight(headingFont, headingWeight));
    if (tagCase === 'upper') {
        vars['--type-tag-transform'] = 'uppercase';
        if (roles?.tag?.size === undefined) vars['--type-tag-tracking'] = '0.06em';
    }
    return vars;
}
