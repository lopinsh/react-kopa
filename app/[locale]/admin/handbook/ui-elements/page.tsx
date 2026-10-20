import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Calendar, Check, Search, ShieldAlert } from 'lucide-react';
import AccentScope from '@/components/handbook/AccentScope';
import { ColourSamples, LogoSamples, TypeSamples } from '@/components/handbook/IdentitySpecimens';
import HandbookShell from '@/components/handbook/HandbookShell';
import { BottomBarDemo, FooterDemo, HeaderDemo, MenusDemo, OwnAreaDemo } from '@/components/handbook/ShellDemos';
import { FilterLineDemo } from '@/components/handbook/DiscoveryDemos';
import { SearchDemo } from '@/components/handbook/SearchDemos';
import { AnnouncementDemo, ChipDemo, InboxDemo, LanguageEditorDemo, PopupDemo, ToastDemo } from '@/components/handbook/UiElementsDemos';
import { HeaderListsDemo, MyGroupsPartsDemo } from '@/components/handbook/OwnAreaDemos';
import { CounterDemo, ErrorStateDemo, PopoverDemo, SheetDemo, SkeletonDemo, SwitchDemo, ToastButtons } from '@/components/handbook/BehaviourDemos';
import { AdminPagesDemo, AdminSectionsDemo } from '@/components/handbook/AdminFrameDemos';
import UiSpecimen from '@/components/handbook/UiSpecimen';
import ProfileView from '@/components/profile/ProfileView';
import ProfileViewerNote from '@/components/profile/ProfileViewerNote';
import MessageUserButton from '@/components/messages/MessageUserButton';
import PrivacySettings from '@/components/me/PrivacySettings';
import ThemeToggle from '@/components/handbook/SampleThemeToggle';
import AuthTextField from '@/components/auth/AuthTextField';
import CreateCard from '@/components/discovery/CreateCard';
import GroupCard from '@/components/discovery/GroupCard';
import GroupRow from '@/components/discovery/GroupRow';
import DayStrip from '@/components/discovery/dates/DayStrip';
import EventDayList from '@/components/events/EventDayList';
import PanelDemos from '@/components/handbook/PanelDemos';
import EventPageDemos from '@/components/handbook/EventPageDemos';
import { DatesDemo } from '@/components/handbook/DateDemos';
import MembersOnlyNotice from '@/components/events/MembersOnlyNotice';
import GroupPicture from '@/components/groups/frame/GroupPicture';
import { GroupBannerDemo, GroupPagesDemo, SAMPLE_IMAGE, sampleState } from '@/components/handbook/GroupFrameDemos';
import { GroupMenuDemo } from '@/components/handbook/GroupMenuDemos';
import HiddenGroupBanner from '@/components/groups/HiddenGroupBanner';
import MemberRow from '@/components/groups/members/MemberRow';
import RequestRow from '@/components/groups/members/RequestRow';
import SettingsTabs from '@/components/groups/SettingsTabs';
import Badge from '@/components/ui/Badge';
import Button, { buttonClass } from '@/components/ui/Button';
import CategoryLine from '@/components/ui/CategoryLine';
import EmptyState from '@/components/ui/EmptyState';
import RoleTag from '@/components/ui/RoleTag';
import TextLink from '@/components/ui/TextLink';
import { UI } from '@/lib/constants';
import { requireHandbookAccess } from '@/lib/handbook-access';
import { SAMPLE_ACCENT, buildUiSamples } from '@/lib/handbook/ui-samples';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin.handbook.ui' });
    return { title: t('title') };
}

