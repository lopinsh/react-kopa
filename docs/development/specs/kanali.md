# Kanāli: a town square for each zoom level of the board

> Status 9 Nov 2026: **"Decided 9 Nov, zoom levels (owner)" replaces the separate per-city page.** Older parts that conflict are kept for history and marked *replaced 9 Nov*. The rest is still a draft. Going live (domain, backups, legal pages, Jelgava promotion) is out of scope for now. The goal is to get the site to the point where going live *can* be considered. The first real audience is planned to be Jelgava, reached through the city newspaper, so expect casual internet users.

## Context
Most people won't create a group, but they still want to find others interested in the same topic in the same place.

A **kanāls** (internal word; users see no special name, only the title) is the **town square for the zoom level the board filter is set to.** It is in the spirit of mIRC public channels and Couchsurfing city groups.
- **Three levels, one tree:** L1 › L1 · L2 › L1 · L2 · City, for example Spēles › Spēles · Šahs › Spēles · Šahs · Jelgava. A city only counts under a tēma path: "Jelgava" alone, or L1 · City, is the normal board with no town square and no chat.
- **Content is derived** from the groups and Meklē cards below, like a filter. Nothing is stored per level except its chat room and the people who follow it.
- **Every level has a chat room.** A city room is for local talk. An upper room (L1, L1 · L2) is for talk across cities or tēmas, and it lists its child rooms.
- **It lives on the board itself.** The URL is the board filter; there is no separate page. A town-square part (Meklē, Čats, Mani interesē) sits on the board for the current filter.
- **No events of its own.** Every event is created by a group; a tournament between groups is an event of the organising group.
- **Chat runs on Matrix,** self-hosted. People talk in our own chat panel on our site; the Matrix phone apps (Element X, FluffyChat) are optional. A Discord bridge is possible later; it is not planned.
- **Signed-out visitors see counts only.**

## Decided 9 Nov, zoom levels (owner)
1. **The kanāls is the board's zoom level.** Board filter → level:

   | Filter (`category`, `tags`, `city` in `lib/discovery-params.ts`) | Level | Chat |
   |---|---|---|
   | L1, no tēma, no city | L1 square ("Spēles") | L1 room, lists its L2 rooms |
   | L1 + one tēma, no city | L2 square ("Spēles · Šahs") | L2 room, lists its city rooms |
   | L1 + one tēma + one city | city square ("Spēles · Šahs · Jelgava") | city room |
   | L1 + city, no tēma; city alone; nothing | normal board | none |
2. **Multi-tēma filter** (Šahs + Go, with or without a city): the content merges; there is **no combo room**. Čats lists the rooms of the selected tēmas (with a city: their city rooms). The same holds for several cities under one tēma.
3. **Matrix layout:** one Space per L1 and per L2, each with its own room; city rooms sit inside their L2 Space.
4. **Group page:** the category line L1 / L2 / city becomes three links, each to its town square (board URL at that level). This replaces the single link "Hobiji · Fotogrāfija · Valmiera →".
5. **Manas grupas** lists the town squares you follow ("Mani interesē"), under your groups.
6. **Moderators are per room.** City rooms: owners and admins of a child group apply and a site admin approves (as before). Upper rooms: a site admin appoints moderators directly; there is no application.
7. **Meklē cards are written at city level** (tēma + city) and show at every level above: a card in Spēles · Šahs · Jelgava also shows on Spēles · Šahs and on Spēles.

