import { unstable_cache } from 'next/cache';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { ErrorCode } from '@/types/actions';
import {
    DEFAULT_THEME_KEY, THEME_CACHE_TAG, THEME_FONT_IDS, THEME_PRESETS, THEME_PRESET_KEYS,
    type ThemeFontId, type ThemeKey, type ThemeModeTokens, type ThemePresetKey,
} from '@/lib/constants';
import { themeInputSchema, type ThemeInput } from '@/lib/validations/theme';

/** A resolved theme, ready for the layout and the Design page. */
export interface ThemeContext {
    /** Row id; null for the built-in default. */
    id: string | null;
    presetKey: ThemeKey;
    light: ThemeModeTokens;
    dark: ThemeModeTokens;
    headingFont: ThemeFontId;
    bodyFont: ThemeFontId;
    /** True when this is an admin's unpublished draft, not the site-wide theme. */
    isPreview: boolean;
}

export type ThemeResult<T = void> =
    | { success: true; data?: T }
    | { success: false; error: ErrorCode };

function defaultTheme(): ThemeContext {
    const p = THEME_PRESETS[DEFAULT_THEME_KEY];
    return { id: null, presetKey: DEFAULT_THEME_KEY, light: p.light, dark: p.dark, headingFont: p.headingFont, bodyFont: p.bodyFont, isPreview: false };
}

/** Rows come from JSON columns; anything that no longer validates falls back to the default look. */
function toContext(
    row: { id: string; presetKey: string; light: Prisma.JsonValue; dark: Prisma.JsonValue; headingFont: string; bodyFont: string },
    isPreview: boolean
): ThemeContext {
    const parsed = themeInputSchema.safeParse({ presetKey: row.presetKey, light: row.light, dark: row.dark, headingFont: row.headingFont, bodyFont: row.bodyFont });
    if (!parsed.success || !THEME_FONT_IDS.includes(parsed.data.headingFont) || !THEME_FONT_IDS.includes(parsed.data.bodyFont)) return defaultTheme();
    const { presetKey } = parsed.data;
    // Code is the source for presets, so a stored copy of an older preset follows the current values; `custom` keeps its own.
    if ((THEME_PRESET_KEYS as readonly string[]).includes(presetKey)) {
        const preset = THEME_PRESETS[presetKey as ThemePresetKey];
        return { id: row.id, presetKey, light: preset.light, dark: preset.dark, headingFont: preset.headingFont, bodyFont: preset.bodyFont, isPreview };
    }
    return { id: row.id, ...parsed.data, isPreview };
}

/**
 * The published theme is read once and cached under a tag. Publishing expires the tag at once; the timer only
 * covers changes made outside the app. A failed read throws, is not cached, and the caller falls back to the default look.
 */
const loadPublished = unstable_cache(
    async (): Promise<ThemeContext> => {
        const row = await prisma.siteTheme.findFirst({ where: { isPublished: true }, orderBy: { updatedAt: 'desc' } });
        return row ? toContext(row, false) : defaultTheme();
    },
    ['site-theme-published'],
    { tags: [THEME_CACHE_TAG], revalidate: 300 }
);

function presetInput(key: typeof DEFAULT_THEME_KEY): ThemeInput {
    const p = THEME_PRESETS[key];
    return { presetKey: key, light: p.light, dark: p.dark, headingFont: p.headingFont, bodyFont: p.bodyFont };
}

export const ThemeService = {
    /** The site-wide theme. Never throws: a failed read gives the default look. */
    async getPublished(): Promise<ThemeContext> {
        try {
            return await loadPublished();
        } catch (error) {
            console.error('[theme] could not read the published theme, using the default look', error);
            return defaultTheme();
        }
    },

    /** An admin's own draft by id; null when it is gone or unreadable. */
    async getDraft(id: string): Promise<ThemeContext | null> {
        try {
            const row = await prisma.siteTheme.findFirst({ where: { id, isPublished: false } });
            return row ? toContext(row, true) : null;
        } catch (error) {
            console.error('[theme] could not read the preview draft', error);
            return null;
        }
    },

    /** Saves the admin's preview. Each admin keeps one draft at a time. */
    async saveDraft(adminId: string, input: ThemeInput): Promise<ThemeResult<{ id: string }>> {
        const parsed = themeInputSchema.safeParse(input);
        if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };
        const created = await prisma.$transaction(async (tx) => {
            await tx.siteTheme.deleteMany({ where: { isPublished: false, updatedById: adminId } });
            return tx.siteTheme.create({ data: { ...parsed.data, isPublished: false, updatedById: adminId } });
        });
        return { success: true, data: { id: created.id } };
    },

    /** Makes the given values the site-wide theme and drops the admin's draft. */
    async publish(adminId: string, input: ThemeInput): Promise<ThemeResult> {
        const parsed = themeInputSchema.safeParse(input);
        if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };
        await prisma.$transaction([
            prisma.siteTheme.deleteMany({ where: { OR: [{ isPublished: true }, { isPublished: false, updatedById: adminId }] } }),
            prisma.siteTheme.create({ data: { ...parsed.data, isPublished: true, updatedById: adminId } }),
        ]);
        return { success: true };
    },

    /** Publishes the admin's saved draft. */
    async publishDraft(adminId: string, draftId: string): Promise<ThemeResult> {
        const draft = await ThemeService.getDraft(draftId);
        if (!draft) return { success: false, error: 'NOT_FOUND' };
        return ThemeService.publish(adminId, { presetKey: draft.presetKey, light: draft.light, dark: draft.dark, headingFont: draft.headingFont, bodyFont: draft.bodyFont });
    },

    /** Back to the default preset (Sūna) for everyone. */
    async reset(adminId: string): Promise<ThemeResult> {
        return ThemeService.publish(adminId, presetInput(DEFAULT_THEME_KEY));
    },

    async discardDraft(adminId: string): Promise<void> {
        await prisma.siteTheme.deleteMany({ where: { isPublished: false, updatedById: adminId } });
    },
};
