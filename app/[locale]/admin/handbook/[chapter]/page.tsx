import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import HandbookMarkdown from '@/components/handbook/HandbookMarkdown';
import DesignDrawings, { isDrawing } from '@/components/handbook/DesignDrawings';
import HandbookShell from '@/components/handbook/HandbookShell';
import { requireHandbookAccess } from '@/lib/handbook-access';
import { HandbookService, isChapterSlug } from '@/lib/services/handbook.service';

type Params = Promise<{ locale: string; chapter: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin.nav' });
    return { title: t('handbook') };
}

export default async function HandbookChapterPage({ params, searchParams }: { params: Params; searchParams: Promise<{ d?: string }> }) {
    const { locale, chapter } = await params;
    const { d } = await searchParams;
    await requireHandbookAccess(locale, `/admin/handbook/${chapter}`);
    if (!isChapterSlug(chapter)) notFound();

    const page = await HandbookService.getPage(chapter);
    const t = await getTranslations('admin.development');
    // The Design chapter ends with the approved drawings.
    const isDesign = chapter === 'design';
    const headings = isDesign ? [...page.headings, { id: 'drawings', text: t('bookTitle') }] : page.headings;

    return (
        <HandbookShell headings={headings}>
            <HandbookMarkdown markdown={page.markdown} />
            {isDesign && <DesignDrawings current={isDrawing(d) ? d : 'r18'} />}
        </HandbookShell>
    );
}
