'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { THEME_STYLE_KEYS, type ThemeStyleKey } from '@/lib/constants';
import type { DraftTheme } from '@/hooks/use-theme-draft';
import StyleCard from './StyleCard';

type Props = { theme: DraftTheme; disabled: boolean; onStyle: (key: ThemeStyleKey) => void };

/** Stils: calm or bold shapes (corners, lines, shadows), shown in the current palette. */
export default function StylePart({ theme, disabled, onStyle }: Props) {
    const t = useTranslations('admin.design');
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
                <h2 id="design-style" className="text-section text-foreground">{t('styleTitle')}</h2>
                <p className="mt-1 text-body-sm text-foreground-muted">{t('styleNote')}</p>
                <div ref={group} role="radiogroup" aria-labelledby="design-style" className="mt-4 grid gap-3 md:grid-cols-3">
                    {THEME_STYLE_KEYS.map((key) => (
                        <StyleCard key={key} styleKey={key} theme={theme} selected={theme.styleKey === key} disabled={disabled} onSelect={() => onStyle(key)} onKeyDown={move} />
                    ))}
                </div>
            </section>

        </div>
    );
}
