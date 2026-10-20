'use client';

import { useTranslations } from 'next-intl';
import { CategoryDisc } from '@/components/ui/CategoryIcon';
import type { CategoryToneSlug, ThemeMode } from '@/lib/constants';
import { toneContrast, toneHex } from '@/lib/theme/contrast';
import type { DraftTheme } from '@/hooks/use-theme-draft';
import ContrastPill from './ContrastPill';
import SwatchInput from './SwatchInput';

type Props = {
    slug: CategoryToneSlug;
    /** Service-provided category title; null falls back to the tone's own name. */
    title: string | null;
    theme: DraftTheme;
    disabled: boolean;
    onTone: (mode: ThemeMode, slug: CategoryToneSlug, hex: string) => void;
};

/** One category: disc in the page mode's tone, name, light and dark swatches, the check. */
export default function CategoryColorRow({ slug, title, theme, disabled, onTone }: Props) {
    const t = useTranslations('admin.design.tones');
    const name = title ?? t(`names.${slug}`);
    const tone = t(`names.${slug}`);
    const light = toneHex(theme.light, slug, 'light');
    const dark = toneHex(theme.dark, slug, 'dark');
    const check = toneContrast(theme, slug);

    return (
        <div
            style={{ '--tone-l': light, '--tone-d': dark } as React.CSSProperties}
            className="grid grid-cols-[28px_minmax(0,1fr)_auto_auto_auto] items-center gap-2.5 border-t border-border py-[7px] text-body-sm first:border-t-0 [--row-tone:var(--tone-l)] [.dark_&]:[--row-tone:var(--tone-d)]"
        >
            <CategoryDisc slug={slug} color="var(--row-tone)" size={28} />
            <span className="text-foreground">{name}</span>
            <SwatchInput hex={light} word={t('swatchLight')} label={t('swatchLabel', { category: name, tone, mode: t('modeLight') })} disabled={disabled} onChange={(hex) => onTone('light', slug, hex)} />
            <SwatchInput hex={dark} word={t('swatchDark')} label={t('swatchLabel', { category: name, tone, mode: t('modeDark') })} disabled={disabled} onChange={(hex) => onTone('dark', slug, hex)} />
            <ContrastPill {...check} />
        </div>
    );
}
