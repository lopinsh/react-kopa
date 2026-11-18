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
| M-17 | **Desktop header keeps today's layout:** logo, the search field ("Meklē grupu vai nodarbi…"), **Atklāt as a button** next to it, then at the right **Mājas** (where "Manas grupas" is now), LV, admin, Ziņas, notifications, profile. | Changed | → M-33 (new order). Kept from M-17: the search field stays, Atklāt is a button with a compass icon. |
| M-33 | **Desktop header order: logo mark · Mājas · Atklāt · search field,** then at the right LV, admin, Ziņas, Paziņojumi, profile. Mājas and Atklāt are a pair of icon + word items; the active one is filled. | Confirmed | 18 Nov, from owner note cmwjdp0fh on the Jaunumi drawing (16 Nov): the old order looked odd; use a square logo mark like FB/Instagram, then Home, then Discover, then search. Drawn in all four drawings, v4. |
| M-34 | **Logo mark:** a symmetrical square or circle mark instead of the "Ejam kopā" word mark in the header; it leads to Jaunumi (M-04). | In progress | 18 Nov, same note. The drawings use a placeholder "EK" tile; the mark itself is not designed yet. Open: square or circle, and is the word mark kept anywhere (e.g. the footer, the signed-out page)? |
| M-18 | **Phone bar: Jaunumi · Atklāt · Mājas (centre) · Paziņojumi · Ziņas.** | Confirmed | 16 Nov, owner. Replaces my proposal (Atklāt · Ziņas · Mājas · Paziņojumi · Es). Ziņas here are the user's private messages. Jaunumi is the signed-out home page (M-04); Mājas is the old Es (M-32). Owner approved the drawn bar (note cmwjdp9fo, 16 Nov: "I like this"): build it as drawn, centre Mājas raised in a filled circle. |
| M-32 | **Mājas is the old Es:** profile, settings and the admin entry live in Mājas; there is no separate Es item. | Confirmed | 16 Nov, owner: "Home is the old Es". |
| M-04 | **Landing:** signed in → Mājas; signed out → Jaunumi, the home page for visitors. | Confirmed | 13 Nov; 16 Nov, owner: Jaunumi is a page of its own (the first bar item), no longer "Atklāt › Jaunumi". |
| M-06 | Notifications as a bell on the Mājas head. | Changed | → M-17/M-18: notifications keep their own item. |
| M-11 | **Be seen before joining:** a new user can write a Ziņojums in their topic so others find them. | In progress | Builds on K-26, K-18a. |
| M-19 | **The tour is optional:** on the first visit a small window asks "Gribi īsu ievadu?" (Jā / Vēlāk); no start card forced into Mājas. | Confirmed | 13 Nov. Open: an "Ievads" link to start it later (my proposal: in Es). |
| M-03 | **Pasākumi tab:** my events first, then events in my topics and city, with the calendar. | In progress | My proposal. |

### Atklāt
| Id | Feature | Status | Notes |
|---|---|---|---|
| M-05 | **Jaunumi is the first tab of Atklāt:** one feed, the other tabs show the same filtered content in their own way (group cards, events with a calendar, people: not known yet). | In progress | 13 Nov confirmed as a tab; 16 Nov: Jaunumi became its own page and bar item (M-04, M-18). My proposal, not yet answered: Atklāt's tabs are then Grupas · Pasākumi · Cilvēki, and desktop reaches Jaunumi from the logo. |
| M-20 | **Jaunumi cards are sized by "can I act on this soon?"**: large = an event near me this week, a person looking for company in my topic; medium = a new group in my topic or city; the rest bundled into one line ("3 jaunas grupas Sportā šonedēļ"). | Confirmed | 13 Nov. Replaces the mixed-size grid without a rule. |
| M-15 | **Filtering like online clothing shops** (Zalando, About You, Reserved; owner's screenshots 13 Nov): tabs above everything; on desktop a **tree of the current branch only** in the left column; a big title with the count; a row of drop-down filter pills; Kārtot at the right. Phone: the tree becomes a list, one level per screen ("Skatīt visu", back arrow), a chip row of the current node's children under the title, a "Filtri · Kārtot" bar opening a sheet that ends in "Rādīt N grupas". | Confirmed | 13 Nov. Desktop tree confirmed; phone version is my proposal from the shops, drawn. A shop category page is a saved set of filters with a layout, close to M-09. |
| M-21 | **Back to all topics:** the tree's top row is "‹ Visas tēmas" (every L1 with its colour and icon, like today's menu); the chosen L1 keeps its icon and colour; every row upward is a link. | Confirmed | 13 Nov. Keep L1 colours and icons. |
| M-22 | **Filters:** Kur and Kad now. **Valoda is never a filter.** Plan per tab later, e.g. events: size (≤6 / medium / large), free; groups: size, how often they meet, open or by request, recently active. | In progress | 13 Nov: "not clear yet". |
| M-16 | **Cilvēki tab:** people's Ziņojumi ("meklēju, ar ko spēlēt šahu"), with the same tree and filters, so a person in no group is findable (M-11). How people are shown: not known yet. | In progress | |

### Ziņojumi
| Id | Feature | Status | Notes |
|---|---|---|---|
| M-14 | **Group announcements and hub Ziņas become one thing: Ziņojumi**, authored by a group or a person; readers filter by author. | Confirmed | 13 Nov (name). 16 Nov, owner: a group announcement **is** a Ziņojums, only seen through the group (M-31); not a second kind. Rules still to settle as one set: today announcements notify members and take no replies; hub Ziņas take replies, expire after 30 days, max 3 per person (K-27a, K-83). **16 Nov, owner: no 30-day expiry for now** (the site is new; decide later; changes K-27a). My proposal, not yet answered: replies everywhere, a group's Ziņojums notifies its members, the cap of 3 only for persons. |
| M-31 | **One content, many lenses:** the site has the same kinds of content everywhere (Ziņojumi, Pasākumi, Grupas, Cilvēki); Atklāt, a hub, a group and a person's page are lenses, each a filter over that content with its own layout. No lens has content types of its own. | Confirmed | 16 Nov, owner: "the same types of content, only filtered through lenses: discovery, hubs, groups, users". Settles the direction of M-09; a hub is the lens topic + place, a group the lens "by this group", Mājas the lens "mine". |
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
1. Atklāt's tabs now that Jaunumi is its own page (M-05), and how desktop reaches Jaunumi.
2. (settled 16 Nov: M-32.)
3. Filters per tab (M-22).
4. How people are shown on the Cilvēki tab (M-16).
5. One rule set for Ziņojumi (M-14, M-31): replies, who is notified and the per-person cap when the author is a group. Expiry: none for now, decide later.
6. Pasākumi tab contents (M-03).
7. What a hub's layout is, now that a hub is a lens (M-09, M-31).
8. The logo mark: square or circle, and where the word mark stays (M-34).
