import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getReports } from '@/actions/report-actions';
import ReportList from './ReportList';
import { ShieldAlert } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function AdminReportsPage() {
    const t = await getTranslations('admin');
    const session = await auth();
    // In a real app, verify admin role here
    if (!session?.user?.id) {
        redirect('/api/auth/signin');
    }

    const reports = await getReports();

    return (
        <div className="container mx-auto px-4 py-12 min-h-full">
            <div className="mb-8 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                    <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">
                        {t('moderationReports')}
                    </h1>
                    <p className="text-foreground-muted mt-1">
                        {t('moderationReportsDesc')}
                    </p>
                </div>
            </div>

            <ReportList initialReports={reports} />
        </div>
    );
}
