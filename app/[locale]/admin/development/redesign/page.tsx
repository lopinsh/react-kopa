import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { requireAdminPage } from '@/lib/admin-access';
import { Link } from '@/i18n/routing';
import { buttonClass } from '@/components/ui/Button';
import { DESIGN_DRAWINGS, DevelopmentService, type DesignDrawingId } from '@/lib/services/development.service';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin.nav' });
    return { title: t('redesign') };
}

function isDrawing(value: string | undefined): value is DesignDrawingId {
    return DESIGN_DRAWINGS.some((id) => id === value);
}

/**
 * The Design book: the approved drawings, each a complete page with its own colours, fonts and script, so it runs in an
 * isolated frame and does not follow the site theme. The tab is in the URL (`?d=r18|r19|r20`).
 */
export default async function DesignBookPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ d?: string }> }) {
    const { locale } = await params;
    const { d } = await searchParams;
    await requireAdminPage(locale, '/admin/development/redesign');

    const t = await getTranslations('admin.development');
    const current: DesignDrawingId = isDrawing(d) ? d : 'r18';
    const html = await DevelopmentService.getDrawing(current);

    return (
        <div className="flex h-[calc(100dvh-7.0625rem)] md:h-[calc(100dvh-9.875rem)] lg:h-[calc(100dvh-6.3125rem)] min-h-96 flex-col">
            <nav aria-label={t('bookTitle')} className="flex gap-1 overflow-x-auto bg-surface px-gutter py-2">
                {DESIGN_DRAWINGS.map((id) => (
                    <Link
                        key={id}
                        href={`/admin/development/redesign?d=${id}`}
                        aria-current={id === current ? 'page' : undefined}
                        className={buttonClass(id === current ? 'primary' : 'quiet', 'shrink-0', 'sm')}
                    >
                        {t(`drawings.${id}`)}
                    </Link>
                ))}
            </nav>
            <iframe key={current} title={t(`drawings.${current}`)} srcDoc={html} className="min-h-0 w-full flex-1 border-0 bg-background" />
        </div>
    );
}
