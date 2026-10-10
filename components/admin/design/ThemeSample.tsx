'use client';

import { useTranslations } from 'next-intl';
import type { ThemeFontId, ThemeModeTokens } from '@/lib/constants';
import { themeSampleVars } from '@/lib/theme/css';

type Props = {
    tokens: ThemeModeTokens;
    headingFont: ThemeFontId;
    bodyFont: ThemeFontId;
    /** Adds the `dark` class so shadows follow dark mode inside the sample. */
    dark: boolean;
};

/** Live sample: its own CSS variables are set on this element only, so nothing else on the page changes while editing. */
export default function ThemeSample({ tokens, headingFont, bodyFont, dark }: Props) {
    const t = useTranslations('admin.design.sample');
    return (
        <div
            style={themeSampleVars(tokens, headingFont, bodyFont) as React.CSSProperties}
            className={`${dark ? 'dark ' : ''}rounded-2xl border border-border bg-background p-4 font-sans text-foreground sm:p-6`}
        >
            <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
                <h3 className="text-2xl font-bold">{t('heading')}</h3>
                <p className="mt-2 text-sm text-foreground-muted">{t('body')}</p>
                <p className="mt-2 text-base">{t('latvian')}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" tabIndex={-1} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">{t('primaryButton')}</button>
                    <button type="button" tabIndex={-1} className="rounded-xl border border-border bg-surface-elevated px-4 py-2 text-sm font-bold text-foreground">{t('secondaryButton')}</button>
                    <span className="rounded-full bg-primary/10 px-3 py-2 text-xs font-bold text-primary">{t('badge')}</span>
                </div>
                <p className="mt-4 text-sm">
                    <span className="font-semibold text-primary underline underline-offset-4">{t('link')}</span>
                </p>
            </div>
        </div>
    );
}
