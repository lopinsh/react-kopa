import type { Metadata } from 'next';
import { requireAdminPage } from '@/lib/admin-access';
import { ReportService } from '@/lib/services/report.service';
import ReportList from './ReportList';
import { getTranslations } from 'next-intl/server';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin.nav' });
    return { title: t('reports') };
}

export default async function AdminReportsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations('admin.reports');
    await requireAdminPage(locale, '/admin/reports');

    const reports = await ReportService.getPendingReports();

    return (
        <div className="space-y-6">
            <AdminPageHeader title={t('title')} subtitle={t('subtitle')} />

            <ReportList initialReports={reports} />
        </div>
    );
}
