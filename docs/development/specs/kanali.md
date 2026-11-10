# Kanāli: hubs, the town squares of each tēma

> Status 9 Nov 2026: **the Feature ledger is the source of truth** and is updated during every conversation. Briefs, drawings and questions point at a ledger id. Discarded designs are removed from this page (git keeps the history).

## Feature ledger
Statuses: **Confirmed** (owner decided), **In progress** (still open, or my proposal the owner has not answered), **Changed** (owner changed their mind; the row names what replaced it). Updated during every conversation, not at the end.

### Model
| Id | Feature | Status | Notes |
|---|---|---|---|
| K-01 | No public name; the page shows only its title. | Changed | → K-01a. |
| K-01a | A hub's public name is **"<tēma> kopiena"**: "Šaha kopiena", "Galda spēļu kopiena", "Jelgavas kopiena" (card, page title, links). Internal word: hub. | Confirmed | 9 Nov. |
| K-02 | Separate per-city page L1 · L2 · City with 5 tabs (`channel.html`). | Changed | → K-05. |
| K-03 | Town square on the board, following the filter's zoom level (`board.html`). | Changed | → K-05. |
| K-04 | A chat room at every level, L1 included. | Changed | → K-06: L1 has no hub and no hub card, "for now". |
| K-05 | **A hub is its own page** for one Veids (L2) or sub-veids (L3), built in the group-page frame. The board shows only the hub card, which links to it. Hub content never appears on the board. | Confirmed | 9 Nov: "Hub chats reside inside the hub pages, that are created similarly to group pages." |
| K-06 | Hubs are created automatically with their L2/L3 tēma and never close. | Confirmed | 9 Nov. |
| K-07 | A hub shows (unlocks) at **2 interested people**. "Mani interesē" works like a group join request; the note is optional. | Changed | → K-58: no followers; Veids/sub-veids hubs are open from creation. The 2-person rule stays only for city hub requests (K-09a). |
| K-08 | **City is a parallel dimension.** A city room ("Šahs · Jelgava") is one room with two parents: the tēma hub and the city hub (Matrix Spaces, `m.space.child` from both). | Confirmed | 9 Nov. |
| K-09 | A city room opens with its first message. | Changed | → K-09a (9 Nov). |
| K-09a | A tēma × city hub ("Galda spēles › Šahs › Jelgava") is **created only on request**: the first person sends a message as the first interested; when a second person does the same, site admins get a notification and approve it. | Confirmed | 9 Nov, owner approved the restatement. 10 Nov: for now (prototype) the second request **opens the city hub at once**, no admin approval; admins can close it later. |
| K-09b | A hub has a **city filter** to see activity only from chosen cities. | Confirmed | 9 Nov. |
| K-10 | Each city has a city hub (Jelgava first) as a **lighter overview**: the city's activity feed and shout-outs plus the list of its city rooms; no room of its own. | Confirmed | 9 Nov. Notes: a city hub page has no city choice, only sub-districts later (K-11). |
| K-11 | Districts (one level, Jelgava › Pārlielupe). | Changed | 9 Nov: not in Kanāli yet; a later release of their own. |
| K-12 | Several Veidi chosen on the board: content merges, no room for the combination; **one hub card** first in the grid that links to each selected Veids's hub, so groups aren't pushed out. | Confirmed | 9 Nov. |
| K-19 | A kanāls shows once it has 1 Meklē card or 1 group (no "2 to open" gate). | Changed | → K-07 (hubs unlock at 2 people). Content itself is never hidden. |
| K-29 | L2 is the root of the chat tree; L1 gets no chat "for now" ("cautious, currently against it"). | Confirmed | 9 Nov. |
| K-39 | A hub is the town-square message board and overview for its tēma. | Confirmed | 9 Nov: "As we agreed before - this is a town square message board/overview". |
| K-43 | Multi-city kanāli later at L1 · L2 ("Spēles · Šahs"). | Changed | → K-05/K-06: hubs are nationwide from the start; cities are rooms (K-08). |
| K-44 | Going live (domain, backups, legal pages, Jelgava promotion) is out of scope for now. | Confirmed | 9 Nov. |

