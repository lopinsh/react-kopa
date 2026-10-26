'use client';

import { useRouter } from 'next/navigation';
import { useFormatter, useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import { THEME_FONTS } from '@/lib/constants';
import { patchType } from '@/lib/theme/type-edit';
import type { DraftTheme } from '@/hooks/use-theme-draft';
import type { ThemeType } from '@/lib/validations/theme';
import EmphasisField from './EmphasisField';
import SegmentedField from './SegmentedField';
import TypeRolesPart from './TypeRolesPart';

type Props = { theme: DraftTheme; disabled: boolean; onType: (type: ThemeType | undefined) => void };

const WEIGHT_CLASS: Record<number, string> = { 400: '[font-weight:400]', 500: '[font-weight:500]', 600: '[font-weight:600]', 700: '[font-weight:700]', 800: '[font-weight:800]' };
const row = 'flex min-h-11 flex-col gap-2 border-t border-border py-3 first:border-t-0 sm:flex-row sm:items-center sm:justify-between';

/** Burti: the site's text size, heading strength, spacing and tag case, plus every role. The font pair stays under Fonti. */
export default function TypePart({ theme, disabled, onType }: Props) {
    const t = useTranslations('admin.design.type');
    const tParts = useTranslations('admin.design.parts');
    const format = useFormatter();
    const router = useRouter();
    const type = theme.type;
    const ctx = { headingFont: theme.headingFont, bodyFont: theme.bodyFont, styleKey: theme.styleKey };
    const patch = (p: Partial<Omit<ThemeType, 'v'>>) => onType(patchType(type, p, ctx));
    const heading = THEME_FONTS.find((f) => f.id === theme.headingFont) ?? THEME_FONTS[0];
    const body = THEME_FONTS.find((f) => f.id === theme.bodyFont) ?? THEME_FONTS[0];
    const fixedWeight = 'weight' in heading;
    const headingWeight = type?.headingWeight;
    const shown = headingWeight === undefined ? undefined : (heading.weights as readonly number[]).reduce((b, w) => (Math.abs(w - headingWeight) < Math.abs(b - headingWeight) || (Math.abs(w - headingWeight) === Math.abs(b - headingWeight) && w > b) ? w : b));
    const contrast = type?.contrast ?? 1;
    const base = type?.base ?? 16;

    return (
        <section aria-labelledby="design-type" className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 id="design-type" className="text-section text-foreground">{tParts('type')}</h2>
                    <p className="mt-1 text-body-sm text-foreground-muted">{t('lead')}</p>
                </div>
                <Button type="button" variant="secondary" size="sm" disabled={disabled || type === undefined} onClick={() => onType(undefined)}>{t('resetType')}</Button>
            </div>
            <p className="text-meta text-foreground-muted">
                {t('fontsLine', { heading: heading.label, body: body.label })}{' '}
                <button type="button" className="weight-strong text-primary underline underline-offset-4" onClick={() => router.replace('?part=fonts', { scroll: false })}>{t('changeFonts')}</button>
            </p>
            <div>
                <h3 className="mb-2 text-body text-foreground">{t('systemTitle')}</h3>
                <div className="rounded-2xl bg-surface px-4 py-0.5 shadow-card frame">
                    <div className={row}>
                        <label htmlFor="type-base" className="text-body text-foreground">{t('base')}</label>
                        <div className="flex items-center gap-3">
                            <input id="type-base" type="range" min={15} max={17} step={0.5} value={base} disabled={disabled} onChange={(e) => patch({ base: Number(e.target.value) })} className="w-full accent-primary sm:w-48" />
                            <output htmlFor="type-base" className="w-14 text-right text-meta tabular-nums">{t('px', { value: format.number(base) })}</output>
                        </div>
                    </div>
                    <div className={row}>
                        <label htmlFor="type-contrast" className="text-body text-foreground">{t('contrast')}</label>
                        <div className="flex items-center gap-3">
                            <input id="type-contrast" type="range" min={0.8} max={1.25} step={0.05} value={contrast} disabled={disabled} onChange={(e) => patch({ contrast: Math.round(Number(e.target.value) * 100) / 100 })} className="w-full accent-primary sm:w-48" />
                            <output htmlFor="type-contrast" className="w-14 text-right text-meta tabular-nums">×{format.number(contrast, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</output>
                        </div>
                    </div>
                    <div className={row}>
                        <span className="text-body text-foreground">{t('headingWeight')}</span>
                        {fixedWeight ? (
                            <div className="flex flex-wrap items-center gap-3">
                                <SegmentedField label={t('headingWeight')} disabled value={heading.weights[0]} options={[{ value: heading.weights[0], label: String(heading.weights[0]) }]} onChange={() => undefined} />
                                <p className="text-meta text-foreground-muted">{t('weightFixed')}</p>
                            </div>
                        ) : (
                            <SegmentedField
                                label={t('headingWeight')}
                                disabled={disabled}
                                value={shown ?? 0}
                                options={[{ value: 0, label: t('styleWeight') }, ...heading.weights.map((w) => ({ value: w as number, label: String(w), className: WEIGHT_CLASS[w] }))]}
                                onChange={(w) => patch({ headingWeight: w === 0 ? undefined : w })}
                            />
                        )}
                    </div>
                    <div className={row}>
                        <span className="text-body text-foreground">{t('leading')}</span>
                        <SegmentedField
                            label={t('leading')}
                            disabled={disabled}
                            value={type?.leading ?? 'normal'}
                            options={(['compact', 'normal', 'airy'] as const).map((v) => ({ value: v, label: t(`leadingOptions.${v}`) }))}
                            onChange={(v) => patch({ leading: v })}
                        />
                    </div>
                    <div className={row}>
                        <span className="text-body text-foreground">{t('emphasis')}</span>
                        <EmphasisField type={type} disabled={disabled} onType={onType} />
                    </div>
                    <div className={row}>
                        <span className="text-body text-foreground">{t('tagCase.label')}</span>
                        <SegmentedField
                            label={t('tagCase.label')}
                            disabled={disabled}
                            value={type?.tagCase ?? 'none'}
                            options={[{ value: 'none' as const, label: 'Aa', ariaLabel: t('tagCase.none') }, { value: 'upper' as const, label: 'AA', ariaLabel: t('tagCase.upper') }]}
                            onChange={(v) => patch({ tagCase: v })}
                        />
                    </div>
                </div>
            </div>
            <TypeRolesPart theme={theme} disabled={disabled} onType={onType} />
        </section>
    );
}
