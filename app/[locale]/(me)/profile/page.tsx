import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { UserService } from '@/lib/services/user.service';
import { signInUrl } from '@/lib/auth-redirect';
import { buttonClass } from '@/components/ui/Button';
import { Link } from '@/i18n/routing';
import ProfileView from '@/components/profile/ProfileView';
import ProfileViewerNote from '@/components/profile/ProfileViewerNote';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'nav' });
    return { title: t('myProfile') };
}

/** Mans profils: exactly what others see (a signed-in person who shares no group with you), with "Labot profilu" at the facts line (OD-26). */
export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const session = await auth();
    if (!session?.user?.id) redirect(signInUrl(locale, '/profile'));

    const [t, view, privacy] = await Promise.all([
        getTranslations('profile'),
        UserService.getProfileView({ userId: session.user.id }, session.user.id, locale, { asStranger: true }),
        UserService.getPrivacySettings(session.user.id),
    ]);
    if (!view || !privacy) redirect(`/${locale}`);

    return (
        <div className="grid gap-5">
            <ProfileViewerNote privacy={privacy} />
            <ProfileView
                view={view}
                viewerId={session.user.id}
                locale={locale}
                own
                action={<Link href="/profile/edit" className={buttonClass('secondary')}>{t('editTitle')}</Link>}
            />
        </div>
    );
}
