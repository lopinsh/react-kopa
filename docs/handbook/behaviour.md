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

## Notifications

- Stored only when the person must act or would miss something.
- Every notification opens exactly the thing it is about.
- A notification is read when you tap it; opening the list marks nothing.
- The only trace of a visit is `lastSeenAt`, day-level, written at most once a day, and shown to admins as counts only (Aktivitāte, R31); the privacy page says so.
- Email is a digest, not a copy (R33): after 10 minutes unread, one email lists how many things and what (bell headline, group or event, sender name), never what was written; only direct messages and requests, applications, questions and their answers (`EMAIL_DIGEST_TYPES`); off by the Iestatījumi switch or the link in every email.

Next: [Who sees what](roles.md).
