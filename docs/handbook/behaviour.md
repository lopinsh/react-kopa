# Behaviour patterns

The same situation behaves the same way on every screen.

## Saving and sending

- The button shows it is working and can't be pressed twice.
- Success: a short toast, or the result appears in place.
- After creating something, open its page.

## Destroying

- Archive or hide first, delete only when needed.
- Permanent delete asks once, in our own dialog, naming the thing: "Dzēst jaunumu "Pārgājiens sestdien"?"
- Never the browser's `confirm()`.

## Errors

- Field errors under the field, in red, while typing is allowed to continue.
- Server errors in plain words near the button.
- Nothing fails silently.

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

- Inside the site: the sign-in pop-up, and afterwards the action continues where it was.
- Direct visits to private pages: the sign-in page.

## Dates and times

- Riga time, 24 h, Monday first, in both languages.
- Today: relative ("pirms 5 min"). Older: date ("9. okt., 20:07").
- Time pickers in 15-minute steps.

## Notifications

- Stored only when the person must act or would miss something.
- Every notification opens exactly the thing it is about.

Next: [Who sees what](roles.md).
