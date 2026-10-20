'use client';

import { useTranslations } from 'next-intl';
import Badge from '@/components/ui/Badge';
import { buttonClass, type ButtonVariant } from '@/components/ui/Button';
import FilterChip from '@/components/ui/FilterChip';
import { THEME_PRESETS, THEME_STYLE_KEYS } from '@/lib/constants';
import { themeSampleVars } from '@/lib/theme/css';

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'quiet', 'danger'];
const PALETTE = THEME_PRESETS.moss;

/** Both styles side by side in the default palette: the variables are set on each box only, so the page itself stays as it is. */
export function StyleDemos() {
    const t = useTranslations('admin.design');
    return (
        <div className="grid gap-4 md:grid-cols-2">
            {THEME_STYLE_KEYS.map((key) => (
                <div
                    key={key}
                    style={themeSampleVars(PALETTE.light, PALETTE.headingFont, PALETTE.bodyFont, 'light', key) as React.CSSProperties}
                    className="rounded-2xl bg-background p-4 font-sans text-foreground sm:p-5"
                >
                    <h3 className="mb-3 text-lg">{t(`styles.${key}`)}</h3>
                    <div className="flex flex-wrap items-center gap-3 pb-1 pr-1">
                        {VARIANTS.map((v) => <button key={v} type="button" tabIndex={-1} className={buttonClass(v, '', 'sm')}>{t(`sample.${v === 'primary' ? 'primaryButton' : 'secondaryButton'}`)}</button>)}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2 pb-1 pr-1">
                        <FilterChip active onClick={() => undefined}>{t('sample.badge')}</FilterChip>
                        <FilterChip active={false} onClick={() => undefined}>{t('sample.link')}</FilterChip>
                        <Badge>{t('sample.badge')}</Badge>
                    </div>
                    <input readOnly tabIndex={-1} value={t('sample.heading')} className="mt-4 block h-11 w-full rounded-lg line bg-background px-3 text-sm" />
                    <div className="mt-4 rounded-2xl bg-surface p-4 shadow-card frame">
                        <p className="text-sm text-foreground-muted">{t('sample.body')}</p>
                    </div>
                    <ul className="mt-4 w-48 rounded-menu line bg-surface p-1.5 shadow-premium text-sm" role="presentation">
                        <li className="rounded-item px-2.5 py-1.5 hover:bg-tint">{t('sample.link')}</li>
                        <li className="rounded-item px-2.5 py-1.5 hover:bg-tint">{t('sample.badge')}</li>
                    </ul>
                </div>
            ))}
        </div>
    );
}
