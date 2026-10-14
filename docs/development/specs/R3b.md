# R3b spec · Sazināties, pending, "…"

Just-in-time spec for release R3b of the [build plan](../build-plan.md) (card "R3b · Sazināties, pending, "…""), written 14 Oct 2026 against `main` at `eebb921` (R1a–R3a live) and the redesign tag `redesign-v9.8.2`. Frozen once R3b is pushed. The redesign page (`docs/development/redesign.html`, generated from `scripts/redesign/`) wins over this spec where they disagree; the ledger line wins over a drawing.

**Owned rules:** AR-45 Sazināties · AR-46 Pending (with AP-05, "Pieteikums nosūtīts" + "Atvērt sarunu") · AR-51 The "…" menu. **Also applied:** AR-71 (the counter in the form; built in R2b, restyled here), AR-67 (the form is a dialog in the middle: dim + 1.5 px blur; a sheet on phones), AP-08 (the visitor's round chat button on the phone bar stays as R3a built it; the pending look on the phone bar is new here), AR-61 ("Atsaukt pieteikumu" on the Tavi pieteikumi row is R8's; the service and action built here are what R8 calls), AR-06 (every button, switch and menu row in the site colour).

**Owner decisions applied as written (section 2 of the plan):**
- **OD-09 The "…" menu:** built as drawn: your role as a line, then the actions (member: Rakstīt komandai, Dalīties, Ziņot par grupu, a line, Pamest grupu; waiting: Atsaukt pieteikumu, a line, Dalīties, Ziņot par grupu; visitor: Dalīties, Ziņot par grupu). Team tools (Iestatījumi, handing the group over) stay in Iestatījumi: the owner's "Nodot grupu citam" link leaves the menu.
- **OD-10 Rakstīt komandai:** in the "…" menu for members; it writes into the same group conversation as "Sazināties" (`GroupService.sendInquiry` → `MessageService.getOrCreateGroupChat`, one chat per person × group).
- **OD-11 Reporting:** "Ziņot par grupu" only (reporting people and events is later, after R12).
- **OD-06:** "Pamest grupu" and "Atsaukt pieteikumu" ask once in a pop-over at the "…" button; nothing here is a permanent delete.
- **OD-05:** the counter's warning tenth and red "+N"; "Nosūtīt" waits past the limit (kept from R2b).
- **OD-07 Private groups:** a link-holder sees "Sazināties" and may ask to join, like any visitor.

**Size:** M, one Sonnet session (about 22 files: 5 new, 2 deleted, the rest edits). Five commits; the **stop point** is the end of step 3 (section 10).

