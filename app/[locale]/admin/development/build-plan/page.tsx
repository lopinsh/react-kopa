import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import HandbookMarkdown from '@/components/handbook/HandbookMarkdown';
import { requireAdminPage } from '@/lib/admin-access';
import { DevelopmentService } from '@/lib/services/development.service';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin.nav' });
    return { title: t('buildPlan') };
}

/** The living implementation plan for the redesign releases, rendered from `docs/development/build-plan.md`. */
export default async function BuildPlanPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    await requireAdminPage(locale, '/admin/development/build-plan');

    const t = await getTranslations('admin.development');
    const markdown = await DevelopmentService.getBuildPlan();

    return (
        <div className="container mx-auto max-w-5xl px-4 py-8">
            <article className="min-w-0">
                {markdown === null ? (
                    <p className="rounded-xl border border-border bg-surface p-6 text-foreground-muted">{t('buildPlanMissing')}</p>
                ) : (
                    <HandbookMarkdown markdown={markdown} />
                )}
                <p className="mt-12 border-t border-border pt-4 text-xs text-foreground-muted">{t('buildPlanNote')}</p>
            </article>
        </div>
    );
}
