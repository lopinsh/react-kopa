import { GroupService } from '@/lib/services/group.service';
import { getTaxonomy } from '@/actions/taxonomy-actions';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import GroupSettingsForm from '@/components/groups/GroupSettingsForm';
import { Settings } from 'lucide-react';
import MembershipPanel from '@/components/groups/MembershipPanel';
import SettingsTabs from '@/components/groups/SettingsTabs';
import { deriveInitialTaxonomy } from '@/lib/utils/taxonomy-utils';

export default async function GroupSettingsPage(props: {
    params: Promise<{ locale: string; groupSlug: string; l1Slug: string }>;
    searchParams: Promise<{ tab?: string }>;
}) {
    const { locale, groupSlug, l1Slug } = await props.params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect(`/${locale}/api/auth/signin`);
    }

    const group = await GroupService.getGroupWithContext(groupSlug, locale, l1Slug, session?.user?.id);

    if (!group) {
        notFound();
    }

    // Must be a member to see any settings
    if (!group.isMember) {
        redirect(`/${locale}/${l1Slug}/group/${groupSlug}`);
    }

    const t = await getTranslations('group');
    const taxonomyRes = await getTaxonomy(locale);
    if (!taxonomyRes.success) {
        notFound();
    }
    const taxonomy = taxonomyRes.data!;

    // Server-side taxonomy derivation
    const initialTaxonomy = deriveInitialTaxonomy(group, taxonomy);

    const isOwnerOrAdmin = group.userRole === 'OWNER' || group.userRole === 'ADMIN';
    const isOwner = group.userRole === 'OWNER';
    const pendingMembers = isOwnerOrAdmin ? (group.members || []).filter((m: any) => m.role === 'PENDING') : [];

    const searchParams = await props.searchParams;
    const currentTab = searchParams.tab || 'profile';

    // Role-based tab gating
    const allowedTabs = isOwner
        ? ['profile', 'social', 'sections', 'categorization', 'privacy', 'danger']
        : ['profile', 'social', 'sections'];

    const activeTab = allowedTabs.includes(currentTab) ? currentTab : 'profile';

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8">
            {isOwnerOrAdmin && pendingMembers.length > 0 && (
                <MembershipPanel
                    groupId={group.id}
                    pendingMembers={pendingMembers}
                    locale={locale}
                />
            )}

            <div className="grid gap-6">
                <SettingsTabs accentColor={group.accentColor} isOwner={isOwner} />

                <div className="space-y-12">
                    <div className="rounded-[40px] border border-border bg-surface p-8 md:p-12 shadow-sm min-h-[400px]">
                        <GroupSettingsForm
                            group={{
                                id: group.id,
                                name: group.name,
                                city: group.city,
                                type: group.type,
                                categoryId: group.categoryId,
                                isAcceptingMembers: group.isAcceptingMembers,
                                discordLink: group.discordLink,
                                websiteLink: group.websiteLink,
                                instagramLink: group.instagramLink,
                                bannerImage: group.bannerImage,
                                sections: group.sections || [],
                                tags: group.tags || [],
                                category: group.category,
                                slug: group.slug,
                                l1Slug: group.category.l1Slug,
                                accentColor: group.accentColor
                            }}
                            taxonomy={taxonomy}
                            locale={locale}
                            userRole={group.userRole as 'OWNER' | 'ADMIN'}
                            activeTab={activeTab}
                            initialTaxonomy={initialTaxonomy}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
