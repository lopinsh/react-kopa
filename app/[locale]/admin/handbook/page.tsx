import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import HandbookMarkdown from '@/components/handbook/HandbookMarkdown';
import HandbookShell from '@/components/handbook/HandbookShell';
import { requireHandbookAccess } from '@/lib/handbook-access';
import { HandbookService } from '@/lib/services/handbook.service';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin.nav' });
    return { title: t('handbook') };
}

export default async function HandbookIndexPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    await requireHandbookAccess(locale, '/admin/handbook');

    const [chapters, page] = await Promise.all([HandbookService.listChapters(), HandbookService.getPage(null)]);

    return (
        <HandbookShell chapters={chapters} current={null} headings={page.headings}>
            <HandbookMarkdown markdown={page.markdown} />
        </HandbookShell>
    );
}
