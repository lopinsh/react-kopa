# R9c spec · Profiles (OD-26) and group settings

Just-in-time spec for release R9c of the [build plan](../build-plan.md) (card "R9c · Group settings and profiles"), written 19 Oct 2026 against `main` at `7f018c2` (R1a–R9b, R6b, C2, C4 live), Next.js 16, next-intl 4, Prisma 6.19. Frozen once R9c is pushed. The redesign page (generated from `scripts/redesign/`) wins over this spec where they disagree, except where OD-26 was changed on 15 Oct (below).

**Owned rules:** [AR-63](../redesign.html#AR-63) Mans profils (moves from R9b to R9c: the profile half was split off; the builder moves it in the R9b/R9c cards and the coverage table). **Also applied:** [AR-60](../redesign.html#AR-60) own area, [AR-14](../redesign.html#AR-14) profile menu, [AR-17](../redesign.html#AR-17) light/dark only in Iestatījumi, [AR-20](../redesign.html#AR-20) where "Es" leads, [AR-35](../redesign.html#AR-35) tagline field, [AR-49](../redesign.html#AR-49) hidden not greyed, [AR-02](../redesign.html#AR-02) undrawn screens (group settings, the edit page and Iestatījumi are not drawn). **Owner decisions:** OD-26 as changed 15 Oct (LinkedIn model), C4 (`LanguageEditor`).

**OD-26 now:** Mans profils shows exactly what others see; "Labot profilu" leads to a separate edit page; the three privacy switches move to Iestatījumi; Iestatījumi keeps Izskats. This replaces AR-63's "opens the form in place" and the drawing's lead (`gen.mjs` 539).

**Owner notes folded in** (the reviewer of the session closes each with `npm run feedback -- done <id> "…"`):

| Note | What | Session |
|---|---|---|
| `cmv9aq31h001umk01k3u5asyy` | Not clear Mans profils is my public profile; separate edit and public pages (OD-26) | R9c-1 |
| `cmv9anua9001kmk01cmcyvjnu` | Privacy switches on Labot profilu belong in Iestatījumi | R9c-1 |
| `cmv9l6kmv001opp01od6vbsi0` | The own bar could carry the edit / view profile links | R9c-1 |
| `cmv9l2nif001epp01q8bi6iq0` | EN bottom bar "Groups" → "My groups" (LV "Grupas" stays) | R9c-1 |
| `cmv9l5a3q001jpp01q7l6gxo5` | "Es" should open Manas grupas: **owner question 1**; with the default, close with "Es keeps Mans profils (AR-20); the edit/view links sit on the own bar (cmv9l6kmv)" | R9c-1 |

Not folded: `cmv9l90i3` (Manas grupas → "My content", the default landing) stays open for a later decision; `cmv9uw02g` (admin "view as") later.

**Already built, not re-specced** (grep at `7f018c2`): `TagPicker` has **no** `as any` left (grep `any`, `as unknown`, `ts-ignore`: none); the handoff's "Known code debt" line still says it is planned, the builder deletes that clause in R9c-2. `LanguageEditor` is wired into sections (`SectionEditForm`) and the wizard (C4). Settings already has three tabs (`SettingsTabs`, `?tab=group|sections|owner`, legacy tab redirects in the page) and `components/groups/settings/*` sections; `useGroupContext` is already used (no `userRole` prop). Iestatījumi already has `AppearanceSetting`. `components/ui/Switch.tsx`, `DiscardGuard.tsx`, `TextLink`, `EmptyState`, `GroupList` (`mine` prop with role tags) exist.

**Sessions** (each built, reviewed and pushed on its own, in this order; both touch `messages/*.json`):

- **R9c-1 · Profiles** (sections 1–4): one profile context from the service, `ProfileView` shared by `/profile` and `/profile/[username]`, the edit page without switches, Privātums in Iestatījumi, own bar links, EN "My groups". ~16 files, 4 commits. **Opus review** (privacy: what a stranger, a co-member and a visitor see).
- **R9c-2 · Group settings** (sections 5–7): `GroupSettingsForm` split per tab and restyled, `GroupSectionEditor` (240) split, `TagPicker` (604) split, the `LanguageEditor` bar wrap. ~20 files, 4 commits, no behaviour change. Sonnet review.

**Rules for builder and reviewer (owner, as given):** drawings are illustrations at 375 and 1280 px; build the intent, fluid; check **360, 768, 1024, 1280, 1440, 1920**. Fix small issues (≤ ~4 min) instead of listing them. Prototype stage: seed/dev-password sign-ins are intended. Dev server only through the preview tool (`preview_start` "dev"), stopped at the end; `window.confirm = () => true` before anything that may confirm. Every commit typechecks on its own; a deletion lands with its replacement. Never push (the reviewer pushes). New components ≤ ~150 lines (limits below). Look at `/admin/handbook/ui-elements` first; reuse `Switch`, `Button`, `TextLink`, `EmptyState`, `RoleTag`, `GroupList`, `PageNavLink`, `DiscardGuard`, `ConfirmDialog`, `LanguageEditor`, `PartTabs`.

## Drawings to match

Redesign page, "Your own area" (#h-me). Sources in `scripts/redesign/gen.mjs`:

| Drawing | Source | What to see |
|---|---|---|
| Desktop · Mans profils | `gen.mjs` 540; `myProfile` 531 | Person header on top, own menu left; the facts line "Jelgava, Rīga · Ejam kopā kopš …" with "Labot profilu" at its right, the about text, then group rows with the role tag |
| Phone · Mans profils ("Es") | `gen.mjs` 542; `parts.mjs` 318 `ownBar` | The own bar (☰, picture, name, line), page title, the same content in one column |
| Lead text | `gen.mjs` 539, 543 | Someone else's profile looks the same, with only the groups you share and "Sūtīt ziņu"; what others see follows the privacy switches |

Changed since the drawings (OD-26, 15 Oct): "Labot profilu" opens `/profile/edit`, not a form in place; the switches are on Iestatījumi. Not drawn: the edit page (layout D inside the own frame), Iestatījumi's Privātums, group settings (build from the rules and the existing sections, AR-02).

## Invariants (must stay exactly as today; the reviewer checks each)

1. **Who sees which groups** is decided in `UserService` only, with today's rules (`user.service.ts` 145–191): pending applications never count; moderation-hidden groups never show; private groups only to fellow members; all public groups only when `showGroupsOnProfile`; signed-out visitors share no group.
2. **A private profile** (`isProfilePublic = false`) shows any other viewer only the private-profile empty state: no name, picture, bio, places or groups in the HTML or RSC payload.
3. **No email, password hash or site role** in any profile payload (`PROFILE_USER_SELECT`).
4. **"Sūtīt ziņu"** shows only when `MessageService.messageableUserIds` allows it (shared group, their `allowDirectMessages`, not yourself).
5. **Saving the profile form never changes the privacy switches**, and saving a switch never touches name, bio, places or picture.
6. **Username** stays unique (`USERNAME_TAKEN`), validated by the shared schema.
7. **Group settings permissions** stay in services: group admins never see or post the Owner tab (`showOwnerTab`); name/owner fields only for owner and site admins (`canEditOwnerFields`); `updateGroup`, `deleteGroup`, transfer and section actions keep their checks. R9c-2 moves code, it does not change what is saved or who may save it.
8. **Legacy settings links** (`LEGACY_TABS` in the settings page) still land on the right tab and block.
9. **Owner text is never machine-translated**; the `LanguageEditor` keeps every draft when switching languages (C4).
10. No browser `confirm()`; deleting the group stays our `ConfirmDialog` naming the group.

## 0. Motivation and design alignment

- **Privacy first (values, principles.md "let people choose what their profile shows").** Today Mans profils shows your 6 newest groups whatever your switches say, and `/profile/{you}` shows all of them: neither is what others see, which is the owner's confusion (cmv9aq31h). One service method now builds the profile for a given viewer; Mans profils asks it for "a signed-in person who shares no group with you", so the page can't drift from what others really get.
- **Service and Context Laws.** Both profile pages call Prisma-free services today but compute `canMessage`, the private check and the groups heading in the page. All of it moves into one typed `ProfileViewContext`; the pages only render.
- **One thing per page (LinkedIn model).** Viewing (Mans profils), editing (Labot profilu) and choosing who sees what (Iestatījumi → Privātums) become three places, each answering one question. Iestatījumi keeps Izskats (AR-17) and later the account (R12, OD-27).
- **Reuse.** Group rows with role tags are Tavas grupas' `GroupList` with `mine`; switches are `components/ui/Switch`; the settings cards take `AppearanceSetting`'s look so Iestatījumi and group settings read as one family.
- **Small components.** `GroupSettingsForm` 288, `GroupSectionEditor` 240, `TagPicker` 604, `ProfileEditForm` 196 are split when touched (build plan section 6).

## 1. Service and schema (R9c-1, commit 1)

`lib/types/profile.ts` (new, ~40 lines):

```ts
export type ProfileGroupRow = { card: GroupCard; role: 'OWNER' | 'ADMIN' | 'MEMBER' };
export type ProfileViewContext = {
  person: { id; name; username; avatarSrc; bio; cities: string[]; createdAt: Date };
  isOwn: boolean;
  isPrivate: boolean;            // true → the page renders only the empty state (invariant 2); person fields empty
  groups: ProfileGroupRow[];
  groupsScope: 'all' | 'shared' | 'none';   // heading: Grupas / Kopīgās grupas / no section
  canMessage: boolean;
};
export type PrivacySettings = { isProfilePublic: boolean; allowDirectMessages: boolean; showGroupsOnProfile: boolean };
```

`UserService` (`lib/services/user.service.ts`):
- **`getProfileView(target: { username: string } | { userId: string }, viewerId: string | undefined, locale, opts?: { asStranger?: boolean })`** replaces `getUserByUsername` and `getOwnProfile` (both deleted with their types). With `asStranger` the group filter is computed as for a signed-in viewer with no shared group (public groups if `showGroupsOnProfile`, else none) and `isPrivate` is reported but the person fields are kept (Mans profils shows them to you, section 2). Without it: today's filter (invariant 1); a non-own private profile returns `isPrivate: true` with empty person fields and no groups. `canMessage` is computed here via `MessageService.messageableUserIds`. Roles come from the membership row (`m.role`), groups ordered `joinedAt desc`, no `take` limit (today's 6 goes).
- **`getPrivacySettings(userId)`** and **`updatePrivacy(userId, data: Partial<PrivacySettings>)`**; `updateProfile`'s data type loses the three privacy fields (invariant 5). `getUserProfile` (edit page) stops selecting them.

`lib/validations/user.ts`: `profileSchema` without the three booleans; new `privacySchema = z.object({ isProfilePublic, allowDirectMessages, showGroupsOnProfile }).partial().refine(at least one key)`.

`actions/user-actions.ts`: `updateProfile` no longer passes privacy fields; new `updatePrivacy(input: unknown): Promise<ActionResponse>` (auth → `privacySchema` → service → `revalidatePath('/', 'layout')`, `revalidateTag('groups', 'max')` as `updateProfile` does). Error codes already in the registry (`UNAUTHORIZED`, `VALIDATION_FAILED`, `UPDATE_FAILED`).

## 2. Mans profils and someone else's profile (R9c-1, commit 2)

**`components/profile/ProfileView.tsx`** (server component, ≤ 120 lines; split the head into `ProfileHead.tsx` if it grows). Layout F reading width (`max-w-[680px]`), no rounded hero, no gradient (today's `rounded-[3rem]` blocks go):
- Head: picture (64 px phone / 80 px desktop), name as `h1` (on Mans profils `md:sr-only`, the person header already names you; mirror Iestatījumi's pattern), `@username` muted, facts line "Jelgava, Rīga · Ejam kopā kopš 2025. gada marta" (`cityLabel`, `createDateFormatter` month + year), and an `action` slot at the right of the facts line (wraps under it at 360).
- About: the bio as plain text with `whitespace-pre-wrap` (no `prose`, no "Par mani" heading with a dot). Empty → nothing; on Mans profils only, a quiet line `profile.noBio` with a `TextLink` to `/profile/edit`.
- Groups: heading by `groupsScope` (`groupsHeading` / `sharedGroups`, none → no section), then `GroupList` with `mine` built from `groups` (role tags; `requestCount: 0`; `fullPage`). Empty list with a heading → the existing empty sentence, outline icon, no button (AR-66).

**`app/[locale]/(me)/profile/page.tsx`** (~45 lines): `getProfileView({ userId }, me, locale, { asStranger: true })`; action slot = `Button` link "Labot profilu" (`profile.editTitle`) to `/profile/edit`. Above the view, **`components/profile/ProfileViewerNote.tsx`** (~40 lines, one quiet line, not a banner):
- public, groups shown: `profile.view.asOthersSee`;
- public, groups hidden: `asOthersSee` + `profile.view.groupsHidden`;
- private: `profile.view.privateNote`; the view still renders below so you can check it (owner question 2).
Each variant ends with a `TextLink` `profile.view.changePrivacy` → `/settings#privacy`.

**`app/[locale]/profile/[username]/page.tsx`** (~50 lines): signed-in owner of the username → `redirect('/{locale}/profile')` (one page per person for yourself; the own-banner `viewingOwnPublicProfile` goes). `isPrivate` → `EmptyState` (`ShieldAlert`, `privateProfile`, `privateProfileDesc`) as today. Otherwise `ProfileView` with action slot = `MessageUserButton` when `canMessage`. Stays outside the own frame, page container + reading width. Metadata unchanged.

`generateMetadata` of a private profile keeps the `@username` title only (no name).

## 3. Labot profilu and Iestatījumi (R9c-1, commit 3)

**Edit page** `app/[locale]/(me)/profile/edit/page.tsx` (~45 lines): inside the own frame (menu keeps Mans profils marked, `ME_PAGES` match already does), layout D column (max 560 px), title `editTitle` (`md:sr-only` like Iestatījumi), the `backToProfile` link stays, no card-in-card: the form sits on the page in `AppearanceSetting`'s card look.

**`components/profile/ProfileEditForm.tsx`** (196 → ≤ 130): fields name, username, picture, about you, places; `SwitchRow` and the Privātums block deleted. Picture input and the dice ("Jauns avatārs") move to **`components/profile/AvatarField.tsx`** (~60). `isPending` guard kept; `DiscardGuard` while dirty; "Saglabāt" + "Atcelt" (`common` keys; Atcelt → `/profile`). On success `router.push('/profile')` + `router.refresh()` (redirect to the public view after update, AGENTS.md). The places field stays the comma-separated text it is today (out of scope).

**Iestatījumi** `app/[locale]/(me)/settings/page.tsx`: order **Privātums, then Izskats**; reads `getPrivacySettings` and passes it as the initial value. **`components/me/PrivacySettings.tsx`** (client, ~80 lines): a `fieldset` in `AppearanceSetting`'s card look, `id="privacy"` (target of the note's link), legend `profile.settings.privacy.title`, three rows label + description + `Switch`. A switch saves on change (as Izskats does, no Save button): optimistic, `useTransition` guard per row (that row disabled while pending), on failure revert and toast `errors.*`; success is silent apart from `aria-live` `profile.settings.saved`. The page comment "other settings stay on Labot profilu until R9b" goes.

## 4. Own bar links and the bottom bar (R9c-1, commit 3)

- `PersonHeader` and `MePhoneBar`: picture + name become one link to `/profile` ("what others see"; accessible name = the person's name + `profile.area.viewProfile`). A trailing **"Labot profilu"** link (pencil icon; word from 768 px, icon-only 44 px with `aria-label` below) shows on every own page **except** `/profile` (the view carries the button) and `/profile/edit`. Pathname via `usePathname` (both are client already). Keep each file ≤ ~60 lines.
- `messages/en.json` `nav.groups`: "Groups" → "My groups" (cmv9l2nif); LV "Grupas" unchanged. Check the 5-tab bottom bar at 360 in EN: no wrap, no truncation of the other labels.

## 5. Group settings split and restyle (R9c-2, commits 5–6)

No behaviour change (invariants 7, 8). Today `GroupSettingsForm` (288) holds the form setup (88–130), submit (131–165) and the three tab bodies (167, 217, 252). New files in `components/groups/settings/`:

| File | Lines (max) | From |
|---|---|---|
| `useGroupSettingsForm.ts` | 110 | `useForm` + `buildGroupFormSchema`, taxonomy selection state, `tagsCleared`, `onSubmit` (with the `router.replace(…?tab=…)` on slug change), `serverError` |
| `GroupTab.tsx` | 90 | Basics, Categorization, Social, the save row |
| `OwnerTab.tsx` | 90 | AcceptingMembers, Privacy, TransferOwnership, DangerZone + the delete `ConfirmDialog` |
| `SectionsTab.tsx` | 50 | title, description, the sections editor |
| `SaveRow.tsx` | 40 | server error line (`AlertCircle`), "Saglabāt" with `isPending`, one per form |

`components/groups/GroupSettingsForm.tsx` is deleted; the settings page renders the tab component for `activeTab` with the same props it passes today. Each form tab wraps `FormProvider` itself; `DiscardGuard` on a dirty form if not already wired.

**`GroupSectionEditor` (240)** moves to `components/groups/settings/sections/` as `SectionsEditor.tsx` (≤ 120, list state and actions) + `SectionRow.tsx` (≤ 90, the whole-row toggle with ▾/▴ and visibility, already built) ; `SectionEditForm` (133) stays, path unchanged.

**Restyle** (AR-02: the same parts as Iestatījumi): `SettingsSection` becomes the card of `AppearanceSetting` (`rounded-2xl bg-surface px-4 py-3.5`, heading `font-heading text-[15px] font-semibold`, description `text-sm text-foreground-muted`); the `animate-in` entry, the 24 px primary icon and `text-xl` go (icon optional, 16 px muted). Cards stack with `gap-4` in the 760 px group reading width. `DangerZoneSection` keeps its danger button styling from `Button` (no red card). Every `settings/*` section is checked for hardcoded colours or radii while there.

## 6. TagPicker split (R9c-2, commit 7)

`components/groups/TagPicker.tsx` (604) → `components/groups/tag-picker/`, same props (`l1`, `allowL3`, `maxTags`), same `useFormContext<GroupFormValues>` contract (`tagIds` via `setValue`):

| File | Lines (max) | From (today's lines) |
|---|---|---|
| `TagPicker.tsx` | 140 | state wiring, render shell (286–604 minus the parts below) |
| `useTagSearch.ts` | 100 | flat tags, query, search effects and debounce (46–160) |
| `usePendingTags.ts` | 110 | pending tags, `createPending`, `commitTypedText`, wildcard mode (51–56, 177–257) |
| `TagResults.tsx` | 120 | the open list with L2/L3 rows and the inline wildcard input |
| `PendingTagOption.tsx` | 40 | `renderPendingOption` (258–285) |
| `SelectedTags.tsx` | 60 | chosen chips with remove and the limit line |

Importers updated: `settings/CategorizationSection.tsx`, `create-wizard/TaxonomyStep.tsx`, `admin/…/categorization/AdminGroupCategorizationForm.tsx`. No `any`, no `as` casts except narrowing with type guards. Effects clean up (timers, aborts) as today.

## 7. LanguageEditor bar wrap (R9c-2, commit 6)

`components/ui/LanguageEditor.tsx` 86–120: the bar is one `flex-wrap` row, so at 768 px in the settings column (frame nav takes the left) single items break apart. Make it **two unbreakable groups**: group 1 = label + current-language trigger, group 2 = "Citas valodas" buttons + "+ Pievienot tulkojumu" (`flex-nowrap`, `ms-auto` when on the same line). The row wraps only between the groups; inside group 2 the language buttons may wrap only at < 400 px column width. Check in a section (Iestatījumi → Sadaļas → open one), the event form and the wizard at 360, 768, 1024.

## 8. i18n (both files, same commit; `npm run i18n:check`)

New (LV / EN):

| Key | LV | EN |
|---|---|---|
| `profile.view.asOthersSee` | Tā tavu profilu redz citi. | This is how others see your profile. |
| `profile.view.groupsHidden` | Tavas grupas citi neredz; kopīgo grupu biedri redz tās, kas jums kopīgas. | Others don't see your groups; people who share a group with you see the ones you share. |
| `profile.view.privateNote` | Tavs profils ir privāts: citi redz tikai, ka tas ir privāts. | Your profile is private: others only see that it is private. |
| `profile.view.changePrivacy` | Mainīt Iestatījumos | Change in Settings |
| `profile.area.viewProfile` | skatīt profilu | view profile |
| `profile.settings.privacy.title` | Privātums | Privacy |
| `profile.settings.privacy.publicProfile` / `…Desc` | (moved from `profile.edit.privacy.*`, text unchanged) | |
| `profile.settings.privacy.allowMessages` / `…Desc` | (moved) | |
| `profile.settings.privacy.showGroups` / `…Desc` | (moved) | |
| `profile.settings.saved` | Saglabāts | Saved |

Changed: `nav.groups` EN "My groups". Removed (grep first, delete only if unused): `profile.edit.privacy.*`, `profile.viewingOwnPublicProfile`, `profile.viewAllGroups`, `profile.message` if unused. `groupSettings` keys: none new (R9c-2 moves code only; a key that loses its last user is deleted).

## 9. Handbook, ledger, UI elements

- `docs/handbook/design.md` "Every screen" (R9c-1): Own profile → R9c done (what others see); Public profile F → R9c done; Edit profile D → R9c done ("Labot profilu" a page of its own; switches in Iestatījumi). (R9c-2): Group settings → R9c done.
- `docs/handbook/behaviour.md`: grep "Labot profilu", "Privātums", "switch"; where a rule says switches live on the edit page, point it to Iestatījumi; add under saving: "a switch saves on change; forms save with Saglabāt" if no such line exists.
- Ledger (`scripts/redesign/gen.mjs`, then `npm run redesign:build`): AR-63 (157): "What others see: about you, places, since when, your groups with your role; "Labot profilu" opens its own page; the privacy switches are in Iestatījumi (OD-26 changed 15 Oct)" with `st('ag', 'Agreed 13 Oct, changed 15 Oct, OD-26')`; the OD-26 item (184) and the Mans profils lead (539) say the same. Build plan: AR-63 owner R9b → R9c in the coverage table and the two cards; `npm run plan:check`.
- `/admin/handbook/ui-elements`: `ProfileView` (own with note, other with Sūtīt ziņu, private empty state), `PrivacySettings`, the restyled `SettingsSection`, `TagPicker` (unchanged demo, new path).
- `docs/execution_handoff.md`: tick R9c-1 / R9c-2; delete the TagPicker `as any` clause from Known code debt (R9c-2).

## 10. Builder steps and commits

**R9c-1** (Sonnet build, **Opus review**):
1. `feat(R9c): one profile context for every viewer; privacy schema and action`: section 1 (types, service, schema, action). Old pages adapted to the new method in the same commit so it typechecks.
2. `feat(R9c): Mans profils shows what others see; profiles share ProfileView`: section 2.
3. `feat(R9c): Labot profilu on its own; Privātums in Iestatījumi; own bar links`: sections 3, 4, i18n.
4. `docs(R9c): profiles per OD-26; ledger AR-63; UI elements; status`.

**R9c-2** (Sonnet build, Sonnet review):
5. `refactor(R9c): group settings split per tab`: section 5 split, `GroupSectionEditor` split, page wiring.
6. `feat(R9c): group settings in the settings card look; LanguageEditor wraps by group`: restyle, section 7.
7. `refactor(R9c): TagPicker split`: section 6, three importers.
8. `docs(R9c): group settings; known debt; status`.

## 11. Acceptance (builder runs it; the reviewer repeats it)

Checks: `npm run typecheck`, `npx eslint <changed files>`, `npm run i18n:check`, `npm run plan:check`. Browser: lv and en, widths 360, 768, 1024, 1280, 1440, 1920; light and dark once at 375 and 1280. Accounts: a user with public + private groups (seed), a second user sharing one group, signed out.

**R9c-1**
- [ ] Mans profils with `showGroupsOnProfile` on: only the person's **public**, non-hidden groups, with role tags; a private group of yours is absent (grep the HTML); off: no groups section and the `groupsHidden` note; private profile: `privateNote`, the view below.
- [ ] Mans profils and `/profile/{username}` opened by a signed-in stranger show the same groups and fields (compare side by side).
- [ ] Co-member sees shared groups (heading "Kopīgās grupas") and "Sūtīt ziņu" only when the person allows messages; signed out sees no groups unless opted in, never "Sūtīt ziņu".
- [ ] Private profile as stranger / signed out: only the empty state; name, bio and image URL absent from HTML and RSC payload.
- [ ] `/profile/{own username}` signed in → `/profile`.
- [ ] Labot profilu: no switches; saving goes to Mans profils with the new text; `USERNAME_TAKEN` shows inline; leaving with changes asks (DiscardGuard); the switches' values are unchanged after a save (DB check).
- [ ] Iestatījumi: Privātums then Izskats; each switch saves on its own, survives reload, reverts with a toast when the action fails (offline); a double click doesn't send twice; `/settings#privacy` lands on the card.
- [ ] Own bar: name/picture opens Mans profils; "Labot profilu" on Manas grupas, Ziņas, Paziņojumi, Iestatījumi, not on Mans profils or the edit page; 44 px target at 360.
- [ ] EN bottom bar reads "My groups" and fits at 360.

**R9c-2**
- [ ] Each tab saves exactly what it saved before (change one field per section, reload); slug change on Grupa tab lands on the new address with `?tab=group`; group admin has no Owner tab and a forced `?tab=owner` shows Grupa.
- [ ] Legacy `?tab=` links land as before; delete asks in our dialog naming the group; transfer works.
- [ ] Sections tab: open/close rows, add, edit in two languages (drafts kept), reorder/visibility as before.
- [ ] TagPicker in settings, the create wizard and the admin categorization form: search, add, remove, the limit, a pending (wildcard) tag, keyboard use; no console errors.
- [ ] LanguageEditor bar in a section at 360 / 768 / 1024: no item split from its group, no horizontal scroll (`scrollWidth === innerWidth`).
- [ ] Settings cards look like Iestatījumi's in light and dark; no `animate-in` left in `settings/*`; every new file within its line limit.

## 12. Risks

- **Viewer drift:** if the page and the service each decide part of the visibility, Mans profils will lie again. The reviewer checks the pages hold no visibility logic (no `isProfilePublic`, `showGroupsOnProfile` or membership checks outside `user.service.ts`).
- **Partial privacy saves:** `privacySchema` is partial; the service must update only the keys given (Prisma ignores `undefined`; never spread a default `false`).
- **Old deploy during the swap:** no schema change; the old app's `updateProfile` still writes the switches, harmless. No migration.
- **Route clash:** `/profile/edit` and `/profile/my-groups` are static and win over `/profile/[username]`; a user named "edit" or "my-groups" can't be reached. Check `lib/username` reserves them; if not, add both to the reserved list (small fix).
- **Settings split regressions** are silent (a field that stops saving): the reviewer saves every section once.
- **TagPicker effects:** moving the debounce/search effects into hooks can double-fire under Strict Mode; keep the cleanup functions exactly.

## 13. Out of scope

Manas grupas as "My content" / the default own landing (`cmv9l90i3`); an admin "view as" mode (`cmv9uw02g`); the places field as a city picker (stays comma text); deleting your account (R12, OD-27); changing who may edit group settings; a banner picker.

## 14. Owner questions (the builder uses the default unless the owner objects)

1. **Where "Es" leads (cmv9l5a3q):** **Default: "Es" keeps opening Mans profils** (AR-20; "Grupas" already opens Manas grupas, two tabs to one page would waste one), with "Labot profilu" and the view link on the own bar. Alternative: "Es" opens Manas grupas and the bar carries the profile.
2. **Mans profils when your profile is private:** **Default: the note "others only see that it is private" plus your profile below**, so you can check it before opening it up. Alternative: show only what others see, the empty state.
3. **Whose view Mans profils copies:** **Default: a signed-in person who shares no group with you** (the most common stranger); the note names what co-members see in addition. Alternative: a signed-out visitor (shows no groups unless you opted in).
