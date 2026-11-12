import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { requireAdminPage } from '@/lib/admin-access';
import { MatrixService } from '@/lib/services/matrix.service';
import { MatrixTrialService } from '@/lib/services/matrix-trial.service';
import { ActionError } from '@/types/actions';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import MatrixTrialPanel from '@/components/admin/matrix/MatrixTrialPanel';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin.matrixTrial' });
    return { title: t('title'), robots: { index: false } };
}

/** K4 Matrix trial: admin only, not linked from anywhere. Without MATRIX_* it only says so. */
export default async function AdminMatrixPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('admin.matrixTrial');
    await requireAdminPage(locale, '/admin/matrix');

    const status = await MatrixService.status().catch((e: unknown) => {
        if (e instanceof ActionError) return { configured: true, reachable: false, serverName: null, publicUrl: null, version: null };
        throw e;
    });
    const trial = status.reachable ? await MatrixTrialService.find().catch(() => null) : null;

    return (
        <div className="space-y-6">
            <AdminPageHeader title={t('title')} subtitle={t('intro')} />
            <MatrixTrialPanel status={status} trial={trial} />
        </div>
    );
}
