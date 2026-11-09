# Kanāli: a home for each sub-category in each city

> Status 9 Nov 2026: **the owner decisions of 9 Nov replace the earlier design; the rest is still a draft.** Going live (domain, backups, legal pages, Jelgava promotion) is out of scope for now. The goal is to get the site to the point where going live *can* be considered. The first real audience is planned to be Jelgava, reached through the city newspaper, so expect casual internet users.

## Context
Most people won't create a group, but they still want to find others interested in the same topic in the same place.

A **Kanāls** (channel) is a site-owned page for one L2 category ("veids") in one city, for example "Šahs Jelgavā". It is a place to **find people**, not to talk (Decided 9 Nov):
- It shows once it has at least one Meklē card or one group; a page with nothing is hidden.
- It lists "Meklē" cards, the groups in that topic and city, and their public events.
- Talking happens in groups (Ziņas), not in the channel.

## Facts from the code survey that shape the design
- `Group.categoryId` must be L1 (`taxonomy.service.ts:712`). L2 reaches a group only through `Group.tags`.
  - So a channel is **its own model**.
  - Its child groups are **derived**, never stored: PUBLIC, unhidden groups tagged with that L2 (or its L3 children) in the channel's city.
- `Event.visibility` and `Post.visibility` exist. The feed shows only `PUBLIC` items.

## Order of work (project "Kanāli")
1. **K2 channels without chat:** Meklē cards, "Es arī", the channel page, groups and events, the one-line bar, wizard prefill, reports.
2. **After the pilot:** Matrix chat (the K1 spike and K3), moderator applications.

## K2 detail (draft)
**Data,** one additive migration:
- `Channel`: `categoryId` (an L2 category), `city` (slug). `@@unique([categoryId, city])`. No `openedAt`.
- `ChannelMember`: `joinedAt`. "Mani interesē" is a light follow; one level of membership.
- `ChannelSeek(channelId, authorId, text, expiresAt)` and `ChannelSeekMeToo(seekId, userId)`; about 30 days; max 3 active cards per person.

**Code:**
- `lib/services/channel.service.ts` (context, follow, leave, seeks, child groups, events).
- `actions/channel-actions.ts`.
- Route `app/[locale]/[l1Slug]/kanals/[l2Slug]/[city]/`.
- The `--accent` comes from the L2's parent L1 in a server `<style>` block.

**Entry points:**
- On the board, when one veids and one city are selected and the channel has content, a one-line bar above `GroupResults`.
- On the group page, a link "Vairāk par fotogrāfiju Valmierā →".
- Wizard prefill: `create/page.tsx` reads `?city=&tag=`, and the wizard gets `initialCity` and `initialTags`.

**Notifications:** `CHANNEL_NEW_GROUP` (in the email digest) and the "Es arī" notification to a card's author. No `CHANNEL_OPENED`, no `CHANNEL_MOD_*`.

**Reports:** site admin handles them in one queue (groups and Meklē cards). Every card has a report action.

**Admin:** `app/[locale]/admin/kanali/` for the report queue and closing a channel. No moderators, no `ChannelModRequest`.

## Defaults taken (open to change)
- Name: **Kanāls** / "Channel" (internal; users see "Šahs Jelgavā").
- Channels exist only at L2 x city.
- A channel has no events or sections of its own. Commitment lives in groups.
- Joining a group doesn't remove you from the channel.
- Channels work in every city; there is no home city.
- "My channels" extends the existing my-groups page (not the board).

## Decided 8 Nov (owner), still standing
- **Signed-out sees counts only:** no faces, no author names on Meklē cards.
- **Fixed words:** L2 is "Veids", not "tēma" ("+ Cits veids", "Ieteikt veidu"). "Jaunumi" is only for group announcements; the channel feed is "Pasākumi" plus "No grupām". One "Dalīties". One joining verb: "Mani interesē"; the exit is "Vairs neinteresē".
- **"Kanāls" is internal** (spec, admin). User-facing: the title "Šahs Jelgavā", the group link "Vairāk par fotogrāfiju Valmierā →".
- **Suggesting a veids** reuses the `CategorySuggest` sheet; visible to admins only until approved (`CategoryStatus` `PENDING_REVIEW`).
- **"Es arī" count** is visible only to the card's author. No "vēl N dienas".
- Rejected: a Kanāli tab in the title switch and the channel as the first grid card (the chips are the navigation).
- **Districts (apkaimes):** channels stay city-level; a district is an optional place detail (`District(citySlug, slug, nameLv, nameEn)` and a nullable `district` on Group, Event, ChannelSeek) with a filter chip inside a channel. District sub-channels only later.

