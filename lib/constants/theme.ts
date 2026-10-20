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
    /** Single-weight display face: as a heading it wins over the style's heading weight. */
    { id: 'archivo-black', label: 'Archivo Black', cssVar: '--font-archivo-black', weight: 400 },
] as const satisfies readonly { id: string; label: string; cssVar: string; weight?: number }[];
export type ThemeFontId = (typeof THEME_FONTS)[number]['id'];
export const THEME_FONT_IDS = THEME_FONTS.map((f) => f.id) as [ThemeFontId, ...ThemeFontId[]];

/** Shape tokens of a template (R13): corners, lines, shadows, press, heading weight. Palette and style are chosen apart. */
export const THEME_STYLE_KEYS = ['calm', 'bold'] as const;
export type ThemeStyleKey = (typeof THEME_STYLE_KEYS)[number];
export const DEFAULT_THEME_STYLE_KEY: ThemeStyleKey = 'calm';

export interface ThemeStyleTokens {
    /** Corner radii; null = Tailwind defaults from globals.css (calm emits nothing). `menu`/`item` are the two odd radii of menus. */
    radius: { md: string; lg: string; xl: string; '2xl': string; '3xl': string; '4xl': string; pill: string; menu: string; item: string } | null;
    lineWidth: string;
    /** Colour of edges and hard shadows: the soft divider colour or the ink. */
    ink: 'border' | 'foreground';
    /** Edge on things that have none today. */
    frameWidth: string;
    /** Hard shadow offsets (no blur); null = the soft shadows from globals.css. */
    shadowOffset: { card: string; control: string; premium: string; dialog: string } | null;
    pressShift: string;
    /** Room a clipping parent leaves for a hard shadow. */
    shadowRoom: string;
    headingWeight: number;
    /** Category tiles (card picture, row icon): a tint of the category tone or the solid tone. */
    tile: 'tint' | 'solid';
}

export const THEME_STYLES: Record<ThemeStyleKey, ThemeStyleTokens> = {
    calm: { radius: null, lineWidth: '1px', ink: 'border', frameWidth: '0px', shadowOffset: null, pressShift: '0px', shadowRoom: '0px', headingWeight: 600, tile: 'tint' },
    bold: {
        radius: { md: '4px', lg: '5px', xl: '6px', '2xl': '8px', '3xl': '10px', '4xl': '12px', pill: '6px', menu: '6px', item: '5px' },
        lineWidth: '2px', ink: 'foreground', frameWidth: '2px',
        shadowOffset: { card: '4px', control: '3px', premium: '5px', dialog: '6px' },
        pressShift: '3px', shadowRoom: '5px', headingWeight: 700, tile: 'solid',
    },
};

export interface ThemeDefinition {
    light: ThemeModeTokens;
    dark: ThemeModeTokens;
    headingFont: ThemeFontId;
    bodyFont: ThemeFontId;
    styleKey: ThemeStyleKey;
}

