import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { requireAdminPage } from '@/lib/admin-access';
import { ActivityService } from '@/lib/services/activity.service';
import { ACTIVITY_FILTERS } from '@/lib/constants/activity';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ActivityFeed from '@/components/admin/activity/ActivityFeed';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin.nav' });
    return { title: t('activity') };
}

export default async function AdminActivityPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ type?: string }>;
}) {
    const { locale } = await params;
    const { type } = await searchParams;
    const t = await getTranslations('admin.activity');
    await requireAdminPage(locale, '/admin/activity');

    const filter = ACTIVITY_FILTERS.find((f) => f === type) ?? 'all';
    const page = await ActivityService.getPage({ filter, cursor: null, locale });

    return (
        <div className="space-y-6">
            <AdminPageHeader title={t('title')} subtitle={t('subtitle')} />
            <ActivityFeed key={filter} filter={filter} initial={page} />
        </div>
    );
}
