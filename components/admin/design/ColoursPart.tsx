'use client';

import { useFormatter, useTranslations } from 'next-intl';
import {
    THEME_EDITABLE_TOKENS,
    type ThemeEditableToken, type ThemeMode,
} from '@/lib/constants';
import { floorRatio, type ContrastIssue } from '@/lib/theme/contrast';
import type { DraftTheme } from '@/hooks/use-theme-draft';
import ColorField from './ColorField';

type Props = {
    theme: DraftTheme;
    issues: ContrastIssue[];
    disabled: boolean;
    onColor: (mode: ThemeMode, token: ThemeEditableToken, hex: string) => void;
};

const MODES = ['light', 'dark'] as const;

/** Krāsas: the site colour and neutrals per mode. */
export default function ColoursPart({ theme, issues, disabled, onColor }: Props) {
    const t = useTranslations('admin.design');
    const format = useFormatter();
    const num = (n: number) => format.number(n, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

    return (
        <div className="space-y-8">
            <section aria-labelledby="design-colours">
                <h2 id="design-colours" className="text-[21px] font-semibold text-foreground">{t('parts.colours')}</h2>
                <p className="mt-1 text-sm text-foreground-muted">{t('colours.lead')}</p>
            </section>

            <div className="grid gap-4 lg:grid-cols-2">
                {MODES.map((mode) => (
                    <div key={mode}>
                        <fieldset className="space-y-3 rounded-2xl bg-surface p-4 shadow-card frame">
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

        </div>
    );
}
