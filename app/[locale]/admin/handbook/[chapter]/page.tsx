import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import HandbookMarkdown from '@/components/handbook/HandbookMarkdown';
import HandbookShell from '@/components/handbook/HandbookShell';
import { requireHandbookAccess } from '@/lib/handbook-access';
import { HandbookService, isChapterSlug } from '@/lib/services/handbook.service';

type Params = Promise<{ locale: string; chapter: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin.nav' });
    return { title: t('handbook') };
}

export default async function HandbookChapterPage({ params }: { params: Params }) {
    const { locale, chapter } = await params;
    await requireHandbookAccess(locale, `/admin/handbook/${chapter}`);
    if (!isChapterSlug(chapter)) notFound();

    const [chapters, page] = await Promise.all([HandbookService.listChapters(), HandbookService.getPage(chapter)]);

    return (
        <HandbookShell chapters={chapters} current={chapter} headings={page.headings}>
            <HandbookMarkdown markdown={page.markdown} />
        </HandbookShell>
    );
}
