import { GroupService } from '@/lib/services/group.service';
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { User as UserIcon } from 'lucide-react';
import MembershipPanel from '@/components/groups/MembershipPanel';
import GroupPartTabs from '@/components/groups/frame/GroupPartTabs';
import MemberCard from '@/components/groups/MemberCard';
import type { Metadata } from 'next';
import { MembershipRole } from '@prisma/client';
import { MessageService } from '@/lib/services/message.service';

interface Member {
    id: string;
    role: MembershipRole | 'PENDING';
    user: {
        id: string;
        name: string | null;
        username?: string | null;
        avatarSeed?: string;
        image: string | null;
        allowDirectMessages: boolean;
        isProfilePublic: boolean;
    };
    chatId: string | null;
    applicationMessages: {
        id: string;
        content: string;
        createdAt: Date;
        senderId: string;
        sender: { name: string | null; image: string | null };
    }[];
}

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
    const c_common_get = await getTranslations('common');
    const isOwnerOrAdmin = group.user.isAdmin;
    const members = await GroupService.getMembers(group, session?.user?.id);
    const pendingMembers = members.filter((m) => m.role === 'PENDING') as Member[];
    const acceptedMembers = members.filter((m) => m.role !== 'PENDING')
        .sort((a, b) => {
            const roles: Record<string, number> = { OWNER: 0, ADMIN: 1, MEMBER: 2, PENDING: 3 };
            return roles[a.role as keyof typeof roles] - roles[b.role as keyof typeof roles];
        }) as Member[];

    // Who this viewer may start a chat with is decided here, not in the card.
    const messageable = await MessageService.messageableUserIds(session?.user?.id, acceptedMembers.map((m) => m.user.id));

    // Ensure users can't see requests if not admin
    const currentTab = isOwnerOrAdmin && tab === 'requests' ? 'requests' : 'members';
    const tFrame = await getTranslations('group.frame');
    const base = `/${l1Slug}/group/${groupSlug}`;

    return (
        <>
            <GroupPartTabs
                title={t('pages.members')}
                label={tFrame('partsLabel')}
                active={currentTab}
                items={[
                    { key: 'members', label: c_common_get('membersList'), href: `${base}/members` },
                    ...(isOwnerOrAdmin ? [{ key: 'requests', label: c_common_get('requestsTab'), href: `${base}/members?tab=requests`, count: group.stats.pendingCount }] : []),
                ]}
            />
            {currentTab === 'requests' ? (
                <div className="space-y-8">
                    {pendingMembers.length > 0 ? (
                        <MembershipPanel
                            groupId={group.id}
                            pendingMembers={pendingMembers}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="h-16 w-16 rounded-full bg-surface-elevated flex items-center justify-center mb-4">
                                <UserIcon className="h-8 w-8 text-foreground-muted/30" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">{c_common_get('noActivity')}</h3>
                            <p className="text-sm text-foreground-muted mt-1 max-w-xs mx-auto">
                                {t('noPendingRequests')}
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {acceptedMembers.map((member) => (
                        <MemberCard
                            key={member.id}
                            member={member}
                            canMessage={messageable.has(member.user.id)}
                            groupId={group.id}
                            locale={locale}
                            l1Slug={l1Slug}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
