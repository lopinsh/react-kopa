import { GroupService } from '@/lib/services/group.service';
import { notFound, redirect } from 'next/navigation';
import { MessageSquareText } from 'lucide-react';
import AnnouncementForm from '@/components/groups/announcements/AnnouncementForm';
import AnnouncementItem from '@/components/groups/announcements/AnnouncementItem';
import AnnouncementItemMenu from '@/components/groups/announcements/AnnouncementItemMenu';
import AnnouncementsLive from '@/components/groups/announcements/AnnouncementsLive';
import EmptyState from '@/components/ui/EmptyState';
import { getAnnouncementsPage } from '@/lib/services/announcements-page';
import PartTabs from '@/components/ui/PartTabs';
import { auth } from '@/lib/auth';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; groupSlug: string; l1Slug: string }>;
}): Promise<Metadata> {
    const { locale, groupSlug, l1Slug } = await params;
    const session = await auth();
    const group = await GroupService.getGroupWithContext(groupSlug, locale, l1Slug, session?.user?.id);
    const tCommon = await getTranslations({ locale, namespace: 'common' });

    if (!group) return {};

    return {
        title: `${group.name} | ${tCommon('announcementsTitle')}`,
    };
}

export default async function GroupAnnouncementsPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string; groupSlug: string; l1Slug: string }>;
    searchParams: Promise<{ tab?: string }>;
}) {
    const { locale, groupSlug, l1Slug } = await params;
    const { tab: tabParam } = await searchParams;
    const tab = tabParam === 'archive' ? 'archive' : 'current';
    const session = await auth();
    const group = await GroupService.getGroupWithContext(groupSlug, locale, l1Slug, session?.user?.id);

    if (!group) {
        notFound();
    }

    // Gated for members only
    const userId = session?.user?.id;
    if (!group.user.isMember || !userId) {
        redirect(`/${locale}/${l1Slug}/group/${groupSlug}`);
    }

    const [t, tFrame, page] = await Promise.all([
        getTranslations('group'),
        getTranslations('group.frame'),
        getAnnouncementsPage(group.id, userId, tab),
    ]);
    const base = `/${l1Slug}/group/${groupSlug}/announcements`;
    const tabs = [
        { key: 'current', label: t('announcementsTabCurrent'), href: base, count: page.counts.current },
        { key: 'archive', label: t('announcementsTabArchive'), href: `${base}?tab=archive`, count: page.counts.archive },
    ];

    return (
        <>
            <AnnouncementsLive groupId={group.id} />
            <PartTabs
                title={t('pages.announcements')}
                label={tFrame('partsLabel')}
                items={tabs}
                active={tab}
                action={page.canManage ? <AnnouncementForm groupId={group.id} locale={locale} canChooseVisibility={group.type === 'PUBLIC'} /> : undefined}
            />
            <div className="mt-4 grid max-w-[760px] gap-3">
                {page.items.length > 0 ? page.items.map((item) => (
                    <AnnouncementItem key={item.id} item={item} menu={page.canManage ? <AnnouncementItemMenu postId={item.id} archived={item.archivedAt !== null} /> : undefined} />
                )) : (
                    <EmptyState
                        icon={MessageSquareText}
                        title={tab === 'archive' ? t('announcementsArchiveEmpty') : t('noAnnouncementsYet')}
                        description={tab === 'current' && page.canManage ? t('announcementsTeamHint') : undefined}
                    />
                )}
            </div>
        </>
    );
}
