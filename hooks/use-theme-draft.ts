'use client';

import { useMemo, useState } from 'react';
import {
    THEME_PRESETS,
    type CategoryToneSlug, type ThemeEditableToken, type ThemeFontId, type ThemeMode, type ThemePresetKey,
} from '@/lib/constants';
import { completeModeTokens, themeContrastIssues, type CompleteModeTokens, type ContrastIssue } from '@/lib/theme/contrast';
import type { ThemeInput } from '@/lib/validations/theme';

export type DraftTheme = Omit<ThemeInput, 'light' | 'dark'> & { light: CompleteModeTokens; dark: CompleteModeTokens };

/** The theme being edited on Admin > Dizains: every optional token filled in, any edit makes it custom. */
export function useThemeDraft(initial: ThemeInput) {
    const [theme, setTheme] = useState<DraftTheme>(() => ({
        ...initial,
        light: completeModeTokens(initial.light),
        dark: completeModeTokens(initial.dark),
    }));
    const issues: ContrastIssue[] = useMemo(() => themeContrastIssues(theme), [theme]);
    const tonesEdited = Object.keys(theme.light.categories ?? {}).length + Object.keys(theme.dark.categories ?? {}).length > 0;

    /** A ready-made theme: its values, completed; tones go back to the defaults. */
    const choosePreset = (key: ThemePresetKey) => {
        const p = THEME_PRESETS[key];
        setTheme({ presetKey: key, light: completeModeTokens(p.light), dark: completeModeTokens(p.dark), headingFont: p.headingFont, bodyFont: p.bodyFont });
    };

    const setColor = (mode: ThemeMode, token: ThemeEditableToken, hex: string) =>
        setTheme((prev) => ({ ...prev, presetKey: 'custom', [mode]: { ...prev[mode], [token]: hex } }));

    const setTone = (mode: ThemeMode, slug: CategoryToneSlug, hex: string) =>
        setTheme((prev) => ({ ...prev, presetKey: 'custom', [mode]: { ...prev[mode], categories: { ...prev[mode].categories, [slug]: hex } } }));

    const setFont = (which: 'headingFont' | 'bodyFont', id: ThemeFontId) =>
        setTheme((prev) => ({ ...prev, presetKey: 'custom', [which]: id }));

    return { theme, issues, tonesEdited, choosePreset, setColor, setTone, setFont };
}
