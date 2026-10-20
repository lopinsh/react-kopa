import PageHead from '@/components/ui/PageHead';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { signInUrl } from '@/lib/auth-redirect';
import AppearanceSetting from '@/components/me/AppearanceSetting';
import PrivacySettings from '@/components/me/PrivacySettings';
import { UserService } from '@/lib/services/user.service';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'profile.settings' });
    return { title: t('title') };
}

/** Iestatījumi: the last page of your own area: Privātums (who sees what, OD-26), then Izskats. */
export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const session = await auth();
    if (!session?.user?.id) redirect(signInUrl(locale, '/settings'));

    const [t, privacy] = await Promise.all([getTranslations('profile.settings'), UserService.getPrivacySettings(session.user.id)]);
    if (!privacy) redirect(`/${locale}`);

    return (
        <div className="grid max-w-xl gap-4">
            {/* On desktop the marked menu item already names the page; on phones the name stands over the content. */}
            <PageHead phoneOnly title={t('title')} />
            <PrivacySettings initial={privacy} />
            <AppearanceSetting />
        </div>
    );
}
