import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import BuildPlanView from '@/components/admin/plan/BuildPlanView';
import HandbookMarkdown from '@/components/handbook/HandbookMarkdown';
import { requireAdminPage } from '@/lib/admin-access';
import { DevelopmentService, PLAN, type PlanDrawingId } from '@/lib/services/development.service';
import { markdownHeadings } from '@/lib/services/handbook.service';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin.nav' });
    return { title: t('buildPlan') };
}

function drawingId(value: string | undefined): PlanDrawingId | null {
    return PLAN.drawings.find((d) => d.id === value)?.id ?? null;
}

/**
 * The plan for the next release (admin review tool): the spec as text, then one tab per drawing, as the page sidebar's tabs (`?d=`).
 * Drawings are complete pages with the site look injected, so each runs in an isolated frame. Between plans the page shows the empty note.
 */
export default async function BuildPlanPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ d?: string }> }) {
    const { locale } = await params;
    const { d } = await searchParams;
    await requireAdminPage(locale, '/admin/development/build-plan');

    const t = await getTranslations('admin.development');
    const tn = await getTranslations('admin.nav');
    const current = drawingId(d);
    const [markdown, html] = await Promise.all([
        current ? null : DevelopmentService.getPlanSpec(),
        current ? DevelopmentService.getPlanDrawing(current) : null,
    ]);

    if (!current && markdown === null) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="max-w-reading rounded-xl line bg-surface p-6">
                    <h1 className="text-title text-foreground">{t('buildPlanEmptyTitle')}</h1>
                    <p className="mt-2 text-body text-foreground-muted">{t('buildPlanEmptyHint')}</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'spec', href: '/admin/development/build-plan', label: t('planTab'), current: !current },
        ...PLAN.drawings.map(({ id }) => ({ id, href: `/admin/development/build-plan?d=${id}`, label: t(`planDrawings.${id}`), current: id === current })),
    ];
    const specSections = markdown ? markdownHeadings(markdown).map((h) => ({ id: h.id, label: h.text })) : [];
    return (
        <BuildPlanView
            key={current ?? 'spec'}
            tabs={tabs}
            specSections={specSections}
            drawing={current ? { id: current, title: t(`planDrawings.${current}`), html: html ?? '' } : null}
            labels={{ tabs: tn('pageTabs'), sections: tn('pageSections') }}
        >
            {markdown && <HandbookMarkdown markdown={markdown} />}
        </BuildPlanView>
    );
}
