# Kanāli: hubs, the town squares of each tēma

> Status 9 Nov 2026: **the Feature ledger is the source of truth** and is updated during every conversation. Briefs, drawings and questions point at a ledger id. Discarded designs are removed from this page (git keeps the history).

## Feature ledger
Statuses: **Confirmed** (owner decided), **In progress** (still open, or my proposal the owner has not answered), **Changed** (owner changed their mind; the row names what replaced it). Updated during every conversation, not at the end.

### Model
| Id | Feature | Status | Notes |
|---|---|---|---|
| K-01 | No public name; the page shows its title. | Confirmed | 8-9 Nov. The internal word (kanāls or hub) is In progress. |
| K-02 | Separate per-city page L1 · L2 · City with 5 tabs (`channel.html`). | Changed | → K-05. |
| K-03 | Town square on the board, following the filter's zoom level (`board.html`). | Changed | → K-05. |
| K-04 | A chat room at every level, L1 included. | Changed | → K-06: L1 has no hub and no hub card, "for now". |
| K-05 | **A hub is its own page** for one Veids (L2) or sub-veids (L3), built in the group-page frame. The board shows only the hub card, which links to it. Hub content never appears on the board. | Confirmed | 9 Nov: "Hub chats reside inside the hub pages, that are created similarly to group pages." |
| K-06 | Hubs are created automatically with their L2/L3 tēma and never close. | Confirmed | 9 Nov. |
| K-07 | A hub shows (unlocks) at **2 interested people**. "Mani interesē" works like a group join request; the note is optional. | Confirmed | 9 Nov. |
| K-08 | **City is a parallel dimension.** A city room ("Šahs · Jelgava") is one room with two parents: the tēma hub and the city hub (Matrix Spaces, `m.space.child` from both). | Confirmed | 9 Nov. |
| K-09 | A city room exists potentially for every hub × city and **opens with its first message**: anyone following the hub can start it by writing the first line. | Confirmed | 9 Nov. |
| K-10 | Each city has a city hub (Jelgava first): see what is happening locally, visit each other, discover groups, try one. | Confirmed | 9 Nov. Its page content: In progress. |
| K-11 | Districts: one level (C2, Jelgava › Pārlielupe); no district rooms for now. | Confirmed | 9 Nov. Districts as a content filter only: In progress (my reading). |
| K-12 | Several Veidi chosen on the board: content merges, no room for the combination. | Confirmed | 9 Nov; which hub card shows then: In progress. |
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
| K-16 | The hub card shows activity numbers, not chat lines. A locked hub shows something like "1 cilvēks vēlas šeit sākt grupu". | Confirmed | 9 Nov. Exact words: In progress. |
| K-17 | No "Vēl 1, un atveras čats" text. | Confirmed | 9 Nov: "redundant". |
| K-18 | The "Mani interesē" sheet text: "Šobrīd esi pirmais. Atstāj ziņu citiem, lai atrastu līdzīgi domājošos." | Confirmed | 9 Nov, owner's words. |
| K-18a | The optional note left with "Mani interesē" is a shout-out (K-26), a public note on the hub. | Confirmed | 9 Nov: "Those are public announcements. Like shout outs." |
| K-18b | Notes become the first chat lines when the hub unlocks. | Changed | My idea, drawn without the owner's OK; replaced by K-18a. |
| K-18c | Locked sub-veidi hubs listed inside the parent hub ("Go · 1 interesējas") as an invitation to be the second. | In progress | My proposal. |
| K-18d | The board "town-square view" (`?view=cats`, switch "Čats \| Grupas \| Pasākumi"). | Changed | → K-05: the hub card opens the hub page. |

### Hub page content
| Id | Feature | Status | Notes |
|---|---|---|---|
| K-20 | Sub-veidi (L3) of this hub. | Confirmed | 9 Nov. |
| K-21 | The groups in this hub. | Confirmed | 9 Nov. |
| K-22 | The latest **public** announcements of those groups. Announcements are practical ("someone forgot their phone after our event"). | Confirmed | 9 Nov. |
| K-23 | The latest public events of those groups. The hub has no events of its own. | Confirmed | 8-9 Nov. |
| K-24 | The latest public blog posts of those groups. **Blog post is a new group post type**, separate from announcements. | Confirmed | 9 Nov. Building it as its own release: In progress (my proposal). |
| K-24b | A blog post's author chooses **public or members-only**. A public post shows in the hub feed as an excerpt with its group and member shown and linked; tapping it opens the full blog post page in that group. Public posts, events and announcements are visible to signed-out visitors (names included). | Confirmed | 9 Nov. |
| K-24a | **Activity feed:** the hub page shows its groups' public announcements, events and blog posts as one merged live feed, organized and compact by period: "Šodien: 3 grupas izveidotas, 32 jauni biedri, 3 jauni raksti, 3 paziņojumi", then "Pagājušajā nedēļā", "Pagājušajā mēnesī". | Confirmed | 9 Nov: "a bit of both" (merged feed + activity numbers). Exact rows, what opens on tap: In progress. |
| K-25 | The hub shows **two numbers**: followers and group members ("41 interesējas · 120 grupu biedri"). | Confirmed | 9 Nov. |
| K-26 | **Shout-outs:** public notes by individuals on the hub ("Oskars: gribētu atrast kādu, ar ko spēlēt domino"). Not chat: chat is real-time, for whoever is there now. | Confirmed | 9 Nov. Replaces the Meklē cards. |
| K-27 | Shout-outs are **plain post-it notes** on the board's wall ("If you are interested too, let me know. We could start a group together"). No "Es arī", no "Izveidot grupu ar viņiem". | Confirmed | 9 Nov: "Yes, plain notes. Announcements really are plain post-it notes." |
| K-27a | Shout-outs expire after 30 days (the author can renew); max 3 active per person across the site; each has "Ziņot". | Confirmed | 9 Nov. |
| K-28 | Layout of the hub page (sections, order, phone vs desktop). | In progress | The group-page sections list was rejected ("sounds wrong"). Content is K-20 to K-26 plus K-31. |

