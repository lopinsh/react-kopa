import { unstable_cache } from 'next/cache';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ActionError } from '@/types/actions';
import {
    DEFAULT_THEME_KEY, DEFAULT_THEME_STYLE_KEY, THEME_CACHE_TAG, THEME_FONT_IDS, THEME_PRESETS, THEME_PRESET_KEYS, THEME_STYLE_KEYS,
    type ThemeFontId, type ThemeKey, type ThemeModeTokens, type ThemePresetKey, type ThemeStyleKey,
} from '@/lib/constants';
import { themeContrastIssues } from '@/lib/theme/contrast';
import { themeInputSchema, themeTypeSchema, type ThemeInput, type ThemeType } from '@/lib/validations/theme';

/** A resolved theme, ready for the layout and the Design page. */
export interface ThemeContext {
    /** Row id; null for the built-in default. */
    id: string | null;
    presetKey: ThemeKey;
    light: ThemeModeTokens;
    dark: ThemeModeTokens;
    headingFont: ThemeFontId;
    bodyFont: ThemeFontId;
    styleKey: ThemeStyleKey;
    /** The site's type tuning (R22); absent = today's type. Optional so a theme cached before it existed still renders. */
    type?: ThemeType;
    /** True when this is an admin's unpublished draft, not the site-wide theme. */
    isPreview: boolean;
}

function defaultTheme(): ThemeContext {
    const p = THEME_PRESETS[DEFAULT_THEME_KEY];
    return { id: null, presetKey: DEFAULT_THEME_KEY, light: p.light, dark: p.dark, headingFont: p.headingFont, bodyFont: p.bodyFont, styleKey: DEFAULT_THEME_STYLE_KEY, isPreview: false };
}

/** Rows come from JSON columns; anything that no longer validates falls back to the default look. */
function toContext(
    row: { id: string; presetKey: string; light: Prisma.JsonValue; dark: Prisma.JsonValue; headingFont: string; bodyFont: string; styleKey?: string | null; type?: Prisma.JsonValue | null },
    isPreview: boolean
): ThemeContext {
    // An unknown stored style key falls back to calm.
    const styleKey = (THEME_STYLE_KEYS as readonly string[]).includes(row.styleKey ?? '') ? row.styleKey : DEFAULT_THEME_STYLE_KEY;
    const parsed = themeInputSchema.safeParse({ presetKey: row.presetKey, light: row.light, dark: row.dark, headingFont: row.headingFont, bodyFont: row.bodyFont, styleKey });
    // A type value that no longer validates is dropped on its own; it never costs the whole theme its look.
    const typeParsed = themeTypeSchema.safeParse(row.type);
    const type = typeParsed.success ? typeParsed.data : undefined;
    if (!parsed.success || !THEME_FONT_IDS.includes(parsed.data.headingFont) || !THEME_FONT_IDS.includes(parsed.data.bodyFont)) return defaultTheme();
    const { presetKey } = parsed.data;
    // Code is the source for presets' colours and fonts, so a stored copy of an older preset follows the current values; `custom` keeps its own. The style comes from the row.
    if ((THEME_PRESET_KEYS as readonly string[]).includes(presetKey)) {
        const preset = THEME_PRESETS[presetKey as ThemePresetKey];
        return { id: row.id, presetKey, light: preset.light, dark: preset.dark, headingFont: preset.headingFont, bodyFont: preset.bodyFont, styleKey: parsed.data.styleKey, type, isPreview };
    }
    return { id: row.id, ...parsed.data, type, isPreview };
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
    return { presetKey: key, light: p.light, dark: p.dark, headingFont: p.headingFont, bodyFont: p.bodyFont, styleKey: p.styleKey };
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
    async saveDraft(adminId: string, input: ThemeInput): Promise<{ id: string }> {
        const parsed = themeInputSchema.safeParse(input);
        if (!parsed.success) throw new ActionError('VALIDATION_FAILED');
        if (themeContrastIssues(parsed.data).length > 0) throw new ActionError('CONTRAST_TOO_LOW');
        const created = await prisma.$transaction(async (tx) => {
            await tx.siteTheme.deleteMany({ where: { isPublished: false, updatedById: adminId } });
            return tx.siteTheme.create({ data: { ...parsed.data, type: parsed.data.type ?? Prisma.JsonNull, isPublished: false, updatedById: adminId } });
        });
        return { id: created.id };
    },

    /** Makes the given values the site-wide theme and drops the admin's draft. */
    async publish(adminId: string, input: ThemeInput): Promise<void> {
        const parsed = themeInputSchema.safeParse(input);
        if (!parsed.success) throw new ActionError('VALIDATION_FAILED');
        if (themeContrastIssues(parsed.data).length > 0) throw new ActionError('CONTRAST_TOO_LOW');
        await prisma.$transaction([
            prisma.siteTheme.deleteMany({ where: { OR: [{ isPublished: true }, { isPublished: false, updatedById: adminId }] } }),
            prisma.siteTheme.create({ data: { ...parsed.data, type: parsed.data.type ?? Prisma.JsonNull, isPublished: true, updatedById: adminId } }),
        ]);
        return;
    },

    /** Publishes the admin's saved draft. */
    async publishDraft(adminId: string, draftId: string): Promise<void> {
        const draft = await ThemeService.getDraft(draftId);
        if (!draft) throw new ActionError('NOT_FOUND');
        return ThemeService.publish(adminId, { presetKey: draft.presetKey, light: draft.light, dark: draft.dark, headingFont: draft.headingFont, bodyFont: draft.bodyFont, styleKey: draft.styleKey, type: draft.type });
    },

    /** Back to the default preset (Sūna) for everyone. */
    async reset(adminId: string): Promise<void> {
        return ThemeService.publish(adminId, presetInput(DEFAULT_THEME_KEY));
    },

    async discardDraft(adminId: string): Promise<void> {
        await prisma.siteTheme.deleteMany({ where: { isPublished: false, updatedById: adminId } });
    },
};
