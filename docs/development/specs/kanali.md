# Kanāli: a home for each sub-category in each city

> Status 9 Nov 2026: **the owner decisions of 9 Nov (revised) replace the earlier design; the rest is still a draft.** Going live (domain, backups, legal pages, Jelgava promotion) is out of scope for now. The goal is to get the site to the point where going live *can* be considered. The first real audience is planned to be Jelgava, reached through the city newspaper, so expect casual internet users.

## Context
Most people won't create a group, but they still want to find others interested in the same topic in the same place.

A **komūna** (internal name: kanāls, "channel") is the **town square** for one tēma (L2 category) in one city, for example "Šahs Jelgavā". It is in the spirit of mIRC public channels and Couchsurfing city groups:
- It is a **local message board** ("Meklē" cards) plus **chat**, where people from the different groups and the merely interested hang out and talk.
- It has **no events of its own.** Events are always created by a group (organisers have a group under the komūna). A tournament between groups is an event of the organising group, shown on the komūna.
- It shows once it has at least one Meklē card or one group; a page with nothing is hidden (no "2 to open" gate).
- Owners and admins of a child group can **apply to moderate**; a site admin approves or declines and keeps more power than moderators.
- **Chat runs on Matrix,** self-hosted. We don't build our own chat engine and don't depend on an outside service.
  - People talk on our site, in our own chat panel; the Matrix phone apps (Element X, FluffyChat) are optional.
  - A Discord bridge is possible later; it is not planned.
- The page uses the **group page frame** (head tile with picture, side menu), with the tabs Sākums, Saruna, Pasākumi, Grupas, Cilvēki.

## Facts from the code survey that shape the design
- `Group.categoryId` must be L1 (`taxonomy.service.ts:712`). L2 reaches a group only through `Group.tags`.
  - So a komūna is **its own model**.
  - Its child groups are **derived**, never stored: PUBLIC, unhidden groups tagged with that L2 (or its L3 children) in the komūna's city.
- The site has no chat for a whole group. Matrix fills that gap, so no group-chat code of our own is needed.
- `Event.visibility` and `Post.visibility` exist. The Pasākumi tab shows only `PUBLIC` events of the child groups.

## Order of work (project "Kanāli", stages K1-K3)
1. **K1 Matrix spike** (no release, nothing pushed):
   - Run continuwuity locally or on the media box, with a throwaway server name.
   - Create one L1 Space > L2 Space > city room by script.
   - Put a bare chat panel built on `matrix-js-sdk` into a localhost test page.
   - It answers four questions: how heavy the server is, how the chat feels, how accounts and login work, and how moderation maps.
2. **K2 komūna without chat:** Meklē cards and "Es arī", the page and its tabs (the Saruna tab stays hidden), the one-line bar, wizard prefill, moderator applications, reports. No placeholder where chat will go.
3. **K3 Matrix chat:**
   - Accounts are created by our site; a room for each komūna; our chat panel in the Saruna tab (members only).
   - Moderators mapped to room power levels; reports work on messages.
   - Rooms are not `world_readable` and allow no guest access, so signed-out visitors see counts only.

## K2 detail (draft)
**Data,** one additive migration:
- `Channel`: `categoryId` (an L2 category), `city` (slug). `@@unique([categoryId, city])`. No `openedAt`.
- `ChannelMember`: `role MEMBER|MODERATOR`, `joinedAt`. "Mani interesē" is a light follow; otherwise one level of membership.
- `ChannelSeek(channelId, authorId, text, expiresAt)` and `ChannelSeekMeToo(seekId, userId)`; about 30 days; max 3 active cards per person.
- `ChannelModRequest`: `channelId`, `userId`, `groupId` (the child group that qualifies them), `status PENDING|APPROVED|DECLINED`, `decidedById?`.

**Code:**
- `lib/services/channel.service.ts` (context, follow, leave, seeks, child groups, events, moderator requests).
- `actions/channel-actions.ts`.
- Route `app/[locale]/[l1Slug]/kanals/[l2Slug]/[city]/`, with the group page frame and segments for the tabs.
- The `--accent` comes from the L2's parent L1 in a server `<style>` block.

**Entry points:**
- On the board, when one tēma and one city are selected and the komūna has content, a one-line bar above `GroupResults`.
- On the group page, a link "Fotogrāfijas komūna Valmierā →".
- Wizard prefill: `create/page.tsx` reads `?city=&tag=`, and the wizard gets `initialCity` and `initialTags`.

**Notifications:** `CHANNEL_NEW_GROUP` (in the email digest), the "Es arī" notification to a card's author, `CHANNEL_MOD_REQUEST` (to admins), `CHANNEL_MOD_DECISION`. No `CHANNEL_OPENED`.

**Reports:** site admin handles them in one queue (groups, Meklē cards, later chat messages). Every card has a report action.

**Admin:** `app/[locale]/admin/kanali/` for moderator requests, the report queue, revoking moderators and closing a komūna.

## Defaults taken (open to change)
- Public name **komūna**; internal name Kanāls / "Channel".
- Komūnas exist only at L2 x city.
- A komūna has no events or sections of its own. Commitment lives in groups.
- Joining a group doesn't remove you from the komūna.
- Komūnas work in every city; there is no home city.
- "My komūnas" extends the existing my-groups page (not the board).

