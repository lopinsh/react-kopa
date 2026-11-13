# Kopienas (hubs)

A hub is the town square of one topic or city: an overview of the groups under it, with a message board (Ziņas) and a chat (Čats). It is not a group.

## What a hub is

- **One per Veids (L2) and sub-veids (L3)**, created with its Veids and never closed. Public name "Kopiena <Veids>" (en "<Veids> community"). Addresses follow the board: `/lv/speles/galda-speles`, a sub-veids `/[l1]/[l2]/[l3]`.
- **No followers.** You belong to a hub by being a member of one of its groups. Its number is the members of its groups ("120 dalībnieki 13 grupās").
- **Activity comes from its children** (groups, events, Ziņas, the public announcements of its groups), merged and compacted by period (Šodien, Pagājušajā nedēļā, Pagājušajā mēnesī). A hub has no events of its own. Public items are readable signed out.
- **Hub content never appears on the board.** The board shows only the hub card, which links in.
- **Admins.** Hub admins are assigned by hand; for now only site admins are.

## Hub page

- Uses the group-page frame (layout B, no side column): head tile, pages down the left, ☰ drawer below 1024 px. The head tile carries a thin duotone photo sliver in the topic tone; the one photo credit sits at the bottom of Pārskats.
- Menu: Pārskats, Grupas, Pasākumi, Ziņas, Čats; Kur last. Inner pages start with their tab bar and content, no title of their own.
- Pārskats order: Aktivitāte, Ziņas (short preview), Čats (last lines, "N tiešsaistē", Atvērt čatu), Pasākumi, Grupas; sub-hubs at the bottom as a few chips and "+N" into the board with the filters set.
- Head actions: Izveidot grupu (the wizard filled with the Veids) and Dalīties. Rakstīt ziņu lives in Ziņas.
- Lists grow in tiers: 1–4 groups are full cards, 5–16 the compact list, 17 or more the first 16 and "Vēl N grupas" into discovery with Veids and Kur set. Pasākumi use the site's day strip and calendar.

## Hub card on the board

- The first cell of the grid when a Veids is chosen (never for a Tēma alone), the size of a group card, tinted with the topic tone, without the tear-off tab. It shows "Kopiena <Veids>", the numbers, the next public event or last activity, and up to 3 sub-veidi.
- Several hubs share the cell: a parent with its children as rows, two as halves, three or more as a list "N kopienas". With exactly one city chosen, the city hub joins as an equal; a Veids with an open hub in that city links there with the city's numbers.
- "Izveidot jaunu grupu" stays the last cell.

## City

City is a second dimension beside topic. A topic × city hub ("Šahs · Jelgava") has two parents: the topic hub and the city hub.

- **Topic × city hubs.** Kur on a topic hub switches between Visas pilsētas, an open city (its hub, the city part of the address: `/lv/games/boardgames/jelgava`) and a city that is not open, which offers Pieprasīt ("N interesējas", never names). One request per person per city; an optional note becomes a public Ziņa. The second distinct person opens the hub at once; the first asker is told. A hub that is not open has no page: its address goes to the topic hub with the request sheet open. Site admins can close one (Aizvērt kopienu); groups and Ziņas stay, and two new requests open it again.
- **City hubs.** Every active city has one, "Kopiena Jelgava" at `/lv/jelgava`: the site colour as its tile, a pin as its mark, no path in the head. Pārskats (Aktivitāte, Ziņas, Pilsētas istabas), Grupas, Pasākumi, Ziņas; no Kur. Nothing is written on a city hub: its Ziņas are read-only rows grouped by Veids that link to the note on its own hub. Pilsētas istabas lists the city's open topic × city hubs, the first 16, then the city's Katalogs.

## Ziņas (hub notes)

- A Ziņa is a short plain public note ("if you are interested too, let me know"), not chat. Optional city (never defaulted; one without a city shows for every Kur) and optional group (only the author's own group in that hub). A sub-veids note also shows on the parent hub.
- It ends after 30 days; the author renews it, and a renewed one starts clean, without replies. At most 3 are active per person across the site.
- Replies are public and vanish with the Ziņa. Everyone edits and deletes only what they wrote; site admins delete anything. Ziņot on a Ziņa or a reply goes to the admin reports.
- "Rakstīt privāti" sends a chat request to the author (Ziņas › Pieprasījumi); Pieņemt opens a normal direct chat with the request text first. A declined request looks pending to the sender forever: no notice, no second request from the same Ziņa.
- On the page: an accordion row per Ziņa (closed it is one line, never bold), grouped by sub-veids, then by group; one with no group goes under "Visai kopienai".
- Signed out: no names anywhere, one button "Ienākt, lai atbildētu".

## Čats

- A public room per hub, per sub-veids and per topic × city hub, like an IRC channel list: lines, no bubbles (the look is being reconsidered in the Mājas plan). A parent never merges its children's rooms. Katalogs lists a hub's rooms by activity, with search. Group chats come later.
- Anyone signed in writes and joins a room on first open; members of the hub's groups carry a flair. Moderators are assigned by the site.
- Signed out reads the last 50 lines with names as plain text (no avatar, card or profile link) and refreshes every 30 s while visible. Signed in is live.
- A room switcher (`# Title ▾`, a bottom sheet on phones), the open rooms as tabs from `lg`.
- **Online list.** People in the room with any site tab open, moderators first. Presence is live only: a signed-in tab joins the `presence-site` channel with the user id, nothing is stored, and the privacy page says so.
- **Name card.** A tap on a name (signed in) opens a small card of the existing profile, never a separate chat profile: shared groups, "Rakstīt ziņu" (a chat request) and the profile link when it is public.
- **Mentions are the only thing that notifies.** Picking a name after `@` marks it; that person gets one bell notice per room until they read it (off by "Paziņot, kad mani piemin", never for yourself). Unread rooms show a dot, no numbers, no sound.

## Who sees what

| Ziņas | Logged out | Signed in |
|---|---|---|
| Read notes and replies | yes, no names | yes, with names |
| Reply, Rakstīt privāti, Ziņot | "Ienākt, lai atbildētu" | yes (not on your own Ziņa) |
| Edit, renew, delete | hidden | own only; site admins delete any |
| Aizvērt kopienu | hidden | site admins only |

| Čats | Logged out | Signed in |
|---|---|---|
| Read | the last 50 lines, names as plain text | live |
| Write | "Ienākt" and a read-only note | yes |
| Iestatījumi tab | hidden | yes |
| Online list | names as plain text | avatar, status, group, Mod; a name opens the name card |
| Name card, "Rakstīt ziņu" | hidden | yes; status and profile link only for a public profile; no button when requests are off |

Next: [Design](design.md).
