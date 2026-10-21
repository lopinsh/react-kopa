'use client';

import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';
import { CATEGORY_TONE_SLUGS, THEME_FONTS, THEME_PRESETS, type ThemeFontId, type ThemePresetKey } from '@/lib/constants';
import { toneHex } from '@/lib/theme/contrast';

function font(id: ThemeFontId) {
    return THEME_FONTS.find((f) => f.id === id) ?? THEME_FONTS[0];
}

type Props = { presetKey: ThemePresetKey; selected: boolean; disabled: boolean; onSelect: () => void };

/** A look: swatches for light and dark, its 15 category tones, its shape and its fonts. */
export default function ThemePresetCard({ presetKey, selected, disabled, onSelect }: Props) {
    const t = useTranslations('admin.design');
    const p = THEME_PRESETS[presetKey];
    const swatches = [p.light.primary, p.light.background, p.light.surface, p.dark.primary, p.dark.background, p.dark.surface];
    const heading = font(p.headingFont);
    const body = font(p.bodyFont);

    return (
        <button
            type="button"
            onClick={onSelect}
            disabled={disabled}
            aria-pressed={selected}
            style={{ '--sample-heading': `var(${heading.cssVar})`, '--sample-body': `var(${body.cssVar})` } as React.CSSProperties}
            className={clsx(
                'relative flex flex-col gap-4 rounded-2xl border-2 bg-surface p-5 text-left transition-colors disabled:opacity-60 shadow-card',
                selected ? 'border-primary' : 'border-border hover:border-foreground-muted'
            )}
        >
            {selected && <Check className="absolute right-4 top-4 h-5 w-5 text-primary" aria-hidden="true" />}
            <span>
                <span className="block text-item text-foreground">{t(`presets.${presetKey}`)}</span>
                <span className="block text-meta text-foreground-muted">{t('looks.shape', { shape: t(`styles.${p.styleKey}`) })}</span>
            </span>
            <span className="flex flex-wrap gap-1.5" aria-hidden="true">
                {swatches.map((hex, i) => (
                    <span key={i} style={{ '--sw': hex } as React.CSSProperties} className="size-8 rounded-pill line bg-[var(--sw)]" />
                ))}
            </span>
            <span className="block">
                <span className="mb-1.5 block text-meta text-foreground-muted">{t('looks.tones')}</span>
                {(['light', 'dark'] as const).map((mode) => (
                    <span key={mode} className="mt-1 flex gap-1" aria-hidden="true">
                        {CATEGORY_TONE_SLUGS.map((slug) => (
                            <span key={slug} style={{ '--sw': toneHex(p[mode], slug, mode) } as React.CSSProperties} className="h-3 min-w-0 flex-1 rounded-md bg-[var(--sw)]" />
                        ))}
                    </span>
                ))}
            </span>
            <span className="block">
                <span className="block text-section text-foreground [font-family:var(--sample-heading)]">{t('fontSampleHeading')}</span>
                <span className="mt-1 block text-body-sm text-foreground-muted [font-family:var(--sample-body)]">{t('fontSampleBody')}</span>
                <span className="mt-2 block text-meta text-foreground-muted">{t('looks.fonts', { heading: heading.label, body: body.label })}</span>
            </span>
        </button>
    );
}