### Board and hub card
| Id | Feature | Status | Notes |
|---|---|---|---|
| K-13 | The hub card is the **first** card in the grid; "Izveidot jaunu grupu" stays the **last**. | Confirmed | 9 Nov. |
| K-14 | One hub card per filter, always matching it; sub-veidi hubs are reached inside the hub (choosing the Šahs chip shows the Šahs hub card). | Confirmed | 9 Nov. |
| K-15 | The hub card is the size of a group card, but styled differently. | Confirmed | 9 Nov. |
| K-16 | The hub card shows activity numbers; locked text "1 cilvēks vēlas šeit sākt grupu". | Changed | → K-16a. |
| K-16a | The hub card shows **just the hub's name ("Šaha kopiena") as a link, with some visual flair**. | Changed | → K-74 (10 Nov notes: the empty card space is wasted). |
| K-17 | No "Vēl 1, un atveras čats" text. | Confirmed | 9 Nov: "redundant". |
| K-73 | Topic chips: there can be too many Veidi/sub-veidi; unselected chips follow common practice, selected chips stay as they are. | Confirmed | 10 Nov note cmwabl0ip. Look at how other projects do it before drawing. 10 Nov (options page, note cmwah2l9i): option B, chips grouped by Veids (a Veids opens its sub-veidi); long lists use the site's existing drop-down with a search box on top. |
| K-74 | **Always one hub card.** One hub: as much about the hub as fits (overview: latest activity, groups, members). Two hubs: the same, split in two. Three or more: a list of the hubs. | Confirmed | 10 Nov (notes cmwabmk9e, cmwabpdk9 and answer). |
| K-75 | What the hub card shows and how two hubs on one card are kept apart (now too bold, they clash; smaller text, more separation). | Confirmed | 10 Nov notes cmwabmk9e, cmwabo309: look at how other projects do it first. 10 Nov (note cmwah5qdh): card content = option B: name, "120 dalībnieki 13 grupās", next public event or "Pēdējā aktivitāte pirms 2 d.", up to 3 sub-veidi chips "+N"; no online count. Two hubs on a card: still to discuss (parent and child, note cmwah998r). 10 Nov answer, two or more hubs on a card: picked parent + child → the parent hub is the main block (bigger), its children compact rows under it; unrelated or sibling hubs split the card equally; 3+ is a list (K-74). |
| K-18 | The "Mani interesē" sheet text: "Šobrīd esi pirmais. Atstāj ziņu citiem, lai atrastu līdzīgi domājošos." | Changed | 10 Nov: dropped. No "you are first" text anywhere; the city hub request window only asks for the optional note (K-18a). |
| K-18a | The optional note left with "Mani interesē" is a shout-out (K-26), a public note on the hub. | Confirmed | 9 Nov: "Those are public announcements. Like shout outs." |
| K-18b | Notes become the first chat lines when the hub unlocks. | Changed | My idea, drawn without the owner's OK; replaced by K-18a. |
| K-18c | Locked sub-veidi hubs listed inside the parent hub ("Go · 1 interesējas") as an invitation to be the second. | Changed | Veids hubs are never locked (K-58); pending city hub requests may be listed instead: In progress. |
| K-18d | The board "town-square view" (`?view=cats`, switch "Čats \| Grupas \| Pasākumi"). | Changed | → K-05: the hub card opens the hub page. |

