import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { UserCog } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { requireAdminPage } from '@/lib/admin-access';
import { TeamService } from '@/lib/services/team.service';
import TeamManager from '@/components/admin/TeamManager';

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

    const result = await TeamService.listTeam(userId);
    if (!result.success) notFound();

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <UserCog className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">{t('title')}</h1>
                    <p className="mt-1 text-foreground-muted">{t(isOwner ? 'subtitle' : 'subtitleReadOnly')}</p>
                </div>
            </div>
            <TeamManager team={result.data ?? []} canManage={isOwner} viewerId={userId} />
        </div>
    );
}
