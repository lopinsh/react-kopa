import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Calendar, Search } from 'lucide-react';
import AccentScope from '@/components/handbook/AccentScope';
import HandbookShell from '@/components/handbook/HandbookShell';
import { AnnouncementDemo, ChipDemo, InboxDemo, PopupDemo, ToastDemo } from '@/components/handbook/UiElementsDemos';
import UiSpecimen from '@/components/handbook/UiSpecimen';
import ThemeToggle from '@/components/shell/ThemeToggle';
import AuthTextField from '@/components/auth/AuthTextField';
import EventCard from '@/components/discovery/EventCard';
import GroupCard from '@/components/discovery/GroupCard';
import ListViewCard from '@/components/discovery/ListViewCard';
import ListViewEventCard from '@/components/discovery/ListViewEventCard';
import MembersOnlyNotice from '@/components/events/MembersOnlyNotice';
import CompactGroupBar from '@/components/groups/CompactGroupBar';
import EventRow from '@/components/groups/EventRow';
import GroupHeader from '@/components/groups/GroupHeader';
import HiddenGroupBanner from '@/components/groups/HiddenGroupBanner';
import MemberCard from '@/components/groups/MemberCard';
import RequestCard from '@/components/groups/RequestCard';
import SettingsTabs from '@/components/groups/SettingsTabs';
import { GroupProvider } from '@/components/providers/GroupProvider';
import Badge from '@/components/ui/Badge';
import Button, { buttonClass } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { UI } from '@/lib/constants';
import { requireHandbookAccess } from '@/lib/handbook-access';
import { buildUiSamples } from '@/lib/handbook/ui-samples';
import { HandbookService } from '@/lib/services/handbook.service';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin.handbook.ui' });
    return { title: t('title') };
}

