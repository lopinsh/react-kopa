'use client';

import { useTranslations } from 'next-intl';
import { CATEGORY_TONE_SLUGS, type CategoryToneSlug, type ThemeMode } from '@/lib/constants';
import type { DraftTheme } from '@/hooks/use-theme-draft';
import CategoryColorRow from './CategoryColorRow';

export type ToneRow = { slug: CategoryToneSlug; title: string | null };

type Props = { rows: ToneRow[]; theme: DraftTheme; disabled: boolean; onTone: (mode: ThemeMode, slug: CategoryToneSlug, hex: string) => void };

/** Kategoriju krāsas: one row per category with its light and dark tone and the contrast check. */
export default function CategoryColorsEditor({ rows, theme, disabled, onTone }: Props) {
    const t = useTranslations('admin.design');
    const ordered = CATEGORY_TONE_SLUGS.map((slug) => rows.find((r) => r.slug === slug) ?? { slug, title: null });
    return (
        <section aria-labelledby="design-categories">
            <h2 id="design-categories" className="text-[21px] font-semibold text-foreground">{t('parts.categories')}</h2>
            <p className="mb-4 mt-1 text-sm text-foreground-muted">{t('categories.lead')}</p>
            <div className="rounded-2xl bg-surface px-4 py-0.5 shadow-card frame">
                {ordered.map((r) => (
                    <CategoryColorRow key={r.slug} slug={r.slug} title={r.title} theme={theme} disabled={disabled} onTone={onTone} />
                ))}
            </div>
        </section>
    );
}
