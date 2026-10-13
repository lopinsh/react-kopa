import type { Metadata } from 'next';
import { Palette } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { requireAdminPage } from '@/lib/admin-access';
import { CATEGORY_TONE_SLUGS, DESIGN_PARTS, type DesignPart } from '@/lib/constants';
import { TaxonomyService } from '@/lib/services/taxonomy.service';
import { getActiveTheme } from '@/lib/theme/server';
import DesignEditor from '@/components/admin/design/DesignEditor';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin.nav' });
    return { title: t('design') };
}

export default async function AdminDesignPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const { locale } = await params;
    const t = await getTranslations('admin.design');

    await requireAdminPage(locale, '/admin/design');

    const { part } = await searchParams;
    const initialPart: DesignPart = typeof part === 'string' && (DESIGN_PARTS as readonly string[]).includes(part) ? (part as DesignPart) : 'colours';

    // Start from what this admin currently sees: their preview if they have one, otherwise the published theme.
    const [theme, taxonomy] = await Promise.all([getActiveTheme(), TaxonomyService.getTaxonomy(locale)]);
    const toneRows = CATEGORY_TONE_SLUGS.map((slug) => ({ slug, title: taxonomy.find((c) => c.slug === slug)?.title ?? null }));

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Palette className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t('title')}</h1>
                    <p className="mt-1 text-foreground-muted">{t('subtitle')}</p>
                </div>
            </div>
            {theme.isPreview && <p className="mb-6 rounded-xl bg-surface px-4 py-3 text-sm font-semibold text-foreground">{t('previewActive')}</p>}
            <DesignEditor
                key={`${theme.id ?? 'default'}-${theme.presetKey}`}
                initialPart={initialPart}
                toneRows={toneRows}
                initial={{ presetKey: theme.presetKey, light: theme.light, dark: theme.dark, headingFont: theme.headingFont, bodyFont: theme.bodyFont }}
            />
        </div>
    );
}
