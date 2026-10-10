import { z } from 'zod';
import { THEME_FONT_IDS, THEME_KEYS } from '@/lib/constants';

/** Only 6-digit hex values are accepted, so a stored theme can never carry anything else into the page's CSS. */
export const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const themeModeTokensSchema = z.object({
    primary: hexColorSchema,
    background: hexColorSchema,
    surface: hexColorSchema,
    foreground: hexColorSchema,
    surfaceElevated: hexColorSchema.optional(),
    muted: hexColorSchema.optional(),
    border: hexColorSchema.optional(),
});

export const themeInputSchema = z.object({
    presetKey: z.enum(THEME_KEYS),
    light: themeModeTokensSchema,
    dark: themeModeTokensSchema,
    headingFont: z.enum(THEME_FONT_IDS),
    bodyFont: z.enum(THEME_FONT_IDS),
});
export type ThemeInput = z.infer<typeof themeInputSchema>;
