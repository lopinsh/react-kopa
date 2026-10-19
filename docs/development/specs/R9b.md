# R9b spec · Jaunumi, Biedri, Informācija on one page, the group picture

Just-in-time spec for release R9b of the [build plan](../build-plan.md) (card "R9b · Biedri, Jaunumi, Informācija, group picture"), written 19 Oct 2026 against `main` at `32d1c55` (R1a–R9a, R6b, C2, C4 live), Next.js 16, next-intl 4, Prisma 6.19. Frozen once R9b is pushed. The redesign page (generated from `scripts/redesign/`) wins over this spec where they disagree, except where an owner note of 15 Oct changed a rule (listed below).

**Split.** The card's settings and profile half (GroupSettingsForm 288 split, TagPicker 604 split and its `as any`, the LanguageEditor wrap at 768 px, Mans profils / someone else's profile / profile editing per OD-26, privacy switches to Iestatījumi) is **R9c**, its own spec and build. R9b plus R9c would be ~60 files; three focused builds here plus R9c keep each build under ~80 tool calls.

**Owned rules:** [AR-52](../redesign.html#AR-52) Join requests, [AR-53](../redesign.html#AR-53) Biedri, Jaunumi. **Also applied:** [AR-09](../redesign.html#AR-09) role tags, [AR-21](../redesign.html#AR-21) part tabs, [AR-49](../redesign.html#AR-49) hidden not greyed, [AR-50](../redesign.html#AR-50) Informācija parts, [AR-70](../redesign.html#AR-70) banner (changed by C5), [AR-02](../redesign.html#AR-02) undrawn screens. **Owner decisions:** OD-24 (Biedri and Jaunumi as drawn), C3, C5 and D of build-plan section 6.

**Owner notes folded in** (the reviewer of the session closes each with `npm run feedback -- done <id> "…"`):

| Note | What | Session |
|---|---|---|
| `cmv9avg8o0029mk01bkru0x7n` | Jaunumi looks broken; newest on the group landing page; each public or members-only (C3) | R9b-1 |
| `cmv9axmh5002gmk01ndvz05sz` | Auto-announcement per event: **already answered by C2** (live: card shows next event, else newest public announcement, no automatic records). Close it in R9b-1 with that reply. | R9b-1 |
| `cmv9bb8ci003nmk013dg1hy6g` | Informācija one page, tabs become jump links (D) | R9b-3 |
| `cmv9b9pbr003imk01aeq5zi9p` | Group header in the event-page image format (C5) | R9b-3 |
| `cmv9at6co0024mk01l33h1oif` | Past events: only on a group's Pasākumi → Pagājušie (D) | R9b-3 |

**Already built, not re-specced** (grep confirmed at `32d1c55`): "Sauklis"/"Tagline" label (`groupSettings.fieldLookingFor`); section rows open on the whole row with ▾/▴ (`GroupSectionEditor`); Pasākumi tabs Gaidāmie/Pagājušie (`events/page.tsx`, `getGroupEventRows(…, 'past')`); member removal already confirms with `ConfirmPopover` (no browser `confirm()` left in `components/groups`, B8 done); settings already has three tabs and `components/groups/settings/*` sections (R9c continues from there). Discovery has no UI that asks for past events; only a dead `status: 'past'` option remains (R9b-3 removes it).

**Sessions** (each built, reviewed and pushed on its own, in this order; all touch `messages/*.json`):

- **R9b-1 · Jaunumi** (sections 1, 2, 3): migration `add_announcement_visibility`, service, the board restyled and split, newest on Informācija, card filter. ~16 files, 4 commits. **Opus review** (migration + visibility leak).
- **R9b-2 · Biedri** (section 4): typed members context, `MemberRow`, `RequestRow`, `MemberRowMenu`; old cards deleted. ~12 files, 3 commits. Sonnet review.
- **R9b-3 · Informācija one page, the group picture** (sections 5, 6): stacked parts with jump links and scroll-spy, C5 banner and picture, dead discovery option. ~12 files, 3 commits. Sonnet review.

**Rules for builder and reviewer (owner, as given):** drawings are illustrations at 375 and 1280 px; build the intent, fluid; check **360, 768, 1024, 1280, 1440, 1920**. Fix small issues (≤ ~4 min) instead of listing them. Prototype stage: seed/dev-password sign-ins are intended. Dev server only through the preview tool (`preview_start` "dev"), stopped at the end; `window.confirm = () => true` before anything that may confirm. Every commit typechecks on its own; a deletion lands with its replacement. Never push (the reviewer pushes). New components ≤ ~150 lines (limits below). Look at `/admin/handbook/ui-elements` first; reuse `PartTabs` (its `action` slot), `Menu` (`useMenu`, `MenuPanel`, `MenuItemButton`, `MenuItemLink`), `RoleTag`, `Badge`, `Button`, `TextLink`, `ConfirmDialog`, `ConfirmPopover`, `EmptyState`, `Modal`, `SectionVisibilityField`, `CategoryIcon`, `FallbackLangLabel`, `components/me/NewsItem.tsx`.

## Drawings to match

Redesign page, "A group" (#h-group). Sources in `scripts/redesign/gen.mjs`:

| Drawing | Source | What to see |
|---|---|---|
| Desktop · Biedri → Pieteikumi · group team | `gen.mjs` 469–470 (`.rd-req`) | Tabs "Biedri", "Pieteikumi 2"; one row per request: name · when, the message in quotes, "Sazināties" (chat icon), "Noraidīt", "Apstiprināt" |
| Desktop · Biedri · group team, one member's "…" open | `gen.mjs` 471–472; `parts.mjs` 307 `memberRow`, 308 `memberMenu` | Rows: face, name, since when, role tag (none for a plain member); "…" menu: Sūtīt ziņu, Skatīt profilu, Iecelt par moderatoru, Izslēgt no grupas |
| Desktop · Jaunumi · group team | `gen.mjs` 473–474; `parts.mjs` 310 `annItem` | Tabs Aktuālie / Arhīvs with "Jauns ieraksts" at the right end; items as in Manas grupas but the line names author and time; "…" per item for the team |
| Desktop · Informācija · signed in, not a member | `gen.mjs` 466 | Changed by D: the parts stacked, the tabs jump |

Changed since the drawings: "Visitors don't see Jaunumi" (474) still holds for the **page**; visitors now see the newest **public** item on Informācija (C3). The banner loses its background picture (C5).

## Invariants (must stay exactly as today; the reviewer checks each)

1. **Permission checks stay in services.** `promoteMember`, `demoteMember`, `kickMember`, `manageMembership`, `createPost`, `setPostArchived` and the announcement delete action keep their service checks unchanged (owner/admin rules, owner never removable, admins can't act on the owner or each other as today). The UI only hides what the service would refuse; it never decides alone.
2. **Pending applicants' messages** reach only the team and the applicant themselves (`getMembers` today); the request list is sent only to owner/admin.
3. **Announcements are written, archived and deleted by owner and admins only**; the list on the Jaunumi page is members only (`PostService.getAnnouncements`); the realtime channel carries only ids.
4. **A members-only announcement never reaches a non-member**: not in HTML, RSC payload, card line, panel or metadata.
5. **A hidden group** (moderation) shows nothing to anyone but its owner, as today (`getRole`, `publicAnnouncements` group filter).
6. **Owner text is never machine-translated**; section titles/content keep `FallbackLangLabel` and `lang`.
7. **Members-only sections** stay out of the HTML for visitors (service filters `group.sections`; nothing hidden by CSS).
8. **No navigation inside the group address from Informācija** (R6: the address opens as a panel from discovery): jump links only change the hash with `replaceState`.
9. **Taxonomy Law:** the category colour comes from the layout's server `<style>` (`--accent`, `banner-tint`, `mark-tint`); no image URL in a `<style>` block; no client colour.
10. No browser `confirm()`; destroying follows behaviour.md "Destroying" (delete = our dialog naming the thing; undoable = popover at the button).

## 0. Motivation and design alignment

- **Service and Context Laws.** Biedri and Jaunumi pages today cast raw rows (`as Member[]`) and the board fetches on the client through an action. Both move to typed context from services (`getMembersPage`, `getAnnouncementsPage`) rendered on the server; clients only render and call actions. The per-row "…" items come from one pure function the service also uses for its checks, so UI and service cannot disagree.
- **Privacy first (values).** New announcements in a public group default to everyone (owner's examples are notices for anyone); old app versions writing during the deploy swap get the column's safe default, members only.
- **Reuse.** The Jaunumi item is Manas grupas' item (`NewsItem`) with an author line; requests reuse the existing group chat ("Sazināties"); the group picture is the event page's picture format (`EventPicture`).
- **Handbook.** Reading width 760 for group pages; sticky page menus (design.md "Page layouts", owner 19 Oct); hidden, not greyed.

## 1. Data: migration `add_announcement_visibility` (R9b-1, commit 1)

`prisma/schema.prisma`, model `Post`: add

```prisma
/// Who may read it: everyone who can see the group, or members only (C3).
visibility Visibility @default(MEMBERS_ONLY)
```

Reuse the existing `enum Visibility { PUBLIC MEMBERS_ONLY }`. Migration (`npm run db:migrate -- --name add_announcement_visibility`), **expand only**:

1. `ALTER TABLE "Post" ADD COLUMN "visibility" "Visibility" NOT NULL DEFAULT 'MEMBERS_ONLY';`
2. Backfill so the live cards do not change: `UPDATE "Post" p SET "visibility" = 'PUBLIC' FROM "Group" g WHERE p."groupId" = g.id AND g.type = 'PUBLIC';` (C2 cards already show these to anyone).

Safe while the old app serves: it never reads the column and its inserts get `MEMBERS_ONLY`. No index (reads are by `groupId, createdAt`, already indexed). Seed: one members-only and one public announcement in `neteiksu-ka-sauc`, one archived.

## 2. Service (R9b-1, commit 2)

`lib/services/post.service.ts` (136 lines; keep ≤ 190, else move the page query to `lib/services/announcements-page.ts`):

- `createAnnouncement` takes `visibility`; **forces `MEMBERS_ONLY` when the group is not `PUBLIC`** (the choice is not offered there).
- `getAnnouncementsPage(groupId, viewerId, tab: 'current' | 'archive')` (replaces `getAnnouncements` and the client-only action `getGroupPosts`): members only (`FORBIDDEN` otherwise, as today); returns `{ items: AnnouncementItemData[]; counts: { current, archive }; canManage }` with `visibility`, `author { name, username }`, `createdAt`, `archivedAt`, localized nothing (owner text). Current = `archivedAt: null`; archive sorted by `archivedAt desc`.
- `getLatestForInfo(groupId, viewer: { id?: string; isMember: boolean })`: newest not archived item; members get any, everyone else only `PUBLIC` in a `PUBLIC`, not hidden group. Returns `null` or one item. One query.
- `lib/services/card-activity.ts` `publicAnnouncements()`: add `visibility: 'PUBLIC'` (the comment there names this step). Check `group-panel.ts`, `my-groups.ts`, `own-counts.ts`: members read their own groups, no change; add the filter wherever a non-member could see a post.
- Validation: the shared announcement Zod schema (`lib/validations`) gains `visibility: z.enum(['PUBLIC', 'MEMBERS_ONLY'])`; `createPost` passes it through.
- Realtime unchanged (ids only). The page refreshes with `router.refresh()` on `new-post` / `archive-post` / delete events instead of refetching through an action.

## 3. Jaunumi page and Informācija's newest item (R9b-1, commits 3–4)

**Files.** Replace `components/groups/{AnnouncementBoard (161), AnnouncementCard (64), AnnouncementModal (106)}.tsx` with `components/groups/announcements/`:

| File | Kind, limit | Does |
|---|---|---|
| `AnnouncementItem.tsx` | server-safe, ≤ 80 | Built on `components/me/NewsItem.tsx` (extract a shared base if `NewsItem` can't take an author line; don't fork its look). Title, text (clamped 3 lines on Informācija, full on Jaunumi), "Oskars · pirms 2 dienām" (`useFormatter().relativeTime`, absolute date past 7 days), a quiet lock + "Tikai biedriem" for members-only items (team and members see it; `Badge` muted, no warning colour) |
| `AnnouncementItemMenu.tsx` | client, ≤ 90 | "…" (`Menu`): Arhivēt / Atjaunot (no confirm, undoable), Dzēst (`ConfirmDialog` naming the title, behaviour.md). Submission guard per item |
| `AnnouncementForm.tsx` | client, ≤ 130 | In `Modal`: title, text, visibility (two radios built like `SectionVisibilityField`, reuse it if its props fit: "Visi" / "Tikai biedri", default Visi) shown only for `PUBLIC` groups; RHF + shared schema |
| `AnnouncementsLive.tsx` | client, ≤ 30 | `usePusher` on the group channel → `router.refresh()` |
| `LatestAnnouncement.tsx` | server, ≤ 60 | Informācija box: heading "Jaunumi", one `AnnouncementItem` (clamped), "Visi jaunumi →" only for members |

**`announcements/page.tsx`** (≤ 70): members only as today (redirect otherwise). `PartTabs` items Aktuālie (`?tab` absent) and Arhīvs (`?tab=archive`) with counts; `action` = "Jauns ieraksts" button for the team (opens `AnnouncementForm`). Items in a single column inside the reading width (760). Empty: `EmptyState` ("Vēl nav jaunumu." + the team hint) / archive "Arhīvā nekā nav.". The `<details>` archive section goes.

**Informācija (`[groupSlug]/page.tsx`)**: `LatestAnnouncement` **above the parts** (a cancelled concert must be seen first), only when `getLatestForInfo` returns one. No age cutoff: the team archives stale items (behaviour.md "archive first").

## 4. Biedri (R9b-2)

**Service** `lib/services/group-members.ts` (new, ≤ 150): `getMembersPage(group, viewerId)` → `{ members: MemberRowData[]; requests: RequestRowData[] | null }`.
- `MemberRowData`: `{ userId, name, username, avatar, role: 'OWNER' | 'ADMIN' | 'MEMBER', since: Date, profileHref: string | null (public profile only), canMessage, actions: MemberAction[] }`; sorted owner, admins, members, then `joinedAt`.
- `RequestRowData` (team only, else `null`): `{ membershipId, userId, name, avatar, askedAt, message: string | null (latest application message), chatId }`.
- `actions` from `allowedMemberActions(viewerRole, targetRole)`: a pure function next to the role helpers (`hasAdminRights`, `checkIsOwner`) that the service's promote/demote/kick checks **also call**, so the menu shows exactly what the service allows. `'message'` and `'profile'` come from `canMessage` / `profileHref`.
- Moves `MessageService.messageableUserIds` call and the role sort out of `members/page.tsx`; no `as Member[]`.

**Files.** Replace `components/groups/{MemberCard (292), RequestCard (125), MembershipPanel (52)}.tsx` (the card's `MemberMoreModal` no longer exists) with `components/groups/members/`:

| File | Kind, limit | Does |
|---|---|---|
| `MemberRow.tsx` | server, ≤ 70 | `parts.mjs` 307: face (`avatarUrl`), name (link when `profileHref`), "kopš 2025. gada marta" (`format.dateTime` month + year), `RoleTag` (owner "Īpašnieks", admin "Mod", plain member none); `MemberRowMenu` when `actions` has a team action |
| `MemberRowMenu.tsx` | client, ≤ 120 | `parts.mjs` 308, `Menu`: Sūtīt ziņu (`getOrCreateDirectChat` → Ziņas), Skatīt profilu, Iecelt par moderatoru / Noņemt moderatora tiesības, Izslēgt no grupas. Promote/demote/kick confirm with `ConfirmPopover` at "…" (as today, OD-06); guard with `useTransition`; errors through `errors.*` |
| `RequestRow.tsx` | client, ≤ 100 | `gen.mjs` 469: name · relative time, message in quotes (`lang` unknown → none), "Sazināties" (`MessageSquare`) → `/messages?c={chatId}`, "Noraidīt" (secondary), "Apstiprināt" (primary) via `manageMembership`; no confirm (a declined person may ask again); buttons wrap under the text below 640 px |

**`members/page.tsx`** (≤ 80): members only as today; `PartTabs` Biedri / Pieteikumi {n} (team only; `?tab=requests` as today, so OD-21's "2 pieteikumi" links keep working). Rows in one column (`divide-y`, reading width 760), not the old 3-column card grid. Empty requests: `EmptyState` with `group.noPendingRequests`.

**Settings page:** remove `MembershipPanel` from `settings/page.tsx` (requests live only in Biedri → Pieteikumi; the tab count and Manas grupas row point there). No other settings change (R9c).

Seed has pending requests with messages (check `prisma/seed.ts`; add one with a message if none).

## 5. Informācija on one page (R9b-3)

Replace `components/groups/frame/InfoParts.tsx` with `InfoSections.tsx` (client, ≤ 90) + `hooks/useScrollSpy.ts` (≤ 50):

- Every part this viewer may read is rendered **stacked**, each `<section id="part-{id}" aria-labelledby>` with its title as `<h2>` (first: "Par mums", `common.about`). The existing article styling per part stays; space between parts 24 px.
- `PartTabs` with `onSelect` become jump links: `href="#part-{id}"`, click scrolls smoothly (`behavior: 'auto'` under `prefers-reduced-motion`) and `replaceState` the hash; arrow keys as today.
- Scroll-spy: `IntersectionObserver` with a top root margin equal to the sticky stack (header + group menu + tabs; read it from the tabs' `getBoundingClientRect().bottom`, not a constant) marks the part whose heading last passed the line; at the page bottom the last part is marked. Sections get `scroll-margin-top` from a CSS variable the tabs set on mount.
- **One part only:** no jump links, just the heading.
- **Old links** `?part={id}`: the server passes `initial`; on mount the client scrolls to it once and rewrites the URL to `#part-{id}`. A `#part-` hash on load does the same.
- Order on the page: mobile tagline, `LatestAnnouncement` (R9b-1), jump links + parts, `NextMeetingBox`, social links.
- Pasākumi → Pagājušie: built; only check newest-first order there (acceptance). Discovery: remove the unused `status?: 'upcoming' | 'past'` from `lib/types/discovery.ts` and the `past` branch in `lib/services/discovery-query.ts` 129–133 (always upcoming), plus `event.service.ts` 934/972 if only discovery passes it.

## 6. The group picture, C5 (R9b-3)

- **Banner** (`components/groups/frame/GroupBanner.tsx`): no background picture any more; always `banner-tint` with the `mark-tint` category mark, same heights (64 / 96 px). Remove the `onImage` branches it feeds: `BannerName.tsx`, `chip.ts`, `GroupPagesDrawer.tsx`, `GroupMoreMenu.tsx`, `contact/PendingState.tsx`, `CategoryLine`'s `onImage` prop if nothing else passes it; drop `image-shade` / `text-on-image` utilities only if a grep shows no other user.
- **Picture** `components/groups/frame/GroupPicture.tsx` (server, ≤ 50): at the top of Informācija only (above `LatestAnnouncement`), reading width 760, 16:9, `rounded-2xl`, the same box as `components/events/page/EventPicture.tsx` (extract a shared `PictureBox` if the two would copy classes). With the group image: `next/image` `fill`, `alt=""`, priority (it is the page's largest paint). **Without:** a 16:9 tile in `banner-tint` with one large `CategoryIcon` (about 60 % of the tile height) in the `mark-tint` colour, cropped by the right edge, plus two smaller copies offset at lower opacity; all `aria-hidden`. Light and dark from the server tones.
- Other group pages (Pasākumi, Biedri, Jaunumi, settings, the event page) show no picture. The event page invariant from R9a ("no picture without the event's own image") holds; its comment in `EventPicture.tsx` ("the group's image is in the banner") is updated.
- The planned banner picker later fills `group.image`; nothing here blocks it.

## 7. i18n (both files, same commit; `npm run i18n:check`)

Reuse first: `common.approve`, `group.role_*` / `RoleTag` keys, `group.noPendingRequests`, `group.announcementArchive`, `group.announcementRestore`, `group.announcementDeleteTitle`, `group.noAnnouncementsYet`, `group.announcementsTeamHint`, `group.frame.partsLabel`, `common.visibilityMembersOnly` (if it reads "Tikai biedriem"). Delete keys left unused by removed components (grep each).

| Key | LV | EN | Session |
|---|---|---|---|
| `group.announcementNew` (value change) | Jauns ieraksts | New post | 1 |
| `group.announcementsTabCurrent` | Aktuālie | Current | 1 |
| `group.announcementsTabArchive` | Arhīvs | Archive | 1 |
| `group.announcementsArchiveEmpty` | Arhīvā nekā nav. | Nothing in the archive. | 1 |
| `group.announcementBy` | {name} · {when} | {name} · {when} | 1 |
| `group.announcementActions` | Darbības ar ierakstu | Post actions | 1 |
| `group.announcementVisibility` | Kas to redz? | Who can see it? | 1 |
| `group.announcementVisibilityPublic` | Visi | Everyone | 1 |
| `group.announcementVisibilityMembers` | Tikai biedri | Members only | 1 |
| `group.latestAnnouncement` | Jaunumi | News | 1 |
| `group.allAnnouncements` | Visi jaunumi | All news | 1 |
| `group.members.since` | kopš {date} | since {date} | 2 |
| `group.members.message` | Sūtīt ziņu | Send a message | 2 |
| `group.members.viewProfile` | Skatīt profilu | View profile | 2 |
| `group.members.promote` | Iecelt par moderatoru | Make moderator | 2 |
| `group.members.demote` | Noņemt moderatora tiesības | Remove moderator role | 2 |
| `group.members.remove` | Izslēgt no grupas | Remove from group | 2 |
| `group.members.decline` | Noraidīt | Decline | 2 |
| `group.members.contact` | Sazināties | Get in touch | 2 |

Confirmation texts for promote/demote/kick keep their existing keys (`group.confirmPromote` etc.).

## 8. Handbook, ledger, UI elements

- `docs/handbook/roles.md` line 9 (R9b-1): Announcements split: public items visible to everyone who sees the group (newest on Informācija only), members-only items members only.
- `docs/handbook/design.md` (R9b-3): "Page layouts" row B: banner is the category tint and mark, the picture is a 16:9 picture on Informācija (C5). "Every screen" rows Jaunumi, Biedri: done; Group settings, profiles: R9c.
- `docs/handbook/behaviour.md` "Destroying": unchanged (already right); add nothing.
- Ledger (`scripts/redesign/gen.mjs`, then `npm run redesign:build`): AR-53 add "each item public or members-only; the newest on Informācija (C3, 15 Oct)"; AR-70/AR-48 "no background picture; a 16:9 picture on Informācija (C5)"; AR-50 "parts stacked, tabs jump (D)". Run `npm run plan:check`.
- `/admin/handbook/ui-elements`: `MemberRow` (three roles), `RequestRow`, `AnnouncementItem` (public / members-only), `GroupPicture` (with and without image), the jump links.

## 9. Builder steps and commits

**R9b-1** (Sonnet build, **Opus review**):
1. `feat(R9b): announcement visibility (add_announcement_visibility)`: schema, migration with backfill, seed, Zod schema. Stop and report the migration SQL.
2. `feat(R9b): announcement visibility in services and cards`: section 2.
3. `feat(R9b): Jaunumi in the new look`: section 3 files, old board files deleted, `getGroupPosts` removed, i18n.
4. `feat(R9b): newest announcement on Informācija; docs`: `LatestAnnouncement`, roles.md, AR-53 ledger, UI elements, build-plan status, handoff.

**R9b-2** (Sonnet build, Sonnet review):
5. `feat(R9b): members page context and the shared member-action rule`: `group-members.ts`, `allowedMemberActions` used by the service checks.
6. `feat(R9b): Biedri and Pieteikumi in the new look`: section 4 files, old cards deleted, settings page without `MembershipPanel`, i18n.
7. `docs(R9b): Biedri; UI elements; status`.

**R9b-3** (Sonnet build, Sonnet review):
8. `feat(R9b): Informācija on one page with jump links`: `InfoSections`, `useScrollSpy`, `?part=` compatibility, dead discovery option.
9. `feat(R9b): the group picture in the event format (C5)`: banner, `GroupPicture`, `onImage` removal.
10. `docs(R9b): one-page Informācija and the group picture; status`.

## 10. Acceptance (builder runs it; the reviewer repeats it)

Checks: `npm run typecheck`, `npx eslint <changed files>`, `npm run i18n:check`. Browser: lv and en, widths 360, 768, 1024, 1280, 1440, 1920; light and dark once at 375 and 1280. Accounts: owner@local, a plain member, a pending applicant, signed out.

**R9b-1**
- [ ] Migration applies on a copy of the live data shape; posts of public groups become `PUBLIC`, others `MEMBERS_ONLY`; the old build still creates posts with the column absent from its code.
- [ ] Owner writes one public and one members-only item; the choice is absent in a private group, and the service stores `MEMBERS_ONLY` there even if `PUBLIC` is posted by hand.
- [ ] Signed out / non-member on Informācija: only the newest **public** item; the members-only text is absent from the HTML and RSC payload (grep the response). Member: newest of either, with the lock line. No item → no box.
- [ ] Discovery card and group panel: a members-only newest item is never the card line (next older public item or tagline instead).
- [ ] Jaunumi: Aktuālie/Arhīvs with counts, "Jauns ieraksts" at the tabs' right end for the team only; archive/restore without a confirm; delete asks in our dialog naming the title; a second browser sees new/archived items without reload; member sees no "…"; visitor is redirected.
- [ ] 360 px: long title and long author name wrap; "…" stays 44 px.

**R9b-2**
- [ ] Rows: face, name, "kopš …", tag Īpašnieks / Mod / none; one column at every width within 760 px.
- [ ] "…" items per viewer exactly match what the service allows (owner on admin: demote, remove; admin on admin: none of promote/demote/remove; nobody on the owner); a forced action through the console is still refused by the service.
- [ ] Promote/demote/remove confirm at the button, update the list, focus returns to "…"; no browser dialog.
- [ ] Pieteikumi (team only): message, Sazināties opens the right conversation, Noraidīt and Apstiprināt work and update the count in the tab and in Manas grupas; a member with `?tab=requests` sees Biedri.
- [ ] Settings page has no request panel; nothing else changed there.

**R9b-3**
- [ ] Informācija with 4 parts: all on the page; clicking a jump link scrolls with the heading just under the sticky tabs (not under them) at 360 and 1280; the marked tab follows scrolling both ways; the last part is marked at the page bottom.
- [ ] `?part={id}` and `#part-{id}` links land on that part; the URL never navigates (no panel opens from discovery history); one part → no jump links; members-only parts absent for visitors.
- [ ] Banner without a background picture on every group page; group with image: 16:9 picture on Informācija only; without: category tile with the icon pattern, light and dark.
- [ ] Event page unchanged apart from the banner; Pasākumi → Pagājušie lists newest first and works in both locales.
- [ ] No `onImage`, `image-shade` or `text-on-image` left without a user.

## 11. Risks

- **Members-only leak** (invariant 4): every path that reads posts for a possible non-member (cards, panel, Informācija, metadata) must filter `visibility`; the Opus reviewer greps the HTML of each as signed out.
- **Backfill vs. deploy swap:** the old app may insert posts after the migration; they get `MEMBERS_ONLY` (safe). Don't add a contract step.
- **Menu vs. service drift:** if `allowedMemberActions` isn't the function the service calls, the two will diverge; the reviewer checks the service imports it.
- **Scroll-spy with the sticky stack** and the phone drawer: measure, don't hard-code offsets; `IntersectionObserver` disconnects on unmount.
- **R6 panel routing:** the jump links must not use `Link` navigation; keep `replaceState`.
- **Banner contrast** after the image goes: tint text keeps 4.5:1 in light and dark (it already does without images; verify a group that had one).

## 12. Out of scope

R9c (settings split, TagPicker, LanguageEditor wrap at 768 px, profiles per OD-26, privacy switches to Iestatījumi, notes `cmv9anua9`, `cmv9aq31h`, `cmv9l5a3q`, `cmv9l6kmv`); changing an announcement's visibility after posting (delete and write again); an admin "view as" mode (`cmv9uw02g`, later); a banner picker; showing past events in discovery.

## 13. Owner questions (the builder uses the default unless the owner objects)

1. **New announcement in a public group:** **Default "Visi" pre-selected** (notices like a cancelled concert or a found scarf are for anyone); the team switches to "Tikai biedri" when needed.
2. **Where the newest item sits on Informācija:** **Default: at the top, under the group picture, above "Par mums"**, shown until the team archives it (no automatic expiry).
3. **Group without an image:** **Default: the 16:9 category tile with the icon pattern on Informācija** (as C5 says); alternative is no picture at all, like an event without its own image.
