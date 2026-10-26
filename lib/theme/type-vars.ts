import { THEME_FONTS, TYPE_EMPHASIS, TYPE_ROLES, snapWeight, type ThemeFontId } from '@/lib/constants';
import type { ThemeType } from '@/lib/validations/theme';

type Vars = Record<string, string>;
type Role = (typeof TYPE_ROLES)[number];

/** A role's font choice: the legacy 'heading' / 'body' or a font id. Returns the font id it stands for. */
export function roleFontId(font: 'heading' | 'body' | ThemeFontId, headingFont: ThemeFontId, bodyFont: ThemeFontId): ThemeFontId {
    return font === 'heading' ? headingFont : font === 'body' ? bodyFont : font;
}
/** CSS value for a role's font choice. */
export function roleFontVar(font: 'heading' | 'body' | ThemeFontId): string {
    if (font === 'heading') return 'var(--font-heading)';
    if (font === 'body') return 'var(--font-sans)';
    return `var(${(THEME_FONTS.find((f) => f.id === font) ?? THEME_FONTS[0]).cssVar})`;
}

const MIN_PX = 8;
const MIN_REM = MIN_PX / 16;
const LEADING = { compact: 0.9, normal: 1, airy: 1.1 } as const;

const num = (n: number, digits = 4) => String(Number(n.toFixed(digits)));
const rem = (n: number) => `${num(Math.max(n, MIN_REM))}rem`;
const step = (n: number) => Math.round(n * 16) / 16; // 1 px steps

/** Size parts of a role (rem) after base and contrast: min, max and, for a fluid role, its middle. Shared by the CSS and the admin's role list. */
export function typeRoleParts(type: ThemeType | undefined, r: Role) {
    const body = TYPE_ROLES.find((x) => x.id === 'body')?.size.min ?? 1;
    const k = type?.base === undefined ? 1 : type.base / 16;
    const c = type?.contrast ?? 1;
    const bodySize = body * k;
    const grow = (x: number) => (r.heading ? bodySize + (x * k - bodySize) * c : x * k);
    const fl = 'fluid' in r.size ? r.size.fluid : undefined;
    return { min: grow(r.size.min), max: grow(r.size.max), fluid: fl ? { rem: grow(fl.rem), vw: fl.vw * (r.heading ? c : 1) } : undefined };
}

/** Every `--type-*` variable at its globals.css fallback, so a sample box shows today's values whatever the root holds. */
export function typeDefaultVars(): Vars {
    const vars: Vars = {};
    for (const r of TYPE_ROLES) {
        const fl = 'fluid' in r.size ? r.size.fluid : undefined;
        vars[`--type-${r.id}-size`] = fl ? `clamp(${num(r.size.min)}rem, ${num(fl.rem)}rem + ${num(fl.vw)}vw, ${num(r.size.max)}rem)` : `${num(r.size.min)}rem`;
        vars[`--type-${r.id}-line`] = r.line === null ? 'inherit' : String(r.line);
        vars[`--type-${r.id}-weight`] = r.heading ? 'var(--heading-weight)' : r.weight === null ? 'inherit' : String(r.weight);
        vars[`--type-${r.id}-tracking`] = r.tracking === null ? 'normal' : `${r.tracking}em`;
        if (r.heading) vars[`--type-${r.id}-font`] = 'var(--font-heading)';
    }
    vars['--type-tag-tracking'] = '0.02em';
    for (const e of TYPE_EMPHASIS) vars[e.cssVar] = String(e.step);
    return vars;
}

/**
 * The site's type tuning (R22) as `--type-<role>-*` variables, which the type utilities in globals.css read.
 * Only keys derived from set values are returned: unset (or `{v:1}`) gives `{}` and the page stays as the literals in globals.css.
 * Every value here is a number or enum checked by `themeTypeSchema`; sizes never go under 8 px.
 */
export function themeTypeVars(type: ThemeType | undefined, headingFont: ThemeFontId, bodyFont: ThemeFontId): Vars {
    if (!type) return {};
    const vars: Vars = {};
    const { base, contrast, leading, headingWeight, tagCase, roles } = type;
    const parts = (r: Role) => typeRoleParts(type, r);
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

        if (o?.weight !== undefined && r.id !== 'human-note') {
            const face = o.font ? roleFontId(o.font, headingFont, bodyFont) : r.heading ? headingFont : bodyFont;
            vars[`--type-${r.id}-weight`] = String(snapWeight(face, o.weight));
        }
        if (o?.font && r.heading) vars[`--type-${r.id}-font`] = roleFontVar(o.font);
    }

    for (const e of TYPE_EMPHASIS) {
        const v = type.emphasis?.[e.key];
        if (v !== undefined && v !== e.step) vars[e.cssVar] = String(v);
    }

    const fixed = THEME_FONTS.find((f) => f.id === headingFont);
    if (headingWeight !== undefined && !(fixed && 'weight' in fixed)) vars['--heading-weight'] = String(snapWeight(headingFont, headingWeight));
    // Uppercase letters need room (the one coupled default); a chosen tag size keeps the usual tracking.
    if (tagCase === 'upper' && roles?.tag?.size === undefined) vars['--type-tag-tracking'] = '0.06em';
    return vars;
}

/**
 * Declarations a role never had in globals.css (a text role's font, the tag's case, the note's weight), as rules that exist only when set:
 * an unset theme adds nothing, so nothing shifts. Same validated enums and numbers as the variables.
 */
export function themeTypeRules(type: ThemeType | undefined, headingFont: ThemeFontId, bodyFont: ThemeFontId, scope?: string): string {
    if (!type && !scope) return '';
    const pre = scope ? `${scope} ` : '';
    const rules: string[] = [];
    for (const r of TYPE_ROLES) {
        const o = type?.roles?.[r.id];
        if (!o && !scope) continue;
        const decls: string[] = [];
        if (!r.heading && (o?.font || scope)) decls.push(`font-family:${o?.font ? roleFontVar(o.font) : 'inherit'}`);
        if (r.id === 'human-note' && (o?.weight !== undefined || scope)) decls.push(`font-weight:${o?.weight !== undefined ? snapWeight(o.font ? roleFontId(o.font, headingFont, bodyFont) : bodyFont, o.weight) : 'inherit'}`);
        if (decls.length) rules.push(`${pre}.${r.utility}{${decls.join(';')}}`);
    }
    // An explicit case utility on the element (FallbackLangLabel's normal-case) still wins: this rule is unlayered, so it would beat any utility.
    if (type?.tagCase === 'upper') rules.push(`${pre}.text-tag:not(.normal-case,.lowercase,.capitalize){text-transform:uppercase}`);
    else if (scope) rules.push(`${pre}.text-tag:not(.normal-case,.lowercase,.capitalize){text-transform:none}`);
    return rules.join('\n');
}
