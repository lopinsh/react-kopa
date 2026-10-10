import { THEME_FONTS, type ThemeDefinition, type ThemeFontId, type ThemeModeTokens } from '@/lib/constants';
import { getLuminance, hexToRgb } from '@/lib/color-utils';

/** White text unless the colour is clearly light; today's indigo (#6366f1) keeps white. */
function onPrimary(hex: string): string {
    const rgb = hexToRgb(hex);
    return rgb && getLuminance(rgb.r, rgb.g, rgb.b) > 0.22 ? '#111111' : '#ffffff';
}

type Vars = Record<string, string>;

function fontVar(id: ThemeFontId): string {
    const font = THEME_FONTS.find((f) => f.id === id) ?? THEME_FONTS[0];
    return `var(${font.cssVar})`;
}

/** The design tokens of one mode as CSS variables. Missing optional tokens are mixed from foreground and background. */
export function themeModeVars(t: ThemeModeTokens): Vars {
    return {
        '--primary': t.primary,
        '--primary-foreground': onPrimary(t.primary),
        '--background': t.background,
        '--surface': t.surface,
        '--surface-elevated': t.surfaceElevated ?? t.surface,
        '--foreground': t.foreground,
        '--foreground-muted': t.muted ?? `color-mix(in srgb, ${t.foreground} 60%, ${t.background})`,
        '--border': t.border ?? `color-mix(in srgb, ${t.foreground} 12%, ${t.background})`,
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
    return [
        block('html:root', {
            ...themeModeVars(def.light),
            '--theme-font-heading': fontVar(def.headingFont),
            '--theme-font-body': fontVar(def.bodyFont),
        }),
        block('html.dark:root', themeModeVars(def.dark)),
    ].join('\n');
}

/**
 * Variables for the live sample in the editor. Tailwind's `--color-*` tokens are resolved at the root,
 * so they are set again here for the sample area to follow its own colours.
 */
export function themeSampleVars(tokens: ThemeModeTokens, headingFont: ThemeFontId, bodyFont: ThemeFontId): Vars {
    const v = themeModeVars(tokens);
    return {
        ...v,
        '--color-primary': v['--primary'],
        '--color-primary-foreground': v['--primary-foreground'],
        '--color-background': v['--background'],
        '--color-surface': v['--surface'],
        '--color-surface-elevated': v['--surface-elevated'],
        '--color-foreground': v['--foreground'],
        '--color-foreground-muted': v['--foreground-muted'],
        '--color-border': v['--border'],
        '--font-sans': fontVar(bodyFont),
        '--font-heading': fontVar(headingFont),
    };
}
