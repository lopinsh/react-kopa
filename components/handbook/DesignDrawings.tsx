import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { buttonClass } from '@/components/ui/Button';
import { DESIGN_DRAWINGS, DevelopmentService, type DesignDrawingId } from '@/lib/services/development.service';

export function isDrawing(value: string | undefined): value is DesignDrawingId {
    return DESIGN_DRAWINGS.some((id) => id === value);
}

/**
 * The approved drawings, the last section of the Design chapter. Each drawing is a complete page with its own colours,
 * fonts and script, so it runs in an isolated frame and does not follow the site theme. The tab is in the URL (`?d=r18|r19|r20|r21`).
 */
export default async function DesignDrawings({ current }: { current: DesignDrawingId }) {
    const t = await getTranslations('admin.development');
    const html = await DevelopmentService.getDrawing(current);

    return (
        <section id="drawings" className="mt-12 scroll-mt-24 border-t border-border pt-8">
            <h2 className="text-section text-foreground">{t('bookTitle')}</h2>
            <nav aria-label={t('bookTitle')} className="mt-4 flex gap-1 overflow-x-auto">
                {DESIGN_DRAWINGS.map((id) => (
                    <Link
                        key={id}
                        href={`/admin/handbook/design?d=${id}#drawings`}
                        aria-current={id === current ? 'page' : undefined}
                        className={buttonClass(id === current ? 'primary' : 'quiet', 'shrink-0', 'sm')}
                    >
                        {t(`drawings.${id}`)}
                    </Link>
                ))}
            </nav>
            <iframe key={current} title={t(`drawings.${current}`)} srcDoc={html} className="mt-4 h-[80dvh] min-h-96 w-full rounded-xl line bg-background" />
        </section>
    );
}
