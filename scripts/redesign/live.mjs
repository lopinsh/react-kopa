// "Compared with the live app" (v9.2): the redesign checked against the code on main, 13 October 2026. Every finding is listed; nothing is summarised away.
import { st } from './parts.mjs';

const q = (n) => `<a href="#h-open">question ${n}</a>`;
const sec = (id, t) => (id ? `<a href="#${id}">${t}</a>` : t);
const path = (p) => (p ? `<small class="path">${p}</small>` : '');

// ── A. Every live screen. [#, screen, live files, section id, section name, status, what happens]
// Status: cov drawn · part partly drawn · nav named only · no not drawn · new no live counterpart. "*" = changed in 9.2.
const A = [
  [1, 'Discovery, groups', 'app/[locale]/page.tsx, components/discovery/GroupCard.tsx', 'h-disc', 'Discovery', 'part', `The cards / list switch goes (B31) and the public/private filter is not in the redesign (${q(11)}); endless scrolling becomes "Rādīt vēl" (${q(4)}); the "N grupas" heading goes on purpose.`],
  [2, 'Discovery, events', 'EventCard.tsx, ListViewEventCard.tsx', 'h-event', 'An event', 'part*', `Approval, "Pilns" and closed sign-ups now drawn as a question (${q(8)}); "Tikai biedriem" (${q(13)}); "N apstiprināti" becomes faces; the size ("Apmēram N cilvēki") stays on the event page.`],
  [3, 'Category sidebar', 'DiscoverySidebar.tsx', 'h-disc', 'Discovery', 'cov', 'Gains counts, search and "Ieteikt jaunu kategoriju".'],
  [4, 'Search in the filter bar', 'DiscoveryFilterBar.tsx', 'h-search', 'Search', 'cov', 'Moves into the header as a plain field that opens the search at once; the place and the categories are chips inside the open search (13 Oct).'],
  [5, 'Header', 'components/shell/Header.tsx', 'h-shell', 'Header and navigation', 'cov*', 'The language switch stays in the header (13 Oct, drawn); light/dark moves to Iestatījumi.'],
  [6, 'Profile menu', 'components/shell/UserMenu.tsx', 'h-shell', 'Header and navigation', 'cov', 'Its lines change, with "Izveidot grupu" (C12, 13 Oct).'],
  [7, 'Admin shield menu', 'components/shell/AdminMenu.tsx', 'h-shell', 'Header and navigation', 'cov', 'The link\'s words change (C13).'],
  [8, 'Bell list (and its admin tab)', 'components/shell/NotificationCenter.tsx', 'h-me', 'Your own area', 'cov', '"Skatīt visus" opens the new Paziņojumi page.'],
  [9, 'Messages drawer', 'components/messages/MessagesDrawer.tsx', 'h-me', 'Your own area', 'cov', 'Built.'],
  [10, 'Messages page', 'app/[locale]/messages/page.tsx, ChatPanel.tsx', 'h-me', 'Your own area', 'part', 'Blocking a person, the "group gone" note, the phone\'s one-pane view with Back and the empty inbox stay as today, in the new look.'],
  [11, 'Phone bottom bar', 'components/shell/MobileNav.tsx, lib/navigation.ts', 'h-shell', 'Header and navigation', 'cov', 'Keeps its + in the middle; two tabs are renamed (C11, 13 Oct).'],
  [12, 'Footer', 'components/shell/Footer.tsx', 'h-shell', 'Header and navigation', 'cov*', 'Slim, only on discovery and reading pages (13 Oct, drawn).'],
  [13, 'Cookie banner', 'components/shell/CookieConsent.tsx', '', '—', 'no', 'Stays as today, in the new look.'],
  [14, 'Short messages after an action (toasts)', 'components/ui/Toast.tsx', '', '—', 'no', 'The Handbook (Behaviour) already decides when: a short toast only for what happens outside the current screen. One line at the bottom, above the bottom bar on phones, in the new look (part R2).'],
  [15, 'Group Informācija', '[l1Slug]/group/[groupSlug]/layout.tsx, page.tsx, GroupHeader.tsx', 'h-group', 'A group', 'cov*', `Social links at the end, faces only on Biedri (13 Oct, drawn). The small "Latviski" / "In English" label on a text written in another language stays, as today (no automatic translation); the side banner and the events-count link go: the header carries the photo, a "Nākamais pasākums" box in the page (13 Oct: not in a narrow side column).`],
  [16, 'Group "…" menu', 'components/groups/GroupMoreMenu.tsx', 'h-group', 'A group', 'cov*', 'Drawn: your role, Rakstīt komandai, Dalīties, Ziņot, Pamest grupu or Atsaukt pieteikumu. Team tools stay in Iestatījumi.'],
  [17, 'Site-admin tools on a group', 'components/groups/AdminToolsMenu.tsx', '', '—', 'no', 'Stay as today, in the new look: fixing the category, editing, the moderation log, hiding and restoring.'],
  [18, 'Hidden-group banner', 'components/groups/HiddenGroupBanner.tsx', '', '—', 'no', 'Stays as today, in the new look.'],
  [19, 'Group pages drawer (phones)', 'components/groups/GroupInfoDrawer.tsx', 'h-group', 'A group', 'cov', ''],
  [20, 'Contact / join form', 'components/modals/ContactGroupModal.tsx', 'h-group', 'A group', 'cov', 'Button words change (C1, C3).'],
  [21, 'Sign-in pop-up', 'components/modals/AuthGateModal.tsx', 'h-pop', 'Pop-ups and panels', 'part', 'Named only; follows the dialog rule and today\'s fields.'],
  [22, 'Group Pasākumi', '[groupSlug]/events/page.tsx, EventRow.tsx, GroupTabs.tsx', 'h-group', 'A group', 'cov*', '"Mani pasākumi" goes (13 Oct); "Izveidot pasākumu" drawn at the right of the tabs; the empty list follows the empty-state rule; joining moves from the row to the panel (C28); "Pārvaldīt · N gaida" moves to the event page\'s "Rīkotājiem".'],
  [23, 'Event page', '[groupSlug]/events/[eventSlug]/page.tsx', 'h-event', 'An event', 'cov*', 'Drawn; agreed 13 Oct (build plan OD-23).'],
  [24, 'Organiser tools: lists, edit, delete', 'EventOrganiserPanel.tsx, EventManageActions.tsx', 'h-event', 'An event', 'part*', 'The "Rīkotājiem" box drawn on the event page; its lists keep today\'s layout.'],
  [25, 'Members-only event, seen from outside', 'components/events/MembersOnlyNotice.tsx', '', '—', 'no', q(13)],
  [26, 'Create / edit event', 'create-event/page.tsx, forms/EventCreationWizard.tsx', '', '—', 'no', 'Today\'s fields plus the event\'s place (13 Oct), in the new look.'],
  [27, 'Members list (Biedri)', '[groupSlug]/members/page.tsx, members/MemberRow.tsx', 'h-group', 'A group', 'cov*', 'Drawn; agreed 13 Oct (build plan OD-24).'],
  [28, 'Join requests (Pieteikumi)', 'members/page.tsx, members/RequestRow.tsx', 'h-group', 'A group', 'cov', ''],
  [29, 'Group Jaunumi', '[groupSlug]/announcements/page.tsx, AnnouncementBoard.tsx', 'h-group', 'A group', 'cov*', 'Drawn; agreed 13 Oct (build plan OD-24): new item, Arhīvs, delete.'],
  [30, 'Group settings (Grupa, Sadaļas, Īpašnieks)', '[groupSlug]/settings/page.tsx, components/groups/settings/*', 'h-group', 'A group', 'nav', 'Keeps its three tabs, gains "Ko meklējam?", in the new look.'],
  [31, 'Report a group', 'components/modals/ReportModal.tsx', 'h-group', 'A group', 'part*', '"Ziņot par grupu" in the "…" menu (drawn); the form keeps today\'s fields.'],
  [32, 'Hide / delete a hidden group (admin)', 'HideGroupModal.tsx, DeleteHiddenGroupModal.tsx', '', '—', 'no', 'Stay as today, in the new look.'],
  [33, 'Confirmations', 'components/ui/ConfirmDialog.tsx, ConfirmPopover.tsx', 'h-pop', 'Pop-ups and panels', 'part', q(15)],
  [34, 'Create-group wizard (4 steps)', 'app/[locale]/create/page.tsx, components/groups/create-wizard/*', 'h-shell', 'Header and navigation', 'nav', 'Keeps its four steps, gains "Ko meklējam?", in the new look.'],
  [35, 'Sign in', 'app/[locale]/auth/signin/page.tsx', '', '—', 'no', 'Today\'s fields in the new look (the Handbook\'s layout D).'],
  [36, 'Register', 'app/[locale]/auth/register/page.tsx', '', '—', 'no', 'The same.'],
  [37, 'Choosing a username', 'app/[locale]/onboarding/username/page.tsx', '', '—', 'no', 'The same.'],
  [38, 'Own profile (Mans profils)', 'app/[locale]/profile/page.tsx', 'h-me', 'Your own area', 'cov*', 'Drawn; agreed 13 Oct (build plan OD-25).'],
  [39, 'Someone else\'s profile', 'profile/[username]/page.tsx', 'h-me', 'Your own area', 'no', 'Follows Mans profils: only the groups you share, and "Sūtīt ziņu".'],
  [40, 'Edit profile', 'profile/edit/page.tsx, ProfileEditForm.tsx', 'h-me', 'Your own area', 'part', q(10)],
  [41, 'My groups (Manas grupas)', 'profile/my-groups/page.tsx', 'h-me', 'Your own area', 'cov', `Its content changes (C26); the team's waiting requests: ${q(9)}.`],
  [42, 'Notifications page', '', 'h-me', 'Your own area', 'new', ''],
  [43, 'Settings page (Iestatījumi)', '', 'h-me', 'Your own area', 'new', ''],
  [44, 'Your own area\'s frame', '', 'h-me', 'Your own area', 'new', ''],
  [45, 'Opened group panel', '', 'h-group', 'A group', 'new', ''],
  [46, 'Event panel', '', 'h-event', 'An event', 'new', ''],
  [47, 'Par mums', 'app/[locale]/about/page.tsx', '', '—', 'no', 'A reading page in the new look, with the slim footer.'],
  [48, 'Privātums', 'app/[locale]/privacy/page.tsx', '', '—', 'no', 'The same.'],
  [49, 'Page not found, with the sign-in hint', 'app/[locale]/not-found.tsx, SignInHint.tsx', '', '—', 'no', 'Follows the empty-state rule: an outline icon, one sentence, one action ("Uz sākumu"); the sign-in hint stays.'],
  [50, 'Loading and error states', 'none exist (no loading.tsx / error.tsx)', '', '—', 'no', 'Missing on the live site too. The Handbook (Behaviour) already decides: grey shapes of the real content while loading (card, row, panel), never a spinner, nothing jumps; an error in plain words with one action ("Mēģināt vēlreiz"). Built in part R2.'],
  [51, 'Admin frame', 'app/[locale]/admin/layout.tsx, components/admin/AdminNav.tsx', 'h-admin', 'Admin', 'cov', 'Its structure changes (C30).'],
  [52, 'Admin: Sūdzības', 'admin/reports/page.tsx', 'h-admin', 'Admin', 'nav', 'Today\'s page in the new frame.'],
  [53, 'Admin: Lēmumi', 'admin/page.tsx', 'h-admin', 'Admin', 'nav', 'The same.'],
  [54, 'Admin: Kategorijas', 'admin/categories/*', 'h-admin', 'Admin', 'nav', 'The same.'],
  [55, 'Admin: Vietas', 'admin/locations/*', 'h-admin', 'Admin', 'nav', 'The same.'],
  [56, 'Admin: Tulkojumi', 'admin/translations/page.tsx', 'h-admin', 'Admin', 'nav', 'The same.'],
  [57, 'Admin: Dizains and its preview bar', 'admin/design/page.tsx, components/admin/design/*', 'h-admin', 'Admin', 'part', 'Krāsas and Fonti follow the drawn Kategoriju krāsas; the preview bar stays.'],
  [58, 'Admin: Rokasgrāmata and UI elementi', 'admin/handbook/*', 'h-admin', 'Admin', 'cov', ''],
  [59, 'Admin: Komanda, Pārveide, Atsauksmes', 'admin/team, admin/development/redesign, admin/feedback', 'h-admin', 'Admin', 'nav', 'Today\'s pages in the new frame.'],
  [60, 'Admin: moving a group to another category', 'admin/groups/[l1Slug]/[groupSlug]/categorization/*', '', '—', 'no', 'Not in the admin menu today either. Stays reached from the site-admin tools on a group, as today, in the new look.'],
  [61, 'Feedback and translation modes', 'components/feedback/*, components/translate/*', 'h-shell', 'Header and navigation', 'part', 'Their switches are drawn; the overlays stay as today.'],
];
const AS = { cov: 'Drawn', part: 'Partly', nav: 'Named only', no: 'Not drawn', new: 'New screen' };

