import { GroupService } from '@/lib/services/group.service';
import { getTaxonomy } from '@/actions/taxonomy-actions';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import GroupSettingsForm from '@/components/groups/GroupSettingsForm';
import MembershipPanel from '@/components/groups/MembershipPanel';
import SettingsTabs, { type SettingsTab } from '@/components/groups/SettingsTabs';
import { deriveInitialTaxonomy } from '@/lib/utils/taxonomy-utils';
import { signInUrl } from '@/lib/auth-redirect';

type Params = { locale: string; groupSlug: string; l1Slug: string };

/** The six old tabs became two; old links land on the right tab (and block). */
const LEGACY_TABS: Record<string, string> = {
    profile: 'group',
    social: 'group#links',
    categorization: 'group#category',
    privacy: 'group#access',
    danger: 'group#danger-zone',
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const { locale, groupSlug, l1Slug } = await params;
    const session = await auth();
    const group = await GroupService.getGroupWithContext(groupSlug, locale, l1Slug, session?.user?.id);
    const t = await getTranslations({ locale, namespace: 'groupSettings' });

    return { title: group ? t('pageTitle', { name: group.name }) : t('tabGroup'), robots: { index: false } };
}

export default async function GroupSettingsPage(props: {
    params: Promise<Params>;
    searchParams: Promise<{ tab?: string }>;
}) {
    const { locale, groupSlug, l1Slug } = await props.params;
    const { tab } = await props.searchParams;
    const session = await auth();

    if (!session?.user?.id) {
        redirect(signInUrl(locale, `/${l1Slug}/group/${groupSlug}/settings`));
    }

    if (tab && LEGACY_TABS[tab]) {
        const [newTab, hash] = LEGACY_TABS[tab].split('#');
        redirect(`/${locale}/${l1Slug}/group/${groupSlug}/settings?tab=${newTab}${hash ? `#${hash}` : ''}`);
    }

    const group = await GroupService.getGroupWithContext(groupSlug, locale, l1Slug, session.user.id);
    if (!group) {
        notFound();
    }

    const isAppAdmin = session.user.role === 'ADMIN';

    // Owner and moderators manage the group; site admins can override without membership.
    if (!group.user.isAdmin && !isAppAdmin) {
        redirect(`/${locale}/${l1Slug}/group/${groupSlug}`);
    }

    const taxonomyRes = await getTaxonomy(locale);
    if (!taxonomyRes.success) {
        notFound();
    }
    const taxonomy = taxonomyRes.data ?? [];

    const initialTaxonomy = deriveInitialTaxonomy(group, taxonomy);

    const isOwner = group.user.role === 'OWNER';
    // Name, category, topics and access: the owner (and site admins). Moderators manage the rest.
    const canEditOwnerFields = isOwner || isAppAdmin;
    const t = await getTranslations('group');
    const pendingMembers = group.members.filter((m) => m.role === 'PENDING');
    const transferCandidates = isOwner
        ? group.members
            .filter((m): m is typeof m & { role: 'ADMIN' | 'MEMBER' } => m.role === 'ADMIN' || m.role === 'MEMBER')
            .map((m) => ({ userId: m.user.id, name: m.user.name || t('anonymousUser'), role: m.role }))
        : [];

    const activeTab: SettingsTab = tab === 'sections' ? 'sections' : 'group';
    // The editor gets the text of every language (managers only).
    const editableSections = activeTab === 'sections' ? await GroupService.getEditableSections(group.id, session.user.id) : [];

    return (
        <div className="mx-auto w-full max-w-4xl animate-in space-y-6 px-4 py-6 fade-in slide-in-from-bottom-2 duration-500 md:px-8 md:py-8">
            {pendingMembers.length > 0 && (
                <MembershipPanel
                    groupId={group.id}
                    pendingMembers={pendingMembers}
                    locale={locale}
                />
            )}

            <SettingsTabs active={activeTab} />

            <div className="min-h-[400px] rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-8 md:p-10">
                <GroupSettingsForm
                    group={{
                        id: group.id,
                        name: group.name,
                        city: group.city,
                        type: group.type,
                        categoryId: group.categoryId,
                        isAcceptingMembers: group.isAcceptingMembers,
                        discordLink: group.socialLinks.discord,
                        websiteLink: group.socialLinks.website,
                        instagramLink: group.socialLinks.instagram,
                        bannerImage: group.bannerImage,
                        sections: editableSections,
                        tags: group.tags || [],
                        slug: group.slug,
                        l1Slug: group.category.l1Slug,
                    }}
                    taxonomy={taxonomy}
                    locale={locale}
                    activeTab={activeTab}
                    canEditOwnerFields={canEditOwnerFields}
                    isOwner={isOwner}
                    transferCandidates={transferCandidates}
                    initialTaxonomy={initialTaxonomy}
                />
            </div>
        </div>
    );
}