## Decided 9 Nov (owner)
1. **Success is people meeting in person.** Measures, in order: events in Jelgava with 2 or more going; Meklē cards answered ("Es arī") within a week; groups started from a card or channel. Pilot target for the first 2 months: 10 meetings, half of the cards answered.
2. **A channel is a place to find people, not to talk.** Talking happens in groups (Ziņas). Matrix chat (the K1 spike and K3) and moderator applications move to "After the pilot". Site admin handles reports, one queue for groups and Meklē cards. `ChannelModRequest` and `CHANNEL_MOD_*` are dropped from K2.
3. **No 2-to-open gate.** A channel page shows once it has at least 1 Meklē card or 1 group; pages with nothing are hidden. `openedAt`, `CHANNEL_OPENED` and the A0/A1 split are dropped. The first action is "Pastāsti, ko meklē" (post a Meklē card); "Mani interesē" stays as the lighter follow.
4. **Meklē leads to a group, not a DM.** No "Rakstīt". When others tap "Es arī", the author gets a notification and "Izveidot grupu ar viņiem", which opens the wizard prefilled `?city=&tag=` and invites them. Max 3 active cards per person; each card has a report action.
5. **The channel bar is one line:** "2 cilvēki Jelgavā meklē fotogrāfijas biedrus → Skatīt". No faces, no city-list variant.
6. **Seeding.** Before the article, the owner and 2-3 Jelgava organisers each start a real group with one dated event. Article topics: šahs un galda spēles, pastaigas/nūjošana, fotogrāfija, koris, skriešana, jaunie vecāki. The article links to the board filtered to Jelgava.

## Ekrāni un lietotāju stāsti
Drawing "Kanāla lapa" (`kanali/channel.html`). Rule: a visit never makes you a member; every step in is a tap.
- **A0 Tukšs veids x pilsēta.** Anna opens Šahs Jelgavā; nothing is there yet. The page offers "Pastāsti, ko meklē" first and "Mani interesē" as the lighter option, with nearby places below (Ozolnieki, Jelgavas novads). Lists hide such pages; this one is reached by a link.
- **A1 Skatās, nepierakstījies.** Counts only: people count, Meklē cards without names, groups, Pasākumi, "No grupām". Only action: "Mani interesē".
- **A2 Dalībnieks.** Sees people, adds a Meklē card (up to 3), taps "Es arī" (no count unless it's their own card), can report a card or tap "Vairs neinteresē".
- **A3 Tava kartīte pēc "Es arī".** The author is notified; "Izveidot grupu ar viņiem" opens the wizard with city and veids filled and invites those who answered.
- **A4 Jauns veids.** Jānis wants Go but the veids doesn't exist. "Ieteikt veidu" opens the existing suggestion sheet (`CategorySuggest`: Nosaukums, Tēma, Ieteikt); no group is created.

## Ieeja no esošās struktūras
URL: `/[l1]/kanals/[l2]/[city]`, e.g. `/lv/hobiji/kanals/fotografija/jelgava`. Sidebar unchanged. Drawing "Ieeja no saraksta" (`kanali/board.html`).
- **C1 Kanāla josla.** With a veids and a city chosen and content in that channel, one line between the chips and the grid: "2 cilvēki Jelgavā meklē fotogrāfijas biedrus → Skatīt". With nothing there, no bar shows. Title switch stays "Grupas · Pasākumi".
- **C2 Izveides kartīte.** "Izveidot jaunu grupu" gets a quiet second action "vai vienkārši pastāsti, ko meklē".
- **C3 Cits veids.** Veidu chips end with a quiet "+ Cits veids" that opens the `CategorySuggest` sheet.
- **C4 Grupas lapa.** Group head shows "Vairāk par fotogrāfiju Valmierā →" under the category line.

## Verification (when built)
- Typecheck, eslint on changed files, `i18n:check`, `ui:check` and the build.
- In the browser, with users A, B and C in lv and en at 360-1920 px:
  1. A posts a Meklē card; the channel page appears and the board bar shows.
  2. B taps "Es arī"; A is notified, taps "Izveidot grupu ar viņiem" and the wizard opens prefilled.
  3. A fourth active card is refused; a report reaches the admin queue.
  4. A tagged group appears with its public event; a members-only post stays hidden.
  5. Signed out sees counts only.
- Smoke and visual tests: only the new channel screens may differ.