// ── B. Live features the redesign didn't mention. [id, feature, files, what happens, kind]
// kind: done = decided or drawn now · keep = stays as today in the new look · ask = a question (see Still open)
const B = [
  ['B1', 'Ways to join an event: open ("Es nāku" / "Piedalīšos"), with the organiser\'s approval ("Pieteikties", then "Pieteikums nosūtīts"; the organiser approves or declines), a waiting list ("Pieteikties gaidīšanas sarakstā"), a size ("Apmēram N cilvēki"), "Slēgt pieteikšanos" (marks the event full); practical details hidden until approved', 'EventParticipation.tsx, EventOrganiserPanel.tsx', `Drawn as pictures: ${q(8)}.`, 'ask'],
  ['B2', 'Members-only events: "Tikai biedriem" on rows; a page that stops outsiders', 'EventRow.tsx, MembersOnlyNotice.tsx', `Visitors don't see them (agreed); for members: ${q(13)}.`, 'ask'],
  ['B3', 'Event page details: add to calendar, share, map or online link, picture, time zone when not Latvian time, "Šis pasākums jau ir noticis", "Svarīga informācija", data for search engines', 'events/[eventSlug]/page.tsx, AddToCalendar.tsx, ShareEventButton.tsx', 'All kept; drawn on the event page (13 Oct).', 'done'],
  ['B4', 'Organiser tools: edit, delete with a check, the lists of who is going, asking and waiting, with "Ielaist"', 'EventManageActions.tsx, EventOrganiserPanel.tsx', 'Kept, in the event page\'s "Rīkotājiem" box (drawn).', 'done'],
  ['B5', 'The event form: name, start and end (time in 15-minute steps; the end starts two hours after the start), place (free text), text, practical details, way to join, who sees it, size, picture link, LV | EN', 'EventCreationWizard.tsx, EventLangBar.tsx, DateTimeField.tsx', 'Kept, plus the event\'s place from the city list (13 Oct).', 'keep'],
  ['B6', 'Repeating events: stored in the database, never used by the form', 'prisma/schema.prisma, EventCreationWizard.tsx', 'Stays unused, as today; each event is created on its own. A note only, nothing to draw.', 'keep'],
  ['B7', '"Mani pasākumi" tab on a group\'s Pasākumi', 'GroupTabs.tsx', 'Goes (13 Oct).', 'done'],
  ['B8', 'Managing members: make or remove a moderator, remove a member (today with the browser\'s own question), write to a member, see a profile, private profiles, the list sorted by role', 'members/MemberRowMenu.tsx, members/page.tsx', 'Drawn on Biedri: the team\'s "…" on each row, the team first (13 Oct). The browser\'s own question goes (Handbook: never the browser\'s box).', 'done'],
  ['B9', 'Group settings, Grupa: name, city (and suggesting one), picture link, category and sub-categories (and suggesting a new sub-category), website / Discord / Instagram', 'components/groups/settings/*', 'Kept, plus "Ko meklējam?".', 'keep'],
  ['B10', 'Group settings, Sadaļas: the team\'s own sections, their order, members-only sections, LV | EN', 'GroupSectionEditor.tsx, SectionEditForm.tsx', 'Kept.', 'keep'],
  ['B11', 'Group settings, Īpašnieks: taking members, public or private, handing over the group, deleting it', 'AcceptingMembersSection, PrivacySection, TransferOwnershipSection, DangerZoneSection', 'Kept.', 'keep'],
  ['B12', 'Private groups: left out of discovery unless the public/private filter (<code>?type=</code>) asks for them, never in search. The live words differ: "Privāta" in the create-group form, "Tikai biedriem" in settings', 'Group.type; discovery.service.ts, AccessStep, PrivacySection', q(11), 'ask'],
  ['B13', 'Group news: new item, archive and restore, archived list, delete, a hint for the team when empty', 'AnnouncementBoard.tsx, AnnouncementCard.tsx, AnnouncementModal.tsx', 'Drawn on the group\'s Jaunumi (13 Oct).', 'done'],
  ['B14', 'Social links on the group (header icons and side column)', 'GroupHeader.tsx, GroupSocialLinks', 'Quiet text links at the end of Informācija (13 Oct, drawn).', 'done'],
  ['B15', 'Member faces on Informācija and the "all members" pop-up, from which a member can write to the team', 'MemberAvatarList', `Faces only on Biedri (13 Oct); writing to the team: ${q(14)}.`, 'ask'],
  ['B16', 'Pictures as a pasted link (group form, settings, event form)', 'BasicInfoStep, BasicsSection, EventCreationWizard', 'Kept until the picture picker (plan item 3.6).', 'keep'],
  ['B17', 'The hidden-group banner with "restore"; site-admin tools on a group', 'HiddenGroupBanner.tsx, AdminToolsMenu.tsx', 'Kept.', 'keep'],
  ['B18', 'Reporting (groups only; the database could hold reported events)', 'ReportModal.tsx', `"Ziņot par grupu" in the "…" menu (drawn); events and people: ${q(7)}.`, 'ask'],
  ['B19', 'Blocking and unblocking a person in a conversation', 'ChatPanel.tsx', 'Kept, in the conversation\'s menu.', 'keep'],
  ['B20', 'Leaving a group, handing it over, sharing it', 'GroupMoreMenu.tsx', 'In the "…" menu (drawn); handing over stays in Iestatījumi → Īpašnieks.', 'done'],
  ['B21', 'Withdrawing a join request (the × today)', 'GroupHeader.tsx', '"Atsaukt pieteikumu" in the "…" menu and on Tavi pieteikumi (13 Oct, drawn).', 'done'],
  ['B22', 'Signing in (email and password, Google and GitHub when set up), registering (with a live username check), choosing a username, the sign-in pop-up that returns you where you were', 'components/auth/*, AuthGateModal.tsx', 'Kept, in the new look.', 'keep'],
  ['B23', 'The LV / EN switch', 'components/shell/LanguageSwitcher.tsx', 'In the header on every page (13 Oct, drawn).', 'done'],
  ['B24', 'Footer: links, Par mums, Privātums, one line about the site', 'components/shell/Footer.tsx', 'Slim footer on discovery and reading pages (13 Oct, drawn).', 'done'],
  ['B25', 'Cookie banner', 'CookieConsent.tsx', 'Kept.', 'keep'],
  ['B26', 'Profiles: your own (about, places, since when, groups), someone else\'s (shared groups, private state, a message button), editing (name, picture, "Jauns avatars", about, places, three privacy switches)', 'app/[locale]/profile/*, ProfileEditForm.tsx', `Mans profils drawn (13 Oct); where editing lives: ${q(10)}.`, 'ask'],
  ['B27', 'Deleting your account: doesn\'t exist today', '—', q(16), 'ask'],
  ['B28', 'Feedback mode, translation mode, the design preview bar', 'components/feedback/*, components/translate/*, ThemePreviewBar', 'Kept.', 'keep'],
  ['B29', 'Admin inside: the category tree and merging, cities, translation suggestions and export, the team, feedback filters, report actions (resolve, delete the content, hide the group), the decisions log and its filter', 'app/[locale]/admin/*', 'Kept, in the new admin frame.', 'keep'],
  ['B30', 'Admin page for moving a group to another category', 'admin/groups/…/categorization', 'Kept, reached from the site-admin tools on a group, as today.', 'keep'],
  ['B31', 'Discovery\'s cards / list switch', 'DiscoveryFilterBarWrapper, ListViewCard', 'Goes: the agreed rules show cards on desktop and rows on phones. Say if you want it back.', 'done'],
  ['B32', 'Loading and error states: none exist', 'app/', 'The Handbook (Behaviour) already decides: grey shapes of the content (card, row, panel), an error in plain words with one action. Built in part R2.', 'done'],
];
const BK = { done: ['ag', 'Decided'], keep: ['lk', 'Kept'], ask: ['op', 'Question'] };