## Open points, each with a default
- **What "Mani interesē" follows upstairs.** Default: it follows that one level. You get its chat room in your list and, in the email digest, new Meklē cards and new groups anywhere below it. It does not follow the child rooms; each child room is its own tap.
- **An upper level with an empty room.** Default: the town-square part shows whenever anything below has content (one Meklē card or one group), even if its own room has no messages yet. The empty room shows the list of child rooms and the composer. A level with nothing below shows no town-square part at all (no `EmptyState` on the board for it).
- **How "Pastāsti, ko meklē" asks for tēma and city upstairs.** Default: the sheet prefills what the filter already says and asks only what is missing. On Spēles it asks for the tēma (chips of the L1's tēmas) and the city (`Select` of cities). On Spēles · Šahs it asks only for the city. With several tēmas or cities selected, it asks you to pick one of them. No preselected city: we don't guess one from the profile.
- **Other filter pieces.** Defaults: an L3 tag (veids) counts as its L2 parent's level; a search text (`q`) hides the town-square part (a search is not a zoom); the part shows on both Grupas and Pasākumi views.

## Facts from the code survey that shape the design
- `Group.categoryId` must be L1 (`taxonomy.service.ts:712`). L2 reaches a group only through `Group.tags`.
  - So a kanāls level is **its own model** (now `ChatRoom`, see K2 detail).
  - Its child groups are **derived**, never stored: PUBLIC, unhidden groups in that L1, tagged with that L2 (or its L3 children), in that city, depending on the level.
- The board filter already exists: `parseDiscoveryParams` / `discoveryHref` in `lib/discovery-params.ts` (`category`, `tags`, `city`), page `app/[locale]/(discovery)/page.tsx`, results in `components/discovery/GroupResults.tsx`. The town square reads the same parsed params; it adds no route.
- The site has no chat for a whole group. Matrix fills that gap, so no group-chat code of our own is needed.
- `Event.visibility` and `Post.visibility` exist. A town square shows only `PUBLIC` events of the groups below.

## Order of work (project "Kanāli", stages K1-K3)
1. **K1 Matrix spike** (no release, nothing pushed):
   - Run continuwuity locally or on the media box, with a throwaway server name.
   - Create the **3-level tree** by script: L1 Space with its own room › L2 Space with its own room › city room inside the L2 Space (for example Spēles › Šahs › Jelgava, plus a second city and a second tēma so a room lists its children).
   - Put a bare chat panel built on `matrix-js-sdk` into a localhost test page; it can switch between a room and its child rooms.
   - It answers five questions: how heavy the server is, how the chat feels, how accounts and login work, how moderation maps to power levels per room, and how a Space lists its child rooms to our panel.
2. **K2 town square without chat:** on the board, for the current zoom level: Meklē cards and "Es arī", "Mani interesē", the three links on the group page, the followed squares in Manas grupas, wizard prefill, moderator applications (city rooms) and appointments (upper rooms), reports. The Čats part stays hidden; no placeholder where chat will go.
3. **K3 Matrix chat:**
   - Accounts are created by our site. A Matrix room is created lazily for a `ChatRoom` the first time it is opened by a signed-in person; Spaces are created with it as needed.
   - Our chat panel in the Čats part of the board (signed-in only). An upper room shows its child rooms; with several tēmas selected, Čats lists their rooms.
   - Moderators mapped to room power levels per room; reports work on messages.
   - Rooms are not `world_readable` and allow no guest access, so signed-out visitors see counts only.

## K2 detail (draft, restated 9 Nov)
**Data,** one additive migration (*`Channel` and `ChannelMember` of the earlier draft replaced 9 Nov*):
- `ChatRoom`: `categoryId` (an L1 or an L2 category), `city String?` (slug; only with an L2), `matrixRoomId String?` (filled in K3), `createdAt`. `@@unique([categoryId, city])`. **Lazy:** the row is created on the first follow, moderator or chat message, never ahead.
  - Postgres treats nulls as distinct, so the unique does not stop two upper rooms for one category. Default: the service creates rooms with an upsert-by-find inside a transaction, and the migration adds a partial unique index `ON "ChatRoom"("categoryId") WHERE "city" IS NULL` by hand. Check `prisma migrate diff` shows no drift after.
  - The service rejects a city with an L1, and an L3 category.
- `ChatRoomMember(roomId, userId, role MEMBER|MODERATOR, joinedAt)`, `@@unique([roomId, userId])`. MEMBER is the "Mani interesē" follow; MODERATOR is per room.
- `ChannelSeek(categoryId, city, authorId, text, expiresAt, district?)`: `categoryId` is an L2, `city` required. **No link to a room:** a card shows at its city level and at every level above it by query. About 30 days; max 3 active cards per person.
- `ChannelSeekMeToo(seekId, userId)`, unique on both.
- `ChannelModRequest`: `roomId` (a city room only), `userId`, `groupId` (the child group that qualifies them), `status PENDING|APPROVED|DECLINED`, `decidedById?`. Upper-room moderators are set by a site admin directly (a `ChatRoomMember` with role MODERATOR, no request row).

**Code:**
- `lib/services/channel.service.ts`: `levelFromFilter(params)` (returns the level, or several L2 / city levels for a multi filter, or none), context for a level (title L1 · L2 · City from service titles, counts, child rooms, merged Meklē cards, followed?), follow / unfollow, seeks, me-too, moderator requests and appointments. Child groups and events reuse `DiscoveryService` queries, not new ones.
- `actions/channel-actions.ts`.
- `components/discovery/TownSquare*.tsx`: the town-square part on the board, between the chips and `GroupResults`, loaded by `(discovery)/page.tsx` with the parsed params.
- *Route `app/[locale]/[l1Slug]/kanals/[l2Slug]/[city]/` with the group page frame and tab segments: replaced 9 Nov.* The board already sets `--accent` from the L1; nothing new.

**Entry points:**
- The board at a zoom level (the URL is the filter).
- The group page: the category line L1 / L2 / city as three links to `discoveryHref` at each level.
- Manas grupas: followed town squares.
- Wizard prefill: `create/page.tsx` reads `?city=&tag=`, and the wizard gets `initialCity` and `initialTags`.
- *One-line bar above `GroupResults` ("C1"): replaced 9 Nov* by the town-square part.

**Notifications:** `CHANNEL_NEW_GROUP` and new Meklē cards below a followed level (in the email digest), the "Es arī" notification to a card's author, `CHANNEL_MOD_REQUEST` (to admins), `CHANNEL_MOD_DECISION`. No `CHANNEL_OPENED`.

**Reports:** site admin handles them in one queue (groups, Meklē cards, later chat messages). Every card has a report action.

**Admin:** `app/[locale]/admin/kanali/` for moderator requests (city rooms), appointing moderators to upper rooms, the report queue, revoking moderators and closing a room.

## Defaults taken (open to change)
- No public name; internal name Kanāls / "Channel" (code may say `ChatRoom` for the stored part).
- *Kanāli exist only at L2 x city: replaced 9 Nov* by three levels (L1, L1 · L2, L1 · L2 · City).
- A kanāls has no events or sections of its own. Commitment lives in groups.
- Joining a group doesn't unfollow a town square.
- Kanāli work in every city; there is no home city.
- Followed squares extend the existing Manas grupas page (not the board).

## Decided 8 Nov (owner), still standing
- **Signed-out sees counts only:** no faces, no author names on Meklē cards, no chat.
- **Fixed words** (revised 9 Nov: use the site's existing ones): L2 is "tēma" ("+ Cits" chip, "Ieteikt jaunu tēmu", "šajā tēmā"). "Jaunumi" is only for group announcements; the feed is "Pasākumi" plus "No grupām". One "Dalīties". One joining verb: "Mani interesē"; the exit is "Vairs neinteresē".
- **No public name** (9 Nov; "kanāls" is the internal word in code, spec and admin). User-facing: the title "Spēles · Šahs · Jelgava".
- **Suggesting a tēma** reuses the `CategorySuggest` sheet; visible to admins only until approved (`CategoryStatus` `PENDING_REVIEW`).
- **"Es arī" count** is visible only to the card's author. No "vēl N dienas".
- Rejected: a Kanāli tab in the title switch and the kanāls as the first grid card (the chips are the navigation).
- **Districts (apkaimes):** kanāli stay city-level; a district is an optional place detail (`District(citySlug, slug, nameLv, nameEn)` and a nullable `district` on Group, Event, ChannelSeek) with a filter chip in the city-level town square. District rooms only later.

## Decided 9 Nov, revised (owner)
1. **Success is people meeting in person.** Measures, in order: events in Jelgava with 2 or more going; Meklē cards answered ("Es arī") within a week; groups started from a card or town square. Pilot target for the first 2 months: 10 meetings, half of the cards answered.
2. **A kanāls is the town square:** a local message board (Meklē cards) plus chat, where people from the different groups and the interested hang out and talk. **No events of its own.** (Its scope is now the zoom level, see "Decided 9 Nov, zoom levels".)
3. **Matrix chat is back** (K1 spike, K2 without chat, K3 chat) and **moderators are back** (now per room, see zoom levels item 6).
4. **No 2-to-open gate** (kept): a level shows its town-square part once there is at least 1 Meklē card or 1 group below it. The first action is "Pastāsti, ko meklē"; "Mani interesē" is the lighter follow.
5. **Meklē leads to a group, not a DM** (kept). No "Rakstīt". When others tap "Es arī", the author gets a notification and "Izveidot grupu ar viņiem", which opens the wizard prefilled `?city=&tag=` and invites them. Max 3 active cards per person; each card has a report action.
6. *The bar is one line ("2 cilvēki meklē biedrus → Skatīt"): replaced 9 Nov* by the town-square part on the board. Kept from it: no faces, and the part does not repeat the title the chips already show.
7. **Seeding** (kept). Before the article, the owner and 2-3 Jelgava organisers each start a real group with one dated event. Article topics: šahs un galda spēles, pastaigas/nūjošana, fotogrāfija, koris, skriešana, jaunie vecāki. The article links to the board filtered to Jelgava.
8. **No public name** (kept): a level is titled by its path, L1 · L2 · City ("Spēles · Šahs · Jelgava"). *"A later multi-city page L1 · L2": replaced 9 Nov*, the L1 · L2 level exists now.

## Later
- *Multi-city kanāli later at L1 · L2 with stricter rules: replaced 9 Nov* (the L1 · L2 level and its room exist from K2; the stricter rule left is that a site admin appoints its moderators).
- District rooms under a city room.

## Ekrāni un lietotāju stāsti
*Replaced 9 Nov:* the separate page in the group page frame with the tabs Sākums, Čats, Pasākumi, Grupas, Cilvēki, and the drawing "Kanāls" (`docs/development/kanali/channel.html`). Kept as history; new drawings of the board's town-square part come with K2's spec. What carries over:
- Meklē board as hairline rows ("Es arī", "…" menu with Ziņot); the author's row after "Es arī" shows "2 atsaucās" and "Izveidot grupu" (no in-page notification card; the bell does it).
- Čats in the chat look of Discord/mIRC (left-aligned lines, no bubbles), day dividers, composer at the bottom; hidden in K2.
- A visit never makes you a member; every step in is a tap.
- Signed out: counts only, no names, no Čats. Only action: "Mani interesē".
- Grupas and Pasākumi are the board's own views for the filter; the town square adds none.

## Ieeja no esošās struktūras
- *URL `/[l1]/kanals/[l2]/[city]`: replaced 9 Nov*; the URL is the board filter, e.g. `/lv?category=speles&tags=sahs&city=jelgava`. Sidebar unchanged.
- *C1 Josla: replaced 9 Nov* by the town-square part between the chips and the grid. Title switch stays "Grupas · Pasākumi".
- **C2 Izveides kartīte** (kept). "Izveidot jaunu grupu" (šajā tēmā) gets a quiet second action "vai vienkārši pastāsti, ko meklē".
- **C3 Cits** (kept). Tēmu chips end with a quiet "+ Cits" that opens the `CategorySuggest` sheet ("Ieteikt jaunu tēmu").
- **C4 Grupas lapa** (restated 9 Nov). The category line L1 / L2 / city is three links, each to its town square.

## Verification (when built)
- Typecheck, eslint on changed files, `i18n:check`, `ui:check` and the build.
- In the browser, with users A, B and C in lv and en at 360-1920 px:
  1. A posts a Meklē card on Spēles · Šahs · Jelgava; it shows there, on Spēles · Šahs and on Spēles. Spēles · Jelgava and Jelgava alone show the normal board.
  2. On Spēles, "Pastāsti, ko meklē" asks for tēma and city; on Spēles · Šahs only for the city.
  3. B taps "Es arī"; A is notified, taps "Izveidot grupu ar viņiem" and the wizard opens prefilled.
  4. Šahs + Go merges the cards; no combo room is created.
  5. A fourth active card is refused; a report reaches the admin queue.
  6. A tagged group appears with its public event; a members-only post stays hidden. Its group page's three links open the three levels.
  7. B follows Spēles · Šahs; it shows in Manas grupas; only one `ChatRoom` row exists for it.
  8. Signed out sees counts only.
  9. A group owner applies to moderate the city room and a site admin approves; a site admin appoints a moderator to Spēles.
- For K3: chat in realtime on the site and in Element X; an upper room lists its child rooms; a moderator deletes a message and mutes someone.
- Smoke and visual tests: only the board screens with a filter the spec lists may differ.
