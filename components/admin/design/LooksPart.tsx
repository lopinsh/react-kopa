'use client';

import { useTranslations } from 'next-intl';
import { THEME_PRESET_KEYS, type ThemePresetKey } from '@/lib/constants';
import type { DraftTheme } from '@/hooks/use-theme-draft';
import ThemePresetCard from './ThemePresetCard';

type Props = { theme: DraftTheme; disabled: boolean; onPreset: (key: ThemePresetKey) => void };

/** Noskaņojumi: the ready-made looks (colours, tones, shape, fonts), one pick sets them all. */
export default function LooksPart({ theme, disabled, onPreset }: Props) {
    const t = useTranslations('admin.design');
    return (
        <section aria-labelledby="design-looks">
            <h2 id="design-looks" className="text-section text-foreground">{t('parts.looks')}</h2>
            <p className="mt-1 text-body-sm text-foreground-muted">{t('looks.lead')}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {THEME_PRESET_KEYS.map((key) => (
                    <ThemePresetCard key={key} presetKey={key} selected={theme.presetKey === key} disabled={disabled} onSelect={() => onPreset(key)} />
                ))}
            </div>
            <p className="mt-3 text-meta text-foreground-muted">{t('presetResetsTones')}</p>
            {theme.presetKey === 'custom' && <p className="mt-2 text-body-sm text-primary">{t('customActive')}</p>}
        </section>
    );
}