// ── C. Where the page and the live app differ. [id, live today, the redesign, verdict, note]
// Verdict: chg intended change · wrong the page was wrong (fixed in 9.2) · unc unclear (now a question) · res answered 13 Oct · ok consistent
const C = [
  ['C1', 'The header button reads "Pieteikties" while a group takes members, "Sazināties" otherwise', 'Always "Sazināties"', 'chg', ''],
  ['C2', 'After asking: "Pieprasīts" and a × with the browser\'s own question', '"Pieteikums nosūtīts" and "Atvērt sarunu"', 'chg', 'Withdrawing: answered 13 Oct ("Atsaukt pieteikumu").'],
  ['C3', 'Send button: "Sūtīt ziņu" / "Sūtīt pieprasījumu"', '"Nosūtīt"', 'chg', ''],
  ['C4', 'Biedri tabs: "Biedru saraksts" / "Pieprasījumi"', '"Biedri" / "Pieteikumi"', 'chg', 'The Handbook\'s fixed words.'],
  ['C5', 'Pasākumi tabs: Gaidāmie / Mani pasākumi / Pagātnes', 'Gaidāmie / Pagājušie', 'chg', '"Mani pasākumi" goes: answered 13 Oct.'],
  ['C6', 'The slim group bar only on Pasākumi and Iestatījumi, without a contact button, with the role pill', 'The lower header on every page but Informācija; on phones the bar carries "Sazināties" for non-members', 'chg', 'Plan item 2.22.'],
  ['C7', 'Your role as a pill in the header', 'No button for members; the role in the "…" menu', 'chg', 'The menu now drawn with the role line.'],
  ['C8', 'A group admin is "Grupas moderators"', 'The tag "Mod"; the Handbook says "grupas komanda" for owner and moderators', 'unc', q(12)],
  ['C9', 'Group pages: Informācija, Pasākumi, Jaunumi, Biedri, then "Labot grupu"', 'Informācija, Jaunumi, Pasākumi, Biedri, Iestatījumi', 'chg', ''],
  ['C10', 'Header: logo with a subtitle, language, light/dark, messages, shield, bell, picture; no search, no + on computers (phones have it in the bottom bar)','Logo, a plain search field, language, shield, messages, bell, picture; no + (on computers "Izveidot grupu" is in the profile menu)', 'chg', 'The language switch stays; the + stays out of the header: answered 13 Oct.'],
  ['C11', 'Bottom bar: Atklāt, Manas grupas, +, Ziņas, Profils', 'Atklāt, Grupas, +, Ziņas, Es', 'chg', `The + stays in the bar (13 Oct). Where "Grupas" and "Es" lead (${q(2)}) matches today's Manas grupas and Profils.`],
  ['C12', 'Profile menu: name and email, Manas grupas, public profile, "Labot profilu", Iziet', 'Mans profils, Manas grupas (with a count), Izveidot grupu, Iestatījumi, Iziet', 'chg', '"Izveidot grupu": 13 Oct.'],
  ['C13', 'The shield menu\'s link reads "Admina panelis"', 'The page said "Administrēšanas panelis, built"', 'wrong', 'Fixed: the rule now says the live words change.'],
  ['C14', 'One city at a time', 'Several cities, "Visur", "Jelgava +1" on the Kur button', 'chg', ''],
  ['C15', 'Events filtered by the group\'s city and category; no sub-category filter for events', 'By the event\'s own place; category and sub-category as for groups', 'chg', 'Needs the event\'s place (D2).'],
  ['C16', 'No date filter for events', 'Šodien, Šonedēļ, Nedēļas nogalē, the calendar, the day strip (no "Rīt", 13 Oct)', 'chg', 'The day strip and the calendar are still open.'],
  ['C17', 'All upcoming events at once, as cards or a list', 'Rows by day, two columns, a week at a time', 'chg', ''],
  ['C18', 'Groups: endless scrolling, 12 at a time', '24, then "Rādīt vēl"', 'chg', q(4)],
  ['C19', 'Group card: picture on top, description, "Aktīva" badge, no sub-categories', 'Picture on the right, sub-categories, "Ko meklējam?" or the next meeting, no description', 'chg', ''],
  ['C20', 'A heading "N grupas" and "Notīrīt visu"', 'No heading; the Kur and Tēma buttons show the choices (no chosen line), "Notīrīt visu" when two or more are chosen', 'chg', '13 Oct.'],
  ['C21', 'A click on a card opens the group page', 'A panel over the list; the address is the group\'s page', 'chg', ''],
  ['C22', 'Search sits in the discovery filter bar', 'A plain header field that opens the search at once; the Kur button and theme chips at its top, recent searches', 'chg', `Plan item 3.5; the chips: 13 Oct; "Rādīt visus rezultātus": ${q(1)}.`],
  ['C23', 'Category sidebar without counts, search or suggesting', 'Counts, greyed empties, search incl. sub-categories, "Ieteikt jaunu kategoriju"', 'chg', ''],
  ['C24', 'No "next event" on Informācija', '"Nākamais pasākums · Visi" on Informācija', 'chg', ''],
  ['C25', 'Group header: category chips, an events-count link, social icons', 'Category and sub-categories, city · members', 'chg', 'Social links: answered 13 Oct.'],
  ['C26', 'Manas grupas: "Jārīkojas", then by role (Īpašnieks, Moderators, Biedrs, Gaida)', 'Tuvākie pasākumi, Jaunumi, Tavas grupas, Tavi pieteikumi', 'chg', `"Jārīkojas": ${q(9)}, drawn.`],
  ['C27', '"Es nāku", "Piedalīšos", "N piedalās", "N apstiprināti"', '"Eju" and faces, "Ilze un vēl 11 iet"', 'chg', 'Who sees faces: answered 13 Oct.'],
  ['C28', 'Event row: date block, time range, place, badges, people, a join button in the row', 'Time, dot, name, city; group · category · sub-category; a one-line description (13 Oct); "Eju"; joining in the panel', 'chg', ''],
  ['C29', 'Empty bell: "Vēl nav paziņojumu"', '"Pagaidām kluss" and one sentence', 'chg', ''],
  ['C30', 'Admin menu: five drop-downs', 'Five sections across, pages down the left', 'chg', ''],
  ['C31', 'The Handbook\'s Design chapter: Geist, indigo, buttons in the group colour, the old page order, layout C', 'Literata and Commissioner, Sūna, category colour never on buttons, the new order', 'chg', 'The chapter is rewritten in part R1.'],
  ['C32', 'The Handbook\'s "Who sees what"', 'The same', 'ok', ''],
  ['C33', 'Every push to main goes live', 'The rule said "one release"', 'res', 'Answered 13 Oct: released in parts, R1–R12.'],
  ['C34', 'Editing the profile is a page of its own ("Labot profilu")', 'Iestatījumi has only Izskats; Mans profils wasn\'t drawn', 'unc', `Mans profils drawn; ${q(10)}.`],
];
const CK = { chg: ['lk', 'Intended change'], wrong: ['pr', 'Page wrong, fixed'], unc: ['op', 'Unclear: a question'], res: ['ag', 'Answered 13 Oct'], ok: ['ag', 'Consistent'] };