### Chat
| Id | Feature | Status | Notes |
|---|---|---|---|
| K-30 | Matrix, self-hosted, in our own chat panel; Element/FluffyChat optional. | Confirmed | 8-9 Nov. |
| K-31 | **Chat section built like Discord:** a public room for the hub, a room per sub-veids (L3), city rooms; the user moves between the public child rooms from a room list. | Confirmed | 9 Nov. |
| K-32 | No merged chat: a parent has its own room and lists its children (like an mIRC channel list). | Confirmed | 9 Nov. |
| K-33 | Chat is read-only until "Mani interesē". | Confirmed | 9 Nov. |
| K-34 | The chat shows the people list: who is in the room and who is online now. | Confirmed | 9 Nov. |
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
| K-42 | A report action on every chat line; private messages only through a shared group. | In progress | My proposal. |

### Entry points and words
| Id | Feature | Status | Notes |
|---|---|---|---|
| K-50 | Group page: the category line's L1 / L2 / city parts link to their hubs. | Confirmed | 9 Nov. |
| K-51 | Manas grupas lists the hubs you follow. | Confirmed | 9 Nov. |
| K-52 | Invites: from a group → the group page; from a hub → the hub page. | Confirmed | 9 Nov. |
| K-53 | Site words: L1 "Tēma", L2 "Veids/Veidi". | Confirmed | 9 Nov (both offered options carried them; say if not). |
| K-54 | One joining verb "Mani interesē"; the exit is "Vairs neinteresē". | Confirmed | 8 Nov. |
| K-55 | "+ Cits" at the end of the Veidi chips opens the existing "Ieteikt jaunu tēmu" sheet (`CategorySuggest`); visible to admins only until approved. | Confirmed | 8 Nov. |
| K-56 | The "Izveidot jaunu grupu" card gets a quiet "vai vienkārši pastāsti, ko meklē". | In progress | 9 Nov (C2), before shout-outs; may become "leave a shout-out". |
| K-59 | The build-plan page is always current: discarded views are removed, not kept; a choice between options is drawn as A and B side by side. | Confirmed | 9 Nov. |
| K-57 | Hub address (route) and the city hub's address. | In progress | Not discussed. |
| K-58 | Joining a group does not remove you from the hub; hubs work in every city, no home city. | In progress | Defaults in the old spec, never discussed. |

### Pilot and stages
| Id | Feature | Status | Notes |
|---|---|---|---|
| K-70 | Success is people meeting in person; Jelgava pilot through the city newspaper; seeding before the article. | Confirmed | 9 Nov. |
| K-71 | Stages: K1 Matrix spike, K2 hubs without chat, K3 chat. | In progress | Set before the hub pages; to be restated. |
| K-72 | Drawings: `channel.html`, `board.html` and the old hub states removed; `hub.html` redrawn from this ledger, open choices as A/B. | In progress | 9 Nov. | Going live (domain, backups, legal pages, Jelgava promotion) is out of scope for now. The goal is to get the site to the point where going live *can* be considered. The first real audience is planned to be Jelgava, reached through the city newspaper, so expect casual internet users.

## Context
Most people won't create a group, but they still want to find others interested in the same thing nearby. A **hub** (internal word; users see only its title) is the town-square message board and overview of one Veids or sub-veids (K-05, K-39): the groups in it, what they made public, people's shout-outs, and a Discord-like chat with rooms for its sub-veidi and cities (K-31). City is a parallel dimension: a city room has two parents, the tēma hub and the city hub (K-08). Chat runs on self-hosted Matrix (K-30). The first audience is Jelgava, through the city newspaper (K-70).

## Facts from the code survey
- `Group.categoryId` must be L1 (`taxonomy.service.ts:712`). L2/L3 reach a group only through `Group.tags`, so a hub's groups are **derived**, never stored: PUBLIC, unhidden groups tagged with that Veids (or its L3 children).
- The board filter exists: `parseDiscoveryParams` / `discoveryHref` in `lib/discovery-params.ts`, page `app/[locale]/(discovery)/page.tsx`, results in `components/discovery/GroupResults.tsx`.
- `Event.visibility` and `Post.visibility` exist; a hub shows only `PUBLIC` ones. `Post` is today's announcement; a blog post would be a new type (K-24).
- The site has no chat for a whole group (`ConversationKind` is DIRECT or person x group team). Matrix fills that gap (K-36).
- Matrix Spaces form a graph, not a tree: one room can be listed by two Spaces (`m.space.child`), with one canonical parent (`m.space.parent`). Power levels are per room, not inherited (K-38).
