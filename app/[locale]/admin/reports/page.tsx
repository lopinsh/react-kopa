import type { Metadata } from 'next';
import { requireAdminPage } from '@/lib/admin-access';
import { ReportService } from '@/lib/services/report.service';
import ReportList from './ReportList';
import { ShieldAlert } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

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
            <div className="mb-8 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/10 text-danger">
                    <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                        {t('title')}
                    </h1>
                    <p className="text-foreground-muted mt-1">
                        {t('subtitle')}
                    </p>
                </div>
            </div>

            <ReportList initialReports={reports} />
        </div>
    );
}
