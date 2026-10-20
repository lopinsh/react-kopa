import PageHead from '@/components/ui/PageHead';
import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { UserService } from '@/lib/services/user.service';
import { getTimeZone, getTranslations } from 'next-intl/server';
import { LogIn } from 'lucide-react';
import { signInUrl } from '@/lib/auth-redirect';
import EmptyState from '@/components/ui/EmptyState';
import { buttonClass } from '@/components/ui/Button';
import MyGroupsSections from '@/components/me/MyGroupsSections';
import MarkMyGroupsSeen from '@/components/me/MarkMyGroupsSeen';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'nav' });
    return { title: t('myGroups') };
}

/** Manas grupas (AR-61): what is coming up and new in your groups, your groups, and your requests. Signed out: an invitation to sign in. */
export default async function MyGroupsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const session = await auth();
    const tAuth = await getTranslations('auth');

    if (!session?.user?.id) {
        return (
            <EmptyState
                icon={LogIn}
                title={tAuth('signInToSeeGroups')}
                description={tAuth('modalDesc')}
                action={<a href={signInUrl(locale, '/profile/my-groups')} className={buttonClass('primary')}>{tAuth('signInButton')}</a>}
            />
        );
    }

    const [t, overview] = await Promise.all([
        getTranslations('nav'),
        UserService.getMyGroupsOverview(session.user.id, locale, await getTimeZone()),
    ]);

    return (
        <>
            {/* On desktop the marked menu item already names the page; on phones the name stands over the content. */}
            <PageHead phoneOnly title={t('myGroups')} />
            <MyGroupsSections overview={overview} />
            <MarkMyGroupsSeen />
        </>
    );
}