// ── D. What needs the database or the server. [id, item, why, what it needs, migration name or '']
const D = [
  ['D1', '"Ko meklējam?"', 'The group card\'s note', `A new optional group field (up to 60 characters), its check, the settings field. One text or two: ${q(17)}.`, 'add_group_looking_for'],
  ['D2', 'The event\'s own place', 'Events away from home', 'A required city on each event, filled from the group\'s city for existing events; an online mark for "Tiešsaistē" (13 Oct); the form field; every event filter switches to it. The address stays free text.', 'add_event_city'],
  ['D3', 'A dark tone per category, with preview and publish', 'Admin → Dizains → Kategoriju krāsas', 'Either a new category field or the colours inside the site theme, which already has preview and publish (the builder\'s default: the theme). The colour is still set on the server, which must now pick the light or the dark tone.', 'add_category_color_dark (only if not in the theme)'],
  ['D4', '"What\'s new since you last looked" on Manas grupas', 'The profile menu\'s count', 'When you last opened Manas grupas: one time per person (or one per group you are in).', 'add_user_my_groups_seen_at'],
  ['D5', 'Distances for "Citur"', 'Discovery', 'Coordinates for every city, and the data to fill them.', 'add_city_coordinates'],
  ['D6', 'Reporting people', `${q(7)}, later`, 'A report about a person.', 'add_report_target_user (later)'],
  ['D7', 'Several cities at once', 'The place list', 'The group and event lists take several cities; the address format.', ''],
  ['D8', 'Counts per category, sub-category and city', 'The drawer and the lists', 'New counting queries, cached.', ''],
  ['D9', 'Events by dates, the day dots, a week at a time', 'Discovery → Pasākumi', 'Date range and limit in the event list; a count per day.', ''],
  ['D10', 'Sub-categories filter events', 'Events filter like groups', 'Through the group\'s sub-categories; no new data.', ''],
  ['D11', 'The next meeting of each group', 'Card, panel, Informācija', 'A query for each group\'s next visible event.', ''],
  ['D12', 'Faces of who is going', 'Event row and panel', 'The people going, with pictures, for signed-in viewers only (13 Oct).', ''],
  ['D13', 'The Paziņojumi page', 'Your own area', 'Paging; the group\'s name as its own link needs the group\'s address in each notification.', ''],
  ['D14', 'The Manas grupas page', 'Your own area', 'Upcoming events of your groups, news, your requests, an answer shown once (from notifications, because a declined request leaves no trace), and the count of waiting requests on the team\'s groups.', ''],
  ['D15', 'Panels with their own address', 'The opened group and the event panel', `Next.js routes that open over the list (to be checked against the installed Next.js 16 docs first).${path('intercepting + parallel routes (@modal)')}`, ''],
  ['D16', 'The place of a signed-out visitor, recent searches', `${q(5)}, Search`, 'Kept on the device only; signed in, the first city on the profile.', ''],
  ['D17', 'Literata and Commissioner, the Sūna theme', 'Identity', 'Loading the fonts; the theme already stores fonts; a new default theme.', ''],
  ['D18', 'Gaišs, Tumšs, Kā ierīcē', 'Iestatījumi', 'Today\'s switch has two states; a third, kept in a cookie.', ''],
  ['D19', 'More languages later', 'The language switch (13 Oct)', 'The switch reads the list of site languages, so adding one needs translations, not a new header. No database change now.', ''],
];

