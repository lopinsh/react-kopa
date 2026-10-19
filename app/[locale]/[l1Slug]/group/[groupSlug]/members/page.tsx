import { GroupService } from '@/lib/services/group.service';
import { GroupMembersService } from '@/lib/services/group-members';
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { UserCheck } from 'lucide-react';
import PartTabs from '@/components/ui/PartTabs';
import EmptyState from '@/components/ui/EmptyState';
import MemberRow from '@/components/groups/members/MemberRow';
import RequestRow from '@/components/groups/members/RequestRow';
import type { Metadata } from 'next';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; groupSlug: string; l1Slug: string }>;
}): Promise<Metadata> {
    const { locale, groupSlug, l1Slug } = await params;
    const session = await auth();
    const group = await GroupService.getGroupWithContext(groupSlug, locale, l1Slug, session?.user?.id);
    const t = await getTranslations('group');

    if (!group) return {};

    return {
        title: t('membersPageTitle', { name: group.name }),
    };
}

export default async function GroupMembersPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string; groupSlug: string; l1Slug: string }>;
    searchParams: Promise<{ tab?: string }>;
}) {
    const { locale, groupSlug, l1Slug } = await params;
    const { tab = 'members' } = await searchParams;
    const session = await auth();
    const group = await GroupService.getGroupWithContext(groupSlug, locale, l1Slug, session?.user?.id);

    if (!group) {
        notFound();
    }

    // Gated for members only
    if (!group.user.isMember) {
        redirect(`/${locale}/${l1Slug}/group/${groupSlug}`);
    }

    const t = await getTranslations('group');
    const tCommon = await getTranslations('common');
    const tFrame = await getTranslations('group.frame');
    const { members, requests } = await GroupMembersService.getMembersPage(group, session?.user?.id);
    // Requests are for the team only: anyone else with ?tab=requests sees the members.
    const currentTab = requests && tab === 'requests' ? 'requests' : 'members';
    const base = `/${l1Slug}/group/${groupSlug}`;

    return (
        <>
            <PartTabs
                title={t('pages.members')}
                label={tFrame('partsLabel')}
                active={currentTab}
                items={[
                    { key: 'members', label: tCommon('membersList'), href: `${base}/members` },
                    ...(requests ? [{ key: 'requests', label: tCommon('requestsTab'), href: `${base}/members?tab=requests`, count: requests.length }] : []),
                ]}
            />
            <div className="max-w-[760px]">
                {currentTab === 'requests' && requests ? (
                    requests.length > 0 ? (
                        <ul className="divide-y divide-border">
                            {requests.map((r) => <RequestRow key={r.membershipId} request={r} />)}
                        </ul>
                    ) : (
                        <EmptyState icon={UserCheck} title={tCommon('noActivity')} description={t('noPendingRequests')} />
                    )
                ) : (
                    <ul className="divide-y divide-border">
                        {members.map((m) => <MemberRow key={m.userId} member={m} groupId={group.id} />)}
                    </ul>
                )}
            </div>
        </>
    );
}
