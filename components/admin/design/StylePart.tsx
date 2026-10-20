'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { THEME_STYLE_KEYS, type ThemeMode, type ThemeStyleKey } from '@/lib/constants';
import type { DraftTheme } from '@/hooks/use-theme-draft';
import StyleCard from './StyleCard';
import ThemeSample from './ThemeSample';

type Props = { theme: DraftTheme; disabled: boolean; onStyle: (key: ThemeStyleKey) => void };

const MODES = ['light', 'dark'] as const;

/** Stils: calm or bold shapes (corners, lines, shadows), shown in the current palette and in a live sample. */
export default function StylePart({ theme, disabled, onStyle }: Props) {
    const t = useTranslations('admin.design');
    const [sampleMode, setSampleMode] = useState<ThemeMode>('light');
    const group = useRef<HTMLDivElement>(null);

    // Arrow keys move the choice, like a native radio group.
    const move = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        const i = THEME_STYLE_KEYS.indexOf(theme.styleKey);
        const next = THEME_STYLE_KEYS[(i + step + THEME_STYLE_KEYS.length) % THEME_STYLE_KEYS.length];
        onStyle(next);
        group.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[THEME_STYLE_KEYS.indexOf(next)]?.focus();
    };

    return (
        <div className="space-y-8">
            <section aria-labelledby="design-style">
                <h2 id="design-style" className="text-[21px] font-semibold text-foreground">{t('styleTitle')}</h2>
                <p className="mt-1 text-sm text-foreground-muted">{t('styleNote')}</p>
                <div ref={group} role="radiogroup" aria-labelledby="design-style" className="mt-4 grid gap-3 md:grid-cols-2">
                    {THEME_STYLE_KEYS.map((key) => (
                        <StyleCard key={key} styleKey={key} theme={theme} selected={theme.styleKey === key} disabled={disabled} onSelect={() => onStyle(key)} onKeyDown={move} />
                    ))}
                </div>
            </section>

            <section aria-labelledby="design-style-sample">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 id="design-style-sample" className="text-base font-semibold text-foreground">{t('sampleTitle')}</h3>
                    <div role="group" aria-label={t('sampleMode')} className="flex rounded-pill bg-tint p-0.5">
                        {MODES.map((mode) => (
                            <button
                                key={mode}
                                type="button"
                                aria-pressed={sampleMode === mode}
                                onClick={() => setSampleMode(mode)}
                                className={clsx('min-h-8 rounded-pill px-3 text-xs font-semibold', sampleMode === mode ? 'bg-primary text-primary-foreground' : 'text-foreground-muted')}
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