export default async function UiElementsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    await requireHandbookAccess(locale, '/admin/handbook/ui-elements');

    const t = await getTranslations('admin.handbook.ui');
    const chapters = await HandbookService.listChapters();
    const samples = buildUiSamples((key) => t(`sample.${key}`), locale);
    const { group, memberGroupContext } = samples;
    const groupState = (g: typeof group) => ({ id: g.id, slug: g.slug, user: g.user, sections: [] });

    return (
        <HandbookShell chapters={chapters} current={null} headings={[]} active="ui-elements" wide>
            <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">{t('title')}</h1>
                    <p className="mt-2 max-w-[70ch] text-foreground-muted">{t('intro')}</p>
                    <p className="mt-2 max-w-[70ch] text-sm text-foreground-muted">{t('sampleNote')}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-surface px-2 py-1 text-xs text-foreground-muted">
                    <span className="hidden sm:inline">{t('theme')}</span>
                    <ThemeToggle />
                </div>
            </div>

            <div className="space-y-12">
                <UiSpecimen id="buttons" names={[UI.buttonPrimary, UI.buttonSecondary, UI.buttonDanger]} files={['components/ui/Button.tsx']}>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button>{t('buttonPrimary')}</Button>
                        <Button variant="secondary">{t('buttonSecondary')}</Button>
                        <Button variant="danger">{t('buttonDanger')}</Button>
                        <Button disabled>{t('buttonWorking')}</Button>
                        <a href="#buttons" className={buttonClass('primary')}>{t('buttonLink')}</a>
                    </div>
                </UiSpecimen>

                <UiSpecimen id="badges" names={[UI.badge]} files={['components/ui/Badge.tsx']}>
                    <AccentScope color={samples.accent} className="flex flex-wrap items-center gap-2">
                        <Badge>{t('sample.badgeMembers')}</Badge>
                        <Badge>{t('sample.badgeRequest')}</Badge>
                        <Badge tone="accent">{t('sample.badgeFull')}</Badge>
                    </AccentScope>
                </UiSpecimen>

                <UiSpecimen id="chips" names={[UI.filterChip]} files={['components/ui/FilterChip.tsx']}>
                    <ChipDemo />
                </UiSpecimen>

                <UiSpecimen id="fields" names={[UI.formField]} files={['components/auth/AuthTextField.tsx']}>
                    <div className="grid max-w-2xl gap-5 sm:grid-cols-2">
                        <AuthTextField id="demo-plain" label={t('fieldLabel')} hint={t('fieldHint')} placeholder={t('fieldPlaceholder')} readOnly />
                        <AuthTextField id="demo-error" label={t('fieldLabel')} error={t('fieldError')} defaultValue="a@" readOnly />
                    </div>
                </UiSpecimen>

                <UiSpecimen id="groupCard" names={[UI.groupCard, UI.groupListRow]} files={['components/discovery/GroupCard.tsx', 'components/discovery/ListViewCard.tsx']}>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <GroupCard group={samples.groupCard} accentColor={samples.accent} locale={locale} />
                        <div className="sm:col-span-1 lg:col-span-2">
                            <ListViewCard group={samples.groupCard} accentColor={samples.accent} locale={locale} />
                        </div>
                    </div>
                </UiSpecimen>

                <UiSpecimen id="eventCard" names={[UI.eventCard, UI.eventListRow]} files={['components/discovery/EventCard.tsx', 'components/discovery/ListViewEventCard.tsx']}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {samples.discoverableEvents.map((event) => (
                            <EventCard key={event.id} event={event} locale={locale} l1Slug={samples.l1Slug} groupSlug={group.slug} accentColor={samples.accent} />
                        ))}
                    </div>
                    <div className="mt-4 space-y-3">
                        {samples.discoverableEvents.map((event) => (
                            <ListViewEventCard key={event.id} event={event} locale={locale} l1Slug={samples.l1Slug} groupSlug={group.slug} accentColor={samples.accent} />
                        ))}
                    </div>
                </UiSpecimen>

                <UiSpecimen id="eventRow" names={[UI.eventRow]} files={['components/groups/EventRow.tsx']}>
                    <AccentScope color={samples.accent} className="space-y-3">
                        {samples.eventRows.map((event, i) => (
                            <EventRow key={event.id} event={event} locale={locale} href="#eventRow" isPast={i === 2} requireSignIn />
                        ))}
                    </AccentScope>
                </UiSpecimen>

                <UiSpecimen id="header" names={[UI.groupHeader, UI.joinButton]} files={['components/groups/GroupHeader.tsx']} padding="bleed">
                    <AccentScope color={samples.accent}>
                        <GroupProvider value={groupState(group)}>
                            <GroupHeader group={group} l1Slug={samples.l1Slug} />
                        </GroupProvider>
                    </AccentScope>
                </UiSpecimen>

                <UiSpecimen id="slimBar" names={[UI.slimBar]} files={['components/groups/CompactGroupBar.tsx']} padding="bleed">
                    <AccentScope color={samples.accent}>
                        <GroupProvider value={groupState(memberGroupContext)}>
                            <CompactGroupBar group={memberGroupContext} l1Slug={samples.l1Slug} />
                        </GroupProvider>
                    </AccentScope>
                </UiSpecimen>

                <UiSpecimen id="memberCard" names={[UI.memberCard]} files={['components/groups/MemberCard.tsx']}>
                    <AccentScope color={samples.accent} className="grid gap-4 md:grid-cols-2">
                        {samples.members.map((member) => (
                            <MemberCard key={member.id} member={member} canMessage groupId={group.id} currentUserRole="OWNER" locale={locale} l1Slug={samples.l1Slug} />
                        ))}
                    </AccentScope>
                </UiSpecimen>

                <UiSpecimen id="requestCard" names={[UI.requestCard]} files={['components/groups/RequestCard.tsx']}>
                    <AccentScope color={samples.accent} className="max-w-2xl">
                        <RequestCard
                            groupId={group.id}
                            membershipId="sample-membership"
                            targetUser={samples.marta}
                            chatId="c-1"
                            messages={[samples.requestMessage]}
                            locale={locale}
                        />
                    </AccentScope>
                </UiSpecimen>

                <UiSpecimen id="announcement" names={[UI.announcementCard]} files={['components/groups/AnnouncementCard.tsx']}>
                    <AnnouncementDemo samples={samples} />
                </UiSpecimen>

                <UiSpecimen id="inbox" names={[UI.conversationList, UI.chatListItem, UI.chatBubble]} files={['components/messages/ConversationList.tsx', 'components/messages/ChatPanel.tsx']}>
                    <InboxDemo samples={samples} />
                </UiSpecimen>

                <UiSpecimen id="popups" names={[UI.modal, UI.confirmDialog]} files={['components/modals/ContactGroupModal.tsx', 'components/ui/ConfirmDialog.tsx']}>
                    <AccentScope color={samples.accent}>
                        <PopupDemo />
                    </AccentScope>
                </UiSpecimen>

                <UiSpecimen id="emptyState" names={[UI.emptyState]} files={['components/ui/EmptyState.tsx']}>
                    <EmptyState
                        icon={<Calendar className="h-10 w-10" />}
                        title={t('sample.emptyTitle')}
                        description={t('sample.emptyDescription')}
                        action={<Button variant="secondary"><Search className="h-4 w-4" />{t('sample.emptyAction')}</Button>}
                    />
                </UiSpecimen>

                <UiSpecimen id="toast" names={[UI.toast]} files={['components/ui/Toast.tsx']}>
                    <ToastDemo />
                </UiSpecimen>

                <UiSpecimen id="tabs" names={[UI.tabs]} files={['components/groups/SettingsTabs.tsx']}>
                    <AccentScope color={samples.accent}>
                        <SettingsTabs active="group" />
                    </AccentScope>
                </UiSpecimen>

                <UiSpecimen id="banner" names={[UI.banner]} files={['components/groups/HiddenGroupBanner.tsx']} padding="bleed">
                    <HiddenGroupBanner groupId={group.id} reason={t('sample.bannerReason')} canRestore={false} />
                </UiSpecimen>

                <UiSpecimen id="notice" names={[UI.notice]} files={['components/events/MembersOnlyNotice.tsx']}>
                    <MembersOnlyNotice groupName={t('sample.groupName')} groupHref="#notice" isLoggedIn />
                </UiSpecimen>
            </div>

            <p className="mt-12 text-xs text-foreground-muted">{t('notShown')}</p>
        </HandbookShell>
    );
}