### Hub page content
| Id | Feature | Status | Notes |
|---|---|---|---|
| K-20 | Sub-veidi (L3) of this hub. | Confirmed | 9 Nov. |
| K-21 | The groups in this hub. | Confirmed | 9 Nov. |
| K-22 | The latest **public** announcements of those groups. Announcements are practical ("someone forgot their phone after our event"). | Confirmed | 9 Nov. |
| K-23 | The latest public events of those groups. The hub has no events of its own. | Confirmed | 8-9 Nov. |
| K-24 | The latest public blog posts of those groups. **Blog post is a new group post type**, built in its own release **after hubs**; hubs launch with announcements and events. | Confirmed | 9 Nov. |
| K-24b | A blog post's author chooses **public or members-only**. A public post shows in the hub feed as an excerpt with its group and member shown and linked; tapping it opens the full blog post page in that group. Public posts, events and announcements are visible to signed-out visitors (names included). | Confirmed | 9 Nov. |
| K-24a | **Activity feed:** the hub page shows its groups' public announcements, events and blog posts as one merged live feed, organized and compact by period: "Šodien: 3 grupas izveidotas, 32 jauni biedri, 3 jauni raksti, 3 paziņojumi", then "Pagājušajā nedēļā", "Pagājušajā mēnesī". | Confirmed | 9 Nov: "a bit of both" (merged feed + activity numbers). Exact rows, what opens on tap: In progress. |
| K-25 | The hub shows two numbers: followers and group members. | Changed | → K-25a. |
| K-25a | The hub's number is the **members of its groups**. | Confirmed | 9 Nov (K-58). |
| K-26 | **Shout-outs:** public notes by individuals on the hub ("Oskars: gribētu atrast kādu, ar ko spēlēt domino"). Not chat: chat is real-time, for whoever is there now. | Confirmed | 9 Nov. Replaces the Meklē cards. |
| K-27 | Shout-outs are **plain post-it notes** on the board's wall ("If you are interested too, let me know. We could start a group together"). No "Es arī", no "Izveidot grupu ar viņiem". | Confirmed | 9 Nov: "Yes, plain notes. Announcements really are plain post-it notes." |
| K-27a | Shout-outs expire after 30 days (the author can renew); max 3 active per person across the site; each has "Ziņot". | Confirmed | 9 Nov. |
| K-76 | Member line: "120 dalībnieki 13 grupās". | Confirmed | 10 Nov note cmwabq1gv. |
| K-77 | Shout-outs are called **"Ziņas"** on the hub (same word as the inbox; the page tells them apart) and are more compact. | Confirmed | 10 Nov note cmwac2417 and answer. |
| K-83 | A Ziņa can be answered both ways: public replies under it and a private "Rakstīt ziņu" (chat request in the Ziņas inbox, K-82). | Confirmed | 10 Nov answer. |
| K-87 | Replies to your Ziņa and chat requests reach you through the existing site notifications (bell / Jaunumi, email if on); nothing new. | Confirmed | 10 Nov answer. |
| K-78 | The activity feed as drawn on "Jelgavas kopiena" is the right direction. | Confirmed | 10 Nov note cmwac580g: "not final, but this is good". |
| K-79 | On phones the hub content is more compact, done smartly from what successful projects do. | In progress | 10 Nov note cmwac7myh (drawing C). Look at others first. 10 Nov (note cmwaha91f): activity feed as one-line rows (option A); tapping a row expands it (accordion). Ziņas rows not yet commented. 10 Nov answer: Ziņas look like the activity feed: an excerpt that expands on tap (accordion); all Ziņas on the Ziņas page. |
| K-28 | Layout of the hub page. | In progress | 9 Nov: options A (one page), B (Pārskats \| Čats pages) and C (Discord columns) drawn; owner: "No single version is ok for now, but there are good ideas." 10 Nov: owner skipped the question for now (also my combined-layout proposal); stays open until the owner picks it up. 10 Nov notes: A (one page) rejected on phone and desktop. Navigation follows the group page's logic: left vertical menu and horizontal sections (not its content); Čats is a page in the left menu with its own inner navigation, still to design. Horizontal sections = the group page's in-page tab bar, adapting to the page (Pasākumi: Gaidāmie / Pagājušie; Informācija: the group's own sections like Par mums, Kontakti). Čats: an mIRC-type chat with tabs such as a directory and preferences (→ K-81). 10 Nov answer: hub menu pages Pārskats, Grupas, Pasākumi, Ziņas, Čats (owner asks if anything is missing). Extra pages (Par kopienu, Cilvēki): skipped for now. Open: how to reach sub-veidi hubs and city hubs from inside a hub (the "Kur" filter; a tree?). 10 Nov: owner: "we made a lot of choices, we need to see how it looks" → one combined drawing from the ledger, then more detail. |
| K-84 | **Moving between hubs:** no tree. The hub head shows the path "Spēles › Galda spēles › Šahs" (each part links up) and under it the board's two drop-downs (K-73): Veids (sub-veidi) and Kur (cities: a city hub opens, a city without one offers "Pieprasīt", K-09a). Picking one opens that hub. | Changed | 10 Nov answer. Notes: the Kur drop-down is liked for location; the Veids drop-down works but does not belong in the head; sub-veidi (L3) are just listed as chips that open their own hub (K-90). → K-90 (Veids drop-down removed from the head). |
| K-85 | Hub head actions: "Rakstīt ziņu" (a public Ziņa), "Izveidot grupu" (wizard pre-filled with this Veids), "Dalīties". | Confirmed | 10 Nov answer. 11 Nov notes on the combined drawing: the head keeps only Izveidot grupu and Dalīties; Rakstīt ziņu moves out of the head (where: K-90). → K-90: head = Izveidot grupu + Dalīties. |
| K-86 | In-page tab bars: Grupas = Visas / Jaunās / Tuvumā; Pasākumi = Gaidāmie / Pagājušie; Ziņas = Visas / Manas; Čats = open rooms + Katalogs + Iestatījumi. | Confirmed | 10 Nov answer (drawn as defaults, adjustable on the drawing). 11 Nov: Grupas tabs become Visas / Jaunās (Tuvumā dropped: Kur already picks the city). |
| K-89 | Pārskats order (phone and desktop): Aktivitāte, Ziņas, Pasākumi, Grupas (groups already show on the board; events matter more here). | Confirmed | 10 Nov answer. |
| K-90 | Head and filters after the combined drawing: city choice moves just under the page tabs and filters the whole hub; sub-veidi as chips somewhere; Rakstīt ziņu out of the head. | Confirmed | Notes cmwalzgo3, cmwam3jtk: exact places to discuss. 11 Nov answers: **one Kur drop-down just under the page tabs** filters every hub page (no city chips); sub-veidi chips only on Pārskats (each opens its hub); Rakstīt ziņu sits in the Ziņas sections (Ziņas page top, beside the Ziņas heading on Pārskats). |
| K-91 | **Desktop must use the width:** Pārskats, Pasākumi and Ziņas are now one long column like the phone; desktop needs its own layout. | In progress | Notes cmwam17n8, cmwam5mxx, cmwam7ia2. 11 Nov: research desktop layouts first; owner curious about a dashboard grid. 11 Nov: drawn as Variants A (main column + sticky side rail) and B (panel grid) in `hub.html`; owner picks. |
| K-92 | Liked in the combined drawing: the phone sticky ☰ bar after the head scrolls away, the Kur drop-down, the Pieprasīt window, the name card, Grupas tabs, Ziņas, the signed-out idea. | Confirmed | Notes cmwam1vfs, cmwam2l6x, cmwam3usb, cmwamd821, cmwam4sur, cmwam7ia2, cmwamir07. |
| K-93 | Hub Pasākumi reuse how the site already shows group events (compare first). | Confirmed | Note cmwam6l0z. |

### Chat
| Id | Feature | Status | Notes |
|---|---|---|---|
| K-80 | The chat idea (room list + chat) is liked; it needs a design review before it is final. | In progress | 10 Nov note cmwabz3xr. |
| K-81 | Čats inner navigation: an mIRC-type chat page with its own tab bar (rooms/directory, preferences, …). | Confirmed | 10 Nov answer; researched with K-73..K-79 before drawing. 10 Nov (note cmwahcjyw): room switcher (option C) is the direction; many rooms → drop-down with built-in search, as in K-73. To discuss. 10 Nov answer: phones use the room switcher; desktop has the switcher plus tabs for the rooms you have open (mIRC style). 10 Nov answer, Iestatījumi: notifications per room, look (compact, times), who can send you a chat request; more ideas from Discord to discuss (flair). 10 Nov answer, flair: group badge, role badge, status line; a profile card on tap is liked but must not clash with the existing profile (avatar, status already there). 10 Nov answer: tapping a name opens a small card of the existing site profile (avatar, status, shared groups, "Rakstīt ziņu", link to the profile); no separate chat profile; the status line is the profile status. 11 Nov: Iestatījumi holds global chat settings only (no per-room settings). Chat lines: WhatsApp-style, messages full width, one small meta line (name, flair, time) under the last message of a run. |
| K-82 | Čats has a member list: who is here and who is online; members can start a private chat, but the other person approves first. | Confirmed | 10 Nov note cmwahe642. Details to discuss (K-42 moderation still later). 10 Nov answer: the member list shows the people in the room now (online first, others as recently here). Where private chat happens: open (owner worries Matrix private chats would undercut the site's Ziņas inbox). 10 Nov: **private chat lives only in the Ziņas inbox.** Tapping a person in Čats offers "Rakstīt ziņu": a chat request lands in their Ziņas inbox (accept / decline), the conversation continues there. Matrix holds only the public rooms; our client offers no private Matrix rooms (server may refuse them too). 10 Nov idea: maybe the member list shows the hub's people with the inactive ones as offline (Discord style) instead of only those in the room now: to discuss. 10 Nov: "online" = active anywhere on the site (green dot). Online now is shown for sure; how people find each other again after chatting is open: owner does not want a friend system ("becomes Facebook"). 10 Nov answer: the member list shows **online now only**; finding someone again = your Ziņas inbox and searching chat lines by name; no friends, no saving people. |
| K-88 | Čats "Katalogs" lists this hub's rooms (hub room, sub-veidi rooms, city rooms), sorted by activity, with search; opening one adds it to your tabs. | Confirmed | 10 Nov answer. |
| K-30 | Matrix, self-hosted, in our own chat panel; Element/FluffyChat optional. | Confirmed | 8-9 Nov. |
| K-31 | **Chat section built like Discord:** a public room for the hub, a room per sub-veids (L3), city rooms; the user moves between the public child rooms from a room list. | Confirmed | 9 Nov. |
| K-32 | No merged chat: a parent has its own room and lists its children (like an mIRC channel list). | Confirmed | 9 Nov. |
| K-33 | Chat is read-only until "Mani interesē". | Changed | → K-33a. |
| K-33a | **Anyone signed in** can write in hub chats and leave notes; members of the hub's groups carry a flair showing they "live here". | Confirmed | 9 Nov. |
| K-34 | The chat shows the people list: who is in the room and who is online now. | Confirmed | 9 Nov. Notes: on desktop the online list must be visible beside the chat (mIRC/Discord); phone needs its own member-list view (K-91). |
| K-35 | The chat look: mIRC lines (left-aligned, no bubbles). | Confirmed | 9 Nov: "more compact". |
| K-36 | Every group has a members-only chat. | Confirmed | 9 Nov. |
| K-37 | Before a tēma has groups, interested people coordinate in the hub chat, then start a group and continue there privately. | Confirmed | 9 Nov. |
| K-38 | Moderators: our site assigns them and sets room power levels (no Space inheritance). | Confirmed | 9 Nov. |
| K-38a | Owners and admins of child groups apply to moderate the hub. | Changed | → K-38c. |
| K-38c | Group members moderate only their own groups. **Hub admins are assigned manually; for now only site admins are hub admins.** | Confirmed | 9 Nov. |
| K-38b | Signed-out visitors can read the public rooms (hub room, sub-veids rooms, city rooms); writing needs sign-in and "Mani interesē". | Confirmed | 9 Nov. |

### Visibility and safety
| Id | Feature | Status | Notes |
|---|---|---|---|
| K-40 | Signed-out visitors see counts only. | Changed | → K-41. |
| K-41 | Signed-out visitors read the shout-outs (no author names) and events; actions lead to sign-in and back. | Confirmed | 9 Nov. The part "the chat stays hidden" is Changed → K-38b. |
| K-42 | A report action on every chat line; private messages only through a shared group. | Changed | 10 Nov: moderation (reports, private messages) is designed later, not in the first hub release. |

### Entry points and words
| Id | Feature | Status | Notes |
|---|---|---|---|
| K-50 | Group page: the category line's L1 / L2 / city parts link to their hubs. | Confirmed | 9 Nov. |
| K-51 | Manas grupas lists the hubs you follow. | Changed | No follow (K-58); Manas grupas lists groups only. |
| K-52 | Invites: from a group → the group page; from a hub → the hub page. | Confirmed | 9 Nov. |
| K-53 | Site words: L1 "Tēma", L2 "Veids/Veidi". | Confirmed | 9 Nov (both offered options carried them; say if not). |
| K-54 | One joining verb "Mani interesē"; the exit is "Vairs neinteresē". | Changed | No hub follow (K-58); "Mani interesē" / "Vairs neinteresē" leave hubs. |
| K-55 | "+ Cits" at the end of the Veidi chips opens the existing "Ieteikt jaunu tēmu" sheet (`CategorySuggest`); visible to admins only until approved. | Confirmed | 8 Nov. |
| K-56 | The "Izveidot jaunu grupu" card gets a quiet "vai vienkārši pastāsti, ko meklē". | Changed | 10 Nov: no second action; the card only creates a group. |
| K-59 | The build-plan page is always current: discarded views are removed, not kept; a choice between options is drawn as A and B side by side. | Confirmed | 9 Nov. |
| K-57 | Addresses follow the board: hub `/lv/speles/galda-speles` (`/[l1]/[l2]`, sub-veids `/[l1]/[l2]/[l3]`); city hub `/lv/jelgava`; a city room as `?room=jelgava` on the hub. | Confirmed | 9 Nov. |
| K-58 | **No followers on hubs.** The point is to join groups: you count as part of a hub by being a member of one of its groups. | Confirmed | 9 Nov. |

### Pilot and stages
| Id | Feature | Status | Notes |
|---|---|---|---|
| K-70 | Success is people meeting in person; Jelgava pilot through the city newspaper; seeding before the article. | Confirmed | 9 Nov. |
| K-71 | Stages: K1 Matrix spike, K2 hubs without chat, K3 chat. | In progress | Set before the hub pages; to be restated. |
| K-72 | Drawings: old ones removed; one combined `hub.html` drawn from the ledger (board hub card cases, hub page frame with Pārskats, Grupas, Pasākumi, Ziņas, Čats, city hub, signed-out). `hub-c.html` and `hub-options.html` removed (K-59). | Confirmed | 9 Nov, c75c07f; 10 Nov combined. 11 Nov: frames are never shrunk (phone frame first, desktop frame(s) below at full width, a narrow pane scrolls the row sideways); drawing updated for K-90, K-81, K-86, K-10, K-93, K-34; K-91 desktop variants A and B added (Pārskats at 1280 and 1920, Pasākumi/Grupas card grids, Ziņas reading column + rail), marked OPEN. |

## Context
Most people won't create a group, but they still want to find others interested in the same thing nearby. A **hub** (internal word; users see only its title) is the town-square message board and overview of one Veids or sub-veids (K-05, K-39): the groups in it, what they made public, people's shout-outs, and a Discord-like chat with rooms for its sub-veidi and cities (K-31). City is a parallel dimension: a city room has two parents, the tēma hub and the city hub (K-08). Chat runs on self-hosted Matrix (K-30). The first audience is Jelgava, through the city newspaper (K-70).

## Facts from the code survey
- `Group.categoryId` must be L1 (`taxonomy.service.ts:712`). L2/L3 reach a group only through `Group.tags`, so a hub's groups are **derived**, never stored: PUBLIC, unhidden groups tagged with that Veids (or its L3 children).
- The board filter exists: `parseDiscoveryParams` / `discoveryHref` in `lib/discovery-params.ts`, page `app/[locale]/(discovery)/page.tsx`, results in `components/discovery/GroupResults.tsx`.
- `Event.visibility` and `Post.visibility` exist; a hub shows only `PUBLIC` ones. `Post` is today's announcement; a blog post would be a new type (K-24).
- The site has no chat for a whole group (`ConversationKind` is DIRECT or person x group team). Matrix fills that gap (K-36).
- Matrix Spaces form a graph, not a tree: one room can be listed by two Spaces (`m.space.child`), with one canonical parent (`m.space.parent`). Power levels are per room, not inherited (K-38).