// ── F. Build order: twelve parts, each released on its own (13 Oct)
const R = [
  ['R1', 'Identity', 'The fonts, Sūna and its neutrals, the fifteen category tones (light and dark), shapes and words; Admin → Dizains with Krāsas, Kategoriju krāsas, Fonti, preview and publish (the deferred Session 15); the Handbook\'s Design chapter rewritten to the agreed rules. Released: today\'s screens in the new look, after an independent review.', 'Maybe one (D3)'],
  ['R2', 'Header, menus, footer', 'The header with the language switch "LV ▾" and room for search, the profile and shield menus, the bottom bar with its + (Atklāt, Grupas, +, Ziņas, Es), "Izveidot grupu" in the profile menu, the slim footer, your own area\'s frame with Iestatījumi (Izskats, Kā ierīcē), the short messages and the grey loading shapes (the Handbook\'s Behaviour rules). Plan item 3.4.', ''],
  ['R3', 'A group\'s frame', 'The lower header, pages down the left (☰ on phones), tabs, one "Sazināties", the waiting state, the new words (C3–C5, C8), the "…" menu with your role, "Atsaukt pieteikumu", reporting, leaving, sharing. Plan items 2.22 and 3.2.', ''],
  ['R4', 'Discovery data', '"Ko meklējam?" and the event\'s place (with the form fields), several cities, counts, dates, sub-categories for events, each group\'s next meeting (D1, D2, D7–D11). Released: the new fields in the forms; the lists keep working as today. An independent review before release: it changes the database.', 'add_group_looking_for, add_event_city'],
  ['R5', 'Discovery', 'The filter line (Kur, Tēma, the Veids chips, "Notīrīt visu"), the place and Veids lists, the drawer with counts and search, the group card and row, the create card, "Rādīt vēl", event rows by day a week at a time. The day strip and the calendar only after your review. Plan item 3.1.', ''],
  ['R6', 'Panels', 'The opened group and event panels with their own addresses, "Sazināties" and "Eju" from them, and the event cases (question 8) (D15).', ''],
  ['R7', 'Search', 'The plain header field that opens the search at once, the Kur button and the matching themes as chips at its top, recent searches; "Rādīt visus rezultātus" opening discovery with the search word as a chip (approved 13 Oct, AP-07). Plan item 3.5.', ''],
  ['R8', 'Your own area', 'Manas grupas (with question 9 answered), the Ziņas page in the frame, the Paziņojumi page, the "new" count (D4, D13, D14).', 'add_user_my_groups_seen_at'],
  ['R9', 'A group\'s life', 'The event page, the event form with its place, Biedri, Jaunumi, settings with "Ko meklējam?", Mans profils and someone else\'s profile. Plan items 3.3 (and 3.6 later).', ''],
  ['R10', 'Citur and the unknown place', 'Distances between cities, the visitor\'s place kept on the device (D5, D16).', 'add_city_coordinates'],
  ['R11', 'Admin frame', 'Sections across, pages down the left, the phone drawer; the admin pages in the new look; the category-moving page stays reached from a group\'s site-admin tools.', ''],
  ['R12', 'Everything else', 'Sign in, register, choosing a username, the create-group wizard, Par mums, Privātums, page not found, the cookie banner.', ''],
];

