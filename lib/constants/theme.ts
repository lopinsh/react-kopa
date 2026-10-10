/**
 * Site themes: ready-made presets and the fonts the admin can pick from (Admin > Design).
 * A theme is colours for light and dark mode plus a heading font and a body font.
 * Category colours (`--color-cat-*`) are not part of a theme.
 */

/** Colours of one mode. The last three are optional: when missing they are derived from the others. */
export interface ThemeModeTokens {
    /** Site colour: buttons, links, active tabs (`--primary`). */
    primary: string;
    background: string;
    surface: string;
    foreground: string;
    surfaceElevated?: string;
    muted?: string;
    border?: string;
}

/** Fonts with full Latvian (latin-ext) support. `cssVar` is the variable next/font exposes (see lib/theme-fonts.ts). */
export const THEME_FONTS = [
    { id: 'geist', label: 'Geist', cssVar: '--font-geist-sans' },
    { id: 'literata', label: 'Literata', cssVar: '--font-literata' },
    { id: 'commissioner', label: 'Commissioner', cssVar: '--font-commissioner' },
    { id: 'atkinson', label: 'Atkinson Hyperlegible', cssVar: '--font-atkinson' },
    { id: 'alegreya-sans', label: 'Alegreya Sans', cssVar: '--font-alegreya-sans' },
    { id: 'source-serif', label: 'Source Serif 4', cssVar: '--font-source-serif' },
    { id: 'lora', label: 'Lora', cssVar: '--font-lora' },
    { id: 'nunito-sans', label: 'Nunito Sans', cssVar: '--font-nunito-sans' },
] as const;
export type ThemeFontId = (typeof THEME_FONTS)[number]['id'];
export const THEME_FONT_IDS = THEME_FONTS.map((f) => f.id) as [ThemeFontId, ...ThemeFontId[]];

export interface ThemeDefinition {
    light: ThemeModeTokens;
    dark: ThemeModeTokens;
    headingFont: ThemeFontId;
    bodyFont: ThemeFontId;
}

export const THEME_PRESET_KEYS = ['current', 'moss', 'sea', 'rye'] as const;
export type ThemePresetKey = (typeof THEME_PRESET_KEYS)[number];
/** A saved theme is either one of the presets or edited by hand. */
export const THEME_KEYS = [...THEME_PRESET_KEYS, 'custom'] as const;
export type ThemeKey = (typeof THEME_KEYS)[number];
/** The look before the Design section existed; also the fallback when nothing is saved. */
export const DEFAULT_THEME_KEY: ThemePresetKey = 'current';

export const THEME_PRESETS: Record<ThemePresetKey, ThemeDefinition & { label: string }> = {
    current: {
        label: 'Pašreizējais',
        light: { primary: '#6366f1', background: '#f1f5f9', surface: '#ffffff', foreground: '#0f172a', surfaceElevated: '#ffffff', muted: '#64748b', border: '#e2e8f0' },
        dark: { primary: '#6366f1', background: '#0d0d12', surface: '#16161f', foreground: '#f8fafc', surfaceElevated: '#1e1e2a', muted: '#94a3b8', border: '#1e293b' },
        headingFont: 'geist',
        bodyFont: 'geist',
    },
    moss: {
        label: 'Sūna',
        light: { primary: '#4B5E3B', background: '#eef0e8', surface: '#fafbf7', foreground: '#1c2418', muted: '#5d6856', border: '#d9ddd0' },
        dark: { primary: '#8fa878', background: '#12150f', surface: '#1b1f16', foreground: '#eef1e8', surfaceElevated: '#232819', muted: '#a3ac98', border: '#2c3324' },
        headingFont: 'literata',
        bodyFont: 'commissioner',
    },
    sea: {
        label: 'Jūra',
        light: { primary: '#34586A', background: '#edf1f3', surface: '#f8fafb', foreground: '#14232b', muted: '#556872', border: '#d4dde2' },
        dark: { primary: '#7fb0c8', background: '#0e1316', surface: '#151c20', foreground: '#e8eff2', surfaceElevated: '#1d272c', muted: '#9db0b9', border: '#26343b' },
        headingFont: 'literata',
        bodyFont: 'commissioner',
    },
    rye: {
        label: 'Rudzu maize',
        light: { primary: '#5E4A38', background: '#f1eeea', surface: '#fbfaf8', foreground: '#231c16', muted: '#6b5f54', border: '#ddd6cd' },
        dark: { primary: '#c19a76', background: '#151210', surface: '#1e1a16', foreground: '#f0ebe5', surfaceElevated: '#27221d', muted: '#aa9f94', border: '#342d26' },
        headingFont: 'literata',
        bodyFont: 'commissioner',
    },
};

/** Colours the custom editor offers, per mode. */
export const THEME_EDITABLE_TOKENS = ['primary', 'background', 'surface', 'foreground'] as const;
export type ThemeEditableToken = (typeof THEME_EDITABLE_TOKENS)[number];

export const THEME_PREVIEW_COOKIE = 'theme_preview';
export const THEME_CACHE_TAG = 'site-theme';
