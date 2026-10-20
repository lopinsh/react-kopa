'use client';

import { useTranslations } from 'next-intl';
import Badge from '@/components/ui/Badge';
import { buttonClass } from '@/components/ui/Button';
import type { ThemeFontId, ThemeModeTokens, ThemeStyleKey } from '@/lib/constants';
import { themeSampleVars } from '@/lib/theme/css';

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
    return (
        <div
            style={themeSampleVars(tokens, headingFont, bodyFont, dark ? 'dark' : 'light', styleKey) as React.CSSProperties}
            className={`${dark ? 'dark ' : ''}rounded-2xl bg-background p-4 font-sans text-foreground ring-1 ring-inset ring-border sm:p-6`}
        >
            <div className="rounded-2xl bg-surface p-4 sm:p-5">
                <h3 className="text-2xl font-bold">{t('heading')}</h3>
                <p className="mt-2 text-sm text-foreground-muted">{t('body')}</p>
                <p className="mt-2 text-base">{t('latvian')}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button type="button" tabIndex={-1} className={buttonClass('primary', '', 'sm')}>{t('primaryButton')}</button>
                    <button type="button" tabIndex={-1} className={buttonClass('secondary', '', 'sm')}>{t('secondaryButton')}</button>
                    <Badge>{t('badge')}</Badge>
                </div>
                <p className="mt-4 text-sm">
                    <span className="font-semibold text-primary underline underline-offset-4">{t('link')}</span>
                </p>
            </div>
        </div>
    );
}
