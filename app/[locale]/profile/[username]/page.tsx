import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { redirect } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { ShieldAlert } from 'lucide-react';
import { UserService } from '@/lib/services/user.service';
import MessageUserButton from '@/components/messages/MessageUserButton';
import EmptyState from '@/components/ui/EmptyState';
import ProfileView from '@/components/profile/ProfileView';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; username: string }> }): Promise<Metadata> {
    const { locale, username } = await params;
    const t = await getTranslations({ locale, namespace: 'profile' });
    return { title: t('handle', { username }) };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ locale: string; username: string }> }) {
    const { locale, username } = await params;
    const session = await auth();
    const t = await getTranslations('profile');

    const view = await UserService.getProfileView({ username }, session?.user?.id, locale);
    if (!view) notFound();

    // One page per person for yourself: Mans profils.
    if (view.isOwn) redirect({ href: '/profile', locale });

    if (view.isPrivate) {
        return (
            <div className="container mx-auto max-w-2xl px-4 py-24 text-center">
                <EmptyState icon={ShieldAlert} title={t('privateProfile')} description={t('privateProfileDesc')} />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <ProfileView view={view} viewerId={session?.user?.id} locale={locale} action={view.canMessage ? <MessageUserButton userId={view.person.id} /> : undefined} />
        </div>
    );
}