export default async function UiElementsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    await requireHandbookAccess(locale, '/admin/handbook/ui-elements');

    const t = await getTranslations('admin.handbook.ui');
    const tProfile = await getTranslations('profile');
    const tTag = await getTranslations('common.tag');
    const samples = buildUiSamples((key) => t(`sample.${key}`), locale);
    const { group } = samples;

    return (
        <HandbookShell headings={[]} wide>
            <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">{t('title')}</h1>
                    <p className="mt-2 max-w-[70ch] text-foreground-muted">{t('intro')}</p>
                    <p className="mt-2 max-w-[70ch] text-sm text-foreground-muted">{t('sampleNote')}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 rounded-xl line bg-surface px-2 py-1 text-xs text-foreground-muted">
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

                <UiSpecimen id="shellHeader" names={[UI.header, UI.searchBar]} files={['components/shell/Header.tsx', 'components/shell/HeaderSearchField.tsx', 'components/shell/PhoneSearchButton.tsx', 'components/search/SearchInput.tsx']} padding="bleed">
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

                <UiSpecimen id="filterLine" names={[UI.filterLine, UI.filterButton, UI.veidsLine, UI.viewSwitch, UI.clearAll, UI.filterList]} files={['components/discovery/filter/FilterLine.tsx', 'components/discovery/filter/FilterButton.tsx', 'components/discovery/filter/VeidsChips.tsx', 'components/discovery/filter/ViewSwitch.tsx']}>
                    <FilterLineDemo accent={samples.accent} />
                </UiSpecimen>

                <UiSpecimen id="search" names={[UI.searchOverlay, UI.searchPanel, UI.searchChips, UI.themeChip, UI.recentSearches, UI.searchResults, UI.alsoMatches]} files={['components/search/SearchPanel.tsx', 'components/search/SearchChips.tsx', 'components/search/ThemeChips.tsx', 'components/search/SearchResults.tsx', 'components/search/RecentSearches.tsx', 'components/search/SearchOverlay.tsx', 'components/discovery/filter/AlsoMatchesLine.tsx', 'components/ui/Highlight.tsx']}>
                    <SearchDemo groups={[samples.groupCard, samples.groupCardNote]} event={samples.eventDays[0].rows[0]} />
                </UiSpecimen>

                <UiSpecimen id="groupCard" names={[UI.groupCard, UI.groupRow, UI.createCard]} files={['components/discovery/GroupCard.tsx', 'components/discovery/GroupCardActivity.tsx', 'components/discovery/GroupRow.tsx', 'components/discovery/CreateCard.tsx']}>
                    <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(100%,20rem),1fr))]">
                        <GroupCard group={samples.groupCardNote} role="OWNER" requestCount={2} />
                        <GroupCard group={samples.groupCard} activity={samples.cardEvent} role="ADMIN" />
                        <GroupCard group={samples.groupCard} activity={samples.cardAnnouncement} />
                        <GroupCard group={samples.groupCardBare} />
                        <CreateCard l1Slug={samples.l1Slug} variant="card" />
                    </div>
                    <div className="mt-4 max-w-sm rounded-2xl bg-surface px-3.5 shadow-card frame">
                        <GroupRow group={samples.groupCard} role="OWNER" requestCount={2} />
                        <CreateCard l1Slug={samples.l1Slug} variant="row" />
                    </div>
                </UiSpecimen>

                <UiSpecimen id="eventRow" names={[UI.eventRow]} files={['components/events/EventRow.tsx', 'components/events/EventDayList.tsx']}>
                    <div className="grid gap-4 lg:grid-cols-2">
                        <EventDayList days={samples.eventDays} today={samples.today} showGroup showCity />
                        <EventDayList days={samples.eventDays} today={samples.today} showGroup={false} showCity />
                    </div>
                </UiSpecimen>

                <UiSpecimen id="panels" names={[UI.panel, UI.groupPanel, UI.eventPanel, UI.facesLine, UI.joinStep, UI.goingButton]} files={['components/panels/GroupPanel.tsx', 'components/panels/EventPanel.tsx', 'components/panels/PanelShell.tsx', 'components/events/FacesLine.tsx', 'components/events/JoinStep.tsx', 'components/events/GoingButton.tsx']}>
                    <PanelDemos group={samples.groupCard} row={samples.eventDays[0].rows[0]} text={t('sample.eventExcerpt')} />
                </UiSpecimen>

                <UiSpecimen id="eventPage" names={[UI.eventPage, UI.eventOrganiser]} files={['app/[locale]/[l1Slug]/group/[groupSlug]/events/[eventSlug]/page.tsx', 'components/events/page/EventArticle.tsx', 'components/events/page/EventFacts.tsx', 'components/events/page/EventTextSection.tsx', 'components/events/page/EventOrganiserBox.tsx', 'components/events/page/OrganiserPeople.tsx']}>
                    <EventPageDemos row={samples.eventDays[0].rows[0]} text={t('sample.eventExcerpt')} />
                </UiSpecimen>

                <UiSpecimen id="dates" names={[UI.dayStrip, UI.dateChoices, UI.datePhone, UI.datePicker, UI.textLink]} files={['components/discovery/dates/DayStrip.tsx', 'components/discovery/dates/DateChoices.tsx', 'components/discovery/dates/DateButton.tsx', 'components/discovery/dates/MonthCalendar.tsx', 'components/ui/MonthGrid.tsx', 'components/ui/TextLink.tsx']}>
                    <div className="max-w-xl space-y-4">
                        <DayStrip window={samples.strip} params={{ kind: 'events', cities: [], category: null, tags: [], q: '', limit: 24, date: { kind: 'week' }, day: null }} counts={samples.stripCounts} />
                        <DatesDemo today={samples.today} />
                        <TextLink href="/?tab=events">{t('sample.nextWeek')}</TextLink>
                    </div>
                </UiSpecimen>

                <UiSpecimen id="header" names={[UI.groupBanner, UI.joinButton]} files={['components/groups/frame/GroupBanner.tsx', 'components/groups/frame/GroupActions.tsx', 'components/groups/frame/GroupPagesDrawer.tsx']} padding="bleed">
                    <div className="p-4"><GroupBannerDemo samples={samples} /></div>
                </UiSpecimen>

                <UiSpecimen id="groupPicture" names={[]} files={['components/groups/frame/GroupPicture.tsx', 'components/ui/PictureBox.tsx', 'components/groups/frame/InfoSections.tsx']}>
                    <AccentScope color={SAMPLE_ACCENT}>
                        <div className="grid gap-4 md:grid-cols-2">
                            <GroupPicture image={SAMPLE_IMAGE} l1Slug={group.category.l1Slug} />
                            <GroupPicture image={null} l1Slug={group.category.l1Slug} />
                        </div>
                    </AccentScope>
                </UiSpecimen>

                <UiSpecimen id="groupPages" names={[UI.groupMenu, UI.tabs, UI.nextMeeting, UI.socialLinks]} files={['components/groups/frame/GroupPagesNav.tsx', 'components/ui/PageNavLink.tsx', 'components/ui/PartTabs.tsx', 'components/groups/NextMeetingBox.tsx', 'components/groups/GroupSocialLinks.tsx']}>
                    <GroupPagesDemo samples={samples} />
                </UiSpecimen>

                <UiSpecimen id="moreMenu" names={[UI.groupMoreMenu, UI.pendingState]} files={['components/groups/GroupMoreMenu.tsx', 'components/groups/AdminToolsMenu.tsx', 'components/groups/contact/PendingState.tsx', 'components/ui/Menu.tsx']}>
                    <GroupMenuDemo accent={SAMPLE_ACCENT} states={{ member: sampleState(group, 'member'), pending: sampleState(group, 'pending'), visitor: sampleState(group, 'visitor') }} />
                </UiSpecimen>

                <UiSpecimen id="memberCard" names={[UI.memberCard]} files={['components/groups/members/MemberRow.tsx', 'components/groups/members/MemberRowMenu.tsx']}>
                    <AccentScope color={samples.accent} className="max-w-[760px]">
                        <ul className="divide-y divide-border">
                            {samples.members.map((member) => (
                                <MemberRow key={member.userId} member={member} groupId={group.id} />
                            ))}
                        </ul>
                    </AccentScope>
                </UiSpecimen>

                <UiSpecimen id="requestCard" names={[UI.requestCard]} files={['components/groups/members/RequestRow.tsx']}>
                    <AccentScope color={samples.accent} className="max-w-[760px]">
                        <ul>
                            <RequestRow request={samples.request} />
                        </ul>
                    </AccentScope>
                </UiSpecimen>

                <UiSpecimen id="announcement" names={[UI.announcementItem]} files={['components/groups/announcements/AnnouncementItem.tsx']}>
                    <AnnouncementDemo samples={samples} />
                </UiSpecimen>

                <UiSpecimen id="inbox" names={[UI.conversationList, UI.chatListItem, UI.chatBubble]} files={['components/messages/ConversationList.tsx', 'components/messages/ConversationRow.tsx', 'components/messages/ChatPanel.tsx']}>
                    <InboxDemo samples={samples} />
                </UiSpecimen>

                <UiSpecimen id="ownSections" names={[UI.myGroupsSections, UI.sectionMenu, UI.newsItem, UI.requestRow]} files={['components/me/MyGroupsSections.tsx', 'components/me/SectionMenu.tsx', 'components/me/NewsItem.tsx', 'components/me/RequestRow.tsx', 'components/handbook/OwnAreaDemos.tsx']}>
                    <MyGroupsPartsDemo samples={samples} />
                </UiSpecimen>

                <UiSpecimen id="headerLists" names={[UI.headerDropdown, UI.bellList, UI.notificationItem, UI.conversationRow, UI.notificationFeed]} files={['components/shell/HeaderDropdown.tsx', 'components/notifications/BellList.tsx', 'components/notifications/BellPanel.tsx', 'components/notifications/NotificationItem.tsx', 'components/notifications/NotificationFeed.tsx', 'components/messages/MessagesDropdown.tsx']}>
                    <HeaderListsDemo samples={samples} />
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

                <UiSpecimen id="languageEditor" names={[UI.languageEditor, UI.languageEditorMenu]} files={['components/ui/LanguageEditor.tsx', 'components/ui/language-editor/LanguageMenu.tsx', 'components/ui/language-editor/AddTranslationButton.tsx', 'components/ui/language-editor/EditorHint.tsx']}>
                    <LanguageEditorDemo />
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

                <UiSpecimen id="profileView" names={[]} files={['components/profile/ProfileView.tsx', 'components/profile/ProfileViewerNote.tsx', 'lib/services/user.service.ts']}>
                    <div className="grid gap-10">
                        <div className="grid gap-5">
                            <ProfileViewerNote privacy={{ isProfilePublic: true, allowDirectMessages: true, showGroupsOnProfile: true }} />
                            <ProfileView view={samples.profileOwn} locale={locale} own action={<span className={buttonClass('secondary')}>{tProfile('editTitle')}</span>} />
                        </div>
                        <ProfileView view={samples.profileOther} locale={locale} action={<MessageUserButton userId={samples.profileOther.person.id} />} />
                        <EmptyState icon={ShieldAlert} title={tProfile('privateProfile')} description={tProfile('privateProfileDesc')} />
                    </div>
                </UiSpecimen>

                <UiSpecimen id="privacySettings" names={[]} files={['components/me/PrivacySettings.tsx']}>
                    <div className="max-w-xl">
                        <PrivacySettings initial={{ isProfilePublic: true, allowDirectMessages: true, showGroupsOnProfile: false }} demo />
                    </div>
                </UiSpecimen>

                <UiSpecimen id="counter" names={[UI.fieldCounter]} files={['components/ui/TextCounter.tsx', 'lib/text-limit.ts']}>
                    <CounterDemo />
                </UiSpecimen>

                <UiSpecimen id="adminSections" names={[UI.tabs]} files={['components/admin/frame/AdminSections.tsx', 'lib/constants/adminNav.ts']}>
                    <AdminSectionsDemo />
                </UiSpecimen>

                <UiSpecimen id="adminPages" names={[UI.tabs]} files={['components/admin/frame/AdminPagesNav.tsx']}>
                    <AdminPagesDemo />
                </UiSpecimen>

                <UiSpecimen id="adminDrawer" names={[UI.tabs]} files={['components/admin/frame/AdminDrawer.tsx']}>
                    <AdminPagesDemo drawer />
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
                    <MembersOnlyNotice />
                </UiSpecimen>
            </div>

            <p className="mt-12 text-xs text-foreground-muted">{t('notShown')}</p>
        </HandbookShell>
    );
}
