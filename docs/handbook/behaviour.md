# Behaviour patterns

The same situation behaves the same way on every screen.

## Saving and sending

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

## Text limits

- A field with a limit shows a count under its right end: quiet, then the warning colour in the last tenth, then red with how many are too many.
- Past the limit the send button waits; the text is never cut.

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

- Riga time, 24 h, Monday first, in both languages. Weeks start on Monday; "today" is the viewer's day in their own time zone.
- Today: relative ("pirms 5 min"). Older: date ("9. okt., 20:07").
- Time pickers in 15-minute steps.

## Search

- Results come as you type; the newest word wins.
- Esc or a click outside closes the search and keeps the word; Back closes it.
- A result opens its panel; Back returns to the page you were on.
- Recent searches stay on this device and can be removed one by one.

## Notifications

- Stored only when the person must act or would miss something.
- Every notification opens exactly the thing it is about.
- A notification is read when you tap it; opening the list marks nothing.

Next: [Who sees what](roles.md).
