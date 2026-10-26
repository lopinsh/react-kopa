import { GroupService } from '@/lib/services/group.service';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import HiddenGroupBanner from '@/components/groups/HiddenGroupBanner';
import GroupBanner from '@/components/groups/frame/GroupBanner';
import GroupStickyBar from '@/components/groups/frame/GroupStickyBar';
import GroupPagesNav from '@/components/groups/frame/GroupPagesNav';
import FrameColumns from '@/components/ui/FrameColumns';
import GroupAside from '@/components/groups/frame/GroupAside';
import { GroupProvider } from '@/components/providers/GroupProvider';
import { GroupDialogsProvider } from '@/components/groups/frame/GroupDialogs';
import AdminGroupBridge from '@/components/admin-panel/AdminGroupBridge';
import { toGroupState } from '@/components/providers/to-group-state';

/**
 * The frame of a group (AR-47): the banner, the pages down the left (a ☰ drawer on phones) and the page beside them.
 * The side column holds the picture, members, next meeting and links. Same container and grid as the own area's, so header, banner, pages column and page line up at every width.
 */
export default async function GroupLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string; groupSlug: string; l1Slug: string }>;
}) {
    const { locale, groupSlug, l1Slug } = await params;
    const session = await auth();
    const group = await GroupService.getGroupWithContext(groupSlug, locale, l1Slug, session?.user?.id);

    if (!group) {
        notFound();
    }

    return (
        <GroupProvider value={toGroupState(group)}>
            {/* var(--cat-<l1Slug>) or a validated hex from TaxonomyResolver: safe inside <style>. Light/dark come from the site theme. The picture is an element in the banner, never a URL here. */}
            <style dangerouslySetInnerHTML={{ __html: `:root{--accent:${group.theme.accentColor};--accent-foreground:var(--on-cat)}@media(max-width:767px){:root{--sticky-bar:2.5rem}}` }} />
            {group.moderation.hidden && (
                <HiddenGroupBanner groupId={group.id} reason={group.moderation.hidden.reason} canRestore={group.moderation.isSiteAdmin} />
            )}
            {group.moderation.isSiteAdmin && <AdminGroupBridge />}
            <GroupDialogsProvider>
            <GroupStickyBar />
            <GroupBanner />
            <FrameColumns
                nav={<GroupPagesNav variant="side" />}
                aside={<GroupAside group={{ id: group.id, memberCount: group.stats.memberCount, bannerImage: group.bannerImage, bannerCredit: group.bannerCredit, l1Slug: group.category.l1Slug, base: `/${l1Slug}/group/${group.slug}`, isMember: group.user.isMember, socialLinks: group.socialLinks }} viewerId={session?.user?.id} />}
            >
                {children}
            </FrameColumns>
            </GroupDialogsProvider>
        </GroupProvider>
    );
}
