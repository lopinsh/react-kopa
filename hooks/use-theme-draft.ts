'use client';

import { useMemo, useState } from 'react';
import {
    CATEGORY_TONE_SLUGS, THEME_PRESET_KEYS, THEME_PRESETS,
    type CategoryToneSlug, type ThemeEditableToken, type ThemeFontId, type ThemeMode, type ThemePresetKey, type ThemeStyleKey,
} from '@/lib/constants';
import { completeModeTokens, themeContrastIssues, type CompleteModeTokens, type ContrastIssue } from '@/lib/theme/contrast';
import type { ThemeInput, ThemeType } from '@/lib/validations/theme';

export type DraftTheme = Omit<ThemeInput, 'light' | 'dark'> & { light: CompleteModeTokens; dark: CompleteModeTokens };

/** The theme being edited on Admin > Dizains: every optional token filled in, any edit makes it custom. */
export function useThemeDraft(initial: ThemeInput) {
    const [theme, setTheme] = useState<DraftTheme>(() => ({
        ...initial,
        light: completeModeTokens(initial.light),
        dark: completeModeTokens(initial.dark),
    }));
    const issues: ContrastIssue[] = useMemo(() => themeContrastIssues(theme), [theme]);
    // Tones differ from every look's own set (a colour edit turns the look custom but keeps its tones), so unedited switching never asks.
    const tonesEdited = !THEME_PRESET_KEYS.some((key) => (['light', 'dark'] as const).every((mode) => {
        const own = theme[mode].categories ?? {};
        const base = THEME_PRESETS[key][mode].categories ?? {};
        return CATEGORY_TONE_SLUGS.every((slug) => (own[slug] ?? '').toLowerCase() === (base[slug] ?? '').toLowerCase());
    }));

    /** A ready-made theme: its values, completed; tones go back to the defaults. */
    const choosePreset = (key: ThemePresetKey) => {
        const p = THEME_PRESETS[key];
        // A look is colour, font and shape; the type tuning is separate and stays (only the site-wide reset clears it).
        setTheme((prev) => ({ type: prev.type, presetKey: key, light: completeModeTokens(p.light), dark: completeModeTokens(p.dark), headingFont: p.headingFont, bodyFont: p.bodyFont, styleKey: p.styleKey }));
    };

    const setColor = (mode: ThemeMode, token: ThemeEditableToken, hex: string) =>
        setTheme((prev) => ({ ...prev, presetKey: 'custom', [mode]: { ...prev[mode], [token]: hex } }));

    const setTone = (mode: ThemeMode, slug: CategoryToneSlug, hex: string) =>
        setTheme((prev) => ({ ...prev, presetKey: 'custom', [mode]: { ...prev[mode], categories: { ...prev[mode].categories, [slug]: hex } } }));

    const setFont = (which: 'headingFont' | 'bodyFont', id: ThemeFontId) =>
        setTheme((prev) => ({ ...prev, presetKey: 'custom', [which]: id }));

    /** The style alone (calm/bold); colours and fonts stay as they are, so a preset keeps its name. */
    const setStyle = (styleKey: ThemeStyleKey) => setTheme((prev) => ({ ...prev, styleKey }));

    /** The type tuning (R22-2's Burti page); does not touch the look's name. */
    const setType = (type: ThemeType | undefined) => setTheme((prev) => ({ ...prev, type }));

    return { theme, issues, tonesEdited, choosePreset, setStyle, setColor, setTone, setFont, setType };
}
