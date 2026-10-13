/**
 * Site themes: ready-made presets and the fonts the admin can pick from (Admin > Design).
 * A theme is colours for light and dark mode plus a heading font and a body font.
 * Category colours (`--cat-*`) are part of a theme, per mode; missing ones come from `CATEGORY_TONES`.
 */

/** The 15 main categories that have a designed tone (AR-05), in display order. */
export const CATEGORY_TONE_SLUGS = [
    'travel', 'dancing', 'hobbies', 'community', 'politics', 'pets', 'art', 'music',
    'religion', 'social', 'games', 'sports', 'family', 'wellbeing', 'education',
] as const;
export type CategoryToneSlug = (typeof CATEGORY_TONE_SLUGS)[number];

/** Default tone of each main category, light and dark (text on tone: white / near-black, both pass AA). */
export const CATEGORY_TONES: Record<CategoryToneSlug, { light: string; dark: string }> = {
    travel: { light: '#4F7330', dark: '#7BBF40' },
    dancing: { light: '#A9452C', dark: '#E09B8A' },
    hobbies: { light: '#A55A12', dark: '#DB9F66' },
    community: { light: '#2F6A45', dark: '#44C172' },
    politics: { light: '#57493D', dark: '#B8AA9D' },
    pets: { light: '#7A5E40', dark: '#C1A78B' },
    art: { light: '#7A4790', dark: '#CA9CDE' },
    music: { light: '#57479A', dark: '#AFA3E0' },
    religion: { light: '#586474', dark: '#A0ACBA' },
    social: { light: '#A53A50', dark: '#DD98A6' },
    games: { light: '#8C3F72', dark: '#DB94C3' },
    sports: { light: '#3B55A0', dark: '#98A9DD' },
    family: { light: '#2B6489', dark: '#7BB2D6' },
    wellbeing: { light: '#2E6B6F', dark: '#47BAC2' },
    education: { light: '#86650E', dark: '#D0A535' },
};

/** Colours of one mode. The ones after `foreground` are optional: when missing they are derived from the others. */
export interface ThemeModeTokens {
    /** Site colour: buttons, links, active tabs (`--primary`). */
    primary: string;
    background: string;
    surface: string;
    foreground: string;
    surfaceElevated?: string;
    muted?: string;
    border?: string;
    /** Quiet fill (secondary buttons, hover, weekend columns). */
    tint?: string;
    /** Tone per main category; missing ones come from `CATEGORY_TONES`. */
    categories?: Partial<Record<CategoryToneSlug, string>>;
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

export const THEME_PRESET_KEYS = ['moss', 'sea', 'rye'] as const;
export type ThemePresetKey = (typeof THEME_PRESET_KEYS)[number];
/** A saved theme is either one of the presets or edited by hand. */
export const THEME_KEYS = [...THEME_PRESET_KEYS, 'custom'] as const;
export type ThemeKey = (typeof THEME_KEYS)[number];
/** The default look (Sūna); also the fallback when nothing is saved. */
export const DEFAULT_THEME_KEY: ThemePresetKey = 'moss';

export const THEME_PRESETS: Record<ThemePresetKey, ThemeDefinition & { label: string }> = {
    moss: {
        label: 'Sūna',
        light: { primary: '#4B5E3B', background: '#f4f4ef', surface: '#fdfdfb', foreground: '#1f221c', surfaceElevated: '#fdfdfb', tint: '#e8eae1', muted: '#5f6558', border: '#dcdfd4' },
        dark: { primary: '#b5c79e', background: '#161814', surface: '#1e211c', foreground: '#eceee7', surfaceElevated: '#282c25', tint: '#282c25', muted: '#a8ae9f', border: '#353a31' },
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
export const THEME_EDITABLE_TOKENS = ['primary', 'background', 'surface', 'foreground', 'muted', 'border', 'tint'] as const;
export type ThemeMode = 'light' | 'dark';
/** The three parts of Admin > Dizains (AR-69), in order. */
export const DESIGN_PARTS = ['colours', 'categories', 'fonts'] as const;
export type DesignPart = (typeof DESIGN_PARTS)[number];
/** Contrast floor (Handbook, design.md): text AA everywhere; a dark-mode tone 7:1 with the dark background. */
export const THEME_CONTRAST_MIN = 4.5;
export const THEME_DARK_TONE_MIN = 7;
export type ThemeEditableToken = (typeof THEME_EDITABLE_TOKENS)[number];

export const THEME_PREVIEW_COOKIE = 'theme_preview';
export const THEME_CACHE_TAG = 'site-theme';
