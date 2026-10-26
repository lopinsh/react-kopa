import { z } from 'zod';
import { CATEGORY_TONE_SLUGS, ROLE_TONE_KEYS, THEME_FONT_IDS, THEME_KEYS, THEME_STYLE_KEYS, TYPE_EMPHASIS, TYPE_EMPHASIS_LIMITS, TYPE_ROLE_IDS } from '@/lib/constants';

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

const emphasisStepSchema = z.number().int().min(TYPE_EMPHASIS_LIMITS.min).max(TYPE_EMPHASIS_LIMITS.max).multipleOf(TYPE_EMPHASIS_LIMITS.step);
const emphasisDefault = (key: 'medium' | 'strong') => TYPE_EMPHASIS.find((e) => e.key === key)?.step ?? 0;

/**
 * The site's type tuning (R22): sparse and versioned; unset keys mean today's values (globals.css). Unknown keys are stripped.
 * Weights 100-1000 (the admin editor is an experiment tool; handbook defaults stay 400-600); the font's own weights decide at render (`snapWeight`). Sizes 8-120 px.
 */
export const themeTypeSchema = z.object({
    v: z.literal(1),
    base: z.number().min(15).max(17).multipleOf(0.5).optional(),
    contrast: z.number().min(0.8).max(1.25).optional(),
    headingWeight: z.number().int().min(100).max(1000).optional(),
    leading: z.enum(['compact', 'normal', 'airy']).optional(),
    tagCase: z.enum(['none', 'upper']).optional(),
    emphasis: z.object({
        medium: emphasisStepSchema.optional(),
        strong: emphasisStepSchema.optional(),
    }).refine((e) => (e.medium ?? emphasisDefault('medium')) <= (e.strong ?? emphasisDefault('strong'))).optional(),
    roles: z.partialRecord(z.enum(TYPE_ROLE_IDS), z.object({
        min: z.number().min(8).max(120).optional(),
        max: z.number().min(8).max(120).optional(),
        size: z.number().min(8).max(120).optional(),
        weight: z.number().int().min(100).max(1000).optional(),
        font: z.enum(['heading', 'body', ...THEME_FONT_IDS]).optional(),
    }).refine((r) => r.min === undefined || r.max === undefined || r.min <= r.max)).optional(),
});
export type ThemeType = z.infer<typeof themeTypeSchema>;

export const themeInputSchema = z.object({
    presetKey: z.enum(THEME_KEYS),
    light: themeModeTokensSchema,
    dark: themeModeTokensSchema,
    headingFont: z.enum(THEME_FONT_IDS),
    bodyFont: z.enum(THEME_FONT_IDS),
    styleKey: z.enum(THEME_STYLE_KEYS),
    type: themeTypeSchema.optional(),
});
export type ThemeInput = z.infer<typeof themeInputSchema>;
