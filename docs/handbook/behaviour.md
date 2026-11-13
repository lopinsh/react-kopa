# Behaviour patterns

The same situation behaves the same way on every screen. How each of these looks is in [Design](design.md).

## Saving and sending

- A switch saves when you change it; forms save with Saglabāt.
- The button shows it is working and can't be pressed twice.
- Success: a toast, or the result appears in place. A toast is one line at the bottom (above the bottom bar on phones), one at a time, and goes by itself.
- After creating something, open its page.

## Destroying

- Archive or hide first, delete only when needed.
- Permanent delete asks once, in our own dialog, naming the thing: "Dzēst jaunumu "Pārgājiens sestdien"?". Never the browser's `confirm()`.
- An undoable step (leave a group, remove a member) asks in a small pop-over at the button.

## Errors

- Field errors under the field, in the danger colour, while typing can continue.
- Server errors in plain words near the button. Nothing fails silently.
- A page that fails to load says so, with "Mēģināt vēlreiz".

## Pop-ups

- Esc, ×, Back and a click outside close them. Back closes the pop-up, it does not leave the page.
- A form with typed input asks "Atmest izmaiņas?" first; keeping on editing is the default.
- Below 768 px every pop-up and drop-down is a sheet from the bottom, never a side drawer or an anchored pop-over: rows must be tappable and nothing may sit off screen. A choice made in a sheet closes it first, then navigates.
- Dialogs dim the page and blur it lightly; side panels, sheets and drawers only dim.
- **Panels.** A group or event opened from a card or row is a centred panel over the dimmed page (a full-height sheet on phones) that grows out of what you clicked. It has its own address: Back closes it, a reload or a shared link opens the full page. It shows at least everything its card shows. A group you belong to or wait for opens its full page, never the panel.
- Movement that shows where something came from is short and left out under reduced motion.
- The admin tool panel is a tool, not a pop-up: no dimming, no focus trap, a click outside keeps it open.

## Text limits

- A field with a limit shows a counter under its right end: quiet, then the warning colour in the last tenth, then red with how many are too many ("13 par daudz").
- Past the limit the send button waits; the text is never cut.

## Text in several languages

- Owner text is written in one language, the original (Oriģināls), and can have translations. One language is on screen at a time, in one language bar above the fields; "+ Pievienot tulkojumu" adds one.
- Switching never loses text. Only the original needs the required fields; an empty translation is not saved.
- Visitors without their language see the original with its language label. Nothing is machine-translated.

## Empty, loading, live

- Empty: an outline icon, one sentence that says what will appear and how to add the first, at most one action. The team and members get different text ("Pirmais jaunums sasniegs visus biedrus" / "Vēl nav jaunumu").
- Loading: skeletons in the shape of the content, never spinners over the page. Content never jumps when it arrives.
- Live: new things appear in place, quietly; counts (unread, requests) update without a reload; a toast only for things outside the current screen.

## Sign-in needed

- Inside the site: the sign-in pop-up, and afterwards the action continues where it was (the contact form, a report). From a panel you land on the thing's own page.
- Direct visits to private pages: the sign-in page.

## Dates and times

- 24-hour time in the viewer's own time zone, named on the event page when it is not Latvian time. Weeks start on Monday in both languages; "today" is the viewer's day.
- Dates carry the weekday: "Svētd., 18. okt. 17:00", "Sun, 18 Oct, 17:00". Today is relative ("pirms 5 min").
- An event is past after its last day in Latvian time; a running one says "Notiek tagad · līdz …".
- Organisers enter times in their own zone in 15-minute steps; a time the clock skips that night cannot be chosen.
- Always through the next-intl formatters, never the browser's.

## Search

- Results come as you type; the newest word wins. Esc or a click outside closes it and keeps the word.
- A result opens its panel; Back returns to the page you were on.
- Recent searches stay on this device and can be removed one by one.
- The exception is the picture picker's Unsplash search: it runs on Meklēt or Enter, because the service limits requests.

## Tags (Veidi)

- A group carries up to 2 Veidi and up to 1 sub-veids (`MAX_GROUP_TAGS`, `MAX_GROUP_SUBTAGS`, enforced by the service).
- Picking a sub-veids tags its Veids too and says so ("Pievienots arī: …"); dropping a Veids drops its sub-veidi. "+ Cits" suggests a new one.
- On the board, choosing a sub-veids replaces its Veids in the filter (tags match with OR).

## Notifications

- Stored only when the person must act or would miss something. Every notification opens exactly the thing it is about.
- A notification is read when you tap it; opening the list marks nothing.
- Email is a digest, not a copy: after 10 minutes unread, one email says how many things and what (headline, group or event, sender), never what was written. Only direct messages, requests, applications, questions and their answers (`EMAIL_DIGEST_TYPES`), plus Ziņa replies, chat requests and chat mentions. Off by the Iestatījumi switch or the link in every email.
- The only trace of a visit is `lastSeenAt`, day-level, written at most once a day, shown to admins as counts only. The privacy page says so.

Next: [Who sees what](roles.md).
