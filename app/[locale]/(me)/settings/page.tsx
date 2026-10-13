import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { signInUrl } from '@/lib/auth-redirect';
import AppearanceSetting from '@/components/me/AppearanceSetting';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'profile.settings' });
    return { title: t('title') };
}

/** Iestatījumi: the last page of your own area. The other settings stay on Labot profilu until R9b (OD-26). */
export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const session = await auth();
    if (!session?.user?.id) redirect(signInUrl(locale, '/settings'));

    const t = await getTranslations('profile.settings');

    return (
        <div className="grid max-w-xl gap-4 px-4 py-4 md:px-0 md:pt-0">
            {/* On desktop the marked menu item already names the page; on phones the name stands over the content. */}
            <h1 className="font-heading text-xl font-semibold md:sr-only">{t('title')}</h1>
            <AppearanceSetting />
        </div>
    );
}
