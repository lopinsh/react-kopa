import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { requireAdminPage } from '@/lib/admin-access';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin.nav' });
    return { title: t('buildPlan') };
}

/**
 * The plan for the next release. Empty between plans; the closed redesign plan stays in `docs/development/build-plan.md`
 * (the rule ledger `npm run plan:check` reads) and is not shown here.
 */
export default async function BuildPlanPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    await requireAdminPage(locale, '/admin/development/build-plan');

    const t = await getTranslations('admin.development');

    return (
        <div className="max-w-reading rounded-xl line bg-surface p-6">
            <h1 className="text-title text-foreground">{t('buildPlanEmptyTitle')}</h1>
            <p className="mt-2 text-body text-foreground-muted">{t('buildPlanEmptyHint')}</p>
        </div>
    );
}
