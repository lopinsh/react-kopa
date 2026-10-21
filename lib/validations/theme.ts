import { z } from 'zod';
import { CATEGORY_TONE_SLUGS, ROLE_TONE_KEYS, THEME_FONT_IDS, THEME_KEYS, THEME_STYLE_KEYS } from '@/lib/constants';

/** Only 6-digit hex values are accepted, so a stored theme can never carry anything else into the page's CSS. */
export const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);

/** #RRGGBB or #RRGGBBAA (overlays carry an alpha). */
const overlayColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?$/);

export const themeModeTokensSchema = z.object({
    primary: hexColorSchema,
    background: hexColorSchema,
    surface: hexColorSchema,
    foreground: hexColorSchema,
    surfaceElevated: hexColorSchema.optional(),
    muted: hexColorSchema.optional(),
    border: hexColorSchema.optional(),
    tint: hexColorSchema.optional(),
    categories: z.partialRecord(z.enum(CATEGORY_TONE_SLUGS), hexColorSchema).optional(),
    roles: z.partialRecord(z.enum(ROLE_TONE_KEYS), hexColorSchema).optional(),
    danger: hexColorSchema.optional(),
    success: hexColorSchema.optional(),
    warning: hexColorSchema.optional(),
    scrim: overlayColorSchema.optional(),
    photoChip: overlayColorSchema.optional(),
});

export const themeInputSchema = z.object({
    presetKey: z.enum(THEME_KEYS),
    light: themeModeTokensSchema,
    dark: themeModeTokensSchema,
    headingFont: z.enum(THEME_FONT_IDS),
    bodyFont: z.enum(THEME_FONT_IDS),
    styleKey: z.enum(THEME_STYLE_KEYS),
});
export type ThemeInput = z.infer<typeof themeInputSchema>;
