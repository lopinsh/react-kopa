'use client';

import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';
import { THEME_FONTS, THEME_PRESETS, type ThemeFontId, type ThemePresetKey } from '@/lib/constants';

function fontVar(id: ThemeFontId): string {
    return `var(${THEME_FONTS.find((f) => f.id === id)?.cssVar ?? '--font-geist-sans'})`;
}

type Props = { presetKey: ThemePresetKey; selected: boolean; disabled: boolean; onSelect: () => void };

/** A ready-made theme: swatches for light and dark, and a sample of its fonts. */
export default function ThemePresetCard({ presetKey, selected, disabled, onSelect }: Props) {
    const t = useTranslations('admin.design');
    const p = THEME_PRESETS[presetKey];
    const swatches = [p.light.primary, p.light.background, p.light.surface, p.dark.primary, p.dark.background, p.dark.surface];

    return (
        <button
            type="button"
            onClick={onSelect}
            disabled={disabled}
            aria-pressed={selected}
            style={{ '--sample-heading': fontVar(p.headingFont), '--sample-body': fontVar(p.bodyFont) } as React.CSSProperties}
            className={clsx(
                'relative flex flex-col gap-3 rounded-2xl border-2 bg-surface p-4 text-left transition-colors disabled:opacity-60',
                selected ? 'border-primary' : 'border-border hover:border-foreground-muted'
            )}
        >
            {selected && <Check className="absolute right-3 top-3 h-5 w-5 text-primary" aria-hidden="true" />}
            <span className="text-sm font-bold text-foreground">{t(`presets.${presetKey}`)}</span>
            <span className="flex gap-1.5" aria-hidden="true">
                {swatches.map((hex, i) => (
                    <span key={i} style={{ '--sw': hex } as React.CSSProperties} className="h-7 w-7 rounded-full border border-border bg-[var(--sw)]" />
                ))}
            </span>
            <span className="block">
                <span className="block text-xl font-bold text-foreground [font-family:var(--sample-heading)]">{t('fontSampleHeading')}</span>
                <span className="mt-1 block text-sm text-foreground-muted [font-family:var(--sample-body)]">{t('fontSampleBody')}</span>
            </span>
        </button>
    );
}
