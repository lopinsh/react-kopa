# Mājas: a home first, then the rest

> Status 13 Nov 2026: idea stage. The **Feature ledger** is the source of truth and is updated during every conversation. The drawings are cheap wireframes meant to be reacted to and changed; nothing is built.

## Why
Feedback from a new user's point of view (13 Nov): discovery as the first page is overwhelming. A person needs a home first, a way to be seen before they are ready to join a group, one place for what's new, and a simple first impression that reveals more later.

## Feature ledger
Statuses: **Confirmed** (owner decided), **In progress** (open, or my proposal not yet answered), **Changed** (the row names what replaced it).

### Navigation and home
| Id | Feature | Status | Notes |
|---|---|---|---|
| M-01 | **Manas grupas becomes Mājas**, the user's homebase, with things to do from it. | Confirmed | 13 Nov. |
| M-02 | **Phone bar: Jaunumi · Pasākumi · Mājas (centre, replaces +) · Ziņas · Atklāt.** Create actions move into Mājas and the hubs. | Confirmed | 13 Nov. Pasākumi "for now" (not Cilvēki). |
| M-03 | **Pasākumi tab:** my events first, then events in my topics and city, with the calendar. | In progress | My proposal. |
| M-04 | **Landing:** signed in → Mājas; signed out → Jaunumi. | Confirmed | 13 Nov. |
| M-06 | **Notifications:** a bell on the Mājas head, the count on the Mājas tab. | Confirmed | 13 Nov. Today they sit behind the Jaunumi tab. |
| M-11 | **Be seen before joining:** the Mājas start card leads a new user to pick topics and city, then write a Ziņa so others find them. | In progress | Builds on K-26, K-18a. |
| M-13 | **Jaunumi and Ziņas keep their names**; the bar's Ziņas is private messages. | Confirmed | 13 Nov. |

### Jaunumi
| Id | Feature | Status | Notes |
|---|---|---|---|
| M-05 | **Jaunumi** is the site-wide feed: new groups, events, Ziņas. Maybe an unordered grid of tiles of different sizes, not a list. | In progress | 13 Nov. |
| M-14 | **Group announcements and hub Ziņas become one thing:** a Ziņa whose author is a group or a person; readers filter by author. | In progress | 13 Nov idea. Rules differ today and must be settled: announcements notify members and take no replies; Ziņas take public replies, expire after 30 days, max 3 per person (K-27a, K-83). |

### Hubs and talk
| Id | Feature | Status | Notes |
|---|---|---|---|
| M-07 | **L1 branches get chat too** while users are few, so people find each other before they branch out. | Confirmed | 13 Nov. Changes K-06, K-29. |
| M-08 | **Simple first, reveal later:** less text on first impression; no mIRC-style wall; capabilities appear as people need them. | Confirmed | 13 Nov principle. Goes into the handbook once the mock settles how. |
| M-09 | **A hub is a dashboard overview of the content it encompasses** (a set of filters plus one layout, reusable at any depth: person, L1, L2, L3, city). | In progress | 13 Nov: needs much more thinking. |
| M-10 | **Ziņas are not restricted by hub level** at first. | Confirmed | 13 Nov. Changes the L2/L3-only rule. |
| M-15 | **Filtering like online clothing shops** (Reserved, About You, Zalando) instead of today's left L1 menu. From the owner's screenshots (Zalando, About You, 13 Nov): (a) the left column is a **tree of the current branch only**: the parent, the chosen node in bold with its children indented under it, its siblings; other top branches collapsed below; (b) the top-most split is a few **tabs above everything** (Sievietēm · Vīriešiem · Bērniem); (c) a **big title of the chosen node with the count** ("Džinsi vīriešiem 5277"); (d) a **row of drop-down pills** for the other filters (for us Kur, Kad, …) with "Rādīt visus filtrus" at the end; sort ("Kārtot") at the right; (e) on phones one "Filtri" button opening a sheet that ends in "Rādīt N grupas"; chosen filters as removable chips. | In progress | 13 Nov, wife's suggestion. Open: what our top tabs are (Grupas / Pasākumi / Jaunumi, or L1); whether L2/L3 live in the tree (shop style) or as chips (K-73). A shop category page is a saved set of filters with a layout, close to M-09. |
| M-12 | **How talk looks** in a hub. | In progress | References below; two options drawn in `talk`. |

## Chat references
- **Twitch / YouTube live chat:** built for speed; unusable for talking.
- **Discord:** channels and threads; powerful, dense.
- **Telegram groups with Topics:** one group split into topic threads, messenger bubbles, replies and reactions.
- **WhatsApp Communities:** a community with an Announcements channel plus small sub-groups; close to our hub (announcements = M-14, sub-groups = groups).
- **Facebook Groups / Reddit:** posts with comment threads; slow, readable, familiar to people who don't chat.
- **Slack threads:** replies fold under their message.

With few users nobody is online at the same time, so a live room stays empty. A Ziņas wall with replies can be the "talk" at first, and live messenger-style chat can be revealed later (M-08). Not decided.

## Open questions
1. Pasākumi tab contents (M-03).
2. Merged Ziņa rules (M-14): replies, expiry, limits, notifications for group vs person authors.
3. Talk look (M-12): Ziņas wall with replies, messenger bubbles, or both.
4. What a hub is (M-09).
