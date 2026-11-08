import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import HandbookMarkdown from '@/components/handbook/HandbookMarkdown';
import { buttonClass } from '@/components/ui/Button';
import { Link } from '@/i18n/routing';
import { requireAdminPage } from '@/lib/admin-access';
import { DevelopmentService, PLAN, type PlanDrawingId } from '@/lib/services/development.service';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin.nav' });
    return { title: t('buildPlan') };
}

function drawingId(value: string | undefined): PlanDrawingId | null {
    return PLAN.drawings.find((d) => d.id === value)?.id ?? null;
}

/**
 * The plan for the next release (admin review tool): the spec as text, then one tab per drawing. The tab is in the URL (`?d=`).
 * Drawings are complete pages with the site look injected, so each runs in an isolated frame. Between plans the page shows the empty note.
 */
export default async function BuildPlanPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ d?: string }> }) {
    const { locale } = await params;
    const { d } = await searchParams;
    await requireAdminPage(locale, '/admin/development/build-plan');

    const t = await getTranslations('admin.development');
    const current = drawingId(d);
    const [markdown, html] = await Promise.all([
        current ? null : DevelopmentService.getPlanSpec(),
        current ? DevelopmentService.getPlanDrawing(current) : null,
    ]);

    if (!current && markdown === null) {
        return (
            <div className="max-w-reading rounded-xl line bg-surface p-6">
                <h1 className="text-title text-foreground">{t('buildPlanEmptyTitle')}</h1>
                <p className="mt-2 text-body text-foreground-muted">{t('buildPlanEmptyHint')}</p>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100dvh-7.0625rem)] md:h-[calc(100dvh-9.875rem)] lg:h-[calc(100dvh-6.3125rem)] min-h-96 flex-col">
            <nav aria-label={t('planTab')} className="flex gap-1 overflow-x-auto bg-surface px-gutter py-2">
                <Link href="/admin/development/build-plan" aria-current={current ? undefined : 'page'} className={buttonClass(current ? 'quiet' : 'primary', 'shrink-0', 'sm')}>
                    {t('planTab')}
                </Link>
                {PLAN.drawings.map(({ id }) => (
                    <Link
                        key={id}
                        href={`/admin/development/build-plan?d=${id}`}
                        aria-current={id === current ? 'page' : undefined}
                        className={buttonClass(id === current ? 'primary' : 'quiet', 'shrink-0', 'sm')}
                    >
                        {t(`planDrawings.${id}`)}
                    </Link>
                ))}
            </nav>
            {current ? (
                <iframe key={current} title={t(`planDrawings.${current}`)} srcDoc={html ?? ''} className="min-h-0 w-full flex-1 border-0 bg-background" />
            ) : (
                <div className="min-h-0 flex-1 overflow-y-auto px-gutter py-6">
                    <article className="max-w-5xl min-w-0">{markdown && <HandbookMarkdown markdown={markdown} />}</article>
                </div>
            )}
        </div>
    );
}
