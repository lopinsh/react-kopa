# Kanāli: a home for each sub-category in each city

> Status 8 Nov 2026: **features still under discussion, nothing approved.** Going live (domain, backups, legal pages, Jelgava promotion) is out of scope for now. The goal is to get the site to the point where going live *can* be considered. The first real audience is planned to be Jelgava, reached through the city newspaper, so expect casual internet users.

## Context
Most people won't create a group, but they still want to find others interested in the same topic in the same place.

A **Kanāls** (channel) is a site-owned space for one L2 category in one city, for example "Šahs · Jelgava" (Chess · Jelgava). It is in the spirit of mIRC public channels and Couchsurfing city groups:
- It opens once **2 people** have tapped "Mani interesē" (I'm interested).
- It stays open as the **parent** of the groups in that topic and city.
- It is the topic's home: people, chat, its groups, and a feed of their public events and announcements.
- Owners and admins of a child group can **apply to moderate** it. Site admins approve or decline, and keep more power than moderators.
- **Chat runs on Matrix,** self-hosted. We don't build our own chat engine and don't depend on an outside service.
  - People talk on our site, in our own chat panel.
  - The Matrix phone apps (Element X, FluffyChat) are optional.
  - A Discord bridge is possible later; it is not planned.

## Facts from the code survey that shape the design
- `Group.categoryId` must be L1 (`taxonomy.service.ts:712`). L2 reaches a group only through `Group.tags`.
  - So a channel is **its own model**.
  - Its child groups are **derived**, never stored: PUBLIC, unhidden groups tagged with that L2 (or its L3 children) in the channel's city.
- The site has no chat for a whole group. Matrix fills that gap, so no group-chat code of our own is needed.
- `Event.visibility` and `Post.visibility` exist. The feed shows only `PUBLIC` items.

## Order of work (project "Kanāli", stages K1–K3)
1. **K1 Matrix spike** (no release, nothing pushed):
   - Run continuwuity locally or on the media box, with a throwaway server name.
   - Create one L1 Space › L2 Space › city room by script.
   - Put a bare chat panel built on `matrix-js-sdk` into a localhost test page.
   - It answers four questions: how heavy the server is, how the chat feels, how accounts and login work, and how moderation maps.
2. **K2 channels without chat:** interest, opening at 2, the channel page, groups and feed, and moderator applications. A "Drīzumā" ("Soon") placeholder stands where chat will go.
3. **K3 Matrix chat:**
   - Accounts are created by our site.
   - A room for each channel.
   - Our chat panel on the channel page.
   - Moderators mapped to room power levels.
   - Reports work on messages.

## K2 detail (draft)
**Data,** one additive migration:
- `Channel`: `categoryId` (an L2 category), `city` (slug), `openedAt?` (null until the second member joins). `@@unique([categoryId, city])`.
- `ChannelMember`: `role MEMBER|MODERATOR`, `joinedAt`. "I'm interested" is simply a membership in a channel that isn't open yet.
- `ChannelModRequest`: `channelId`, `userId`, `groupId` (the child group that qualifies them), `status PENDING|APPROVED|DECLINED`, `decidedById?`.

**Code:**
- `lib/services/channel.service.ts` (context, interest, leave, child groups, feed, moderator requests).
- `actions/channel-actions.ts`.
- Route `app/[locale]/kanals/[l2Slug]/[city]/`.
- The `--accent` comes from the L2's parent L1 in a server `<style>` block.

**Entry points:**
- On the board (`(discovery)/page.tsx`), when one L2 and one city are selected, a line above `GroupResults`.
- On the group page, a "Kanāls: …" link.
- Wizard prefill from the channel: `create/page.tsx` reads `?city=&tag=`, and the wizard gets `initialCity` and `initialTags`.

**Notifications:**
- `CHANNEL_OPENED`
- `CHANNEL_NEW_GROUP` (in the email digest)
- `CHANNEL_MOD_REQUEST` (to admins)
- `CHANNEL_MOD_DECISION`

**Admin:** `app/[locale]/admin/kanali/` for moderator requests, revoking moderators and closing a channel.

## Defaults taken (open to change)
- Name: **Kanāls** / "Channel".
- Channels exist only at L2 × city.
- A channel has no events or sections of its own. Commitment lives in groups.
- Joining a child group doesn't remove you from the channel.
- Channels work in every city.

## Decided 8 Nov (owner)
- **First interested person** sees "Tu esi pirmais" ("You're the first") plus **Uzaicināt draugu** (Invite a friend) and Kopēt saiti (Copy link), with nearby channels below. There is a "Vairs neinteresē" ("Not interested anymore") exit.
- **One level of membership.** You are in or out. Chat notifications are off by default; new groups and events are on.
- **"Meklē" ("Looking for") cards are in K2.**
  - A pinned card lives about 30 days.
  - Others tap "Es arī" ("Me too") or message the author.
  - Data: `ChannelSeek(channelId, authorId, text, expiresAt)` and `ChannelSeekMeToo(seekId, userId)`.
- **Cities are free.** You can join channels in any city, and there is no home city.
- **"My channels" extends the existing my-groups page** (not the board).

**Districts (apkaimes), agreed by owner 8 Nov:** channels per city; district sub-channels only later, starting with Rīga if needed. Jelgava and most cities have districts (see jelgavas-ielas.lv/apkaimes). The leaning:
- Channels stay **city-level**. Splitting small populations would make "2 to open" harder.
- A district becomes an optional **place detail** on groups, events and Meklē cards ("Pārlielupe"), with a district filter chip inside a channel.
- Data: `District(citySlug, slug, nameLv, nameEn)`, plus a nullable `district` on Group, Event and ChannelSeek.
- District sub-channels come later, only if a city channel grows too big.

Mockup (8 Nov): five screens, see "Ekrāni un lietotāja stāsti" (A0, A1, A2, B0, B1). The open state shows people, Meklē cards, groups here, Jaunumi (events and posts) and Saruna (chat).

## Ekrāni un lietotāja stāsti
Rule: a visit never makes you a member; A0 and B0 are browsing views, every step in is a tap.
- **A0 Pirms atvēršanas, skatās.** Anna in Jelgava browses Šahs. She sees "Kanāls vēl nav atvērts · interesē 0 no 2", what a channel is, and groups in nearby cities. One action, "Mani interesē"; nothing happens until she taps.
- **A1 Pirms atvēršanas, ieinteresēta.** After the tap: "Tu esi pirmais", Uzaicināt draugu, Kopēt saiti, Vairs neinteresē. She is notified when the 2nd person comes.
- **A2 Jauna tēma.** Jānis wants Go but the topic (L2) doesn't exist. "Ieteikt tēmu" gives him a channel without creating a group. The topic uses the existing `CategoryStatus` `PENDING_REVIEW`: visible to him and those he invites, public once an admin approves.
- **B0 Atvērts, skatās.** People count, Meklē cards, groups, Jaunumi; chat readable, not writable. Only action: "Pievienoties".
- **B1 Atvērts, dalībnieks.** Writes in chat, adds a Meklē card, taps "Es arī", has "Pamest".

## Ieeja no esošās struktūras
URL: `/[l1]/kanals/[l2]/[city]`, e.g. `/lv/hobiji/kanals/fotografija/jelgava`. Sidebar unchanged. Drawing: "Ieeja no saraksta" (`kanali/board.html`).
- **C1 Kanāla josla.** Tapping a topic chip (Fotogrāfija) shows a full-width bar between the chip row and the grid, only for topics that have a channel. With Kur=Jelgava: "Fotogrāfija · Jelgava kanāls · 12 cilvēki · 2 meklē", faces, Atvērt; not yet open: "interesē 1 no 2", Mani interesē; no city: list "Rīga 24 · Valmiera 6 · Jelgava 1/2", each a link. Title switch stays "Grupas · Pasākumi".
- **C2 Izveides kartīte.** "Izveidot jaunu grupu" gets a quiet second action "vai vienkārši Mani interesē".
- **C3 Cita tēma.** Topic chips end with a quiet "+ Cita tēma" that opens the "Ieteikt tēmu" sheet (name, city, Ieteikt; an admin approves).
- **C4 Grupas lapa.** Group head shows the link "Kanāls: Fotogrāfija · Valmiera" under the category line.

Rejected (owner, 8 Nov): a Kanāli tab in the title switch and the channel as the first grid card. Channels double as L2 tags and the chips are already the navigation.

## Verification (when built)
- Typecheck, eslint on changed files, `i18n:check`, `ui:check` and the build.
- In the browser, with users A, B and C in lv and en at 360–1920 px:
  1. A taps "interested" and sees "you're the first".
  2. B taps it, the channel opens, and A is notified.
  3. A tagged group appears with its public event and post. A members-only post stays hidden.
  4. That group's owner applies to moderate, and a site admin approves.
- For K3: chat in realtime on the site and in Element X, and a moderator deletes a message and mutes someone.
- Smoke and visual tests: only the new channel screens may differ.
