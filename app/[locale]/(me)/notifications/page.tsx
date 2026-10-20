import PageHead from '@/components/ui/PageHead';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { signInUrl } from '@/lib/auth-redirect';
import { NOTIFICATIONS_MAX_PAGES, NOTIFICATIONS_PAGE } from '@/lib/constants';
import { notificationPageSchema } from '@/lib/validations/notification';
import { NotificationService } from '@/lib/services/notification.service';
import { isSiteAdminUser } from '@/lib/services/site-role.service';
import NotificationFeed from '@/components/notifications/NotificationFeed';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'notifications' });
    return { title: t('title') };
}

/** Paziņojumi (AR-65): a page of your own area; phones open it from the bell. `?page=n` shows the first 30·n, `?tab=admin` is for site admins. */
export default async function NotificationsPage({ params, searchParams }: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const { locale } = await params;
    const session = await auth();
    if (!session?.user?.id) redirect(signInUrl(locale, '/notifications'));

    const raw = await searchParams;
    const query = notificationPageSchema.parse({ page: Array.isArray(raw.page) ? raw.page[0] : raw.page, tab: Array.isArray(raw.tab) ? raw.tab[0] : raw.tab });
    const [t, isAdmin] = await Promise.all([getTranslations('notifications'), isSiteAdminUser(session.user.id)]);
    const tab = query.tab === 'admin' && isAdmin ? 'admin' : 'user';
    const { rows, hasMore } = await NotificationService.list(session.user.id, {
        audience: tab === 'admin' ? 'ADMIN' : 'USER',
        take: NOTIFICATIONS_PAGE * query.page,
        locale,
    });

    return (
        <>
            {/* On desktop the marked menu item already names the page; on phones the name stands over the list. */}
            <PageHead phoneOnly title={t('title')} />
            <NotificationFeed key={`${tab}-${query.page}`} rows={rows} hasMore={hasMore && query.page < NOTIFICATIONS_MAX_PAGES} tab={tab} isAdmin={isAdmin} page={query.page} />
        </>
    );
}
