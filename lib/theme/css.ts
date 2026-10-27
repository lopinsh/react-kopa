import {
    CATEGORY_TONES, CATEGORY_TONE_SLUGS, DEFAULT_OVERLAYS, DEFAULT_ROLE_TONES, DEFAULT_STATUS_TONES, PHOTO_INK, ROLE_TONE_KEYS, SOFT_SHADOWS, THEME_FONTS, THEME_STYLES,
    type ThemeDefinition, type ThemeFontId, type ThemeModeTokens, type ThemeStyleKey, type ThemeStyleTokens,
} from '@/lib/constants';
import { themeTypeRules, themeTypeVars, typeDefaultVars } from '@/lib/theme/type-vars';
import type { ThemeType } from '@/lib/validations/theme';
import { getLuminance, hexToRgb } from '@/lib/color-utils';

/** White text unless the colour is clearly light (Sūna's light primary keeps white, its light-sage dark primary gets near-black). */
export function onPrimary(hex: string): string {
    const rgb = hexToRgb(hex);
    return rgb && getLuminance(rgb.r, rgb.g, rgb.b) > 0.22 ? '#111111' : '#ffffff';
}

/** Ink on a role tone: white or near-black, whichever reads better. */
export function roleInk(hex: string): string {
    const rgb = hexToRgb(hex);
    return rgb && getLuminance(rgb.r, rgb.g, rgb.b) > 0.18 ? '#111111' : '#ffffff';
}

type Vars = Record<string, string>;

function fontVar(id: ThemeFontId): string {
    const font = THEME_FONTS.find((f) => f.id === id) ?? THEME_FONTS[0];
    return `var(${font.cssVar})`;
}

/** The ink: the soft divider colour in calm, the foreground (dark mode: 85 % of it) in bold. */
function inkValue(style: ThemeStyleTokens, mode: 'light' | 'dark'): string {
    if (style.ink === 'border') return 'var(--border)';
    return mode === 'dark' ? 'color-mix(in srgb, var(--foreground) 85%, var(--background))' : 'var(--foreground)';
}

/**
 * The style tokens as CSS variables (R13). Every style writes all of them (calm's radii and soft shadows too): globals.css holds no look values.
 * `withDefaults` also resets the active edge (for the editor's sample, which must not inherit the root's style).
 */
export function themeStyleVars(style: ThemeStyleTokens, headingFont: ThemeFontId, mode: 'light' | 'dark' = 'light', withDefaults = false): Vars {
    const font = THEME_FONTS.find((f) => f.id === headingFont);
    const weight = (font && 'weight' in font ? font.weight : undefined) ?? style.headingWeight;
    const vars: Vars = {
        '--line-width': style.lineWidth,
        '--line-color': style.ink === 'border' ? 'var(--border)' : 'var(--ink)',
        '--frame-width': style.frameWidth,
        '--ink': inkValue(style, mode),
        '--press-shift': style.pressShift,
        '--shadow-room': style.shadowRoom,
        '--card-pad': style.cardSpace,
        '--card-gap': style.cardSpace,
        '--list-row': style.listRow,
        '--list-pad': style.listPad,
        '--search-edge': style.searchEdge,
        // Active/open edges (chosen chip, open filter): the ink in bold; calm leaves it unset so each element's own fallback colour applies.
        ...(style.ink === 'foreground' ? { '--line-active': 'var(--ink)' } : withDefaults ? { '--line-active': 'initial' } : {}),
        '--heading-weight': String(weight),
        '--icon-stroke': String(style.iconStroke),
    };
    // Tile tone shares; the cat-tile utility mixes them with --c per card (a var(--c) here would resolve at the root).
    if (style.tile === 'solid') {
        vars['--tile-mix'] = '100%';
        vars['--tile-on'] = '100%';
        vars['--band-mix'] = '100%';
    } else {
        vars['--tile-mix'] = '20%';
        vars['--tile-on'] = '0%';
        if (withDefaults) vars['--band-mix'] = 'initial';
    }
    for (const [k, v] of Object.entries(style.radius)) vars[`--radius-${k}`] = v;
    const sh = style.shadows;
    if (sh === 'none') {
        for (const k of ['card', 'control', 'premium', 'dialog']) vars[`--shadow-${k}`] = 'none';
    } else if (sh !== 'soft') {
        vars['--shadow-card'] = `${sh.card} ${sh.card} 0 0 var(--ink)`;
        vars['--shadow-control'] = `${sh.control} ${sh.control} 0 0 var(--ink)`;
        vars['--shadow-premium'] = `${sh.premium} ${sh.premium} 0 0 var(--ink)`;
        vars['--shadow-dialog'] = `${sh.dialog} ${sh.dialog} 0 0 var(--ink)`;
    } else {
        for (const k of ['card', 'control', 'premium', 'dialog'] as const) vars[`--shadow-${k}`] = SOFT_SHADOWS[k];
    }
    return vars;
}