/** A compact table; on phones each row stacks and every cell is introduced by its column name. */
const tbl = (cls, head, rows) => `<div class="rd-cmp ${cls}" role="table"><div class="r hd" role="row">${head.map((h) => `<span role="columnheader">${h}</span>`).join('')}</div>${rows.map((cells) => `<div class="r" role="row">${cells.map((c, i) => `<span role="cell"${head[i] && i > 1 ? ` data-h="${head[i]}"` : ''}>${c}</span>`).join('')}</div>`).join('')}</div>`;
const row = (cells) => cells;
const chip = (kind, text) => st(kind, text);
const ACHIP = { cov: 'ag', part: 'lk', nav: 'op', no: 'op', new: 'pr' };

const count = (keyOf, list) => list.reduce((m, r) => ((m[keyOf(r)] = (m[keyOf(r)] ?? 0) + 1), m), {});

export const liveSection = () => {
  const ac = count((r) => r[5].replace('*', ''), A);
  const changed = A.filter((r) => r[5].endsWith('*')).length;
  const bc = count((r) => r[4], B);
  const cc = count((r) => r[3], C);
  const migs = D.filter((r) => r[4]).length;
  return `<section aria-labelledby="h-live">
  <h2 id="h-live">Salīdzinājums ar dzīvo lapu · Compared with the live app</h2>
  <p class="lead">On 13 October every screen of the live site was compared with this page, by reading the code on <code>main</code>. Below is everything that came out of it, not a summary: each live screen and where it is on this page; what the live site does that this page didn't mention, and what happens to it; where the two disagree, and whether that is an intended change, a mistake on this page, or still unclear; and what needs new data. Unclear points became questions in <a href="#h-open">Still open</a> (8–18), each answered on 13 October by agreeing to its default. File names are in small print, for the builders.</p>

  <h3>Your answers of 13 October</h3>
  <div class="rd-rows">
    <div><b>1 · One release?</b> No: the redesign ships in logical parts, one by one (the build order below). <a href="#h-rules">Agreed rules → Identity</a></div>
    <div><b>2 · Language and footer.</b> The language switch is important: it stays visible in the header on every page, "LV ▾", built for more languages. A slim footer on discovery and reading pages. <a href="#h-shell">Header and navigation</a></div>
    <div><b>3 · Screens not drawn.</b> They follow the decisions on this page. The four most important are now drawn: the event page, Biedri, a group's Jaunumi, Mans profils (agreed 13 Oct). <a href="#h-rules">Agreed rules</a></div>
    <div><b>4 · Events that need approval or are full.</b> Redone as pictures: <a href="#q-states">An event → Events you can't simply join</a> (Still open, 8).</div>
    <div><b>5 · The event's place.</b> A required city from the list, filled in with the group's city, plus a free address; "Tiešsaistē" for online events, shown under "Visur". <a href="#h-event">An event</a></div>
    <div><b>6 · Faces of who is going.</b> Only for signed-in viewers; visitors see "12 iet". <a href="#h-event">An event</a></div>
    <div><b>7 · Withdrawing a request.</b> "Atsaukt pieteikumu" in the group's "…" menu and on the Tavi pieteikumi row. <a href="#h-group">A group</a>, <a href="#h-me">Your own area</a></div>
    <div><b>8 · The team's "Jārīkojas".</b> Redone as pictures: <a href="#q-team">Your own area → Waiting join requests</a> (Still open, 9).</div>
    <div><b>9 · "Mani pasākumi" on a group.</b> It goes. <a href="#h-group">A group</a></div>
    <div><b>10 · Social links and member faces.</b> Links as quiet text at the end of Informācija; faces only on Biedri. <a href="#h-group">A group</a></div>
  </div>

  <h3 id="live-screens">Every live screen (${A.length})</h3>
  <p class="lead">${A.length} screens and pop-ups: ${ac.cov} drawn, ${ac.part} partly drawn, ${ac.nav} only named in a menu, ${ac.no} not drawn, ${ac.new} new screens with no live counterpart. ${changed} rows changed in 9.2 (marked "· 9.2"). At the comparison (9.1) the numbers were 13 drawn, 12 partly, 12 named only, 19 not covered. A screen that isn't drawn follows the rules on this page (your answer of 13 October).</p>
  ${tbl('a', ['#', 'Live screen', 'On this page', 'Status', 'What happens'], A.map(([n, name, files, id, where, s, what]) => row([String(n), `${name}${path(files)}`, sec(id, where), chip(ACHIP[s.replace('*', '')], AS[s.replace('*', '')] + (s.endsWith('*') ? ' · 9.2' : '')), what])))}

  <h3>What the live site does that this page didn't mention (${B.length})</h3>
  <p class="lead">${bc.done ?? 0} are now decided or drawn, ${bc.keep ?? 0} stay as they are today in the new look, ${bc.ask ?? 0} became questions.</p>
  ${tbl('b', ['', 'Live feature', 'What happens'], B.map(([id, f, files, what, k]) => row([`<b>${id}</b>`, `${f}${path(files)}`, `${chip(BK[k][0], BK[k][1])} ${what}`])))}

  <h3>Where this page and the live site differ (${C.length})</h3>
  <p class="lead">${cc.chg ?? 0} are changes on purpose (each one is building work), ${cc.wrong ?? 0} was a mistake on this page (fixed), ${cc.unc ?? 0} are unclear and now questions, ${cc.res ?? 0} was answered on 13 October, ${cc.ok ?? 0} agrees already.</p>
  ${tbl('c', ['', 'Live today', 'This page', 'Verdict'], C.map(([id, live, page, v, note]) => row([`<b>${id}</b>`, live, page, `${chip(CK[v][0], CK[v][1])}${note ? ` <span class="nt">${note}</span>` : ''}`])))}

  <h3>What needs new data or server work (${D.length})</h3>
  <p class="lead">${migs} of them change the database (marked "Migration"). Every change is additive first, so the version still running keeps working while the new one starts; anything removed goes in a later release.</p>
  ${tbl('d', ['', 'Item', 'Why', 'What it needs'], D.map(([id, item, why, need, mig]) => row([`<b>${id}</b>`, item, why, `${need}${mig ? ` <span class="rd-mig">Migration</span>${path(mig)}` : ''}`])))}

  <h3 id="live-order">Build order: twelve parts, each released on its own ${st('ag', 'Agreed 13 Oct')}</h3>
  <p class="lead">Your answer of 13 October: not one big release. Each part is built, reviewed and released before the next; the site works after every one. Identity comes first, because every later part is drawn in it. <b>No feature switch</b> (your decision at the design freeze, 9.8): a part is not hidden behind a switch while it is built; it goes live for everyone when it is released, and the build plan names the rules each part carries by their ids (AR-…, AP-…, <a href="#h-rules">Agreed rules</a>).</p>
  <ol class="rd-build">${R.map(([id, t, what, mig]) => `<li><b>${id} · ${t}</b><p>${what}${mig ? ` <span class="rd-mig">Migration</span>${path(mig)}` : ''}</p></li>`).join('')}</ol>

  <h3>Questions this raised</h3>
  <p class="lead">All in <a href="#h-open">Still open</a>, each answered on 13 October by agreeing to the default: 8 events you can't simply join (pictures), 9 the team's waiting requests (pictures), 10 where you change your profile, 11 private groups, 12 the word behind "Mod", 13 members-only events, 14 how a member writes to the team, 15 "are you sure?" for steps that can be undone, 16 deleting your account, 17 "Ko meklējam?" in one language or two, 18 the four new drawings; reporting an event joined question 7. Where the Handbook or this page already decides (short messages, loading and error pages, text in another language, the cards / list switch, repeating events, the category-moving page), the answer is written in the tables above instead of asked.</p>
</section>`;
};
