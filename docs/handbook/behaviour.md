# Behaviour patterns

The same situation behaves the same way on every screen.

## Saving and sending

- A switch saves when you change it (Iestatījumi, Privātums); forms save with Saglabāt.
- The button shows it is working and can't be pressed twice.
- Success: a short toast (one line at the bottom, above the bottom bar on phones, one at a time, it goes by itself), or the result appears in place.
- After creating something, open its page.

## Destroying

- Archive or hide first, delete only when needed.
- Permanent delete asks once, in our own dialog, naming the thing: "Dzēst jaunumu "Pārgājiens sestdien"?"
- "Are you sure" for a step you can undo (leave a group, remove a member) is a small pop-over at the button.
- Never the browser's `confirm()`.

## Errors

- Field errors under the field, in red, while typing is allowed to continue.
- Server errors in plain words near the button.
- Nothing fails silently.
- A page that fails to load says so in plain words, with "Mēģināt vēlreiz".

## Pop-ups

- Dialogs in the middle dim the page and blur it lightly; side panels, sheets and drawers only dim. The opened card and the event panel sit in the middle over the dimmed page (dim only, no blur) and grow out of the card you clicked; Back, Esc, × and a click outside close them.
- Movement that shows where something came from is kept short and left out under reduced motion.
- A click outside, Esc, × and Back close them. Back does not leave the page.
- A form with typed input asks "Atmest izmaiņas?" first; keeping on editing is the default.
- On phones a dialog opens as a sheet from the bottom.
- A panel has its own address: Back closes it; a reload or a shared link opens the full page.
- The admin tool panel is a tool, not a pop-up: no dimming, no focus trap, a click outside keeps it; Esc inside it first leaves a field, then a selection, then closes it.

## Text limits

- A field with a limit shows a count under its right end: quiet, then the warning colour in the last tenth, then red with how many are too many.
- Past the limit the send button waits; the text is never cut.

## Text in several languages

- Owner text is written in one language, the original, and can have translations. One language is on screen at a time, chosen in "Valoda: Latviešu ▾"; "+ Pievienot tulkojumu" adds one.
- Switching never loses text: every version is kept until you save. Only the original needs the required fields.
- An empty translation is not saved. Visitors without their language see the original with its language label. Nothing is machine-translated.

## Empty

- An outline icon, one sentence, at most one action.
- Different text for the team ("Pirmais jaunums sasniegs visus biedrus") and for members ("Vēl nav jaunumu").

## Loading

- Skeletons in the shape of the content, not spinners over the page.
- Content never jumps when it arrives.

## Live updates

- New things appear in place, quietly.
- Counts (unread, requests) update without a reload.
- A toast only for things outside the current screen.
- Chat signed in is live through the SDK; signed out the page asks the server again every 30 s while it is visible.

## Sign-in needed

- Inside the site: the sign-in pop-up, and afterwards the action continues where it was (the contact form, a report).
- From a panel you land on the thing's own page after signing in, and the step continues there.
- Direct visits to private pages: the sign-in page.

## Dates and times

- 24 h in the viewer's own zone, named on the event page when it is not Latvian time; Monday first, in both languages. Weeks start on Monday; "today" is the viewer's day in their own time zone. An event is past after its last day in Latvian time; a running event says "Notiek tagad · līdz …". Organisers enter times in their own zone, in 15-minute steps; a time the clock skips that night cannot be chosen.
- Today: relative ("pirms 5 min"). Older: date ("9. okt., 20:07").
- Time pickers in 15-minute steps.

## Search

- Results come as you type; the newest word wins.
- Esc or a click outside closes the search and keeps the word; Back closes it.
- A result opens its panel; Back returns to the page you were on.
- Recent searches stay on this device and can be removed one by one.
- The picture picker's Unsplash search is the exception: it runs on Meklēt or Enter, not as you type, because the photo service limits requests.

## Hubs (kopiena)

