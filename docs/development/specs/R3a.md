# R3a spec · A group's frame

Just-in-time spec for release R3a of the [build plan](../build-plan.md#r3a--a-groups-frame-l), written 13 Oct 2026 against `main` at `9713cff` (R1a–R2b built) and the redesign tag `redesign-v9.8.2`. Frozen once R3a is pushed. The redesign page (`docs/development/redesign.html`, generated from `scripts/redesign/`) wins over this spec where they disagree; the ledger line wins over a drawing.

**Owned rules:** AR-47 Group page, desktop · AR-48 Group page, phones (with AP-08, the icon-only "Sazināties") · AR-49 Visitors · AR-50 Informācija extras · AR-58 A group's Pasākumi · AR-70 Group banner: the group's image. **Also applied:** AR-21 (pages down the left, parts as tabs, no label repeats the chosen item), AR-20 (the bottom-bar tab you came from stays marked; unchanged, re-checked), AR-06 (category tone only on the banner tint, mark and dots; every button, link and active tab in the site colour), AR-34/AR-44 (the next-meeting query is built for reuse by R5a's card and R6's panel), AR-54 (rows stay today's `EventRow` until R5b; the next-meeting box shows the row's shape without "Eju").

**Owner decisions applied as written (section 2 of the plan):**
- **OD-07 Private groups:** a non-member with the link sees Informācija, the public events and "Sazināties", like any visitor; the quiet line under the name ends with "Tikai biedriem"; one word everywhere ("Tikai biedriem", also in the create wizard). Out of discovery and search stays R5a/R7's job.
- **OD-08 Image banner:** the image fills the banner, a dark shade from below, white text, and the same image behind the phone bar.
- **OD-01 Words:** the tag stays "Mod", lists and menus say "Moderators", "Grupas komanda" = owner + moderators (voice.md C8).
- **OD-06:** withdrawing a join request is a pop-over at its button (kept from R2b, moved).
- **OD-10:** "Rakstīt komandai" opens the same conversation as "Sazināties" (used here as the bridge in 4.6; R3b builds the real menu).
- **OD-19:** no "Tikai biedriem" on event rows (the next-meeting box shows none).

**Size:** L, one Sonnet session (about 35 files: 7 new, 9 deleted, the rest small edits). Five commits; the **stop point** is the end of step 3 (section 10).

**Feedback notes folded in:** none. `npm run feedback` on 13 Oct shows one open note (`cmv5on08v`, own area), not R3a's.

**Owner rule for every builder:** the drawings are illustrations at 375 and 1280 px, not pixel specs. Build the intent, fluid between and beyond: the banner and the phone bar span the full width, their content and the page sit in the shared container (`max-w-6xl`, the own area's), no width copied from a drawing except the pages column (190 px), the 96 px banner and the 64 px bar. Check at 360, 768, 1024, 1280, 1440 and 1920 px. **Any small issue you find (about 4 minutes or less) you fix in the same release instead of listing it as a leftover.**

## Drawings to match

On the redesign page, section "A group" ([#h-group](../redesign.html#h-group), [#g-banner](../redesign.html#g-banner)); source `scripts/redesign/gen.mjs` 450–481, parts `parts.mjs` 277–305 (`gban`, `gbar`, `gnav`, `GPAGES`, `tabs`, `socLinks`), CSS `css.mjs` 404–444 and `gen.mjs` 886–892 (image shade), 832–844 (tabs with an action, social links).

| Drawing | What to see |
|---|---|
| "Desktop · banner · the group has an image (Pārgājieni)" | image fills the 96 px banner, dark shade from below, no mark; name 20 px Literata white; under it the category line (dot ringed white, "Pārgājieni", sub-categories) and "Rīga · 3 biedri", all white; at the right "Sazināties" (primary) and "…" (chip, white 90 % with dark icon) |
| "Desktop · banner · no image: category tint and icon (Jelgavas skrējēji)" | 120° tint from 22 % to 7 % category tone over the surface, bottom border; 44 px rounded mark with the category icon in the tone; text in the normal colours |
| "… on a team page" (both) | the same banner, only "…" at the right (no button for members and the team) |
| "Phone · group bar · with an image" / "· no image" | one 64 px row, never wraps: ☰, (mark 34 px when no image), name 15 px truncated, "● Pārgājieni · Rīga · 3 biedri" 12 px truncated, "…", then the round primary chat button for visitors (AP-08); with an image the image and shade behind the whole bar, text white |
| "Phone · the pages drawer, opened" | drawer from the left over the dimmed page: head (34 px picture or mark, name 16 px, category line), then the pages list with the open page tinted |
| "Desktop · Informācija · signed in, not a member" | pages column (Informācija, Pasākumi only: Jaunumi and Biedri hidden); tabs "Par mums · Kā notiek pirmā tikšanās · Praktiski"; the part's text in a surface box; "Nākamais pasākums" box with "Visi →" and one event row (no "Eju", no group line); social links as quiet text links at the end |
| "Phone · Informācija · signed in, not a member" | page title "Informācija" over the tabs (the menu is in the drawer); text; links; bottom bar marks "Atklāt" |
| "Desktop · Pasākumi · group team" | pages Informācija, Jaunumi, Pasākumi, Biedri (badge 2), Iestatījumi; tabs "Gaidāmie · Pagājušie" with "Izveidot pasākumu" (secondary, small) at the right end of the tab row |
| "Phone · Pasākumi · member" | title "Pasākumi" over "Gaidāmie · Pagājušie", the rows; bottom bar marks "Grupas" |

Rule texts: [AR-47](../redesign.html#AR-47), [AR-48](../redesign.html#AR-48), [AR-49](../redesign.html#AR-49), [AR-50](../redesign.html#AR-50), [AR-58](../redesign.html#AR-58), [AR-70](../redesign.html#AR-70), [AR-21](../redesign.html#AR-21).

**Orchestrator defaults (tell owner):** short list of choices the plan and decisions leave open.
1. **Shade darker at the top than drawn.** The drawing's shade (18 % black at the top, 38 % at 60 %) gives white text only 2.7:1 on a white photo. The built shade is 60 % black at the top to 75 % at the bottom: 5.7:1 on pure white (AR-70 asks the text to read "over any photo"; the cross-cutting rule asks 4.5:1).
2. **No next event, no box.** Informācija shows "Nākamais pasākums" only when there is one the viewer may see; otherwise nothing (no empty box).
3. **Pending until R3b:** the button reads "Pieprasīts" with a tick (on phones the round button with a tick) and opens the R2b pop-over "Atsaukt pieteikumu?"; today's separate × goes.
4. **"Rakstīt komandai" in today's "…" menu for plain members** (OD-10's words), because the member faces that carried "write to the team" leave Informācija (AR-50). R3b rebuilds the menu.
5. **Nothing sticky** on group pages except the desktop pages column (like the own area): banner, phone bar and tabs scroll away.

## 0. Motivation and design alignment

- **Service Law.** Two service additions, no Prisma outside `lib/services`: `GroupService.getGroupWithContext` gains the pages list and the category line; `EventService.getNextVisibleEvent(s)` (D11) reads the next event with the members-only rule of `canSeeMembersOnly`. The client-fetched group menu (`GroupSidebarContent` → `getGroupRole` action) is deleted with its action and service method.
- **Context Law.** The layout fetches once; `GroupProvider` carries everything the frame shows (name, image, category line, city, members, private, pages, viewer, moderation); `GroupBanner`, `GroupPagesNav`, `GroupPagesDrawer`, `GroupActions`, `GroupMoreMenu` and `AdminToolsMenu` read `useGroupContext()`. No `group`, `userRole` or accent prop is passed into the frame (today's `GroupHeader group={…}`, `GroupTabs group={…} pendingCount={…}` go).
- **Taxonomy Law.** `--accent` keeps being set in the layout's `<style>` from the server-resolved tone (light and dark from the theme). The image is a server-chosen URL rendered as an `<Image>` element, never a URL in `<style>` (cross-cutting rule: CSS injection). Tint and shade are CSS utilities on tokens; the client resolves no colour. Buttons, links and active tabs use the site colour (AR-06); the tone appears only on the tint, the mark and the dots.
- **Defensive Coding.** The pending/withdraw button keeps its `isPending` guard; the auth-gate resume after sign-in exists once (one action cluster, 3.3), so the contact pop-up cannot open twice.
- **Action Consistency.** No new action. `manageMembership` revalidates the group **layout** so the Biedri badge and Pieteikumi count update without the old browser event.
- **Zero-Any / Constants.** `GroupPageKey` is a string-literal union; the page order lives in one constant (`GROUP_PAGE_KEYS` in `lib/group-pages.ts`).
- **150-line rule.** `GroupHeader` (408) and `GroupTabs` (301) are replaced by files under 150 each (P1).

## 1. Data and services

**Migration: none.** `prisma/schema.prisma` is unchanged (the image is `Group.bannerImage`, the type is `Group.type`). Blue/green: nothing the old app reads changes; URLs are unchanged (`?tab=my-rsvps` simply shows Gaidāmie; old `#<sectionId>` anchors land on the first part). Note for R5a (not here): the batch next-event query will want `@@index([groupId, startDate])` on `Event`; R4 or R5a adds it with its own migration if measured slow.

### 1.1 `lib/group-pages.ts` (new, pure, ≤ 40 lines)

```ts
export const GROUP_PAGE_KEYS = ['info', 'announcements', 'events', 'members', 'settings'] as const;   // C9 order
export type GroupPageKey = (typeof GROUP_PAGE_KEYS)[number];
export interface GroupPageLink { key: GroupPageKey; href: string; badge?: number }   // href without locale: `/${l1}/group/${slug}/events`
export function groupPages(o: { base: string; isMember: boolean; isTeam: boolean; pendingCount: number }): GroupPageLink[];
/** The page a URL segment under the group layout belongs to (`useSelectedLayoutSegment()`): null → info, 'create-event' → events. */
export function pageForSegment(segment: string | null): GroupPageKey | null;
```
Visibility (AR-49, hidden not greyed): `info`, `events` for everyone; `announcements`, `members` only when `isMember` (the pages themselves redirect non-members, so a site admin who is not a member does not get them either); `settings` only for the team (`isTeam` = owner or moderator; site admins reach settings through their tools menu, as today). `members` carries `badge: pendingCount` when the team has waiting requests.

### 1.2 `GroupService.getGroupWithContext` (`lib/services/group.service.ts`)

Add to `GroupContext` (and fill them in the same function; no extra query):
- `pages: GroupPageLink[]` from `groupPages({ base: '/' + resolved.l1Slug + '/group/' + g.slug, isMember, isTeam: isAdmin, pendingCount })`.
- `category.l1Title: string` (`resolved.l1Title`) and `subCategories: string[]` (titles of the level-2 tags, in the viewer's language, in tag order): the banner's category line "● Pārgājieni  Pārgājieni, Kempings" needs the main category and the sub-categories, which today's `title`/`parentTitle` pair (built for breadcrumbs) does not give cleanly.
- Keep `bannerImage` as is (the image; settings and samples use the name). Keep `type`.
- `stats.eventCount` and its extra count query: delete when nothing reads them after step 3 (today only `GroupHeader` does; check `lib/handbook/ui-samples.ts`). Small-debt rule.

`getGroupRole` (service, line 719) and the `getGroupRole` action (`actions/group-actions.ts` 181) are deleted: their only reader is `GroupSidebarContent`. `lib/constants/events.ts` `GROUP_MEMBERSHIP_CHANGED` and its dispatch in `RequestCard.tsx` go (the file goes if empty).

### 1.3 D11: `EventService.getNextVisibleEvents` / `getNextVisibleEvent` (`lib/services/event.service.ts`)

```ts
export interface NextEventView {
  id: string; slug: string; groupId: string;
  title: string; titleLang: TextLang;
  startDate: Date; endDate: Date | null; location: string | null;
  /** First words of the description as plain text (≤ 140 chars, no HTML), or null. */
  excerpt: string | null;
}
/** Batch: each group's next event the viewer may see (R5a's cards reuse it with 24 ids). */
static async getNextVisibleEvents(groupIds: string[], locale: string, viewerId?: string): Promise<Map<string, NextEventView>>;
/** One group (Informācija, R6's panel). React `cache()`d like getEventWithContext. */
static getNextVisibleEvent = cache((groupId: string, locale: string, viewerId?: string) => Promise<NextEventView | null>);
```
- **Next** = not past by the same rule as the Gaidāmie tab (`isEventPast`, `lib/event-dates.ts`): `OR: [{ endDate: { gte: startOfTodayInRiga() } }, { endDate: null, startDate: { gte: startOfTodayInRiga() } }]`, `orderBy: { startDate: 'asc' }`, the first per group (`distinct: ['groupId']` after the order, or `take: 1` in the single case).
- **Visible:** `visibility: 'PUBLIC'`, plus `MEMBERS_ONLY` for groups where the viewer is an approved member, or for a site admin: one `membership.findMany({ where: { userId, groupId: { in }, role: { not: 'PENDING' } } })` and `getSiteRole` (the same rule as `canSeeMembersOnly`). Never members-only events for a signed-out viewer. Also `group: { hiddenAt: null }`.
- Text: `resolveEventText(translations, lang, originalLang, true)` (instructions never read); `excerpt` through a new `lib/text-excerpt.ts` `plainExcerpt(html, max)` (strip tags, `&nbsp;` and the five basic entities, collapse whitespace, cut at a word with "…"; ≤ 25 lines; R5a can reuse it in `GroupCard`).
- Select only what `NextEventView` needs (no attendees).

### 1.4 `actions/group-actions.ts`

`manageMembership` (line 145) must leave the frame's Biedri badge and the "Pieteikumi N" tab right after approve/decline, which the removed browser event did for the old sidebar. Per `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/revalidatePath.md`, from a Server Function the page being viewed updates at once (its layouts are dynamic here: `auth()`), and a literal path takes no `type` (today's calls pass `'page'` with literal paths; drop it in the lines touched). Check it in the browser; if the badge stays stale, add `revalidatePath('/[locale]/[l1Slug]/group/[groupSlug]', 'layout')` (pattern + `'layout'` invalidates the layout and every page under it).

## 2. Tokens (`app/globals.css`)

Same values in light and dark (an image is shaded the same in both modes):
- `--on-image: #ffffff`, `--image-chip: rgb(255 255 255 / 0.9)`, `--image-chip-foreground: #1f221c`; `@theme`: `--color-on-image`, `--color-image-chip`, `--color-image-chip-foreground`.
- `@utility image-shade { background-image: linear-gradient(to top, rgb(0 0 0 / 0.75), rgb(0 0 0 / 0.6)); }` (Orchestrator default 1).
- `@utility banner-tint { background-image: linear-gradient(120deg, color-mix(in srgb, var(--accent) 22%, var(--surface)), color-mix(in srgb, var(--accent) 7%, var(--surface))); }`
- `@utility mark-tint { background-color: color-mix(in srgb, var(--accent) 22%, var(--surface)); color: var(--accent); }` (the mark tile; dark mode: the tone is the brighter dark tone already, R1a).

## 3. The frame

### 3.1 `app/[locale]/[l1Slug]/group/[groupSlug]/layout.tsx` (rewrite, ≤ 80 lines)

```tsx
<GroupProvider value={toGroupState(group)}>               // a small mapper next to the provider; no section content
  <style>…--accent as today…</style>
  {group.moderation.hidden && <HiddenGroupBanner … />}     // kept, above the banner (B17); restyle to tokens only
  <GroupBanner />
  <div className="mx-auto max-w-6xl px-3 pb-6 pt-3 md:grid md:grid-cols-[190px_minmax(0,1fr)] md:gap-[22px] md:px-[22px] md:pt-[18px]">
    <GroupPagesNav variant="side" />
    <div className="grid min-w-0 content-start gap-3">{children}</div>
  </div>
</GroupProvider>
```
- The container and grid are the own area's (`(me)/layout.tsx`), so header, banner content, pages column and own area line up at every width.
- `GroupState` (`components/providers/GroupProvider.tsx`) grows: `name`, `href` (the group's base path), `image: string | null` (`getSmartImageUrl(bannerImage)`, or null), `isPrivate`, `category: { l1Slug, l1Title, subCategories }`, `city` (slug; the client labels it with `cityLabel`), `memberCount`, `isAcceptingMembers`, `pages`, `moderation: { isSiteAdmin, hidden: boolean }`; keeps `id`, `slug`, `user`, `pendingCount`, `sections` (titles). Update every `GroupProvider` in the UI-elements page and `UiElementsDemos.tsx`.

### 3.2 `components/groups/frame/GroupBanner.tsx` (new, client, ≤ 140 lines)

One header for both widths: one image element, one action cluster (so the auth-gate resume and the pop-ups exist once). That is why there is no separate `GroupPhoneBar` file (the card's name for the phone look of this same component).

- Wrapper `<div data-ui={UI.groupBanner} data-image={image ? '' : undefined} class="relative isolate overflow-hidden h-16 md:h-24 border-b border-border">`; no image: `banner-tint`; with an image: no border, `<Image src={image} alt="" fill sizes="100vw" unoptimized loading="eager" fetchPriority="high" class="-z-10 object-cover" />` and `<span aria-hidden class="absolute inset-0 -z-10 image-shade" />`. (`priority` is deprecated since Next 16: `image.md` → `preload`, and the doc advises `loading="eager"` / `fetchPriority="high"`.) The image is decorative: the name is text.
- Row `mx-auto flex h-full max-w-6xl items-center gap-2.5 px-3 md:gap-4 md:px-[22px]`:
  1. `<GroupPagesDrawer />` (☰, `md:hidden`, 3.5).
  2. Mark when there is no image: `CategoryIcon` in a `mark-tint` tile, `size-[34px] rounded-[10px]` (icon 18 px) on phones, `md:size-11 md:rounded-[13px]` (icon 24 px).
  3. Text `min-w-0 flex-1`: `<h1 class="truncate font-heading text-[15px] font-semibold leading-tight md:text-xl">{name}</h1>`; phones: one line `truncate text-xs text-foreground-muted`: dot (8 px, `bg-[var(--accent)]`) + l1Title + " · " + city + " · " + members (+ " · Tikai biedriem" when private); from `md`: `flex flex-wrap items-baseline gap-x-3.5 gap-y-1` with `CategoryLine` (dot, l1Title, sub-categories) and the quiet "city · N biedri (· Tikai biedriem)" 13 px; at most two lines (`line-clamp-2`), the 96 px never grows.
  4. `<GroupActions />` (3.3).
- With an image (`data-image`), every text, the sub-categories and the muted line are `text-on-image`; the category dot gets `ring-[1.5px] ring-on-image`; chips (the "…", the admin tools button, the pending button) are `bg-image-chip text-image-chip-foreground`. `CategoryLine` gets an `onImage?: boolean` prop for this (its own colours otherwise unchanged); its colour prop takes `var(--accent)`.
- Every group page has it at the same height, including the event page, settings, create and edit event (C6: today's slim bar goes).

### 3.3 `components/groups/frame/GroupActions.tsx` (new, client, ≤ 140 lines)

What `GroupHeader` lines 42–87 and 287–405 did, in one cluster `flex shrink-0 items-center gap-2`:
- **Visitor** (not a member, not pending): one button, always "Sazināties" (`common.contact`; C1: today's form already has the join switch, `ContactGroupModal allowJoin={isAcceptingMembers}`). Phones: round primary `size-10 rounded-full` with `MessageCircle` and the word as `sr-only` (AP-08, accessible name "Sazināties"); from `md`: the primary pill with the word, no icon (`md:h-10 md:w-auto md:px-5`, the icon `md:hidden`, the word `sr-only md:not-sr-only`). Order: phones "…" then the button (`order-last md:order-first`). Signed out: the auth gate as today (`useAuthGate`, `'join_group'`, resume after sign-in once).
- **Pending:** Orchestrator default 3: a chip button "✓ Pieprasīts" (phones: round chip, tick, word `sr-only`) that opens `ConfirmPopover` (`renderTrigger` mode, message `group.confirmCancelRequest`, confirm `group.withdrawRequest`, destructive, `isPending` guard) → `cancelJoinRequest`. R3b replaces it with "Pieteikums nosūtīts" + "Atvērt sarunu".
- **Member / team:** no button (C7: the role pill goes; the role will be the "…" menu's first line in R3b).
- Then `<AdminToolsMenu />` (site admins only, B17) and `<GroupMoreMenu />`, both 40 px chips, reading the group from `useGroupContext()` (their `group`, `l1Slug` and `variant` props go; one look). Their menus open below the chip, aligned right, `max-w-[calc(100vw-24px)]` (no overflow at 360 px).
- The dynamic pop-ups move here unchanged: `ContactGroupModal`, `ReportModal`, `HideGroupModal`, `AuthGateModal`, with `menuReturnRef` for focus return.

### 3.4 `components/groups/frame/GroupPagesNav.tsx` (new, client, ≤ 70 lines) and `components/ui/PageNavLink.tsx` (new, ≤ 40 lines)

- `PageNavLink({ href, icon, label, current, badge, replace })`: the link look of `MeMenu` (`flex min-h-10 items-center gap-2.5 rounded-xl px-2.5 py-[7px] text-sm`, current `bg-tint font-semibold`, `aria-current="page"`, badge chip `ml-auto rounded-full px-2 text-[11px] font-semibold text-foreground-muted`, `bg-surface` when current else `bg-tint`, "9+" above 9). `MeMenu` switches to it (same look, one component: reuse before creating).
- `GroupPagesNav({ variant: 'side' | 'drawer', active?: GroupPageKey })`: `<nav data-ui={UI.groupMenu} aria-label={group.frame.pagesLabel}>`; side: `sticky top-[18px] hidden self-start md:flex flex-col gap-0.5` (Orchestrator default 5); drawer: `flex flex-col gap-0.5 pt-2`, links `replace` (R2b: the drawer's history entry becomes the page). Items from `useGroupContext().pages`, labels `group.pages.<key>`, icons (lucide): info `FileText`, announcements `List`, events `CalendarDays`, members `Users`, settings `Settings`. Current page: `active ?? pageForSegment(useSelectedLayoutSegment())` (the hook reads the segment one level below the group layout, `use-selected-layout-segment.md`; `active` is for the UI-elements demo).

### 3.5 `components/groups/frame/GroupPagesDrawer.tsx` (new, client, ≤ 70 lines)

The ☰ button (`grid size-10 place-items-center rounded-full md:hidden`, `aria-label={group.frame.pagesLabel}`, `aria-expanded`, `aria-controls`; `bg-image-chip text-image-chip-foreground` on an image) and, when open, `Overlay layout="left" dataUi={UI.drawer} label={group.frame.pagesLabel} flush panelClassName="px-2.5 py-3.5" returnFocusRef` exactly like `MeDrawer` (closes on a path change, Back, Esc, scrim). Head: the picture (the image as a 34 px `rounded-[10px] object-cover` `<img>`, or the mark), name `font-heading text-base font-semibold`, and the category line (dot, l1Title, sub-categories, 12 px muted); then `<GroupPagesNav variant="drawer" />`. It opens above the bottom bar (Overlay `z-50` over `MobileNav` `z-40`).

### 3.6 `components/groups/frame/GroupPartTabs.tsx` (new, server-safe, no hooks, ≤ 60 lines)

```ts
type Props = { title: string; label: string; items: { key: string; label: string; href: string; lang?: string; count?: number }[]; active: string; action?: ReactNode };
```
- The page's name on phones: `<h2 class="font-heading text-xl font-semibold md:sr-only">{title}</h2>` (the drawing: "On phones the page's name stands over its tabs"; on desktop the pages column already names it, AR-21 "no label repeats", so it is screen-reader only there).
- Row `flex items-end gap-3 border-b border-border` (`data-ui={UI.tabs}`): `<nav aria-label={label} class="flex min-w-0 flex-1 gap-[18px] overflow-x-auto [scrollbar-width:none]">` of `Link`s (`scroll={false}`, `aria-current="page"` on the active one) `whitespace-nowrap pb-2 text-sm text-foreground-muted border-b-2 border-transparent -mb-px`, active `font-semibold text-foreground border-primary` (site colour); a `count` shows as " 2" `tabular-nums`. `action` sits at the right end (`mb-1.5 shrink-0`). Tabs are links, not `role="tab"`: each one is its own URL.
- With no items (Jaunumi until R9b, the event page), only the phone title renders.
- `SettingsTabs` renders through it if that is a straight swap (one look for parts); otherwise left for R9b.

### 3.7 `app/[locale]/layout.tsx`

Remove `<Sidebar />` and its import; the scroll container keeps `id="main-content"`. Delete `components/shell/Sidebar.tsx`, `components/shell/GroupSidebarContent.tsx` and their keys if unused (`shell.sidebar.label`, `collapse`, `expand`; grep first, `DiscoverySidebar` uses others) and `UI.sidebar` if unused.

## 4. The pages

Every page under the group layout loses its own outer container (`max-w-screen-2xl mx-auto px-4 md:px-8`, `container mx-auto px-4`, `max-w-4xl … px-4 md:px-8`, the `animate-in …` classes that do nothing since R2b) and fills the main column; inner widths stay. Files: `page.tsx`, `events/page.tsx`, `members/page.tsx`, `announcements/page.tsx`, `settings/page.tsx`, `create-event/page.tsx`, `events/[eventSlug]/page.tsx`, `events/[eventSlug]/edit/page.tsx`, `loading.tsx`, `error.tsx`. No horizontal scroll at 768 and 1024 (the event page's own two columns are R9a's; they may stack earlier).

### 4.1 Informācija (`page.tsx`, ≤ 120 lines)

- Parts as tabs (AR-21): `GroupPartTabs title={group.pages.info} label={group.frame.partsLabel}` with one item per visible section: the first is "Par mums" (`common.about`, as today), the others the section title (with `lang` when not the page language); `href` `?part=<sectionId>` (the first has no param). The open part is `searchParams.part` when it names a visible section, else the first. Members-only sections are already left out by the service for visitors (hidden, not greyed: no tab, no placeholder).
- The open part: `<article class="rounded-2xl bg-surface px-[18px] py-3.5 text-[15px] max-w-[760px]">` (design.md: 760 for group pages) with today's `FallbackLangLabel` logic and `sanitizeRichText`; the prose reads in `text-foreground` in light and dark (check today's `prose-invert` in light mode).
- Then `<NextMeetingBox />` (4.2), then `<GroupSocialLinks />` (4.3), under whichever part is open, on phones too (the phone drawing is shorter, not a rule).
- Removed: the decorative glows, the side column (image now in the banner), the member faces and count box (AR-50), the `GroupService.getMembers` call (one query less), `UsersIcon`/`HelpCircle` headers. `generateMetadata` unchanged.

### 4.2 `components/groups/NextMeetingBox.tsx` (new, server, ≤ 60 lines)

`EventService.getNextVisibleEvent(group.id, locale, session?.user?.id)`; `null` → render nothing (Orchestrator default 2). Box `rounded-2xl bg-surface px-3.5 pb-1 pt-2.5 max-w-[760px]`, `data-ui={UI.nextMeeting}`:
- Head `flex items-baseline justify-between`: `<h2 class="text-[13px] font-semibold text-foreground-muted">Nākamais pasākums</h2>` and `Link` "Visi" + `ArrowRight` 14 px (`text-primary font-semibold text-[13px]`) to the group's `/events`.
- One row, a `Link` to the event page (`py-2.5 grid gap-0.5`): line 1 the date and time (`createDateFormatter` + `EVENT_WEEKDAY_TIME` from `lib/date-format.ts`, as `EventRow` does; tabular), the category dot (`bg-[var(--accent)]`), the title (`font-semibold`, `lang` when it differs); line 2 the excerpt, `text-[13px] text-foreground-muted truncate`. No "Eju", no group line, no "Tikai biedriem" (OD-19). R5b swaps the row for the shared `EventRow`.

### 4.3 `components/groups/GroupSocialLinks.tsx` (rewrite, server-safe, ≤ 35 lines)

Reads its links as props from the page (`group.socialLinks`, the page already has the context; not the provider, which does not carry them). Nothing when there are none. `<p data-ui={UI.socialLinks} class="flex flex-wrap gap-x-4 gap-y-1 text-[13px]">` with `<a target="_blank" rel="noopener noreferrer" class="font-semibold text-primary underline decoration-border underline-offset-[3px]">`: "Mājaslapa", "Instagram", "Discord" (`common.social_*`). No icons, no heading, not in the banner (AR-50, B14).

### 4.4 Pasākumi (`events/page.tsx`)

- `GroupPartTabs title={group.pages.events}` items Gaidāmie (`?tab` none) and Pagājušie (`?tab=past`) (C5); `action` for the team: `<Link className={buttonClass('secondary', undefined, 'sm')}>{group.createEvent}</Link>` (AR-58: at the right end of the tabs). "Mani pasākumi" and its filter are deleted (B7); any other `tab` value shows Gaidāmie.
- Rows: today's `EventRow` in a `flex flex-col gap-3` list filling the column (R5b replaces the rows, AR-54). Members-only events stay hidden from visitors (service unchanged). Empty state unchanged; `group.noRsvps` and `common.eventsTabMyRsvps` deleted.

### 4.5 Biedri, Jaunumi, Iestatījumi, event pages

- `members/page.tsx`: `GroupPartTabs title={group.pages.members}`; items Biedri and, for the team, Pieteikumi with `count={pendingCount}` (C4, `?tab=requests`); content unchanged (R9b).
- `announcements/page.tsx`: `GroupPartTabs title={group.pages.announcements} items={[]}` (title on phones only; Aktuālie/Arhīvs are R9b).
- `settings/page.tsx`: title `group.pages.settings` over `SettingsTabs`.
- Event page, create and edit event: no title row (they have their own headings); the banner and the pages column (Pasākumi current) frame them.
- `loading.tsx`: inside the main column: a phone title line (`md:hidden`), a 32 px tab line, three `SkeletonRow`s; no own container. `error.tsx`: `py-12` only.

### 4.6 The "…" menu, today's items (`GroupMoreMenu.tsx`)

Kept until R3b, moved into `GroupActions`, reading the context. Two small changes: its "Iestatījumi/Labot grupu" link goes (the team has Iestatījumi in the pages column; AR-51 "team tools stay in Iestatījumi"; the owner's transfer link stays until R3b); plain members (`isMember && !isAdmin`) get "Rakstīt komandai" (`group.writeToTeam`), which opens `ContactGroupModal` with `allowJoin={false}` (Orchestrator default 4; `GroupService.sendInquiry` allows members, not the team).

### 4.7 Deleted

`components/groups/{GroupHeader,GroupTabs,CompactGroupBar,GroupInfoDrawer,MemberAvatarList}.tsx`, `components/modals/MemberMoreModal.tsx` (only `MemberAvatarList` used it), `components/shell/{Sidebar,GroupSidebarContent}.tsx`, the `getGroupRole` action and service method, `GROUP_MEMBERSHIP_CHANGED`. `UI.groupHeader`, `UI.slimBar` replaced by `UI.groupBanner: 'group-banner'`, `UI.groupMenu: 'group-menu'`, `UI.socialLinks: 'social-links'`, `UI.nextMeeting: 'next-meeting'` (the redesign's `el()` names; `group-bar-phone` is the same element, so it is listed on the banner's specimen).

## 5. Members-only and private (AR-49, OD-07)

| Viewer | Pages | Banner right end | Informācija | Pasākumi |
|---|---|---|---|---|
| Signed out | Informācija, Pasākumi | Sazināties (→ sign-in pop-up) | public parts, next public event | public events |
| Signed in, not a member (also any private group's link-holder) | same | Sazināties | same | same |
| Pending | same | ✓ Pieprasīts (withdraw pop-over) | same | same |
| Member | + Jaunumi, Biedri | "…" only (+ Rakstīt komandai inside) | + members-only parts and events | + members-only |
| Team | + Iestatījumi, Biedri badge | "…" only | same | + Izveidot pasākumu |
| Site admin (not a member) | Informācija, Pasākumi | tools chip + "…" (+ Sazināties) | members-only parts (service rule) | all events |
| Hidden group (owner, site admin) | as above | as above, the hidden banner on top | | |

A private group adds " · Tikai biedriem" to the quiet line; nothing else differs on the page. Members-only things never show a lock, a greyed tab or an empty slot.

## 6. i18n (both files; `npm run i18n:check`)

| Key | lv | en |
|---|---|---|
| `group.pages.info` (new) | Informācija | Information |
| `group.pages.announcements` (new) | Jaunumi | Announcements |
| `group.pages.events` (new) | Pasākumi | Events |
| `group.pages.members` (new) | Biedri | Members |
| `group.pages.settings` (new) | Iestatījumi | Settings |
| `group.frame.pagesLabel` (new) | Grupas lapas | Group pages |
| `group.frame.partsLabel` (new) | Lapas daļas | Page parts |
| `group.frame.members` (new) | {count, plural, zero {# biedru} one {# biedrs} other {# biedri}} | {count, plural, one {# member} other {# members}} |
| `group.frame.membersOnly` (new) | Tikai biedriem | Members only |
| `group.nextMeeting.title` (new) | Nākamais pasākums | Next event |
| `group.nextMeeting.all` (new) | Visi | All |
| `group.writeToTeam` (new) | Rakstīt komandai | Write to the team |
| `common.eventsTabPast` (value) | Pagājušie | Past |
| `common.membersList` (value) | Biedri | Members |
| `common.requestsTab` (value) | Pieteikumi | Requests |
| `common.role_admin` (value, OD-01) | Moderators | Moderator |
| `common.private`, `common.typePrivate`/wizard `typePrivate` (value, OD-07) | Tikai biedriem | Members only |

Deleted when no reader is left (grep each in `app components lib`): `common.eventsTabMyRsvps`, `group.noRsvps`, `common.groupMenu`, `common.navigationMenu`, `common.closeDrawer`, `common.informationTitle`, `common.breadcrumb`, `common.moreMembers`, `group.eventsCount`, `common.tabSocial` (settings keeps it), `shell.sidebar.{label,collapse,expand}`. Sentence case in every value (AR-10).

## 7. Handbook and UI elements

- `docs/handbook/voice.md` fixed words: change "Owner + admins" to "Owner + moderators | Grupas komanda | Group team"; add rows: "A group's pages | Informācija, Jaunumi, Pasākumi, Biedri, Iestatījumi | Information, Announcements, Events, Members, Settings"; "Parts of Biedri | Biedri / Pieteikumi | Members / Requests" (C4); "Parts of Pasākumi | Gaidāmie / Pagājušie | Upcoming / Past" (C5); "A group moderator | the tag "Mod"; in lists and menus "Moderators" | "Mod"; "Moderator"" (C8, OD-01); "A private group | Tikai biedriem | Members only" (OD-07).
- `docs/handbook/roles.md`: under the table, "Hidden, not greyed (AR-49): members-only pages, parts and events leave no tab, lock or empty place for people who may not see them."; Team column "Settings in the sidebar" → "Iestatījumi in the group's pages"; a line "A private group ("Tikai biedriem") is out of discovery and search; someone with the link sees what a signed-in visitor sees (OD-07)."
- `docs/handbook/design.md`: Layout B line: "a banner (96 px, the group's image with a dark shade and white text, or the category tint and mark; a 64 px bar on phones with ☰ for the pages)"; line 19: "…and the same "Sazināties" for visitors on every group page"; screen table "Group Informācija" and "Pasākumi tab" → "R3a (rows R5b)" done; Components: "Part tabs: links, the site colour under the open one, the page's one action at the right end".
- UI elements: new `components/handbook/GroupFrameDemos.tsx` (≤ 150): `GroupBanner` with an image and without (sample `GroupProvider` states: visitor, pending, member, team), `GroupPagesNav` (side, `active="events"`, team pages with badge), `GroupPartTabs` (Gaidāmie/Pagājušie + action), `NextMeetingBox` sample (render the row part from sample data: split the row into `NextMeetingRow` so the demo needs no DB), `GroupSocialLinks`. Replace the `header` and `slimBar` specimens on `app/[locale]/admin/handbook/ui-elements/page.tsx`; update `lib/handbook/ui-samples.ts` for the new context fields.

## 8. Accessibility

- One `h1` (the group name) in the frame; the phone page title is an `h2` (`md:sr-only` on desktop). Display-hidden copies are out of the accessibility tree.
- Icon-only buttons carry their word: ☰ "Grupas lapas", the round chat button "Sazināties" (AP-08), the pending tick "Pieprasīts", "…" (`common.moreOptions`). Targets 40 px like the own-area bar.
- Pages and parts are `nav`s with links and `aria-current="page"`; the drawer is the R2b `Overlay` (focus trap, Esc, Back, focus back to ☰).
- White text on images ≥ 4.5:1 through the shade (Risks: how to test); category dots are decoration (`aria-hidden`), the category name is text.
- No motion added.

## 9. Grep proofs

```bash
wc -l components/groups/frame/*.tsx components/groups/{NextMeetingBox,GroupSocialLinks}.tsx components/ui/PageNavLink.tsx lib/group-pages.ts lib/text-excerpt.ts "app/[locale]/[l1Slug]/group/[groupSlug]/"{layout,page}.tsx components/handbook/GroupFrameDemos.tsx   # P1: each < 150
ls components/groups/{GroupHeader,GroupTabs,CompactGroupBar,GroupInfoDrawer,MemberAvatarList}.tsx components/shell/{Sidebar,GroupSidebarContent}.tsx components/modals/MemberMoreModal.tsx 2>/dev/null   # P2: nothing
grep -rn "getGroupRole\|GROUP_MEMBERSHIP_CHANGED\|eventsTabMyRsvps\|my-rsvps" app components actions lib       # P3: 0
grep -rn "Sidebar" "app/[locale]/layout.tsx"                                                                    # P4: 0
grep -rnE "group=\{|userRole=|accentColor=|pendingCount=" components/groups/frame "app/[locale]/[l1Slug]/group/[groupSlug]/layout.tsx"   # P5: 0 (Context Law)
grep -rnE "#[0-9a-fA-F]{3,6}\b|style=|dark:|uppercase|\bpriority\b" components/groups/frame components/groups/NextMeetingBox.tsx components/groups/GroupSocialLinks.tsx   # P6: 0
grep -rn "url(" "app/[locale]/[l1Slug]/group/[groupSlug]/layout.tsx"                                         # P7: 0 (no image URL in <style>)
grep -rn "prisma" components/groups/frame components/groups/NextMeetingBox.tsx lib/group-pages.ts              # P8: 0
grep -rn "bg-\[var(--accent)\]" components/groups/frame | grep -iv "dot\|rounded-full"                      # P9: 0 (tone only on dots, tint, mark)
git diff --stat origin/main -- prisma/                                                                       # P10: empty
```

## 10. Builder steps and commits

Small commits, each passing `npm run typecheck`; messages end with the co-author line.

1. **Services.** `lib/group-pages.ts`, `lib/text-excerpt.ts`, `GroupContext` additions (1.2), `EventService.getNextVisibleEvents`/`getNextVisibleEvent` (1.3), `manageMembership` revalidation (1.4). Check the members-only rule by hand on the seeded DB: a members-only event is next for a member and skipped for a visitor and signed out. Commit "feat(R3a): group pages and the next visible event in the services".
2. **Frame.** Tokens (2), `GroupProvider` state, `PageNavLink` (+ `MeMenu` on it), `GroupBanner`, `GroupActions`, `GroupPagesNav`, `GroupPagesDrawer`, layout rewrite (3.1), `AdminToolsMenu`/`GroupMoreMenu` on the context + 4.6, Sidebar unmount and the deletions of 4.7 except `MemberAvatarList`/`MemberMoreModal`, `getGroupRole` gone. Commit "feat(R3a): the group frame: banner, pages down the left, phone bar and drawer" (split in two if large: banner + actions, then nav + drawer + deletions).
3. **Pages.** `GroupPartTabs`, Informācija (4.1) with `NextMeetingBox` and `GroupSocialLinks`, delete `MemberAvatarList` and `MemberMoreModal`, Pasākumi tabs, Biedri tabs, titles on Jaunumi and Iestatījumi, the container sweep (4), `loading.tsx`/`error.tsx`, the i18n of 6. Commit "feat(R3a): parts as tabs, Informācija with the next meeting, Pasākumi tabs".
   **Stop point.** If the session runs long, stop here: everything a visitor, member or team sees is built. Steps 4–5 (Handbook, UI elements, close-out) must still land before the release is pushed; hand over with the build-plan row "built to step 3".
4. **Handbook and UI elements** (7). Commit "docs(R3a): handbook words, roles and the group frame on UI elements".
5. **Close-out.** Definition of done and the screens of 11; small issues found are fixed now (≤ ~4 min each), not listed; in `docs/development/build-plan.md` section 8 set R3a to "built, in review" with the commit range; tick the R3a line in `docs/execution_handoff.md`. Commit. Do not push (the reviewer pushes).

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

**Matrix.** Dev server, seeded DB. Widths **360, 768, 1024, 1280, 1440, 1920 px**; **lv and en**; **light and dark**; viewers **signed out, signed in non-member, pending, member, group team (owner and moderator), site admin**; groups **with an image, without an image, hidden (as owner and as site admin), private (as a non-member with the link)**. Side by side with each drawing at 375 and 1280.

| Where | Look for |
|---|---|
| banner, every group page (Informācija, Jaunumi, Pasākumi, Biedri, Iestatījumi, event page, create/edit event) | 96 px from `md`, 64 px on phones, the same on every page; full-width background, content aligned with the header's and the pages column's left edge at 1280–1920; with an image: shade, white text, no mark, chips white; without: tint + mark; name never wraps on phones (truncates with "…"), the bar never wraps at 360 |
| banner right end per viewer | table of 5: visitor "Sazināties" (round icon on phones, word from `md`), signed out → sign-in pop-up and after sign-in the contact form opens **once**; pending "✓ Pieprasīts" → pop-over → withdrawn, button back to "Sazināties"; member and team: only "…"; site admin: tools chip; hidden group: the hidden banner above, restore works for a site admin |
| pages column (from `md`) and drawer (phones) | the right pages per viewer (5), C9 order, the open one tinted; team sees Biedri with the waiting count; approve a request on Biedri → Pieteikumi count and the badge drop without a reload; drawer: ☰ opens from the left over the bottom bar, a page link lands with one Back to return, Esc/scrim/Back close, focus back to ☰ |
| bottom bar (phones) | entering a group from discovery marks Atklāt, from Manas grupas marks Grupas, unchanged while moving between the group's pages and through the drawer (AR-20) |
| Informācija | parts as tabs (`?part=`), one part shown; members-only parts absent for visitors (no tab); next-meeting box only when there is an event: for a member a members-only next event, for a visitor the next public one, nothing when none; "Visi" opens Pasākumi; social links as text links at the end; no member faces anywhere on the page |
| Pasākumi | Gaidāmie / Pagājušie only, "Izveidot pasākumu" at the tabs' right end for the team (wraps nothing at 360), no "Mani pasākumi"; `?tab=my-rsvps` shows Gaidāmie; members-only events hidden from visitors |
| Biedri (member, team) | tabs "Biedri" and, for the team, "Pieteikumi 2"; content as before |
| phone page titles | "Informācija", "Pasākumi", "Biedri", "Jaunumi", "Iestatījumi" over the tabs on phones, not visible from `md` |
| "…" menu | today's items work from the new place (share, report with focus return, leave with the pop-over); members have "Rakstīt komandai" → the contact form without the join switch → a conversation in Ziņas; no "Labot grupu" item for the team |
| private group, non-member with the link | Informācija, Pasākumi, "Sazināties", " · Tikai biedriem" at the end of the quiet line; the create wizard and settings both say "Tikai biedriem" |
| loading / error | throttle "Slow 4G", move between the group's pages: banner and pages column stay, the skeleton fills the column; a thrown error (not committed) shows the error state inside the column |
| contrast (Orchestrator default 1) | set a group's image to a pure white picture (settings → picture link, e.g. `https://dummyimage.com/1600x400/ffffff/ffffff.png`) and to a busy photo; take a screenshot at 1280 and 375, sample the background pixel right next to the smallest white text (the quiet line, top-left of the name) with a colour picker, compute the ratio with white (WebAIM or DevTools' contrast formula): ≥ 4.5:1 everywhere text sits; then restore the image |
| no horizontal scroll | every group page at all six widths, both locales (long en words, a long group name, three sub-categories) |
| UI elements page | the new specimens in both modes |

**Signed-out leak checks** (as in R2b): `/lv/<l1>/group/<private-or-public-slug>` signed out (`fetch(url, { credentials: 'omit' })`): the body contains no members-only section text, no members-only event title (also not in the next-meeting box) and no member names; an unknown group slug still returns **404** (layout check above the group `loading.tsx`).

**Blue/green:** no schema change (P10); URLs unchanged; the old app keeps working during the swap.

## 12. Risks

- **White text on a user's image.** The shade must hold 4.5:1 on the worst picture (pure white). Default 1 darkens the top; the reviewer runs the white-image test (11). If the owner wants the lighter drawn shade back, the only safe alternative is a text shadow plus the darker shade under the text block, not a lighter shade.
- **Pages drawer vs bottom bar on phones.** Both are fixed; the drawer must open over the bottom bar (Overlay `z-50` > `MobileNav` `z-40`) and a page chosen in it must `replace` the drawer's history entry, or Back takes two steps (R2b's rule). The bottom-bar tab must not change when moving through the drawer (AR-20; `useBottomTab` compares the group base path).
- **Hidden-group banner and site-admin tools must stay** (B17): `HiddenGroupBanner` above the banner, `AdminToolsMenu` in the action cluster for site admins (hide, restore, categorisation page, moderation log, edit). The reviewer opens a hidden group as owner and as site admin.
- **Today's join/contact button, withdraw and "…" keep working in their new place until R3b**, including the sign-in resume (`pendingAction === 'join_group'`) firing once. Rendering the action cluster twice (one per width) would double it: one header for both widths (3.2).
- **`useSelectedLayoutSegment` inside the portal drawer** reads the group layout's segment through React context, so it still works in a portal; check the current page is marked in the drawer.
- **Removing the client sidebar** removes the old `GROUP_MEMBERSHIP_CHANGED` refresh; the layout revalidation in `manageMembership` replaces it (check approve/decline updates the badge).
- **Container sweep** touches the event, create and edit pages (R9a's): only their outer wrapper changes; the reviewer opens each at 768 and 1024 for overflow.
- **Members' "write to the team"** moves from the faces list to the "…" menu (default 4); without it members would have no way to the team until R3b.

## 13. Out of scope

The Sazināties form's new look and toast, the pending state "Pieteikums nosūtīts" + "Atvērt sarunu", the new "…" menu with the role line (R3b); Biedri and Jaunumi content, Aktuālie/Arhīvs, settings restyle (R9b); the event rows (R5b: the shared `EventRow`, two columns, "Rādīt nākamo nedēļu"); the event page's own layout (R9a); private groups out of discovery and search (R5a, R7); the opened group panel (R6, which reuses `getNextVisibleEvent`); an `og:image` from the group's image; the `(groupId, startDate)` index (R4/R5a if measured).
