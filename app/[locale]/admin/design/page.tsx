import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { requireAdminPage } from '@/lib/admin-access';
import { CATEGORY_TONE_SLUGS, DESIGN_PARTS, type DesignPart } from '@/lib/constants';
import { TaxonomyService } from '@/lib/services/taxonomy.service';
import { getActiveTheme } from '@/lib/theme/server';
import DesignEditor from '@/components/admin/design/DesignEditor';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

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
        <div className="space-y-6">
            <AdminPageHeader title={t('title')} subtitle={t('subtitle')} />
            {theme.isPreview && <p className="mb-6 rounded-xl bg-surface px-4 py-3 text-sm font-semibold text-foreground">{t('previewActive')}</p>}
            <DesignEditor
                key={`${theme.id ?? 'default'}-${theme.presetKey}`}
                initialPart={initialPart}
                toneRows={toneRows}
                initial={{ presetKey: theme.presetKey, light: theme.light, dark: theme.dark, headingFont: theme.headingFont, bodyFont: theme.bodyFont, styleKey: theme.styleKey }}
            />
        </div>
    );
}
