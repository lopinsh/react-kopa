import { ActionError } from '@/types/actions';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { requireAdminPage } from '@/lib/admin-access';
import { TeamService } from '@/lib/services/team.service';
import TeamManager from '@/components/admin/TeamManager';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin.nav' });
    return { title: t('team') };
}

/** Who the site admins are. Every admin can see it and message them; only the owner can change roles. Everyone else gets a 404. */
export default async function AdminTeamPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('admin.team');

    const { userId, isOwner } = await requireAdminPage(locale, '/admin/team');

    const team = await TeamService.listTeam(userId).catch((e: unknown) => { if (e instanceof ActionError) notFound(); throw e; });

    return (
        <div className="space-y-6">
            <AdminPageHeader title={t('title')} subtitle={t(isOwner ? 'subtitle' : 'subtitleReadOnly')} />
            <TeamManager team={team} canManage={isOwner} viewerId={userId} />
        </div>
    );
}
