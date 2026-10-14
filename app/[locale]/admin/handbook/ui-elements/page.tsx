import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Calendar, Check, Search } from 'lucide-react';
import AccentScope from '@/components/handbook/AccentScope';
import { ColourSamples, LogoSamples, TypeSamples } from '@/components/handbook/IdentitySpecimens';
import HandbookShell from '@/components/handbook/HandbookShell';
import { BottomBarDemo, FooterDemo, HeaderDemo, MenusDemo, OwnAreaDemo } from '@/components/handbook/ShellDemos';
import { AnnouncementDemo, ChipDemo, InboxDemo, PopupDemo, ToastDemo } from '@/components/handbook/UiElementsDemos';
import { CounterDemo, ErrorStateDemo, PopoverDemo, SheetDemo, SkeletonDemo, SwitchDemo, ToastButtons } from '@/components/handbook/BehaviourDemos';
import UiSpecimen from '@/components/handbook/UiSpecimen';
import ThemeToggle from '@/components/handbook/SampleThemeToggle';
import AuthTextField from '@/components/auth/AuthTextField';
import EventCard from '@/components/discovery/EventCard';
import GroupCard from '@/components/discovery/GroupCard';
import ListViewCard from '@/components/discovery/ListViewCard';
import ListViewEventCard from '@/components/discovery/ListViewEventCard';
import MembersOnlyNotice from '@/components/events/MembersOnlyNotice';
import EventRow from '@/components/groups/EventRow';
import { GroupBannerDemo, GroupPagesDemo, sampleState } from '@/components/handbook/GroupFrameDemos';
import { GroupMenuDemo } from '@/components/handbook/GroupMenuDemos';
import HiddenGroupBanner from '@/components/groups/HiddenGroupBanner';
import MemberCard from '@/components/groups/MemberCard';
import RequestCard from '@/components/groups/RequestCard';
import SettingsTabs from '@/components/groups/SettingsTabs';
import { GroupProvider } from '@/components/providers/GroupProvider';
import { toGroupState } from '@/components/providers/to-group-state';
import Badge from '@/components/ui/Badge';
import Button, { buttonClass } from '@/components/ui/Button';
import CategoryLine from '@/components/ui/CategoryLine';
import EmptyState from '@/components/ui/EmptyState';
import RoleTag from '@/components/ui/RoleTag';
import { UI } from '@/lib/constants';
import { requireHandbookAccess } from '@/lib/handbook-access';
import { SAMPLE_ACCENT, buildUiSamples } from '@/lib/handbook/ui-samples';
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
    const tTag = await getTranslations('common.tag');
    const chapters = await HandbookService.listChapters();
    const samples = buildUiSamples((key) => t(`sample.${key}`), locale);
    const { group } = samples;
    const groupState = toGroupState;

    return (
        <HandbookShell chapters={chapters} current={null} headings={[]} active="ui-elements" wide>
            <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t('title')}</h1>
                    <p className="mt-2 max-w-[70ch] text-foreground-muted">{t('intro')}</p>
                    <p className="mt-2 max-w-[70ch] text-sm text-foreground-muted">{t('sampleNote')}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-surface px-2 py-1 text-xs text-foreground-muted">
                    <span className="hidden sm:inline">{t('theme')}</span>
                    <ThemeToggle />
                </div>
            </div>

            <div className="space-y-12">
                <UiSpecimen id="logo" names={[UI.logo]} files={['components/ui/Logo.tsx', 'app/icon.svg']}>
                    <LogoSamples />
                </UiSpecimen>

                <UiSpecimen id="type" names={[]} files={['app/globals.css', 'lib/theme-fonts.ts']}>
                    <TypeSamples />
                </UiSpecimen>

                <UiSpecimen id="colours" names={[UI.categoryDisc]} files={['app/globals.css', 'lib/constants/theme.ts', 'components/ui/CategoryIcon.tsx']}>
                    <ColourSamples />
                </UiSpecimen>

                <UiSpecimen id="shellHeader" names={[UI.header, UI.searchBar]} files={['components/shell/Header.tsx', 'components/shell/HeaderSearchField.tsx', 'components/shell/PhoneSearchToggle.tsx']} padding="bleed">
                    <HeaderDemo signedIn />
                    <HeaderDemo signedIn admin />
                    <HeaderDemo signedIn={false} />
                </UiSpecimen>

                <UiSpecimen id="shellMenus" names={[UI.profileMenu, UI.shieldMenu, UI.languageSwitch, UI.languageList]} files={['components/ui/Menu.tsx', 'components/shell/UserMenu.tsx', 'components/shell/AdminMenu.tsx', 'components/shell/LanguageMenu.tsx']}>
                    <MenusDemo />
                </UiSpecimen>

                <UiSpecimen id="bottomBar" names={[UI.mobileNav]} files={['components/shell/MobileNav.tsx', 'hooks/useBottomTab.ts', 'lib/navigation.ts']} padding="bleed">
                    <BottomBarDemo />
                </UiSpecimen>

                <UiSpecimen id="footer" names={[UI.footer]} files={['components/shell/Footer.tsx']} padding="bleed">
                    <FooterDemo />
                </UiSpecimen>

                <UiSpecimen id="ownArea" names={[UI.personHeader, UI.ownMenu, UI.ownBarPhone]} files={['app/[locale]/(me)/layout.tsx', 'components/me/PersonHeader.tsx', 'components/me/MeMenu.tsx', 'components/me/MePhoneBar.tsx', 'components/me/MeDrawer.tsx', 'components/me/AppearanceSetting.tsx']} padding="bleed">
                    <OwnAreaDemo />
                </UiSpecimen>

                <UiSpecimen id="buttons" names={[UI.buttonPrimary, UI.buttonSecondary, UI.buttonQuiet, UI.buttonDanger]} files={['components/ui/Button.tsx']}>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button>{t('buttonPrimary')}</Button>
                        <Button variant="secondary">{t('buttonSecondary')}</Button>
                        <Button variant="quiet">{t('buttonQuiet')}</Button>
                        <Button variant="danger">{t('buttonDanger')}</Button>
                        <Button size="sm">{t('buttonSmall')}</Button>
                        <Button disabled>{t('buttonWorking')}</Button>
                        <a href="#buttons" className={buttonClass('primary')}>{t('buttonLink')}</a>
                    </div>
                </UiSpecimen>

                <UiSpecimen id="tags" names={[UI.badge, UI.roleTag]} files={['components/ui/Badge.tsx', 'components/ui/RoleTag.tsx']}>
                    <AccentScope color={samples.accent} className="flex flex-wrap items-center gap-2">
                        <Badge><Check aria-hidden />{tTag('going')}</Badge>
                        <RoleTag role="OWNER" />
                        <RoleTag role="ADMIN" />
                        <RoleTag role="PENDING" />
                        <Badge tone="muted">{t('sample.badgeMembers')}</Badge>
                        <Badge tone="muted">{t('sample.badgeRequest')}</Badge>
                        <Badge tone="outline">{t('sample.badgeFull')}</Badge>
                    </AccentScope>
                </UiSpecimen>

                <UiSpecimen id="categoryLine" names={[UI.categoryLine]} files={['components/ui/CategoryLine.tsx']}>
                    <CategoryLine color={samples.accent} category={t('sample.parentCategory')} subCategories={t('sample.subCategories').split(', ')} />
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

                <UiSpecimen id="header" names={[UI.groupBanner, UI.joinButton]} files={['components/groups/frame/GroupBanner.tsx', 'components/groups/frame/GroupActions.tsx', 'components/groups/frame/GroupPagesDrawer.tsx']} padding="bleed">
                    <div className="p-4"><GroupBannerDemo samples={samples} /></div>
                </UiSpecimen>

                <UiSpecimen id="groupPages" names={[UI.groupMenu, UI.tabs, UI.nextMeeting, UI.socialLinks]} files={['components/groups/frame/GroupPagesNav.tsx', 'components/ui/PageNavLink.tsx', 'components/groups/frame/GroupPartTabs.tsx', 'components/groups/NextMeetingBox.tsx', 'components/groups/GroupSocialLinks.tsx']}>
                    <GroupPagesDemo samples={samples} />
                </UiSpecimen>

                <UiSpecimen id="moreMenu" names={[UI.groupMoreMenu, UI.pendingState]} files={['components/groups/GroupMoreMenu.tsx', 'components/groups/AdminToolsMenu.tsx', 'components/groups/contact/PendingState.tsx', 'components/ui/Menu.tsx']}>
                    <GroupMenuDemo accent={SAMPLE_ACCENT} states={{ member: sampleState(group, 'member'), pending: sampleState(group, 'pending'), visitor: sampleState(group, 'visitor') }} />
                </UiSpecimen>

                <UiSpecimen id="memberCard" names={[UI.memberCard]} files={['components/groups/MemberCard.tsx']}>
                    <AccentScope color={samples.accent} className="grid gap-4 md:grid-cols-2">
                        <GroupProvider value={groupState({ ...group, user: { role: 'OWNER', isMember: true, isAdmin: true, chatId: null } })}>
                            {samples.members.map((member) => (
                                <MemberCard key={member.id} member={member} canMessage groupId={group.id} locale={locale} l1Slug={samples.l1Slug} />
                            ))}
                        </GroupProvider>
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
                        />
                    </AccentScope>
                </UiSpecimen>

                <UiSpecimen id="announcement" names={[UI.announcementCard]} files={['components/groups/AnnouncementCard.tsx']}>
                    <AnnouncementDemo samples={samples} />
                </UiSpecimen>

                <UiSpecimen id="inbox" names={[UI.conversationList, UI.chatListItem, UI.chatBubble]} files={['components/messages/ConversationList.tsx', 'components/messages/ChatPanel.tsx']}>
                    <InboxDemo samples={samples} />
                </UiSpecimen>

                <UiSpecimen id="popups" names={[UI.modal, UI.confirmDialog]} files={['components/groups/contact/ContactForm.tsx', 'components/ui/ConfirmDialog.tsx', 'components/ui/Modal.tsx', 'components/ui/Overlay.tsx']}>
                    <AccentScope color={samples.accent}>
                        <PopupDemo />
                    </AccentScope>
                </UiSpecimen>

                <UiSpecimen id="emptyState" names={[UI.emptyState]} files={['components/ui/EmptyState.tsx']}>
                    <EmptyState
                        icon={Calendar}
                        title={t('sample.emptyTitle')}
                        description={t('sample.emptyDescription')}
                        action={<Button variant="secondary"><Search className="h-4 w-4" />{t('sample.emptyAction')}</Button>}
                    />
                </UiSpecimen>

                <UiSpecimen id="sheet" names={[UI.sheet]} files={['components/ui/Sheet.tsx', 'components/ui/Overlay.tsx']}>
                    <SheetDemo />
                </UiSpecimen>

                <UiSpecimen id="confirmPopover" names={[UI.confirmPopover]} files={['components/ui/ConfirmPopover.tsx']}>
                    <PopoverDemo />
                </UiSpecimen>

                <UiSpecimen id="toast" names={[UI.toast]} files={['components/ui/Toast.tsx', 'components/ui/ToastContainer.tsx', 'hooks/use-toast.tsx']}>
                    <ToastDemo />
                    <div className="mt-4"><ToastButtons /></div>
                </UiSpecimen>

                <UiSpecimen id="errorState" names={[UI.errorState]} files={['components/ui/ErrorState.tsx']}>
                    <ErrorStateDemo />
                </UiSpecimen>

                <UiSpecimen id="skeleton" names={[UI.skeleton]} files={['components/ui/Skeleton.tsx']}>
                    <SkeletonDemo />
                </UiSpecimen>

                <UiSpecimen id="switch" names={[UI.switch]} files={['components/ui/Switch.tsx']}>
                    <SwitchDemo />
                </UiSpecimen>

                <UiSpecimen id="counter" names={[UI.fieldCounter]} files={['components/ui/TextCounter.tsx', 'lib/text-limit.ts']}>
                    <CounterDemo />
                </UiSpecimen>

                <UiSpecimen id="tabs" names={[UI.tabs]} files={['components/groups/SettingsTabs.tsx']}>
                    <AccentScope color={samples.accent}>
                        <SettingsTabs active="group" showOwner />
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
