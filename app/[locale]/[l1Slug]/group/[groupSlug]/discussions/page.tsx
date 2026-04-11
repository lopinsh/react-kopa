import { GroupService } from '@/lib/services/group.service';
import { notFound, redirect } from 'next/navigation';
import DiscussionBoard from '@/components/groups/DiscussionBoard';
import { auth } from '@/lib/auth';
import type { Metadata } from 'next';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; groupSlug: string; l1Slug: string }>;
}): Promise<Metadata> {
    const { locale, groupSlug, l1Slug } = await params;
    const session = await auth();
    const group = await GroupService.getGroupWithContext(groupSlug, locale, l1Slug, session?.user?.id);

    if (!group) return {};

    return {
        title: `${group.name} | Discussions | Ejam kopā`,
    };
}

export default async function GroupDiscussionsPage({
    params,
}: {
    params: Promise<{ locale: string; groupSlug: string; l1Slug: string }>;
}) {
    const { locale, groupSlug, l1Slug } = await params;
    const session = await auth();
    const group = await GroupService.getGroupWithContext(groupSlug, locale, l1Slug, session?.user?.id);

    if (!group) {
        notFound();
    }

    // Gated for members only
    if (!group.user.isMember) {
        redirect(`/${locale}/${l1Slug}/group/${groupSlug}`);
    }

    return (
        <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <DiscussionBoard
                groupId={group.id}
                locale={locale}
                currentUserId={session?.user?.id}
            />
        </section>
    );
}