- A hub is the town square of one Veids (L2) or sub-veids (L3): its own page in the group-page frame, an overview with a message board, not a group. It is created with its Veids and never closes. Its public name is "Kopiena <Veids>" (en "<Veids> community"), the stored title as it is. Addresses follow the board: `/lv/speles/galda-speles`, a sub-veids `/[l1]/[l2]/[l3]`, a city hub `/lv/jelgava`.
- No followers: you count as part of a hub by being a member of one of its groups. The hub's number is the members of its groups ("120 dalībnieki 13 grupās"). Hub content never appears on the board; the board shows only the hub card, which links in.
- A hub shows activity from its children (groups, events, Ziņas, the public announcements of its groups), merged and compact by period (Šodien, Pagājušajā nedēļā, Pagājušajā mēnesī). It has no events of its own. Public items are readable signed out (Ziņas without names).
- City is a parallel dimension: a city room ("Šahs · Jelgava") has two parents, the topic hub and the city hub. Hub admins are assigned by hand; for now only site admins are.
- Menu: Pārskats, Grupas, Pasākumi, Ziņas, Čats. Pārskats order: Aktivitāte, Ziņas (3-row preview), Čats (last 3 lines, "N tiešsaistē", Atvērt čatu), Pasākumi, Grupas; sub-hubs at the bottom as a few chips and "+N" into the board with the filters set. Head actions: Izveidot grupu (wizard filled with the Veids) and Dalīties; Rakstīt ziņu lives in Ziņas. Tab bars: Grupas Visas / Jaunās, Pasākumi Gaidāmie / Pagājušie, Ziņas Visas / Manas. Kur is the last item of the menu on Pārskats and the end of the tab bar on the inner pages. Pages start with the tab bar and content, with no title or description of their own.
- Groups list in tiers: 1-4 groups are full cards, 5-16 the compact list, 17 or more the first 16 and "Vēl N grupas" into discovery with Veids and Kur set. City rooms use the same tiers ("Vēl N istabas"). Pasākumi use the site's day strip and calendar; a busy month lists by day, the first 15, then "Rādīt vēl N". Ziņas are grouped by sub-veids, then by group; a Ziņa with no group goes under "Visai kopienai".
- Čats: a public room per hub, per sub-veids and per city room, like an mIRC channel list (lines, no bubbles; a parent never merges its children's rooms). Anyone signed in writes; members of the hub's groups carry a flair. Katalogs lists the hub's rooms by activity with search. Signed out reads (names shown, no profile link) and refreshes every 30 s. Moderators are assigned by the site; group members moderate only their own groups. Group chats come later.

## Ziņas (hub notes)

- A Ziņa is a short note on a hub (K-26): optional city and group (only the author's own group in that hub), a sub-veids note also shows on the parent hub.
- It ends after 30 days; the author renews it (an expired one starts clean, without replies). At most 3 are active per person across the site.
- Replies are public and vanish with the Ziņa. Everyone edits and deletes only what they wrote; the Ziņa's author cannot delete others' replies; site admins delete anything.
- "Rakstīt privāti" sends a chat request into the author's Ziņas inbox (Pieprasījumi): Pieņemt opens a normal direct chat with the request text first. A declined request looks like a pending one to the sender, forever: no notification, no second request from the same Ziņa.
- Signed out: no names anywhere; one button "Ienākt, lai atbildētu".
- Ziņot on a Ziņa or reply goes to the admin reports list (two separate targets).
- A Ziņa is a plain public note ("if you are interested too, let me know"), not chat; the optional note left with Mani interesē is one. Replies and private messages reach you through the normal notifications. Button names: Rakstīt ziņu (compose), Rakstīt privāti (message the author). A Ziņa's city is optional and never defaulted; one without a city shows for every Kur choice.

### Topic x city hubs (K3)

- Kur on a topic hub is a switcher: Visas pilsētas, an open city (its topic x city hub, same page), or a city with Pieprasīt ("N interesējas", never names). The city is part of the address (`/lv/games/boardgames/jelgava`), not a filter.
- Pieprasīt: one request per person per city; an optional note becomes a public Ziņa (counts toward the 3). The second distinct person opens the hub at once and lands on it; the first asker is told. A shared `?request=<city>` link opens the sheet.
- A hub that is not open has no page: its address goes to the topic hub with the sheet open. Site admins can Aizvērt kopienu; groups and Ziņas stay, two new requests open it again.

### City hubs (K3)

- Every active city has a hub, "Kopiena Jelgava", at `/lv/jelgava`: Pārskats (Aktivitāte of the city's groups, Ziņas, Pilsētas istabas), Grupas, Pasākumi and Ziņas. It has no Tēma, no Kur and nothing to write: no Rakstīt ziņu, reply, private message or report. Izveidot grupu and Dalīties stay.
- Ziņas lists every Ziņa that has this city, request notes included, grouped by Veids; a row opens to its text and reply count and links to the note on its own hub (Atvērt kopienā). Signed out sees the same without names.
- Pilsētas istabas lists the city's open topic x city hubs ("Šahs · Jelgava", groups and last activity), the first 16, then "Vēl N istabas" links to the city's Katalogs at `/lv/jelgava/rooms` (K-147), which sorts them by last line and opens each room's Čats.

## Notifications

- Stored only when the person must act or would miss something.
- Every notification opens exactly the thing it is about.
- A notification is read when you tap it; opening the list marks nothing.
- The only trace of a visit is `lastSeenAt`, day-level, written at most once a day, and shown to admins as counts only (Aktivitāte, R31); the privacy page says so.
- "Online now" in Čats is live only (K-148): a signed-in tab joins the Soketi presence channel `presence-site` with the user id, nothing else; it is never stored, and the list is asked again every 60 s while visible. The privacy page says so.
- Čats notifies @mentions only (K-145): picking a name after `@` in the composer marks it; the person gets one bell notice (`CHAT_MENTION`) per room until they read it, none if they turned "Paziņot, kad mani piemin" off, never for mentioning yourself. No other chat line rings the bell; unread rooms show a dot on their tab and switcher row, no numbers, no sound.
- Email is a digest, not a copy (R33): after 10 minutes unread, one email lists how many things and what (bell headline, group or event, sender name), never what was written; only direct messages and requests, applications, questions and their answers (`EMAIL_DIGEST_TYPES`), plus replies to your Ziņa, chat requests and chat mentions; off by the Iestatījumi switch or the link in every email.

Next: [Who sees what](roles.md).

Picking sub-veidi (L3-2): a group carries up to 2 Veidi and up to 1 sub-veids (constants `MAX_GROUP_TAGS`, `MAX_GROUP_SUBTAGS`, enforced by the service). Picking a sub-veids in the tag picker tags its Veids too and says so ("Pievienots arī: …"); un-picking a Veids drops its sub-veidi; a sub-veids chip reads "Veids › sub-veids". "+ Cits" under a Veids's sub-veidi suggests a new one.
