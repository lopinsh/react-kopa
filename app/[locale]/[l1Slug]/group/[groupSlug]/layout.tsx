import { GroupService } from '@/lib/services/group.service';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import HiddenGroupBanner from '@/components/groups/HiddenGroupBanner';
import GroupBanner from '@/components/groups/frame/GroupBanner';
import GroupPagesNav from '@/components/groups/frame/GroupPagesNav';
import { GroupProvider } from '@/components/providers/GroupProvider';
import { toGroupState } from '@/components/providers/to-group-state';

/**
 * The frame of a group (AR-47): the banner, the pages down the left (a ☰ drawer on phones) and the page beside them.
 * Same container and grid as the own area's, so header, banner, pages column and page line up at every width.
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
            <style dangerouslySetInnerHTML={{ __html: `:root{--accent:${group.theme.accentColor};--accent-foreground:var(--on-cat)}` }} />
            {group.moderation.hidden && (
                <HiddenGroupBanner groupId={group.id} reason={group.moderation.hidden.reason} canRestore={group.moderation.isSiteAdmin} />
            )}
            <GroupBanner />
            <div className="mx-auto max-w-6xl px-3 pb-6 pt-3 md:grid md:grid-cols-[190px_minmax(0,1fr)] md:gap-[22px] md:px-[22px] md:pt-[18px]">
                <GroupPagesNav variant="side" />
                <div className="grid min-w-0 content-start gap-3">{children}</div>
            </div>
        </GroupProvider>
    );
}