## Decided 8 Nov (owner), still standing
- **Signed-out sees counts only:** no faces, no author names on Meklē cards, no chat.
- **Fixed words** (revised 9 Nov: use the site's existing ones): L2 is "tēma" ("+ Cits" chip, "Ieteikt jaunu tēmu", "šajā tēmā"). "Jaunumi" is only for group announcements; the feed is "Pasākumi" plus "No grupām". One "Dalīties". One joining verb: "Mani interesē"; the exit is "Vairs neinteresē".
- **Public name "komūna"** (9 Nov; "Kanāls" stays internal in spec and admin). User-facing: the title "Šahs Jelgavā", the group link "Fotogrāfijas komūna Valmierā →".
- **Suggesting a tēma** reuses the `CategorySuggest` sheet; visible to admins only until approved (`CategoryStatus` `PENDING_REVIEW`).
- **"Es arī" count** is visible only to the card's author. No "vēl N dienas".
- Rejected: a Kanāli tab in the title switch and the komūna as the first grid card (the chips are the navigation).
- **Districts (apkaimes):** komūnas stay city-level; a district is an optional place detail (`District(citySlug, slug, nameLv, nameEn)` and a nullable `district` on Group, Event, ChannelSeek) with a filter chip inside a komūna. District sub-komūnas only later.

## Decided 9 Nov, revised (owner)
1. **Success is people meeting in person.** Measures, in order: events in Jelgava with 2 or more going; Meklē cards answered ("Es arī") within a week; groups started from a card or komūna. Pilot target for the first 2 months: 10 meetings, half of the cards answered.
2. **A komūna is the town square** for one tēma in one city: a local message board (Meklē cards) plus chat, where people from the different groups and the interested hang out and talk. **No events of its own:** every event is created by a group, and a tournament between groups is an event of the organising group, shown on the komūna.
3. **Matrix chat is back** (K1 spike, K2 komūna without chat, K3 chat) and **moderators are back** (owners and admins of child groups apply, a site admin approves; `ChannelModRequest` and `CHANNEL_MOD_*` restored).
4. **No 2-to-open gate** (kept): a komūna page shows once it has at least 1 Meklē card or 1 group; pages with nothing are hidden. The first action is "Pastāsti, ko meklē"; "Mani interesē" is the lighter follow.
5. **Meklē leads to a group, not a DM** (kept). No "Rakstīt". When others tap "Es arī", the author gets a notification and "Izveidot grupu ar viņiem", which opens the wizard prefilled `?city=&tag=` and invites them. Max 3 active cards per person; each card has a report action.
6. **The bar is one line** (kept): "2 cilvēki Jelgavā meklē fotogrāfijas biedrus → Skatīt". No faces, no city-list variant.
7. **Seeding** (kept). Before the article, the owner and 2-3 Jelgava organisers each start a real group with one dated event. Article topics: šahs un galda spēles, pastaigas/nūjošana, fotogrāfija, koris, skriešana, jaunie vecāki. The article links to the board filtered to Jelgava.

## Ekrāni un lietotāju stāsti
Drawing "Komūna" (`kanali/channel.html`): one full page in the group page frame (head with picture: "Šahs Jelgavā", "Komūna · 14 cilvēki", Mani interesē / Vairs neinteresē), each tab drawn once in member view, then three short states. Rule: a visit never makes you a member; every step in is a tap.
- **A1 Sākums.** The Meklē board (cards, "Es arī", report, the 3-card limit) and the next group events.
- **A2 Saruna.** Chat for members only, moderators marked; the `ChatPanel` look. Hidden in K2.
- **A3 Pasākumi.** The child groups' public events; a tournament between groups is the organiser group's event.
- **A4 Grupas.** The groups in this tēma and city, and "Izveidot grupu".
- **A5 Cilvēki.** Members with their group, moderators, and how to apply to moderate.
- **B1 Nepierakstījies.** Counts only: no names on cards, no chat. Only action: "Mani interesē".
- **B2 Tukša komūna.** Reached by a link; first-card prompt "Pastāsti, ko meklē", "Mani interesē" as the lighter step. Lists hide such pages.
- **B3 Tava kartīte pēc "Es arī".** Notification and "Izveidot grupu ar viņiem" (wizard prefilled, respondents invited).

## Ieeja no esošās struktūras
URL: `/[l1]/kanals/[l2]/[city]`, e.g. `/lv/hobiji/kanals/fotografija/jelgava`. Sidebar unchanged. Drawing "Ieeja no saraksta" (`kanali/board.html`).
- **C1 Komūnas josla.** With a tēma and a city chosen and content in that komūna, one line between the chips and the grid: "2 cilvēki Jelgavā meklē fotogrāfijas biedrus → Skatīt". With nothing there, no bar shows. Title switch stays "Grupas · Pasākumi".
- **C2 Izveides kartīte.** "Izveidot jaunu grupu" (šajā tēmā) gets a quiet second action "vai vienkārši pastāsti, ko meklē".
- **C3 Cits.** Tēmu chips end with a quiet "+ Cits" that opens the `CategorySuggest` sheet ("Ieteikt jaunu tēmu").
- **C4 Grupas lapa.** Group head shows "Fotogrāfijas komūna Valmierā →" under the category line.

## Verification (when built)
- Typecheck, eslint on changed files, `i18n:check`, `ui:check` and the build.
- In the browser, with users A, B and C in lv and en at 360-1920 px:
  1. A posts a Meklē card; the komūna page appears and the board bar shows.
  2. B taps "Es arī"; A is notified, taps "Izveidot grupu ar viņiem" and the wizard opens prefilled.
  3. A fourth active card is refused; a report reaches the admin queue.
  4. A tagged group appears with its public event; a members-only post stays hidden.
  5. Signed out sees counts only.
  6. A group owner applies to moderate and a site admin approves.
- For K3: chat in realtime on the site and in Element X; a moderator deletes a message and mutes someone.
- Smoke and visual tests: only the new komūna screens may differ.
