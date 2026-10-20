'use client';

import { useState } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import {
    THEME_EDITABLE_TOKENS, THEME_PRESET_KEYS,
    type ThemeEditableToken, type ThemeMode, type ThemePresetKey,
} from '@/lib/constants';
import { floorRatio, type ContrastIssue } from '@/lib/theme/contrast';
import type { DraftTheme } from '@/hooks/use-theme-draft';
import ColorField from './ColorField';
import ThemePresetCard from './ThemePresetCard';
import ThemeSample from './ThemeSample';

type Props = {
    theme: DraftTheme;
    issues: ContrastIssue[];
    disabled: boolean;
    onPreset: (key: ThemePresetKey) => void;
    onColor: (mode: ThemeMode, token: ThemeEditableToken, hex: string) => void;
};

const MODES = ['light', 'dark'] as const;

/** Krāsas: ready-made themes, the site colour and neutrals per mode, and a live sample. */
export default function ColoursPart({ theme, issues, disabled, onPreset, onColor }: Props) {
    const t = useTranslations('admin.design');
    const format = useFormatter();
    const [sampleMode, setSampleMode] = useState<ThemeMode>('light');
    const num = (n: number) => format.number(n, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

    return (
        <div className="space-y-8">
            <section aria-labelledby="design-colours">
                <h2 id="design-colours" className="text-[21px] font-semibold text-foreground">{t('parts.colours')}</h2>
                <p className="mt-1 text-sm text-foreground-muted">{t('colours.lead')}</p>
            </section>

            <section aria-labelledby="design-presets">
                <h3 id="design-presets" className="mb-3 text-base font-semibold text-foreground">{t('presetsTitle')}</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {THEME_PRESET_KEYS.map((key) => (
                        <ThemePresetCard key={key} presetKey={key} selected={theme.presetKey === key} disabled={disabled} onSelect={() => onPreset(key)} />
                    ))}
                </div>
                <p className="mt-3 text-[13px] text-foreground-muted">{t('presetResetsTones')}</p>
                {theme.presetKey === 'custom' && <p className="mt-2 text-sm font-semibold text-primary">{t('customActive')}</p>}
            </section>

            <div className="grid gap-4 lg:grid-cols-2">
                {MODES.map((mode) => (
                    <div key={mode}>
                        <fieldset className="space-y-3 rounded-2xl bg-surface p-4">
                            <legend className="px-2 text-sm font-semibold text-foreground">{t(`mode.${mode}`)}</legend>
                            {THEME_EDITABLE_TOKENS.map((token) => (
                                <ColorField key={token} label={t(`token.${token}`)} value={theme[mode][token]} disabled={disabled} onChange={(hex) => onColor(mode, token, hex)} />
                            ))}
                        </fieldset>
                        <ul className="mt-3 space-y-1 text-[13px] text-warning">
                            {issues.map((i) => i.part === 'colours' && i.mode === mode && (
                                <li key={i.pair}>{t('contrast.low', { pair: t(`contrast.pair.${i.pair}`), ratio: num(floorRatio(i.ratio)), min: num(i.min) })}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <section aria-labelledby="design-sample">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 id="design-sample" className="text-base font-semibold text-foreground">{t('sampleTitle')}</h3>
                    <div role="group" aria-label={t('sampleMode')} className="flex rounded-full bg-tint p-0.5">
                        {MODES.map((mode) => (
                            <button
                                key={mode}
                                type="button"
                                aria-pressed={sampleMode === mode}
                                onClick={() => setSampleMode(mode)}
                                className={clsx('min-h-8 rounded-full px-3 text-xs font-semibold', sampleMode === mode ? 'bg-primary text-primary-foreground' : 'text-foreground-muted')}
                            >
                                {t(`mode.${mode}`)}
                            </button>
                        ))}
                    </div>
                </div>
                <ThemeSample tokens={theme[sampleMode]} headingFont={theme.headingFont} bodyFont={theme.bodyFont} styleKey={theme.styleKey} dark={sampleMode === 'dark'} />
            </section>
        </div>
    );
}
