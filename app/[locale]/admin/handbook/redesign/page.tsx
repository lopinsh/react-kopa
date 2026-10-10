import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import HandbookShell from '@/components/handbook/HandbookShell';
import { requireHandbookAccess } from '@/lib/handbook-access';
import { HandbookService } from '@/lib/services/handbook.service';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin.handbook' });
    return { title: t('redesign') };
}

/** The redesign discussion (discussion only, nothing is built from it). The HTML is our own file from the repo, scoped under `.rd`. */
export default async function HandbookRedesignPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    await requireHandbookAccess(locale, '/admin/handbook/redesign');

    const [chapters, html] = await Promise.all([HandbookService.listChapters(), HandbookService.getRedesignHtml()]);

    return (
        <HandbookShell chapters={chapters} current={null} headings={[]} active="redesign" wide>
            <div dangerouslySetInnerHTML={{ __html: html }} />
        </HandbookShell>
    );
}