export const THEME_PRESET_KEYS = ['moss', 'sea', 'rye', 'sun'] as const;
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
        styleKey: 'calm',
    },
    sea: {
        label: 'Jūra',
        light: { primary: '#34586A', background: '#edf1f3', surface: '#f8fafb', foreground: '#14232b', muted: '#556872', border: '#d4dde2', categories: { travel: '#447141', dancing: '#985113', hobbies: '#916313', community: '#2D664C', politics: '#50483B', pets: '#6E5F41', art: '#6D4B8C', music: '#4E4A8F', religion: '#56616E', social: '#9A4431', games: '#7D4477', sports: '#395593', family: '#326180', wellbeing: '#36666C', education: '#746926' } },
        dark: { primary: '#7fb0c8', background: '#0e1316', surface: '#151c20', foreground: '#e8eff2', surfaceElevated: '#1d272c', muted: '#9db0b9', border: '#26343b', categories: { travel: '#6EC36C', dancing: '#D8A685', hobbies: '#CDAB6F', community: '#49C28C', politics: '#B6AFA1', pets: '#BBAE92', art: '#C3A5E0', music: '#ADAADE', religion: '#A4AFBB', social: '#DBA197', games: '#D29DCD', sports: '#9BAED9', family: '#86B4D3', wellbeing: '#60BAC4', education: '#BDB156' } },
        headingFont: 'literata',
        bodyFont: 'commissioner',
        styleKey: 'calm',
    },
    rye: {
        label: 'Rudzu maize',
        light: { primary: '#5E4A38', background: '#f1eeea', surface: '#fbfaf8', foreground: '#231c16', muted: '#6b5f54', border: '#ddd6cd', categories: { travel: '#56693A', dancing: '#914E3A', hobbies: '#905D34', community: '#406042', politics: '#4E453C', pets: '#6E5A46', art: '#5E5086', music: '#3F4E84', religion: '#535F68', social: '#8E454D', games: '#6E4977', sports: '#2C5884', family: '#316072', wellbeing: '#3C6360', education: '#796131' } },
        dark: { primary: '#c19a76', background: '#151210', surface: '#1e1a16', foreground: '#f0ebe5', surfaceElevated: '#27221d', muted: '#aa9f94', border: '#342d26', categories: { travel: '#8EB15A', dancing: '#CB9C8E', hobbies: '#C89E78', community: '#72B273', politics: '#AEA59C', pets: '#B5A28F', art: '#ADA1D4', music: '#9BA5CE', religion: '#9BA6AE', social: '#CA999F', games: '#BB9AC6', sports: '#8DA7C7', family: '#7FACBE', wellbeing: '#69AFAB', education: '#C1A15E' } },
        headingFont: 'literata',
        bodyFont: 'commissioner',
        styleKey: 'calm',
    },
    sun: {
        label: 'Saule',
        light: { primary: '#2B3FD6', background: '#FFF1B8', surface: '#FFFFFF', foreground: '#111111', surfaceElevated: '#FFFFFF', tint: '#FFE27A', muted: '#4A4536', border: '#C9BC8A', categories: { travel: '#457607', dancing: '#BA2F00', hobbies: '#A75904', community: '#096E3C', politics: '#5B4837', pets: '#815B30', art: '#8239A0', music: '#593CB0', religion: '#54647A', social: '#B71648', games: '#992C78', sports: '#314FB7', family: '#046595', wellbeing: '#026E74', education: '#876501' } },
        dark: { primary: '#FFD43B', background: '#14130F', surface: '#1E1C16', foreground: '#F6F1DE', surfaceElevated: '#28251D', tint: '#332C12', muted: '#BDB59C', border: '#3A362A', categories: { travel: '#79D108', dancing: '#FD9F88', hobbies: '#F7A551', community: '#0AD46F', politics: '#C9B6A4', pets: '#D5B28B', art: '#E0A0FB', music: '#BDABFF', religion: '#A9B9CC', social: '#F99BB0', games: '#F695D7', sports: '#9EB4FB', family: '#72C1F2', wellbeing: '#05CBD6', education: '#E4B009' } },
        headingFont: 'archivo-black',
        bodyFont: 'commissioner',
        styleKey: 'bold',
    },
};

/** Colours the custom editor offers, per mode. */
export const THEME_EDITABLE_TOKENS = ['primary', 'background', 'surface', 'foreground', 'muted', 'border', 'tint'] as const;
export type ThemeMode = 'light' | 'dark';
/** The five parts of Admin > Dizains (AR-69), in order: looks (ready-made), colours, category colours, shape, fonts. */
export const DESIGN_PARTS = ['looks', 'colours', 'categories', 'style', 'fonts'] as const;
export type DesignPart = (typeof DESIGN_PARTS)[number];
/** Contrast floor (Handbook, design.md): text AA everywhere; a dark-mode tone 7:1 with the dark background. */
export const THEME_CONTRAST_MIN = 4.5;
export const THEME_DARK_TONE_MIN = 7;
export type ThemeEditableToken = (typeof THEME_EDITABLE_TOKENS)[number];

export const THEME_PREVIEW_COOKIE = 'theme_preview';
export const THEME_CACHE_TAG = 'site-theme';
