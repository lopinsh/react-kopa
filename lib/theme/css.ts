import {
    CATEGORY_TONES, CATEGORY_TONE_SLUGS, THEME_FONTS, THEME_STYLES,
    type ThemeDefinition, type ThemeFontId, type ThemeModeTokens, type ThemeStyleKey, type ThemeStyleTokens,
} from '@/lib/constants';
import { getLuminance, hexToRgb } from '@/lib/color-utils';

/** White text unless the colour is clearly light (Sūna's light primary keeps white, its light-sage dark primary gets near-black). */
export function onPrimary(hex: string): string {
    const rgb = hexToRgb(hex);
    return rgb && getLuminance(rgb.r, rgb.g, rgb.b) > 0.22 ? '#111111' : '#ffffff';
}

type Vars = Record<string, string>;

function fontVar(id: ThemeFontId): string {
    const font = THEME_FONTS.find((f) => f.id === id) ?? THEME_FONTS[0];
    return `var(${font.cssVar})`;
}

/** Soft shadows of calm (globals.css), repeated where a sample must not inherit the root's style. */
const CALM_SHADOWS = {
    card: 'none',
    control: 'none',
    premium: '0 10px 28px rgba(0, 0, 0, 0.12)',
    dialog: '0 14px 34px rgba(0, 0, 0, 0.25)',
};
/** Tailwind's default radii, repeated for the same reason. */
const CALM_RADII = { md: '0.375rem', lg: '0.5rem', xl: '0.75rem', '2xl': '1rem', '3xl': '1.5rem', '4xl': '2rem', pill: '9999px', menu: '14px', item: '10px' };

/** The ink: the soft divider colour in calm, the foreground (dark mode: 85 % of it) in bold. */
function inkValue(style: ThemeStyleTokens, mode: 'light' | 'dark'): string {
    if (style.ink === 'border') return 'var(--border)';
    return mode === 'dark' ? 'color-mix(in srgb, var(--foreground) 85%, var(--background))' : 'var(--foreground)';
}

/**
 * The style tokens as CSS variables (R13). Calm (`radius`/`shadowOffset` null) emits no radii and shadows: those stay at the
 * globals.css values, which is what keeps it identical to the site before styles existed.
 * `withDefaults` also writes the calm radii and shadows (for the editor's sample, which must not inherit the root's style).
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
        // Active/open edges (chosen chip, open filter): the ink in bold; calm leaves it unset so each element's own fallback colour applies.
        ...(style.ink === 'foreground' ? { '--line-active': 'var(--ink)' } : withDefaults ? { '--line-active': 'initial' } : {}),
        '--heading-weight': String(weight),
    };
    // Tile tone shares; the cat-tile utility mixes them with --c per card (a var(--c) here would resolve at the root).
    if (style.tile === 'solid') {
        vars['--tile-mix'] = '100%';
        vars['--tile-on'] = '100%';
    } else if (withDefaults) {
        vars['--tile-mix'] = '20%';
        vars['--tile-on'] = '0%';
    }
    const radius = style.radius ?? (withDefaults ? CALM_RADII : null);
    if (radius) {
        for (const [k, v] of Object.entries(radius)) vars[`--radius-${k}`] = v;
    }
    const off = style.shadowOffset;
    if (off) {
        vars['--shadow-card'] = `${off.card} ${off.card} 0 0 var(--ink)`;
        vars['--shadow-control'] = `${off.control} ${off.control} 0 0 var(--ink)`;
        vars['--shadow-premium'] = `${off.premium} ${off.premium} 0 0 var(--ink)`;
        vars['--shadow-dialog'] = `${off.dialog} ${off.dialog} 0 0 var(--ink)`;
    } else if (withDefaults) {
        vars['--shadow-card'] = CALM_SHADOWS.card;
        vars['--shadow-control'] = CALM_SHADOWS.control;
        vars['--shadow-premium'] = CALM_SHADOWS.premium;
        vars['--shadow-dialog'] = CALM_SHADOWS.dialog;
    }
    return vars;
}

/** The design tokens of one mode as CSS variables. Missing optional tokens are mixed from foreground and background. */
export function themeModeVars(t: ThemeModeTokens, mode: 'light' | 'dark'): Vars {
    const tones: Vars = {};
    for (const slug of CATEGORY_TONE_SLUGS) tones[`--cat-${slug}`] = t.categories?.[slug] ?? CATEGORY_TONES[slug][mode];
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
        ...tones,
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
        }),
        block('html.dark:root', { ...themeModeVars(def.dark, 'dark'), ...(style.ink === 'foreground' ? { '--ink': inkValue(style, 'dark') } : {}) }),
    ].join('\n');
}

/**
 * Variables for the live sample in the editor. Tailwind's `--color-*` tokens are resolved at the root,
 * so they are set again here for the sample area to follow its own colours.
 */
export function themeSampleVars(tokens: ThemeModeTokens, headingFont: ThemeFontId, bodyFont: ThemeFontId, mode: 'light' | 'dark', styleKey: ThemeStyleKey = 'calm'): Vars {
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
        '--font-sans': fontVar(bodyFont),
        '--font-heading': fontVar(headingFont),
    };
}
