'use client';

import { useTranslations } from 'next-intl';
import { Users } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { buttonClass } from '@/components/ui/Button';
import { ROLE_TONE_KEYS, type ThemeFontId, type ThemeModeTokens, type ThemeStyleKey } from '@/lib/constants';
import { toneHex } from '@/lib/theme/contrast';
import { themeSampleVars } from '@/lib/theme/css';

const TILES = [['travel', 'tile1'], ['music', 'tile2'], ['sports', 'tile3']] as const;

type Props = {
    tokens: ThemeModeTokens;
    headingFont: ThemeFontId;
    bodyFont: ThemeFontId;
    styleKey: ThemeStyleKey;
    /** Adds the `dark` class so shadows follow dark mode inside the sample. */
    dark: boolean;
};

/** Live sample: its own CSS variables are set on this element only, so nothing else on the page changes while editing. */
export default function ThemeSample({ tokens, headingFont, bodyFont, styleKey, dark }: Props) {
    const t = useTranslations('admin.design.sample');
    const tTag = useTranslations('common.tag');
    return (
        <div
            style={themeSampleVars(tokens, headingFont, bodyFont, dark ? 'dark' : 'light', styleKey) as React.CSSProperties}
            className={`${dark ? 'dark ' : ''}rounded-2xl bg-background p-4 font-sans text-foreground ring-1 ring-inset ring-border sm:p-6`}
        >
            <div className="rounded-2xl bg-surface p-4 sm:p-5 shadow-card frame">
                <h3 className="text-item">{t('heading')}</h3>
                <p className="mt-2 text-body-sm text-foreground-muted">{t('body')}</p>
                <p className="mt-2 text-body">{t('latvian')}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button type="button" tabIndex={-1} className={buttonClass('primary', '', 'sm')}>{t('primaryButton')}</button>
                    <button type="button" tabIndex={-1} className={buttonClass('secondary', '', 'sm')}>{t('secondaryButton')}</button>
                    <Badge>{t('badge')}</Badge>
                    {ROLE_TONE_KEYS.map((k) => <Badge key={k} tone="role" role={k}>{tTag(k)}</Badge>)}
                </div>
                <p className="mt-4 text-body-sm">
                    <span className="weight-strong text-primary underline underline-offset-4">{t('link')}</span>
                </p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                    {TILES.map(([slug, key]) => (
                        <li key={slug} className="flex items-center gap-2 rounded-xl bg-surface-elevated p-2 shadow-card frame">
                            <span style={{ '--c': toneHex(tokens, slug, dark ? 'dark' : 'light') } as React.CSSProperties} className="grid size-10 shrink-0 place-items-center rounded-item cat-tile">
                                <Users className="size-5" aria-hidden="true" />
                            </span>
                            <span className="min-w-0 truncate text-body-sm">{t(key)}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
