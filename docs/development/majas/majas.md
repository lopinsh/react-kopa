# Mājas: a home first, then the rest

> Status 13 Nov 2026: idea stage. The **Feature ledger** is the source of truth and is updated during every conversation. The drawings are cheap wireframes meant to be reacted to and changed; nothing is built.

## Why
Feedback from a new user's point of view (13 Nov): discovery as the first page is overwhelming. A person needs a home first, a way to be seen before they are ready to join a group, one place for what's new, and a simple first impression that reveals more later. And one wish of the owner's: bring back the feeling of **real-time closeness**: on other social sites you browse alone, out of sync with everyone, a ghost that leaves replies; here you should feel that others are in the same place now, like striking up a conversation in a queue or by the tea pot at an event.

## Words
| Word | Means |
|---|---|
| **Mājas** | Your own space: your content, your groups, your events; a safe place, not a feed. |
| **Atklāt** | Discovery: one feed seen through tabs Jaunumi · Grupas · Pasākumi · Cilvēki. |
| **Ziņas** | Private messages (the inbox). |
| **Ziņojumi** | Public announcements by a group or a person (was "hub Ziņas" and "group Jaunumi"). |
| **Laukums** | A square: the live place where people looking at the same topic and place are together now. |

## Feature ledger
Statuses: **Confirmed** (owner decided), **In progress** (open, or my proposal not yet answered), **Changed** (the row names what replaced it).

### Navigation and home
| Id | Feature | Status | Notes |
|---|---|---|---|
| M-01 | **Manas grupas becomes Mājas**, the user's own space and safe base, with things to do from it. | Confirmed | 13 Nov. Others call this kind of space "You"/"Me" (YouTube, Google, LinkedIn), not "Home" (a feed there). |
| M-02 | Phone bar Jaunumi · Pasākumi · Mājas · Ziņas · Atklāt. | Changed | → M-17 (Jaunumi and Pasākumi became Atklāt tabs). |
| M-17 | **Desktop header: Mājas · Atklāt** on the left; at the right the current items: admin, Ziņas, notifications, profile. | Confirmed | 13 Nov. |
| M-18 | **Phone bar: Atklāt · Ziņas · Mājas (centre) · Paziņojumi · Es** (admin inside Es). | In progress | My proposal: today's bar with + → Mājas and Jaunumi → Paziņojumi. Owner: "the rest I don't know". |
| M-04 | **Landing:** signed in → Mājas; signed out → Atklāt › Jaunumi. | Confirmed | 13 Nov. |
| M-06 | Notifications as a bell on the Mājas head. | Changed | → M-17/M-18: notifications keep their own item. |
| M-11 | **Be seen before joining:** a new user can write a Ziņojums in their topic so others find them. | In progress | Builds on K-26, K-18a. |
| M-19 | **The tour is optional:** on the first visit a small window asks "Gribi īsu ievadu?" (Jā / Vēlāk); no start card forced into Mājas. | Confirmed | 13 Nov. Open: an "Ievads" link to start it later (my proposal: in Es). |
| M-03 | **Pasākumi tab:** my events first, then events in my topics and city, with the calendar. | In progress | My proposal. |

### Atklāt
| Id | Feature | Status | Notes |
|---|---|---|---|
| M-05 | **Jaunumi is the first tab of Atklāt:** one feed, the other tabs show the same filtered content in their own way (group cards, events with a calendar, people: not known yet). | Confirmed | 13 Nov. |
| M-20 | **Jaunumi cards are sized by "can I act on this soon?"**: large = an event near me this week, a person looking for company in my topic; medium = a new group in my topic or city; the rest bundled into one line ("3 jaunas grupas Sportā šonedēļ"). | Confirmed | 13 Nov. Replaces the mixed-size grid without a rule. |
| M-15 | **Filtering like online clothing shops** (Zalando, About You, Reserved; owner's screenshots 13 Nov): tabs above everything; on desktop a **tree of the current branch only** in the left column; a big title with the count; a row of drop-down filter pills; Kārtot at the right. Phone: the tree becomes a list, one level per screen ("Skatīt visu", back arrow), a chip row of the current node's children under the title, a "Filtri · Kārtot" bar opening a sheet that ends in "Rādīt N grupas". | Confirmed | 13 Nov. Desktop tree confirmed; phone version is my proposal from the shops, drawn. A shop category page is a saved set of filters with a layout, close to M-09. |
| M-21 | **Back to all topics:** the tree's top row is "‹ Visas tēmas" (every L1 with its colour and icon, like today's menu); the chosen L1 keeps its icon and colour; every row upward is a link. | Confirmed | 13 Nov. Keep L1 colours and icons. |
| M-22 | **Filters:** Kur and Kad now. **Valoda is never a filter.** Plan per tab later, e.g. events: size (≤6 / medium / large), free; groups: size, how often they meet, open or by request, recently active. | In progress | 13 Nov: "not clear yet". |
| M-16 | **Cilvēki tab:** people's Ziņojumi ("meklēju, ar ko spēlēt šahu"), with the same tree and filters, so a person in no group is findable (M-11). How people are shown: not known yet. | In progress | |