**Feedback notes folded in:** none. `npm run feedback` on 14 Oct shows one open note (`cmv5on08v`, own area, R8's), nothing tagged R3a/R3b or about Sazināties, pending, the "…" menu or the group frame. The owner's decision notes behind OD-09/10/11 (`cmv6mkt2`, `cmv6mm26`, `cmv6mmf8`) and the toast note (`cmv6bsyio`) are already closed.

**Owner rule for every builder:** the drawings are illustrations at 375 and 1280 px, not pixel specs. Build the intent, fluid between and beyond: the banner and phone bar span the full width with their content in the shared container (R3a), the dialog keeps its own width (420 px is a dialog size, allowed) and becomes a sheet on phones, the menu is anchored to its button and never wider than the screen minus 24 px. No width copied from a drawing otherwise. Check at 360, 768, 1024, 1280, 1440 and 1920 px. **Any small issue you find (about 4 minutes or less) you fix in the same release instead of listing it as a leftover.** Components over ~150 lines are split.

## Drawings to match

On the redesign page, section "A group" ([#g-contact](../redesign.html#g-contact) and the "…" menu right after it) and "Pop-ups and panels" ([#h-pop](../redesign.html#h-pop)); source `scripts/redesign/gen.mjs` 419–449 and 590, parts `parts.mjs` 260–275 (`toast`, `fieldCounter`, `contactDialog`), 283–285 (`gban`/`gbar` with `role: 'pending'`), 294–303 (`groupMore`), CSS `css.mjs` 128–134 (menu), 378–385 (dialog).

| Drawing | What to see |
|---|---|
| "The form · the group takes members: switch on" | dialog 420 px: title "Pieteikties grupā Zemgales nūjotāji" (Literata 18/600), one quiet sentence "Pastāsti organizatoriem, kāpēc vēlies pievienoties un ko meklē. Atbildes būs sadaļā Ziņas.", the textarea with the counter "71 / 2000" under its right end, the row "Vēlos pievienoties grupai" with a switch (on), then "Atcelt" (secondary) and "Nosūtīt" (primary) at the right |
| "The form · switch off: only a message" | title "Sazināties ar grupu …", sentence "Uzraksti grupas organizatoriem. Atbildes būs sadaļā Ziņas.", switch off |
| "The form · the group takes no members" | as switch off, without the switch row |
| "After "Nosūtīt": the form closes, a short toast" | one inverted toast with a tick: "Ziņa nosūtīta"; no second dialog, no link |
| "The counter · in the last tenth" / "· past the limit" | warning colour from 1800; past 2000 red "2013 / 2000 · 13 par daudz" and "Nosūtīt" waits (faded, not pressable) |
| "Who sees what" row (the `rd-roles` list under the form) | signed out "Sazināties" → sign-in pop-up, then the form opens where you were; signed in "Sazināties"; asked to join "✓ Pieteikums nosūtīts" + "Atvērt sarunu", "Atsaukt pieteikumu" in "…"; member: no button; team: no button |
| Desktop banner with `role: 'pending'` (`gban`) | at the right: the chip "✓ Pieteikums nosūtīts" (secondary look), the quiet button "Atvērt sarunu", then "…" |
| "The "…" menu": Member / Asked to join / Not a member | 240 px menu, 14 px radius, 6 px padding; a quiet first line "Tu esi šīs grupas biedrs" / "Tavs pieteikums gaida atbildi" (none for a visitor); rows with a 17 px icon and the word; a thin line before "Pamest grupu" (member) and after "Atsaukt pieteikumu" (waiting) |
| "Desktop · Dialog in the middle · dim and 1.5 px blur" | the same form over the dimmed, lightly blurred page |

Rule texts: [AR-45](../redesign.html#AR-45), [AR-46](../redesign.html#AR-46) with [AP-05](../redesign.html#AP-05), [AR-51](../redesign.html#AR-51), [AR-71](../redesign.html#AR-71), [AR-67](../redesign.html#AR-67), [AP-08](../redesign.html#AP-08).

**Orchestrator defaults (tell owner):** what the plan, the rules and the drawings leave open.
1. **Pending on the phone bar.** The phone bar drawing (`gbar`) draws no pending state and the 64 px bar never wraps. On phones the waiting person gets one round chip (the chip look, not primary) with the chat icon, named "Atvērt sarunu"; "Tavs pieteikums gaida atbildi" is the first line of the "…" menu. From `md` both pieces show as drawn.
2. **"Pieteikums nosūtīts" is a status, not a button.** It keeps the drawn chip shape and tick but has no hover, no press and no focus (withdrawing moved to the "…" menu, AR-46). R3a's "✓ Pieprasīts" button with its withdraw pop-over goes.
3. **The team's "…" menu** (not drawn): the role line ("Tu esi šīs grupas īpašnieks" / "… moderators"), then "Dalīties"; a moderator also gets the line and "Pamest grupu". No "Rakstīt komandai" (the team does not write to itself; the service refuses it), no "Ziņot par grupu" on your own group, no "Nodot grupu citam" (Iestatījumi, OD-09).
4. **"Rakstīt komandai" opens the same form** without the switch (title "Sazināties ar grupu …"), not Ziņas directly: it works before any conversation exists and ends the same way (toast). The message lands in the one group conversation (OD-10).
5. **No "Sazināties" on a hidden group.** Only its owner and site admins can see a hidden group, and writing to it fails (`NOT_FOUND` in `sendInquiry`); a site admin who is not a member sees the tools chip and "…" only.
6. **After "Pamest grupu"** the page goes to the group's Informācija (the pages you just lost would otherwise redirect mid-render) with the toast "Tu pameti grupu".

## 0. Motivation and design alignment

- **Service Law.** All permission checks stay in services: `GroupService.joinGroup` (accepting members, existing membership, hidden group), `sendInquiry` (team refused, hidden refused), `cancelJoinRequest` (only your own `PENDING` row), `leaveGroup` (owner refused). The viewer's own group conversation id is read by a new `MessageService.findGroupChatId` and returned inside `GroupContext` (the layout's one service call); no Prisma outside `lib/services`.
- **Context Law.** The frame keeps reading `useGroupContext()`: `GroupActions`, `PendingState` and `GroupMoreMenu` take no `group`, `role` or `chatId` props. The form (`ContactForm`) takes the group's id, name and `allowJoin` as props on purpose, because R6 opens it from the discovery panel outside any `GroupProvider`.
- **Taxonomy Law / AR-06.** Nothing in this release uses the category tone: buttons, the switch, the menu and the toast use site tokens; on an image banner the chips use R3a's `groupChip(onImage)`.
- **Defensive Coding.** `isPending` guards on "Nosūtīt", the menu's withdraw and leave, and the report; the shared `messageTextSchema` and `MESSAGE_MAX_LENGTH` validate in the form and the action; a second request is stopped by the DB unique (`Membership @@unique([userId, groupId])`) and now answers with its own code.
- **Action Consistency.** Every action keeps returning `ActionResponse<T>` with uppercase codes; two new codes (`ALREADY_REQUESTED`, `NOT_ACCEPTING_MEMBERS`) go into the registry in `types/actions.ts` and `errors.*`. Actions do auth, revalidation and notifications only.
- **Zero-Any / Constants.** New `data-ui` names in `UI` (`lib/constants/index.ts`); no casts.
- **Reuse before creating.** The "…" menu and the site-admin tools chip move onto the shared `Menu` (`components/ui/Menu.tsx`, the header menus' look and keys); share logic is pulled into one hook used by the group menu and `ShareEventButton`; one `Switch` replaces the hand-made switch.

## 1. Data, services and actions

**Migration: none.** `prisma/schema.prisma` is unchanged: a request is a `Membership` with role `PENDING`, its message lives in the group `Conversation` (`kind GROUP`, `originType 'JOIN_REQUEST' | 'GROUP_CONTACT'`, unique `(originGroupId, contactUserId)`). Blue/green: no URL or data shape the old app reads changes. Groups have no "open" join: every ask is a request the team approves (`isAcceptingMembers` on = requests allowed, off = closed); the events' `OPEN`/`REQUEST` modes are R6's.

### 1.1 `MessageService.findGroupChatId` (`lib/services/message.service.ts`, new, ≤ 12 lines)

```ts
/** The id of the one chat between a person and a group's team, or null. Read-only (never creates). */
async findGroupChatId(groupId: string, personId: string): Promise<string | null>
```
`prisma.conversation.findUnique({ where: { originGroupId_contactUserId: { originGroupId: groupId, contactUserId: personId } }, select: { id: true } })`. Only ever called with the signed-in viewer's own id, so it can only return the viewer's own conversation.

### 1.2 `GroupService.getGroupWithContext` (`lib/services/group.service.ts`)

`GroupContext.user` gains `chatId: string | null`: `MessageService.findGroupChatId(g.id, currentUserId)` **only when the viewer's role is `PENDING`**, otherwise `null` (no query for anyone else). `GroupState.user` (`components/providers/GroupProvider.tsx`) gets the same field; `toGroupState` already passes `group.user` through. Update the samples that build a `user`: `lib/handbook/ui-samples.ts` (lines 63, 82) and `components/handbook/GroupFrameDemos.tsx` (`USER`, pending gets a sample id such as `'sample-chat'`).

A legacy request without a conversation (before 2.21 every request had none) gives `chatId: null`; "Atvērt sarunu" then links to `/messages`.

### 1.3 `GroupService.joinGroup`: clear codes

Today every refusal is `JOIN_FAILED`. Split the two a person can actually meet:
- an existing membership with role `PENDING` (two tabs, a stale page, a double request that lost the race on P2002) → `ALREADY_REQUESTED`; any other existing membership → `JOIN_FAILED` (unchanged);
- `isAcceptingMembers` false (the team closed requests while the form was open) → `NOT_ACCEPTING_MEMBERS`.
Keep the order: existing membership, message, group (hidden → `NOT_FOUND`), accepting, create, conversation + message, delete the membership again if the message fails (unchanged: "no request without its message").

Add both codes to `ERROR_CODES` in `types/actions.ts` and to `errors.*` (6).

### 1.4 `actions/group-actions.ts`

- `joinGroup`, `cancelJoinRequest`, `leaveGroup`: revalidate the group **layout** like `manageMembership` does since R3a: `revalidatePath('/[locale]/[l1Slug]/group/[groupSlug]', 'layout')` (pattern + `'layout'`, per `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidatePath.md`: from a Server Function the viewed page updates at once; a pattern needs the `type`). The frame (banner button, pages, member count) lives in the layout, so the literal `…'page'` calls go. `joinGroup` also revalidates when it fails with `ALREADY_REQUESTED`, so a stale tab catches up to the pending state. `leaveGroup` keeps `updateTag('groups')`.
- `sendInquiry`: unchanged (no revalidation needed: nothing on the page changes). Its notification `INQUIRY_RECEIVED` to every team member stays; `joinGroup`'s `JOIN_REQUEST` notification stays. Check that one "Nosūtīt" makes exactly one message and one notification per team member in both modes.
- No new action. `cancelJoinRequest` is the one R8's "Tavi pieteikumi" row will call.

## 2. Shared pieces

### 2.1 `components/ui/Switch.tsx` (new, ≤ 40 lines)

`Switch({ checked, onChange, labelledBy, disabled?, className? })`: `<button type="button" role="switch" aria-checked aria-labelledby>`; track `h-6 w-11 rounded-full`, `bg-primary` on, `bg-border` off; knob `size-5 rounded-full bg-surface shadow-sm` moving `translate-x-5` (`motion-safe:transition-transform`); focus ring in the site colour. No `bg-white` (dark mode: R1a's rule, filled colours carry their own text colour). `data-ui={UI.switch}` (`'switch'`). `AcceptingMembersSection` keeps its checkbox until R9b.

### 2.2 `hooks/useShareLink.ts` (new, ≤ 30 lines)

`useShareLink()` → `share({ title, url })`: `navigator.share` when present (an `AbortError` is not an error), else `clipboard.writeText` + success toast `common.linkCopied`; failure → error toast `common.shareFailed`. `ShareEventButton` and the group menu both use it (the code is duplicated today).

### 2.3 `components/ui/Menu.tsx`: an anchored panel

`MenuPanel` gains `placement?: 'header' | 'anchor'` (default `'header'`, today's look for the header menus). `'anchor'`: `absolute right-0 top-full z-50 mt-2 w-60 max-w-[calc(100vw-24px)]` at every width (a banner scrolls away, so the header's fixed phone position would float the menu far from its button). It also gains `describedBy?: string` for the role line (3.3). Header menus are unchanged.

## 3. The group's right end

### 3.1 `components/groups/contact/ContactForm.tsx` (new, replaces `components/modals/ContactGroupModal.tsx`, ≤ 140 lines)

```ts
type Props = { groupId: string; groupName: string; allowJoin: boolean; onClose: () => void; returnFocusRef?: RefObject<HTMLElement | null> };
```
- Rendered only while open (the caller mounts it), so each opening starts empty (R2b review: "Sazināties starts empty").
- `Modal` (`size="sm"`-ish width ~420 px from `md`, a sheet on phones by R2b's rule), `data-ui={UI.contactDialog}` (`'contact-dialog'`), `locked={isPending}`, `dirty={message.trim() !== ''}` (the R2b "Atmest izmaiņas?" guard).
- Title: switch on and `allowJoin` → `contactForm.titleJoin` "Pieteikties grupā {name}"; else `contactForm.title` "Sazināties ar grupu {name}" (the title follows the switch as drawn). The quiet sentence under it follows too (`descriptionJoin` / `description`).
- Textarea (label `sr-only` "Tava ziņa"; `rounded-xl border-border bg-surface`, focus ring site colour; 5 rows; placeholder kept), the `TextCounter` under its right end (`aria-describedby`), max `MESSAGE_MAX_LENGTH`.
- `allowJoin` only: the row `flex items-center justify-between gap-4` with the label `contactForm.joinSwitch` "Vēlos pievienoties grupai" and `Switch` (on by default). Without `allowJoin` no row (AR-45: "when the group takes no members, the switch isn't there").
- Error under the buttons, `role="alert"`, mapped from `errors.*`.
- Buttons right: `Button variant="secondary"` "Atcelt" (`OverlayCloseButton` semantics) and `Button` primary "Nosūtīt" (`contactForm.send`, one word in both modes: "buttons name the result"), `disabled` until `messageTextSchema` passes, not past the limit, not pending; while pending it shows R2b's working state.
- Submit: switch on → `joinGroup(groupId, locale, message)`; off → `sendInquiry(groupId, message)`. Success: close the form and `success(t('sentToast'))` "Ziņa nosūtīta" (AR-45: no second dialog, no "Atvērt sarunu" link). The page's own state follows from the layout revalidation (1.4): after a join request the banner shows the pending state.
- `NOT_ACCEPTING_MEMBERS`: show the error; the switch stays so the person can switch it off and send the message alone. `ALREADY_REQUESTED`: show the error; the revalidated frame behind already shows the pending state.
- Delete `ContactGroupModal.tsx`; update its two users (`GroupActions`, `UiElementsDemos` `PopupDemo`) and the ui-elements specimen's `files` list.

### 3.2 `components/groups/contact/PendingState.tsx` (new, client, ≤ 60 lines)

Reads `useGroupContext()`; rendered by `GroupActions` when `user.role === 'PENDING'`. `href = chatId ? '/messages?c=' + chatId : '/messages'` (the own area's Ziņas, R2a; the deep link opens that chat, Session 16).
- From `md`: a status chip `inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold` in `groupChip(onImage)` colours without its hover (`Check` 16 px + `group.pending.sent` "Pieteikums nosūtīts"; a `span`, not focusable; Orchestrator default 2), then a `Link` in the quiet button look (`buttonClass('quiet', …)`; on an image the chip colours) "Atvērt sarunu" (`group.openChat`). `data-ui={UI.pendingState}` (`'pending-state'`) on the wrapper.
- Phones (`md:hidden`): one round 40 px `Link` in `groupChip(onImage)` with `MessageCircle`, `aria-label` "Atvērt sarunu" (Orchestrator default 1), at the right end after "…" like the visitor's button (`order-last`).

### 3.3 `components/groups/GroupMoreMenu.tsx` (rewrite, ≤ 130 lines)

On the shared menu: `useMenu()`, the trigger `{...triggerProps}` as today's 40 px chip (`groupChip(onImage)`, `MoreHorizontal`, `aria-label` `common.moreOptions`), `MenuPanel placement="anchor" label={c('moreOptions')} dataUi={UI.groupMoreMenu}` (`'group-more-menu'`), `MenuItemButton` rows with 16–17 px lucide icons in `text-foreground-muted`, `MenuSeparator`.

| Viewer (`user`) | Role line (`group.more.role.*`) | Rows |
|---|---|---|
| visitor, signed out, site admin not a member | none | Dalīties (`Share2`), Ziņot par grupu (`Flag`) |
| pending | "Tavs pieteikums gaida atbildi" | Atsaukt pieteikumu (`X`), line, Dalīties, Ziņot par grupu |
| member | "Tu esi šīs grupas biedrs" | Rakstīt komandai (`MessageCircle`), Dalīties, Ziņot par grupu, line, Pamest grupu (`LogOut`) |
| moderator (`ADMIN`) | "Tu esi šīs grupas moderators" | Dalīties, line, Pamest grupu (Orchestrator default 3) |
| owner | "Tu esi šīs grupas īpašnieks" | Dalīties |

- The role line: `<p id={roleId} role="none" className="px-2.5 pb-1.5 pt-1 text-xs text-foreground-muted">` at the top of the panel, `describedBy={roleId}`; not a menu item (arrow keys skip it).
- Dalīties: `useShareLink().share({ title: name, url: origin + '/' + locale + href })` (the group's Informācija, not the sub-page you are on).
- Ziņot par grupu and Rakstīt komandai call `onReport(trigger)` / `onWriteToTeam(trigger)` from `GroupActions` (unchanged contract), so their dialogs return focus to "…".
- Atsaukt pieteikumu and Pamest grupu open a `ConfirmPopover anchorRef={triggerRef}` (destructive, `isPending`): withdraw `group.confirmCancelRequest` / `group.withdrawRequest` → `cancelJoinRequest(id, locale)` → toast `group.requestWithdrawn` "Pieteikums atsaukts"; leave `common.confirmLeave` / `common.leaveGroup` → `leaveGroup(id)` → toast `group.leftGroup` "Tu pameti grupu" and `router.replace(href)` (Orchestrator default 6). Errors as toasts through `errors.*` (`OWNER_MUST_TRANSFER` can no longer be reached from the menu, but keep the mapping).
- Rows are hidden, never disabled (roles.md). The owner's "Nodot grupu citam" link goes (it lives in Iestatījumi → Īpašnieks).
- `initialOpen?: boolean` prop (passed to `useMenu`) for the UI-elements page only.

### 3.4 `components/groups/frame/GroupActions.tsx` (edit, stays ≤ 120 lines)

- Visitor button unchanged (AP-08: round on phones, the word from `md`, auth gate `'join_group'`), but **not on a hidden group** (`moderation.hidden`, Orchestrator default 5).
- Pending: `<PendingState />` in place of R3a's `ConfirmPopover` "✓ Pieprasīts" (remove `cancelOpen`, `withdraw`, `isPending`, the `Check` import).
- `ContactForm` in place of `ContactGroupModal`: `dialog === 'join'` → `allowJoin={g.isAcceptingMembers}`; `dialog === 'team'` → `allowJoin={false}` with `returnFocusRef={menuReturnRef}`.
- Report while signed out: `gateAction(…, 'report_group')`, and the resume effect also handles `'report_group'` (open the report once after the reload), so "afterwards the action continues where it was" (behaviour.md) holds for both. Keep the one-time clear of the stored action.
- Order stays: (button or pending) · `AdminToolsMenu` · `GroupMoreMenu`; on phones the button or the pending chip is last.

### 3.5 `components/groups/AdminToolsMenu.tsx` (edit)

Same move onto `useMenu` / `MenuPanel placement="anchor"` / `MenuItemLink` / `MenuItemButton` as 3.3, so the two chips side by side open the same menu (one look, arrow keys, Esc returns focus). Items, labels, the restore action and `onHide` unchanged; the site-admin check stays first (`return null`). Site-admin tools must keep working on hidden groups.

### 3.6 `components/modals/ReportModal.tsx` (restyle, ≤ 90 lines)

`Modal` title `report.title` "Ziņot par grupu" (drop the shield icon), the description sentence, the four reasons as a radio list (`fieldset` with `legend` `sr-only`, rows `min-h-11 rounded-xl px-3` with a site-colour radio, `REPORT_REASONS` from constants) instead of the `select`, then `Button variant="secondary"` "Atcelt" and primary "Nosūtīt" (`report.submit`; reporting is not destructive, so not danger). Success toast `report.success`, error toast `report.error`; `isPending` guard; `targetEventId` prop removed if still unused (grep).

## 4. Who sees what (group right end)

| Viewer | Desktop right end | Phone bar right end | "…" rows |
|---|---|---|---|
| Signed out | Sazināties → sign-in pop-up → after the reload the form opens once | "…", round chat button | Dalīties, Ziņot par grupu (→ sign-in, then the report opens) |
| Signed in, not a member (also a private group's link-holder) | Sazināties | "…", round chat button | Dalīties, Ziņot par grupu |
| Pending | ✓ Pieteikums nosūtīts · Atvērt sarunu · "…" | "…", round chat chip (Atvērt sarunu) | role line, Atsaukt pieteikumu, line, Dalīties, Ziņot par grupu |
| Member | "…" | "…" | role line, Rakstīt komandai, Dalīties, Ziņot par grupu, line, Pamest grupu |
| Moderator / owner | "…" | "…" | role line, Dalīties (+ line, Pamest grupu for a moderator) |
| Site admin, not a member | Sazināties · tools · "…" | tools, "…", round chat button | visitor rows |
| Hidden group (owner, site admin) | tools (admin) · "…"; never Sazināties | same | by role |

| Group state | Form |
|---|---|
| takes members (`isAcceptingMembers`) | switch shown, on; on → request + message (`joinGroup`), off → message (`sendInquiry`) |
| takes no members | no switch; message only |
| closed while the form was open | `NOT_ACCEPTING_MEMBERS` under the button; switch off and send works |
| already requested (other tab) | `ALREADY_REQUESTED`; the frame shows the pending state |

## 5. Privacy and abuse

- `chatId` in the client state is only ever the viewer's own conversation (1.1, 1.2); `/messages?c=` checks access again (`MessageService.canAccess`).
- A request and its message land once: `isPending` guard, `Membership` unique, the conversation's unique `(originGroupId, contactUserId)` with the P2002 race handling in `getOrCreateGroupChat`; a failed message deletes the request.
- The team never writes to itself (`sendInquiry` FORBIDDEN, `getOrCreateGroupChat` FORBIDDEN): their menu has no "Rakstīt komandai" and no button.
- A blocked group conversation refuses new messages (`FORBIDDEN` from `sendMessage`): the form shows the plain error; no request is left behind.
- No new rate limit (out of scope, like Ziņas itself); the prototype has no real users.

## 6. i18n (both files; `npm run i18n:check`)

| Key | lv | en |
|---|---|---|
| `contactForm.send` (value) | Nosūtīt | Send |
| `contactForm.sentToast` (new) | Ziņa nosūtīta | Message sent |
| `contactForm.placeholder` (value) | Uzraksti savu ziņu… | Write your message… |
| `group.pending.sent` (new) | Pieteikums nosūtīts | Request sent |
| `group.openChat` (existing, reused) | Atvērt sarunu | Open chat |
| `group.more.role.OWNER` (new) | Tu esi šīs grupas īpašnieks | You own this group |
| `group.more.role.ADMIN` (new) | Tu esi šīs grupas moderators | You're a moderator of this group |
| `group.more.role.MEMBER` (new) | Tu esi šīs grupas biedrs | You're a member of this group |
| `group.more.role.PENDING` (new) | Tavs pieteikums gaida atbildi | Your request is waiting for an answer |
| `group.requestWithdrawn` (new) | Pieteikums atsaukts | Request withdrawn |
| `group.leftGroup` (new) | Tu pameti grupu | You left the group |
| `group.confirmCancelRequest` (value) | Atsaukt pieteikumu? | Withdraw your request? |
| `common.confirmLeave` (value) | Pamest grupu? | Leave the group? |
| `common.shareGroup` (value) | Dalīties | Share |
| `common.leaveGroup` (value, en) | Pamest grupu | Leave group |
| `common.reportGroup` (value, en) | Ziņot par grupu | Report group |
| `errors.ALREADY_REQUESTED` (new) | Tavs pieteikums jau ir nosūtīts. | You've already sent a request. |
| `errors.NOT_ACCEPTING_MEMBERS` (new) | Grupa šobrīd neuzņem jaunus biedrus. Izslēdz slēdzi, lai vienkārši uzrakstītu. | The group isn't taking new members right now. Turn the switch off to just send a message. |

Deleted when no reader is left (grep each in `app components lib hooks`): `contactForm.sendJoin`, `contactForm.sentTitle`, `contactForm.sentBody`, `contactForm.openChat`, `common.requested`, `common.messageSent` (unused today), `common.transferOwnership` (if only the old menu read it). Sentence case in every value (AR-10); Latvian with "tu".

## 7. Handbook and UI elements

- `docs/handbook/roles.md`: the Pending cell → ""Pieteikums nosūtīts" + "Atvērt sarunu"; "Atsaukt pieteikumu" in the "…" menu"; Member cell → "none (role and "Rakstīt komandai" in the "…" menu)"; under "One button": "After "Nosūtīt" the form closes and a toast says "Ziņa nosūtīta" (AR-45). A hidden group shows no "Sazināties"."
- `docs/handbook/voice.md` fixed words, new rows: "A member writing to the team | Rakstīt komandai | Write to the team" (OD-10); "Taking back a join request | Atsaukt pieteikumu | Withdraw request"; "Sharing a link | Dalīties | Share"; "Reporting a group | Ziņot par grupu | Report group". Say, not: "Ziņa nosūtīta | ~~Nosūtīts! Atvērt sarunu?~~".
- `docs/handbook/design.md`: screen table "Join / Contact pop-up, sign-in pop-up" → "R3b done"; Components: replace "Also one each: … the "…" menu …" with a line "**The "…" menu.** The shared Menu anchored to its chip: your role as a quiet first line, then what you can do; rows hidden, never greyed; an undoable step asks in a pop-over at the chip." and "**Switch.** A pill track in the site colour; the label is the row's text."; Toast: add "(after "Nosūtīt": "Ziņa nosūtīta")".
- `docs/handbook/behaviour.md` "Sign-in needed": "…afterwards the action continues where it was (the contact form, a report)."
- UI elements (`app/[locale]/admin/handbook/ui-elements/page.tsx`, `components/handbook/*`): the pop-ups specimen opens `ContactForm` (files list updated); `GroupFrameDemos` banner gains the pending viewer (desktop chip + "Atvērt sarunu"); a new specimen "…" menu showing `GroupMoreMenu initialOpen` for member, pending and visitor side by side (sample `GroupProvider` states; the leave/withdraw actions are not called from the demo: pass sample ids, the specimen is look-only); `Switch` on and off. Keep `GroupFrameDemos` ≤ 150 lines (move the menu specimen to a new `components/handbook/GroupMenuDemos.tsx` if needed).
- `lib/constants/index.ts` `UI`: `contactDialog: 'contact-dialog'`, `pendingState: 'pending-state'`, `groupMoreMenu: 'group-more-menu'`, `switch: 'switch'`; `joinButton` stays.

## 8. Accessibility

- The form is R2b's dialog: focus trap, Esc/scrim/×/Back close, "Atmest izmaiņas?" with typed text, focus back to the button (or to "…" for Rakstīt komandai and the report).
- The switch is `role="switch"` with `aria-checked`, labelled by its row text; the counter is the field's `aria-describedby` with R2b's one-time live announcement.
- The toast is `role="status"` (R2b).
- "…" is a WAI-ARIA menu button (shared `useMenu`): Enter/Space/↓ open on the first row, ↑ on the last, arrows move, Home/End, Esc closes and returns focus, Tab closes. The role line is described, not a row.
- Icon-only controls carry their word: the round chat button "Sazināties" (AP-08), the pending round chip "Atvērt sarunu", "…" "Vairāk iespēju". Targets 40 px (bar) / 44 px (menu rows ≥ 40 px, radio rows 44 px).
- "Pieteikums nosūtīts" is plain text with an `aria-hidden` tick.

## 9. Grep proofs

```bash
ls components/modals/ContactGroupModal.tsx 2>/dev/null                                                          # P1: nothing
wc -l components/groups/contact/*.tsx components/groups/{GroupMoreMenu,AdminToolsMenu}.tsx components/groups/frame/GroupActions.tsx components/modals/ReportModal.tsx components/ui/{Switch,Menu}.tsx hooks/useShareLink.ts   # P2: each < 150
grep -rn "ContactGroupModal\|c('requested')\|sendJoin\|sentTitle\|transferOwnership')" app components lib hooks   # P3: 0
grep -rn "navigator.share" components hooks | grep -v useShareLink                                             # P4: 0
grep -rnE "group=\{|role=\{role|chatId=" components/groups/frame components/groups/contact/PendingState.tsx components/groups/GroupMoreMenu.tsx   # P5: 0 (Context Law)
grep -rnE "#[0-9a-fA-F]{3,6}\b|style=|bg-white|uppercase|bg-\[var\(--accent\)\]" components/groups/contact components/groups/GroupMoreMenu.tsx components/ui/Switch.tsx components/modals/ReportModal.tsx   # P6: 0
grep -rn "prisma" components/groups actions/group-actions.ts | grep -v "@prisma/client"                         # P7: 0
grep -n "ALREADY_REQUESTED\|NOT_ACCEPTING_MEMBERS" types/actions.ts messages/lv.json messages/en.json            # P8: 2 + 2 + 2
grep -n "'page')" actions/group-actions.ts | grep -i "join\|cancel\|leave"                                      # P9: 0 (layout revalidation)
git diff --stat origin/main -- prisma/                                                                        # P10: empty
```

## 10. Builder steps and commits

Small commits, each passing `npm run typecheck`; messages end with the co-author line.

1. **Services and actions.** `MessageService.findGroupChatId` (1.1), `GroupContext.user.chatId` + `GroupState` + samples (1.2), `joinGroup` codes + registry + `errors.*` (1.3, 6), layout revalidation in `joinGroup`/`cancelJoinRequest`/`leaveGroup` (1.4). Check on the seeded DB: a pending viewer's context has their chat id; a member's and a visitor's are null; a second request returns `ALREADY_REQUESTED`; a closed group returns `NOT_ACCEPTING_MEMBERS`. Commit "feat(R3b): the viewer's group chat in the context, clear join codes, layout revalidation".
2. **The form.** `Switch` (2.1), `ContactForm` (3.1) with the toast, `GroupActions` and `PopupDemo` on it, delete `ContactGroupModal`, the `contactForm.*` keys of 6. Commit "feat(R3b): one Sazināties form with the join switch, counter and toast".
3. **Pending and the "…" menu.** `useShareLink` (+ `ShareEventButton`), `MenuPanel` anchor + `describedBy` (2.3), `PendingState` (3.2), `GroupMoreMenu` rewrite (3.3), `GroupActions` (3.4: pending, hidden group, report resume), `AdminToolsMenu` on the shared menu (3.5), `ReportModal` restyle (3.6), the `group.*`, `common.*` keys of 6 and the deletions. Commit "feat(R3b): pending state with Atvērt sarunu and the new "…" menu".
   **Stop point.** If the session runs long, stop here: everything a visitor, a waiting person, a member and the team sees is built. Steps 4–5 must still land before the release is pushed; hand over with the build-plan row "built to step 3".
4. **Handbook and UI elements** (7). Commit "docs(R3b): handbook words and roles, the form and the "…" menu on UI elements".
5. **Close-out.** Definition of done and the screens of 11; small issues found are fixed now (≤ ~4 min each), not listed; `docs/development/build-plan.md` section 8: R3b "built, in review" with the commit range; tick the R3b line in `docs/execution_handoff.md`. Commit. Do not push (the reviewer pushes).

## 11. Acceptance

**Definition of done:**
```bash
npm run typecheck
npx eslint $(git diff --name-only --diff-filter=d origin/main...HEAD -- '*.ts' '*.tsx')
npm run i18n:check
npm run plan:check
npm run build   # needs AUTH_SECRET + DATABASE_URL
```
Plus the grep proofs P1–P10 (9).

**Matrix.** Dev server, seeded DB. Widths **360, 768, 1024, 1280, 1440, 1920 px**; **lv and en**; **light and dark**; viewers **signed out, signed in non-member, pending, member, moderator, owner, site admin (not a member)**; groups **taking members, not taking members (closed), closed while the form is open, private (non-member with the link), hidden (owner and site admin)**, each **with and without an image**. Side by side with each drawing at 375 and 1280.

| Where | Look for |
|---|---|
| the form, taking members | title "Pieteikties grupā …" with the switch on; switching off changes title and sentence to "Sazināties ar grupu …"; counter "0 / 2000" → warning from 1800 → red "+N" past 2000 and "Nosūtīt" waits; empty text cannot send; Esc with text asks "Atmest izmaiņas?"; phones: a sheet; desktop: dim + blur, ~420 px |
| send with the switch on | the form closes, toast "Ziņa nosūtīta"; the banner shows "✓ Pieteikums nosūtīts" + "Atvērt sarunu" (phones: the round chat chip) **without a reload**, on every group page; Ziņas has one new conversation with the message once; each team member has one join-request notification; Biedri → Pieteikumi shows the request with its message |
| send with the switch off / closed group | toast; no pending state; the message in the same conversation; each team member notified once |
| two tabs | request in tab A, send again in tab B with the switch on → "Tavs pieteikums jau ir nosūtīts.", tab B's banner switches to pending |
| closed while open | open the form, close requests in settings (other tab), send with the switch on → the error; switch off → sent |
| pending | "Atvērt sarunu" opens `/messages?c=<id>` on that chat; "…" shows "Tavs pieteikums gaida atbildi", "Atsaukt pieteikumu" → pop-over at "…" → toast "Pieteikums atsaukts", the banner back to "Sazināties" without a reload; ask again works |
| member | no button; "…": role line, Rakstīt komandai → the form without the switch → toast → message in the same conversation as before (not a second one); Pamest grupu → pop-over → toast "Tu pameti grupu", Informācija, banner shows "Sazināties", Jaunumi/Biedri gone from the pages |
| moderator / owner | no button; role line; moderator can leave; owner has no leave and no "Nodot grupu citam" in the menu (Iestatījumi → Īpašnieks still works) |
| signed out | "Sazināties" → sign-in pop-up → after signing in the form opens **once**; "Ziņot par grupu" → sign-in → the report opens once; "Dalīties" works signed out |
| Dalīties | phone: the native share sheet (cancelling is silent); desktop: "Saite nokopēta…" toast; the shared URL is the group's Informācija from any sub-page; the event page's share still works |
| Ziņot par grupu | radio list, "Nosūtīt", toast; focus back to "…"; the report appears in Admin → Moderācija → Sūdzības |
| private group, non-member with the link | "Sazināties", the form, a request works |
| hidden group | owner and site admin: no "Sazināties"; the hidden banner, site-admin tools (hide/restore, categorisation, log, edit) work from the new tools menu |
| menus | "…" and the tools chip open under their chip, aligned right, inside the screen at 360 px, on an image banner and without; arrow keys, Esc returns focus; no menu under the sticky header |
| contrast | the pending chip and "Atvērt sarunu" on the white-image banner (R3a's test image) ≥ 4.5:1; switch and radios visible in dark |
| no horizontal scroll | every group page at all six widths with each viewer, long en words, a long group name |
| UI elements page | the form, the menu (three viewers), the pending banner, the switch in both modes |

**Leak check:** as another signed-in user, `GET` a group page and search the RSC payload: no `chatId` value other than `null` unless you are pending there, and then only your own (compare with `/messages`).

**Blue/green:** no schema change (P10); URLs unchanged.

## 12. Risks

- **Messaging flow (Opus review).** One "Nosūtīt" = one membership row (when joining), one message, one notification per team member; the conversation opens from "Atvērt sarunu"; the failed-message rollback still deletes the request. The reviewer replays both modes and the two-tab case against the DB.
- **The frame updates through the layout.** The banner button lives in the layout since R3a; without the layout revalidation (1.4) the pending state or the visitor button would need a reload. Check every action from a sub-page (Pasākumi, an event page).
- **Sign-in resume runs once.** Two stored keys now (`join_group`, `report_group`); the effect clears the key before acting and runs only after the sign-in reload (R3a's fix). A user who signs in and turns out to be a member or pending does not get the form.
- **Join modes.** There is no open group join: every request waits for the team. A group that stops taking members keeps its waiting requests (pending state and withdraw still work).
- **Private and hidden groups.** Private: same as a public group for the right end. Hidden: no "Sazināties", tools must stay (B17).
- **Site-admin tools** move onto the shared menu: the reviewer runs hide, restore, categorisation link, moderation log and edit from the chip.
- **The anchored menu on an image banner** sits inside the banner's `isolate z-10` stacking context: it must still paint above the page below the banner (R3a's dropdown did at `z-[45]`; check the new `z-50` panel at 360 px and on the event page).

## 13. Out of scope

The opened group panel with its "Sazināties" (R6, reuses `ContactForm`); "Atsaukt pieteikumu" on the Tavi pieteikumi row and the waiting-request counts (R8, calls `cancelJoinRequest`); Biedri → Pieteikumi with "Sazināties" per request (R9b, AR-52); members-only event notice's "Sazināties" (R6/R9a, OD-19); reporting people and events (later, OD-11, `add_report_target_user`); rate limits on messages; the messages drawer from "Atvērt sarunu".
