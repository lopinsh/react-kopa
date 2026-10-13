import {
    CATEGORY_TONES, CATEGORY_TONE_SLUGS, THEME_CONTRAST_MIN, THEME_DARK_TONE_MIN,
    type CategoryToneSlug, type ThemeDefinition, type ThemeMode, type ThemeModeTokens,
} from '@/lib/constants';
import { contrastRatio, mixHex } from '@/lib/color-utils';
import { onPrimary } from '@/lib/theme/css';

export type CompleteModeTokens = ThemeModeTokens & Required<Pick<ThemeModeTokens, 'surfaceElevated' | 'muted' | 'border' | 'tint'>>;

/** Fills the optional tokens with what `themeModeVars` would mix (same weights: muted 60, border 12, tint 8; surfaceElevated = surface). */
export function completeModeTokens(t: ThemeModeTokens): CompleteModeTokens {
    return {
        ...t,
        surfaceElevated: t.surfaceElevated ?? t.surface,
        muted: t.muted ?? mixHex(t.foreground, t.background, 60),
        border: t.border ?? mixHex(t.foreground, t.background, 12),
        tint: t.tint ?? mixHex(t.foreground, t.background, 8),
    };
}

export const SITE_CONTRAST_PAIRS = [
    'textOnBackground', 'textOnSurface', 'textOnTint', 'mutedOnBackground',
    'mutedOnSurface', 'linkOnBackground', 'linkOnSurface', 'textOnButton',
] as const;
export type SiteContrastPair = (typeof SITE_CONTRAST_PAIRS)[number];

function pairRatio(c: CompleteModeTokens, pair: SiteContrastPair): number {
    switch (pair) {
        case 'textOnBackground': return contrastRatio(c.foreground, c.background);
        case 'textOnSurface': return contrastRatio(c.foreground, c.surface);
        case 'textOnTint': return contrastRatio(c.foreground, c.tint);
        case 'mutedOnBackground': return contrastRatio(c.muted, c.background);
        case 'mutedOnSurface': return contrastRatio(c.muted, c.surface);
        case 'linkOnBackground': return contrastRatio(c.primary, c.background);
        case 'linkOnSurface': return contrastRatio(c.primary, c.surface);
        case 'textOnButton': return contrastRatio(onPrimary(c.primary), c.primary);
    }
}

/** The tone the theme uses for a slug and mode (stored, else the default). */
export function toneHex(t: ThemeModeTokens, slug: CategoryToneSlug, mode: ThemeMode): string {
    return t.categories?.[slug] ?? CATEGORY_TONES[slug][mode];
}

function toneRatio(t: ThemeModeTokens, slug: CategoryToneSlug, mode: ThemeMode): number {
    const tone = toneHex(t, slug, mode);
    return mode === 'light' ? contrastRatio('#ffffff', tone) : contrastRatio(t.background, tone);
}

/** Light: white on the light tone (>= 4.5). Dark: the dark background (= --on-cat) on the dark tone (>= 7). */
export function toneContrast(def: ThemeDefinition, slug: CategoryToneSlug): { light: number; dark: number; lightOk: boolean; darkOk: boolean } {
    const light = toneRatio(def.light, slug, 'light');
    const dark = toneRatio(def.dark, slug, 'dark');
    return { light, dark, lightOk: light >= THEME_CONTRAST_MIN, darkOk: dark >= THEME_DARK_TONE_MIN };
}

export type ContrastIssue =
    | { part: 'colours'; mode: ThemeMode; pair: SiteContrastPair; ratio: number; min: number }
    | { part: 'categories'; mode: ThemeMode; slug: CategoryToneSlug; ratio: number; min: number };

/** Every pair below the floor: site colours (both modes, all 8 pairs at 4.5), then tones (15 x 2). Empty = can be saved. */
export function themeContrastIssues(def: ThemeDefinition): ContrastIssue[] {
    const issues: ContrastIssue[] = [];
    for (const mode of ['light', 'dark'] as const) {
        const c = completeModeTokens(def[mode]);
        for (const pair of SITE_CONTRAST_PAIRS) {
            const ratio = pairRatio(c, pair);
            if (ratio < THEME_CONTRAST_MIN) issues.push({ part: 'colours', mode, pair, ratio, min: THEME_CONTRAST_MIN });
        }
    }
    for (const slug of CATEGORY_TONE_SLUGS) {
        for (const mode of ['light', 'dark'] as const) {
            const ratio = toneRatio(def[mode], slug, mode);
            const min = mode === 'light' ? THEME_CONTRAST_MIN : THEME_DARK_TONE_MIN;
            if (ratio < min) issues.push({ part: 'categories', mode, slug, ratio, min });
        }
    }
    return issues;
}

/** Ratio as shown to people: cut, not rounded, to one decimal, so 4.46 never shows as a passing 4.5. */
export function floorRatio(ratio: number): number {
    return Math.floor(ratio * 10) / 10;
}