/** The design tokens of one mode as CSS variables. Missing optional tokens are mixed from foreground and background. */
export function themeModeVars(t: ThemeModeTokens, mode: 'light' | 'dark'): Vars {
    const tones: Vars = {};
    for (const slug of CATEGORY_TONE_SLUGS) tones[`--cat-${slug}`] = t.categories?.[slug] ?? CATEGORY_TONES[slug][mode];
    const roles: Vars = {};
    for (const key of ROLE_TONE_KEYS) {
        const tone = t.roles?.[key] ?? DEFAULT_ROLE_TONES[mode][key];
        roles[`--role-${key}`] = tone;
        roles[`--role-${key}-ink`] = roleInk(tone);
    }
    const status = {
        danger: t.danger ?? DEFAULT_STATUS_TONES[mode].danger,
        success: t.success ?? DEFAULT_STATUS_TONES[mode].success,
        warning: t.warning ?? DEFAULT_STATUS_TONES[mode].warning,
    };
    return {
        '--primary': t.primary,
        '--primary-foreground': onPrimary(t.primary),
        '--background': t.background,
        '--surface': t.surface,
        '--surface-elevated': t.surfaceElevated ?? t.surface,
        '--foreground': t.foreground,
        '--foreground-muted': t.muted ?? `color-mix(in srgb, ${t.foreground} 60%, ${t.background})`,
        '--border': t.border ?? `color-mix(in srgb, ${t.foreground} 12%, ${t.background})`,
        '--tint': t.tint ?? `color-mix(in srgb, ${t.foreground} 8%, ${t.background})`,
        '--on-cat': mode === 'light' ? '#ffffff' : t.background,
        // The group head tile's button: a light pill with dark text in both modes (a site-colour button on a category tone fails contrast).
        '--tone-btn': mode === 'light' ? 'var(--surface)' : 'var(--foreground)',
        '--tone-btn-ink': mode === 'light' ? 'var(--foreground)' : 'var(--background)',
        '--danger': status.danger,
        '--danger-foreground': roleInk(status.danger),
        '--success': status.success,
        '--success-foreground': roleInk(status.success),
        '--warning': status.warning,
        '--warning-foreground': roleInk(status.warning),
        '--scrim': t.scrim ?? DEFAULT_OVERLAYS[mode].scrim,
        '--photo-chip': t.photoChip ?? DEFAULT_OVERLAYS[mode].photoChip,
        '--photo-ink': PHOTO_INK,
        ...tones,
        ...roles,
    };
}

function block(selector: string, vars: Vars): string {
    return `${selector}{${Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(';')}}`;
}

/**
 * The `<style>` text for the whole site. Selectors are more specific than globals.css (`:root`, `.dark`)
 * so the theme wins whatever the order of the stylesheets. Only validated hex colours and known font ids get in here.
 */
export function themeCss(def: ThemeDefinition): string {
    // A context cached before styles existed has no styleKey: it renders calm, which is what it was.
    const style = THEME_STYLES[def.styleKey] ?? THEME_STYLES.calm;
    return [
        block('html:root', {
            ...themeModeVars(def.light, 'light'),
            ...themeStyleVars(style, def.headingFont),
            '--theme-font-heading': fontVar(def.headingFont),
            '--theme-font-body': fontVar(def.bodyFont),
            // Last: the type variables (and a chosen heading weight) win over the style's.
            ...themeTypeVars(def.type, def.headingFont, def.bodyFont),
        }),
        block('html.dark:root', { ...themeModeVars(def.dark, 'dark'), ...(style.ink === 'foreground' ? { '--ink': inkValue(style, 'dark') } : {}) }),
        themeTypeRules(def.type, def.headingFont, def.bodyFont),
    ].filter(Boolean).join('\n');
}

/**
 * Variables for the live sample in the editor. It carries a complete set of type variables, so the published root values never show through. Tailwind's `--color-*` tokens are resolved at the root,
 * so they are set again here for the sample area to follow its own colours.
 */
export function themeSampleVars(tokens: ThemeModeTokens, headingFont: ThemeFontId, bodyFont: ThemeFontId, mode: 'light' | 'dark', styleKey: ThemeStyleKey = 'calm', type?: ThemeType): Vars {
    const v = themeModeVars(tokens, mode);
    return {
        ...v,
        // Style variables again: ink and lines hold `var(--foreground)`/`var(--border)`, which resolve where they are declared (the root).
        ...themeStyleVars(THEME_STYLES[styleKey] ?? THEME_STYLES.calm, headingFont, mode, true),
        '--color-primary': v['--primary'],
        '--color-primary-foreground': v['--primary-foreground'],
        '--color-background': v['--background'],
        '--color-surface': v['--surface'],
        '--color-surface-elevated': v['--surface-elevated'],
        '--color-foreground': v['--foreground'],
        '--color-foreground-muted': v['--foreground-muted'],
        '--color-border': v['--border'],
        '--color-tint': v['--tint'],
        ...Object.fromEntries(['danger', 'success', 'warning'].flatMap((k) => [[`--color-${k}`, v[`--${k}`]], [`--color-${k}-foreground`, v[`--${k}-foreground`]]])),
        '--color-scrim': v['--scrim'],
        '--color-photo-chip': v['--photo-chip'],
        '--color-photo-ink': v['--photo-ink'],
        ...Object.fromEntries(ROLE_TONE_KEYS.flatMap((k) => [[`--color-role-${k}`, v[`--role-${k}`]], [`--color-role-${k}-ink`, v[`--role-${k}-ink`]]])),
        '--font-sans': fontVar(bodyFont),
        '--font-heading': fontVar(headingFont),
        ...typeDefaultVars(),
        ...themeTypeVars(type, headingFont, bodyFont),
    };
}
