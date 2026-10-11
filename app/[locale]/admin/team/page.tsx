import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { UserCog } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { signInUrl } from '@/lib/auth-redirect';
import { isSiteOwner } from '@/lib/site-role';
import { TeamService } from '@/lib/services/team.service';
import TeamManager from '@/components/admin/TeamManager';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin.nav' });
    return { title: t('team') };
}

/** Owner-only: who the site admins are. Everyone else gets a 404. */
export default async function AdminTeamPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('admin.team');

    const session = await auth();
    if (!session?.user?.id) redirect(signInUrl(locale, '/admin/team'));
    if (!isSiteOwner(session.user.role)) notFound();

    const result = await TeamService.listTeam(session.user.id);
    if (!result.success) notFound();

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <UserCog className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">{t('title')}</h1>
                    <p className="mt-1 text-foreground-muted">{t('subtitle')}</p>
                </div>
            </div>
            <TeamManager team={result.data ?? []} />
        </div>
    );
}