### Ziņojumi
| Id | Feature | Status | Notes |
|---|---|---|---|
| M-14 | **Group announcements and hub Ziņas become one thing: Ziņojumi**, authored by a group or a person; readers filter by author. | Confirmed | 13 Nov (name). Rules still to settle: today announcements notify members and take no replies; Ziņas take replies, expire after 30 days, max 3 per person (K-27a, K-83). |
| M-12 | **Ziņojumi look: a wall with short replies** (option A of the first mock). Messenger bubbles are not for Ziņojumi. | Confirmed | 13 Nov. |
| M-23 | **Direct messages are not restricted:** anyone can write to anyone. Replying to a Ziņojums publicly, then "Rakstīt privāti" (a message request), is one common path. | Confirmed | 13 Nov. |
| M-24 | **Personal events:** a person can post "eju uz sporta zāli 18:00, nāc līdzi" (time and place); it shows in Pasākumi and Jaunumi and goes away when the time has passed. Exact details are shared once people have talked. | Confirmed | 13 Nov. Vouches (like Couchsurfing) and verification: later. |
| M-10 | **Ziņojumi are not restricted by hub level** at first. | Confirmed | 13 Nov. Changes the L2/L3-only rule. |

### Laukums (real-time squares)
| Id | Feature | Status | Notes |
|---|---|---|---|
| M-07 | **L1 branches get talk too** while users are few. | Confirmed | 13 Nov. Changes K-06, K-29. |
| M-25 | **The square is what you are looking at:** browsing Atklāt › Galda spēles › Jelgava puts you in that square; people looking at the same or an overlapping filter are "nearby". Squares follow the topics (L1/L2/L3) and places (country, city, later district). | Confirmed | 13 Nov. Builds on M-09. |
| M-26 | **Elastic squares:** with few people, presence spreads upward: nobody in the district → the city square; nobody in the city → the topic nationally ("2 cilvēki tagad skatās Galda spēles"). Squares tighten by themselves as users grow. | Confirmed | 13 Nov. |
| M-27 | **Presence and a nudge, not a cold start:** "Šeit tagad: 5" with small faces, and a nudge "Šeit ir 5 cilvēki, kam interesē šahs. Droši uzraksti." The site invites talk in the square; it never pushes you to write to one person first. | Confirmed | 13 Nov. |
| M-28 | **Talk lasts by activity:** in a busy square lines fade after about 4 hours; a quiet square keeps them for a few days, or always keeps its last lines, so the next person sees the vibe and it is never empty. | Confirmed | 13 Nov. Exact numbers later. |
| M-29 | **Everyone is visible by default.** Later: hiding is mutual (hidden → you don't see others and can't write). | Confirmed | 13 Nov. Hiding: later. |
| M-30 | **Rush hours** (a square evening for a topic). | In progress | Later. |
| M-08 | **Simple first, reveal later:** less text on first impression, no mIRC-style wall; capabilities appear as people need them. | Confirmed | 13 Nov principle. Goes into the handbook once settled how. |
| M-09 | **A hub is a dashboard overview of the content it encompasses** (filters plus one layout, at any depth). | In progress | Needs more thinking; M-15 and M-25 are steps toward it. |

## Chat references
- **Twitch / YouTube live chat:** built for speed; unusable for talking.
- **Discord:** channels and threads; powerful, dense.
- **Telegram groups with Topics:** topic threads, messenger bubbles, replies and reactions.
- **WhatsApp Communities:** an Announcements channel plus small sub-groups.
- **Facebook Groups / Reddit:** posts with comment threads; slow, readable.
- **Slack threads:** replies fold under their message.

## Open questions
1. Phone bar (M-18).
2. Filters per tab (M-22).
3. How people are shown on the Cilvēki tab (M-16).
4. Ziņojumi rules for groups vs persons (M-14).
5. Pasākumi tab contents (M-03).
6. What a hub is (M-09).
