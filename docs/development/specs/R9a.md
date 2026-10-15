# R9a spec · Event page and event form

Just-in-time spec for release R9a of the [build plan](../build-plan.md) (card "R9a · Event page and event form"), written 15 Oct 2026 against `main` at `5bbc026` (R1a–R8, R6b, C2 live; C4 built, in review), Next.js 16.4, next-intl 4.13.7, Prisma 6.19. Frozen once R9a is pushed. The redesign page (`docs/development/redesign.html`, generated from `scripts/redesign/`) wins over this spec where they disagree, except where an owner note of 15 Oct changed a rule (below); the ledger line wins over a drawing.

**Owned rule:** [AR-59](../redesign.html#AR-59) Event page (the panel's content in full inside the group's frame; calendar, map, share, the practical info; the team's "Rīkotājiem" box; the group's image is in the banner, so an event without its own image shows no picture). **Also applied:** [AR-55](../redesign.html#AR-55) (the panel's parts, faces only for signed-in viewers), [AR-56](../redesign.html#AR-56) (the step's button names the step, "Gaida" after asking), [AR-57](../redesign.html#AR-57) (the event's own place, "Tiešsaistē"), [AR-70](../redesign.html#AR-70) (banner with the group's image), [AR-40](../redesign.html#AR-40) (the form's date picker: one month, Monday first, weekend tint), [AR-71](../redesign.html#AR-71) (counter on the title), [AR-02](../redesign.html#AR-02) (the form is not drawn: built from the same parts), [AR-49](../redesign.html#AR-49) (members-only things hidden, not greyed), AR-09, AR-10, AR-11.

**Owner decisions applied as written:** **OD-23** build the event page as drawn, including "no picture without the event's own image". **OD-18** one state for "full": the organiser's "Slēgt pieteikšanos" marks the event "Pilns" and the waiting list stays open. **OD-19** a members-only event opened from a link by someone outside the group: one sentence and the banner's "Sazināties". **C4** language input through `LanguageEditor` (built). **C5** contained, rounded 16:9 image (the event's own image uses it here; the group header follows in R9b).

**Owner notes of 15 Oct folded in** (the reviewer marks each done with the commit, `npm run feedback -- done <id> "…"`):

| Note | What | Where |
|---|---|---|
| `cmv9b6daz0038mk0191varga6` | "Svarīga informācija" in red becomes "Praktiskā informācija", a section styled exactly like "Par pasākumu"; a small lock line "Redzama tikai dalībniekiem" | 4.4 |
| `cmv9b80zl003dmk01yxymji8j` | "Visi pasākumi" moves up as a breadcrumb next to the group name; no gap between the banner and the event | 4.1 |
| `cmv9b418s…` | The form's "Adrese" → "Kur?" with a hint | **Already done** in the quick batch (`bd16140`, `6f03068`: label, hint, `aria-describedby`); the note is closed. R9a only moves `EventPlaceFields` with the split. |
| C4 notes | Language input in the form | Done in C4; moves with the split (6.1) |
| C2 review | A multi-day event that is still running shows its start date (yesterday) as "Nākamā tikšanās" on the card | 3 (one timing rule, "Notiek tagad · līdz …") |

**Data:** no migration (confirmed: every field the page and form need exists on `Event`, `EventTranslation`, `EventAttendee`). The seed gains a running two-day event and instructions on the approval events (7).

**Size and split: L, two build sessions.** The page and the form share no file except i18n, so they ship as two builds, each reviewed and pushed on its own:

- **R9a-1 · Event page** (sections 2–5, 7): timing rule and card wording, `getEventPage` context, the page, the banner breadcrumb, Rīkotājiem. About 22 files. Five commits. **Stop point:** after commit 2 (the service): the reviewer of R9a-1 is Opus (time and the instructions gate).
- **R9a-2 · Event form** (section 6): the wizard split into `forms/event/*`, the restyle, the skipped-hour check. About 14 files. Three commits.

R9a-2 may start only after R9a-1 is pushed (both touch `messages/*.json` and the handoff).

**Rules for the builder and the reviewer (owner, copied as given):**
- Drawings are illustrations at 375 and 1280 px, not pixel specs: build the intent, fluid; check at **360, 768, 1024, 1280, 1440, 1920** px; the reviewer judges against intent, not the drawing's pixels.
- Fix small issues found (≤ ~4 min) instead of listing them as leftovers; only report items that need a decision or real effort.
- Prototype stage: seed/dev-password sign-ins on ejam.lumm.eu and `ALLOW_DEV_PASSWORDS` are intended; never "fix" or report them.
- Dev server only through the browser preview tool (`preview_start` name "dev"), stopped at the end; switch seed accounts on localhost only; prefer text checks over screenshots; `window.confirm = () => true` before anything that may confirm.
- Every commit typechecks on its own: a deletion lands in the same commit as its replacement.
- Never push (the reviewer pushes).

Every new component stays under ~150 lines (limits per file below). Look at `/admin/handbook/ui-elements` first; reuse `Fact`, `CategoryLine`, `FacesLine`, `JoinStep`, `Badge`, `FallbackLangLabel`, `Button`, `TextLink`, `ConfirmDialog`, `ConfirmPopover`, `LanguageEditor`, `TextCounter`, `MonthGrid`, `Switch`.

## Drawings to match

Redesign page, "An event" ([#h-event](../redesign.html#h-event)) → "The event's own page": **"Desktop · the event page · seen by Pēteris"** (signed in, not a member) and **"Phone · the event page · group team"** (Anna) with the note beside it ("Kept from today …", "The team also sees …"). Sources: `scripts/redesign/gen.mjs` 513–520, `parts.mjs` 247–256 (`evAct`, `going`, `eventPage`), CSS `.rd-evp` in `css.mjs`. The four "Events you can't simply join" cases (#q-states) give the step words.

| Drawing | What to see |
|---|---|
| Desktop · Pēteris | Banner with the group's image and "Sazināties"; pages column (Informācija, Pasākumi open); one event surface: title, category line, when + "Pievienot kalendāram", where + "Atvērt kartē", the text, the practical info, "Ilze un vēl 11 iet", "Eju" and "Dalīties" on one line. No picture (the event has none of its own). |
| Phone · group team | Phone bar, the same surface full width, "Rīkotājiem" box at its bottom: "Iet 12 · Pieteikumi 0 · Gaidīšanas sarakstā 0", Labot, Slēgt pieteikšanos, Dzēst. |

Changed by the owner since: the tinted "Svarīga informācija" box is now a plain section like "Par pasākumu" (cmv9b6daz); the back link is a breadcrumb in the banner (cmv9b80zl).

## Invariants (must stay exactly as today; the reviewer checks each)

1. **Visibility × join mode are independent.** `PUBLIC`/`MEMBERS_ONLY` × `OPEN`/`REQUEST`, any combination.
2. **Members-only:** `getEventPage` returns null for anyone who is not an approved member or site admin; the page then asks `getMembersOnlyGate` and shows `MembersOnlyNotice` (one sentence, nothing from the event, `robots: noindex`), else `notFound()`. Metadata says nothing about the event for them.
3. **Open events:** "Eju" with a visible count; `maxParticipants` is context only ("Apmēram 20 cilvēku") and never blocks.
4. **Request events:** organiser approves or declines; the description is visible to everyone who can see the event; **instructions only to approved people and organisers, stripped in the service** (`instructionsVisible`, `resolveEventText(…, withhold)`) — never sent to the client and hidden by CSS.
5. **Full + waitlist:** "Pilns" is set by hand only (request events), the button becomes "Pieteikties gaidīšanas sarakstā", the waitlist is in join order and released by hand ("Uzņemt"). Cancel-while-full notifies the organiser; unmarking Full notifies the waitlisted (service unchanged).
6. **Request → Open** moves pending and waitlisted to going in one transaction, with the confirmation in the form first (`opensToWaiting`, `CONFIRMATION_REQUIRED`).
7. **No "Interested"**, no seats or tickets in any word.
8. **Past** (`isEventPast`, the Latvian day boundary): no join step, no "Pievienot kalendāram", not editable (edit page redirects), still deletable; "{n} piedalījās".
9. **Faces only for signed-in viewers** (D12): signed-out viewers get the number; the service queries no people for them.
10. **Organiser = event creator or group admin** (`canManage`); the people lists (pending, waitlist, going) are sent only to them.
11. **Owner text is never machine-translated:** the viewer's language when present, else the original with `FallbackLangLabel` and a `lang` attribute.
12. **Times are stored as UTC instants** (`timestamp(3)`), entered and shown in the viewer's zone (section 3). Nothing in R9a changes stored data.

## 0. Motivation and design alignment

- **Service Law / Context Law.** Today the page reads a spread of the raw Prisma result (`...eventFields`) from `getEventWithContext` and derives place, people line and online link in the page. R9a adds `EventService.getEventPage` returning a typed `EventPageData` (like `EventPanelData`): the page only lays it out. Faces come from the same `goingFaces` the panel uses, so panel and page cannot disagree.
- **Reuse before creating.** The page is the panel's content in full (AR-59): `Fact`, `CategoryLine`, `FacesLine`, `JoinStep` are reused as they are; nothing panel-like is rebuilt.
- **One timing rule.** "Running", "upcoming", "past" are decided in one helper (`lib/event-dates.ts`) and computed on the server, so a card, a panel and the page never disagree and no client renders "now" (no hydration mismatch).
- **Taxonomy Law.** No new colour on the client: the category dot uses `event.category.color` exactly as the panel does; the banner is untouched apart from its name line.
- **Action Consistency / Defensive Coding.** Actions are unchanged (`ActionResponse`, uppercase codes); every new button runs in a transition and is disabled while pending.
- **Handbook.** One reading width for group pages (760, design.md "Content widths"); sections all look the same (owner, cmv9b6daz); hidden, not greyed (AR-49) for members-only; the practical info lock line is a quiet fact, not a warning colour.

## 1. Who sees what on the event page (R9a-1)

Group-level states come from the frame (R3a/R3b, unchanged): signed out → "Sazināties" opens sign-in; signed-in non-member → "Sazināties"; pending group member → "Pieteikums nosūtīts" + "Atvērt sarunu"; member/team → no main button.

| Part | Signed out | Signed in, not a member | Member | Event: pending / waitlisted / declined | Event: approved (going) | Organiser |
|---|---|---|---|---|---|---|
| Members-only event | gate sentence | gate sentence | shown, quiet "Tikai biedriem" | as member | as member | shown |
| Title, category line, when, where, "Par pasākumu" | yes | yes | yes | yes | yes | yes |
| "Praktiskā informācija" on an OPEN event | yes, no lock line | yes | yes | — | yes | yes |
| … on a REQUEST event | heading + lock + "būs redzama pēc apstiprināšanas" (no text) | same | same | same | text + lock line "Redzama tikai dalībniekiem" | text + lock line |
| Online link on a REQUEST event (Default 2) | "Tiešsaistē", link withheld | same | same | same | link | link |
| Who is going | "12 iet" | faces + name | faces + name | faces + name | "Tu un vēl 11 iet" | faces + name |
| Step | "Eju"/"Pieteikties" → sign-in pop-up, then continues | "Eju" / "Pieteikties" / "Pieteikties gaidīšanas sarakstā" | same | "Gaida" + "Atsaukt pieteikumu" / waitlisted + "Izstāties…" / "Šoreiz nē" | "Eju ✓" + "Atteikties" (open) / "Tu esi iekšā" + "Atteikties no dalības" (request, confirm) | open: own "Eju"; request: no step |
| "Dalīties" | yes | yes | yes | yes | yes | yes |
| "Rīkotājiem" | — | — | — | — | — | yes |

| Event state | What changes |
|---|---|
| Upcoming | as above |
| Running (started, end in the future) | `Badge tone="tag"` "Notiek tagad" at the end of the when fact; still joinable; "Pievienot kalendāram" hidden |
| Past | step line shows "Šis pasākums jau ir noticis." (JoinStep `tookPlace`, as today); people line "{n} piedalījās" (nothing when 0); no calendar link; Rīkotājiem keeps only "Dzēst" |
| Full (request) | quiet "Pilns" after the request word in the status line; step "Pieteikties gaidīšanas sarakstā" with "fullNote"; Rīkotājiem shows "Atvērt pieteikšanos" |
| Request to join | quiet "Pieteikšanās" in the status line; step note "Organizators apstiprina, kas piedalīsies." |
| Members-only | quiet "Tikai biedriem" in the status line (members only ever see it) |

The **status line** is one quiet 13 px line under the category line, words joined by " · ": "Tikai biedriem", "Pieteikšanās", "Pilns" (only those that apply; no line when none apply). Same words as the row (AR-56), grey, never a coloured badge.

## 2. Data

None (no migration). Confirmed fields: `Event.startDate`, `endDate`, `bannerImage`, `isOnline`, `location`, `city`, `visibility`, `joinMode`, `isFull`, `maxParticipants`, `originalLang`; `EventTranslation.{title,description,instructions}`; `EventAttendee.status/joinedAt`.

## 3. Time: stored, entered, shown (both sessions; the Opus reviewer reads this first)

**Stored.** UTC instants (`DateTime` → Postgres `timestamp(3)`). Unchanged.

**Entered (R9a-2 keeps the current mechanism exactly).** The form holds local strings `"YYYY-MM-DDTHH:mm"` in the **browser's** zone (`lib/local-datetime.ts`). They become instants **in the browser**: `zodResolver(eventSchema)` runs client-side, `new Date("YYYY-MM-DDTHH:mm")` reads local time, and the action receives a `Date` (server actions serialise `Date`). The server re-validates with the same schema; a `Date` input is not re-interpreted. **The builder must not move parsing to the server or send the raw string** (the server runs in UTC: it would shift every event by 2–3 hours). Default values are set after mount (server zone ≠ browser zone), as today. The end follows the start on the wall clock (`addMinutesLocal`), as today. Hint under the times: "Laiki ir tavā laika joslā ({zone})", as today.

**DST, new in R9a-2.** Riga skips 03:00–03:59 on the last Sunday of March and repeats it on the last Sunday of October (25 Oct 2026). A **skipped** time (e.g. 29 Mar 2026 03:30) silently becomes 04:30 in the browser today. New helper `localTimeExists(value: string): boolean` in `lib/local-datetime.ts` (`toLocalValue(new Date(value)) === value`); the form's step-1 validation adds `eventWizard.TIME_SKIPPED` on `startDate`/`endDate` when false (client-only check, not in the shared Zod schema, because the server's zone is UTC and would never fail it). A **repeated** time takes the first occurrence (browser behaviour; documented in the helper's comment, no UI).

**Shown.** Every time on the site is formatted with `createDateFormatter(locale, getTimeZone())` / `useDateFormatter()` in the viewer's zone from the `tz` cookie (`TimeZoneSync`, default `Europe/Riga`), 24 h, European order in both languages. On the event page the zone is named after the time when the viewer's zone is not `Europe/Riga` ("17:00–19:00 (GMT+1)"), as today. **Past** is decided at the Latvian day boundary (`isEventPast`), one fact for everyone, as today.

**Range format.** The event page uses the panel's form: `formatter.dateTimeRange(start, end, EVENT_DAY_TIME)` ("Svētd., 18. okt. 17:00–19:00"; multi-day "Sestd., 17. okt. 10:00 – svētd., 18. okt. 16:00"), only in Server Components (server and browser ICU space ranges differently; see `MonthCalendar` comment).

**Timing rule (R9a-1, new).** In `lib/event-dates.ts`:

```ts
export type EventTiming = 'upcoming' | 'running' | 'past';
/** Past by the Latvian day (isEventPast); running while start <= now < end (only events with an end); otherwise upcoming. */
export function eventTiming(e: { startDate: Date | string; endDate?: Date | string | null }, now = new Date()): EventTiming
```

Computed **on the server** (service or Server Component), never in a client component's render.

**"Next meeting" views skip finished events.** `getNextVisibleEvents` (card line, group panel, Informācija box) adds `{ OR: [{ endDate: null }, { endDate: { gt: now } }] }` to its where: an event that ended this morning is not "the next meeting" (lists keep the day rule and still show it under today). `NextEventView` gains `running: boolean` (`eventTiming(e) === 'running'`).

**Card wording (the C2 review item), Default 1.** A running event on the card, the group panel and the Informācija box:
- LV "Notiek tagad · līdz {until}", EN "On now · until {until}" (`event.runningUntil`).
- `{until}` is `EVENT_DAY` ("svētd., 18. okt.") when the end is on another day than the start in the viewer's zone, else the time ("19:00"). The comparison is start vs end (deterministic), not "now", so client cards hydrate without mismatch.
- Not running: "Nākamā tikšanās: {date}" as today.
- `CardActivity` event becomes `{ kind: 'event'; at: Date; until: Date | null }` (`until` = end when running). One shared formatter `meetingLine()` in `lib/event-when.ts` (≤ 40 lines, pure: takes `t`, the formatter, zone and `{ at, until }`) used by `GroupCardActivity`, `GroupPanel` and `NextMeetingRow`.
- Event rows already say "kopš 12. okt." under a later day heading (`continuesFrom`): unchanged.

## 4. The event page (R9a-1)

### 4.1 Breadcrumb in the banner (cmv9b80zl)

- New `components/groups/frame/BannerName.tsx` (client, ≤ 50 lines) replaces the `<h1>` line in `GroupBanner.tsx`. It reads `useSelectedLayoutSegments()` (`next/navigation`; verify in `node_modules/next/dist/docs/` that it returns the segments under the group layout). On `events/<slug>`, `events/<slug>/edit` and `create-event`: the group name becomes a link to the group's home and is followed by a chevron (`ChevronRight` 14 px, `aria-hidden`) and the link "Visi pasākumi" (`event.allEvents`) to `/…/events`, inside `<nav aria-label={t('group.frame.breadcrumb')}>`; the name is then a `<p>` (the page's own `<h1>` is the event title / form title). Elsewhere: the `<h1>` exactly as today.
- Same font and size as the name; "Visi pasākumi" in the banner's quiet colour (`text-on-image` on an image), underline on hover. The name truncates first; "Visi pasākumi" never truncates (`shrink-0`). Phones: same line in the 64 px bar.
- The page's own "← Visi pasākumi" link goes (event page and create page); the edit page's "← {event title}" link stays as a subtitle link under its heading (6.3). The event surface starts right at the frame's top spacing (`FrameColumns`), no extra margin.

### 4.2 `app/[locale]/[l1Slug]/group/[groupSlug]/events/[eventSlug]/page.tsx` (rewrite, ≤ 90 lines)

`getEventPage` → null → gate / `notFound()` (invariant 2). Else renders `<EventJsonLd>` and `<EventArticle event={…} paths={…} />`. `generateMetadata` uses `getEventPage` (cached per request). JSON-LD moves to `lib/event-json-ld.ts` (≤ 60 lines, pure): description as plain text (`plainExcerpt`, no HTML), `image` only when there is one (today it sends `[null]`), `eventStatus` unchanged, the online link only when the viewer may see it.

### 4.3 `components/events/page/EventArticle.tsx` (server, ≤ 120 lines)

One surface (`bg-surface rounded-2xl`, 16 px, flat, no border, no shadow), `max-w-[760px]` (group-page width, design.md), left-aligned in the page column at every width (fluid below 760; nothing copied from the drawing). `data-ui={UI.eventPage}`, `style={{ '--c': category.color }}` as the panel. Order:

1. `EventPicture` (≤ 30 lines): only `event.image` (the event's **own** `bannerImage`; never the group's, AR-59), `aspect-video`, `rounded-2xl`, `object-cover`, `next/image` `unoptimized` as the banner, `alt=""`; inside the surface's top padding (contained, C5). Past events: no grayscale (the step line says it).
2. Title `<h1>` Literata 600, 22 px phones / 28 px from `md` (page title), `lang`; `FallbackLangLabel` under it when the title is in another language (as today).
3. `CategoryLine` (category + sub-categories, as the panel).
4. Status line (section 1).
5. `EventFacts` (≤ 80 lines): `Fact icon={CalendarDays}`: the range (3), zone name when not Riga, then **"Pievienot kalendāram"** (upcoming only) or the "Notiek tagad" tag (running). `Fact icon={MapPin}`: online → "Tiešsaistē" + the "Pievienoties tiešsaistē" link (`event.joinLink`, retext in 8) when the link may be shown, or the locked sentence (Default 2); else "City, address" + "Atvērt kartē" (Google Maps query of address + city, as today). Inline links use `TextLink` style (site colour, 600, `whitespace-nowrap`, 4 px left gap) like the drawing.
6. `EventTextSection title={t('aboutEvent')}` with the description (when present).
7. `EventTextSection title={t('practicalInfo')}` (4.4).
8. People line: past → "{n} piedalījās" (none when 0); else `FacesLine` + " · Apmēram {n} cilvēku" when `maxParticipants` (one line, wraps).
9. `JoinStep join={event.join} trailing={<ShareEventButton …/>}` — the step and "Dalīties" on one line (drawing). For the request-event organiser the step is `none` and the line holds only "Dalīties".
10. `EventOrganiserBox` (team only, 4.5), inside the surface at its bottom (`bg-background` inset box, 16 px radius, drawing `.rd-box2.org`).

Gaps: 8–10 px between parts (panel rhythm), 24 px before each section heading; surface padding 18 px phones / 24 px from `md`. Phones: the surface spans the page column (16 px gutters from the frame).

`AddToCalendar.tsx` (edit): a text link "Pievienot kalendāram" (no box, no icon; the fact has the icon) opening Google Calendar in a new tab as today; the end defaults to +1 h as today; the description is plain text (tags stripped, as today); the location includes the city. **Never includes instructions.** (Default 3: no `.ics` file in R9a.)

`ShareEventButton.tsx` (edit): a quiet text button `Share2` 16 px + "Dalīties" (`event.share`), 44 px touch target, `useShareLink` as today.

### 4.4 `components/events/page/EventTextSection.tsx` (server, ≤ 50 lines) — cmv9b6daz

One component for both sections, so they cannot drift: `<section>` with `<h2>` Literata 600 17 px (item-title size, inside a surface), optional `FallbackLangLabel` when its language differs from the title's (as today), then the sanitised HTML (`sanitizeRichText`, `prose` body 15–16 px / 1.6, foreground colour, links in the site colour). **No accent colour, no tint, no border, no icon in the heading** (the red "Svarīga informācija" goes).

Practical info variants (props `lock?: 'members' | 'locked'`):
- OPEN event: heading + text, no lock line (everyone who can see the event may read it, invariant 4).
- REQUEST event, viewer may read it (approved or organiser): heading, under it a quiet 13 px line with `Lock` 14 px icon "Redzama tikai dalībniekiem" (`event.practicalInfoMembers`), then the text.
- REQUEST event, viewer may not (`instructionsLocked`): heading, then the quiet lock line with "Praktiskā informācija būs redzama pēc tam, kad organizators apstiprinās tavu dalību." (`event.instructionsLocked`, existing). No placeholder box, no dashed border. Nothing else of the text is in the HTML (it never left the service).
- No instructions at all: no section.

### 4.5 `components/events/page/EventOrganiserBox.tsx` (client, ≤ 120) + `OrganiserPeople.tsx` (client, ≤ 110)

Replaces `EventOrganiserPanel.tsx` and `EventManageActions.tsx` (both deleted in the same commit). `data-ui={UI.eventOrganiser}`.

- Heading "Rīkotājiem" (`event.organiser.title`), 13 px 600.
- Count line: "Iet **12**" (open) / "Apstiprināti **12**" (request) · "Pieteikumi **3**" (request only) · "Gaidīšanas sarakstā **2**" (request, when full or > 0). Each count is a button (`aria-expanded`, `aria-controls`) that opens its list under the line; one list open at a time; the "Pieteikumi" list opens by default when it has people. Counts in the foreground colour, labels muted (drawing).
- `OrganiserPeople`: rows name + actions: Pieteikumi → "Apstiprināt" (primary sm) / "Noraidīt" (quiet sm); Gaidīšanas saraksts in join order with "1." … → "Uzņemt" (primary sm); Iet/Apstiprināti → names only. Empty: "Pagaidām neviena." / existing empty strings. Names link to the profile when a username exists (`/profile/{username}`), else plain.
- Buttons (`Button` sm, quiet): "Labot" (upcoming/running only), "Slēgt pieteikšanos" / "Atvērt pieteikšanos" (request only; hint `closeSignupsHint` as `title`/description under the row), "Dzēst" (danger quiet; `ConfirmDialog` with `deleteConfirm`, then `/…/events`), as today.
- Every action through `useTransition`, all buttons disabled while one runs, `router.refresh()` after, errors via `errors.*` (as today). After approving/declining, focus moves to the next row's first button or the list's toggle.
- Past: only "Dzēst" (and the "piedalījās" count line without lists).

### 4.6 Service: `EventService.getEventPage` + `lib/services/event-page.ts` (new, ≤ 150 lines)

`event-page.ts` holds `EventPageData` and its mapper; `event.service.ts` gets the cached `getEventPage(eventSlug, groupSlug, locale, userId?, l1Slug?)` (≤ 60 lines in the service file; the file is 984 lines: the mapper goes in `event-page.ts`, not in the service).

```ts
export interface EventPageData {
  id: string; slug: string;
  title: string; titleLang: TextLang;
  description: string | null; descriptionLang: TextLang;
  /** null when withheld or empty */ instructions: string | null; instructionsLang: TextLang;
  instructionsLocked: boolean;
  startDate: Date; endDate: Date | null; timing: EventTiming;
  city: string; isOnline: boolean;
  /** Address, or the online link; null when withheld (Default 2). */ location: string | null;
  onlineLinkLocked: boolean;
  /** The event's own image only. */ image: string | null;
  membersOnly: boolean; joinMode: EventJoinModeValue; isFull: boolean; maxParticipants: number | null;
  category: { l1Slug: string; l1Title: string; color: string }; subCategories: string[];
  group: { name: string; slug: string; city: string };
  join: EventJoinView;
  going: { count: number; viewerGoing: boolean; people: Face[] | null };
  /** Organisers only. */
  organiser: { going: Person[]; pending: Person[]; waitlist: Person[] } | null;
}
```

- Same access, members-only and instructions rules as `getEventWithContext` (invariants 2, 4, 10); legacy online events (a link in `location`) count as online, as today.
- **Default 2:** for a REQUEST event, when the viewer may not read the instructions, an online event's `location` is null and `onlineLinkLocked` true (the link is practical info; the panel already never sends it).
- `going.people` from the existing private `goingFaces` (signed-in only, D12). `organiser` only when `canManage`.
- `getEventWithContext` stays for the edit page only (its `editable` texts); the event page, its metadata and JSON-LD stop using it.

## 5. Handbook, UI elements, constants (R9a-1)

- `UI.eventPage = 'event-page'`, `UI.eventOrganiser = 'event-organiser'` in `lib/constants/index.ts`; both on `/admin/handbook/ui-elements` (an event page example with a seed event, and the Rīkotājiem box).
- `docs/handbook/design.md`: Components gains **Event page** ("The panel's content in full inside the group frame, one surface 760 px wide: own picture only (16:9, rounded), title, category line, the status words, when with 'Pievienot kalendāram', where with 'Atvērt kartē', 'Par pasākumu' and 'Praktiskā informācija' as identical sections (a lock line when only participants see it), who is going, the step and 'Dalīties', 'Rīkotājiem' for the team"), and **Breadcrumb** ("A group's subpage that belongs to a list names it after the group in the banner: 'Vēja zirdžiņš › Visi pasākumi'; pages never put a back link between the banner and the content"). Screens table: "Event page | B | R9a done". Fix the stale "Tikšanās vēl nav izziņota" in "Group card and row" (C2 removed it): "the group's note (the next meeting or 'Notiek tagad · līdz …', else the newest public announcement, else the tagline; nothing when none)".
- `docs/handbook/behaviour.md` "Dates and times": replace "Riga time, 24 h" with "24 h in the viewer's own zone, named on the event page when it is not Latvian time; an event is past after its last day in Latvian time; a running event says 'Notiek tagad · līdz …'. Organisers enter times in their own zone, in 15-minute steps; a time the clock skips that night cannot be chosen."
- `docs/handbook/voice.md` table: "A section of an event only participants see | Praktiskā informācija · Redzama tikai dalībniekiem | Practical info · Shown only to people taking part"; "An event happening now | Notiek tagad · līdz 18. okt. | On now · until 18 Oct".
- `docs/execution_handoff.md`: R9a-1 ticked with commits; build plan section 8 status row "R9a" → "R9a-1 built / R9a-2 not started".

## 6. The event form (R9a-2)

### 6.1 Split `components/forms/EventCreationWizard.tsx` (555) into `components/forms/event/*`

Commit 6 is a pure move (no visual change; the reviewer diffs behaviour):

| File | Lines | Holds |
|---|---|---|
| `event/EventForm.tsx` (client) | ≤ 130 | `FormProvider`, `LanguageEditor` wrapping the steps, step header, progress, nav buttons, the open-to-waiting `ConfirmDialog`, server error. Exported type `EventToEdit` moves here. |
| `event/useEventForm.ts` | ≤ 150 | `useForm` + defaults, mount effect for times, `changeStart`/`changeEnd`, text helpers (`copyFromOriginal`, `clearText`, `changeOriginal`, `langsWithErrors`), `validateStep`, `save`, `opensToWaiting`. |
| `event/WhatWhenStep.tsx` | ≤ 120 | title (+ `TextCounter`), description, image URL, `EventTimeFields`, `PlaceFields`. |
| `event/EventTimeFields.tsx` | ≤ 70 | the two `DateTimeField`s, errors, zone hint. |
| `event/WhoCanComeStep.tsx` | ≤ 120 | visibility, join mode, about how many, practical info (+ its hint by join mode). |
| `event/ChoiceGroup.tsx` | ≤ 60 | the radio cards used by visibility and join mode. |
| `event/PlaceFields.tsx` | moved `EventPlaceFields.tsx` (96) | unchanged |
| `event/DateField.tsx`, `DateTimeField.tsx`, `TimeSelect.tsx` | moved | only the event form uses them (checked) |

`create-event/page.tsx` and `edit/page.tsx` import `EventForm`. `EventCreationWizard.tsx` is deleted in the same commit.

### 6.2 Restyle (commit 7; built from the rules, AR-02)

- One surface (`bg-surface rounded-2xl`, flat: no `shadow-lg`, no border), `max-w-[560px]` (focus width), padding 18 px phones / 24 px from `md`. The coloured progress bar goes; the step header is "1. solis no 2" (13 px muted) + step title Literata 21 + one muted line.
- Fields follow the handbook form field: label above (14 px 500, no icons in labels), input 12 px radius 44 px tall on phones / 40 from `md`, help text below, the error replaces the help text. Remove the label icons (`Type`, `AlignLeft`, `Calendar`, `Eye`, …): icons only next to words where they mean something.
- `ChoiceGroup`: real `<input type="radio">` inside `<label>` rows (`role="radiogroup"` with `aria-labelledby`), 12 px radius ring; chosen: site-colour ring + tint, never the category colour. Replaces the `<button>` cards (keyboard: arrows move, as native radios).
- Buttons: `Button` primary "Tālāk" / "Izveidot pasākumu" / "Saglabāt izmaiņas" at the right, quiet "Atpakaļ" at the left; while pending a spinner in the button and both disabled (`isPending`).
- Practical info hint next to its field, by join mode (`fieldInstructionsHintOpen` / `…Request`), as today.
- `TextCounter` on the title (exists). Description and practical info keep their HTML caps without a counter (out of scope, 11).
- Skipped DST hour check (3).

### 6.3 Page heads (`create-event/page.tsx` ≤ 50, `edit/page.tsx` ≤ 70)

- Breadcrumb in the banner (4.1); no back link above the form.
- Create: `<h1>` "Jauns pasākums" (`eventWizard.createTitle`, page title 28/600, 22 on phones), the muted line `event.createSubtitle`. The group's name is no longer the page title (it is in the banner).
- Edit: `<h1>` "Labot pasākumu", then a quiet line linking to the event by its title (`TextLink`), then `event.editSubtitle`.
- Both left-aligned at the form's left edge (no centred heading), the form under them.
- After save: the event's own page in full (`loadFullPage`), as today.

## 7. Seed (R9a-1 commit 1)

`EventSeed` gains `endDate?: Date`, `isFull?: boolean`, `instructions?: string`. Add: one public open **running** event (start `days(-1)` 10:00, end `days(1)` 16:00) in a group with a card, so the card shows "Notiek tagad · līdz …"; instructions on the two approval events ("Tempa treniņš…", "Mazā Catan…") and on one open event; `isFull: true` with one waitlisted attendee on "Mazā Catan…"; one event with its own `bannerImage` (an existing Unsplash URL from the seed). Keep every existing case.

## 8. i18n (both files, same commit; `npm run i18n:check`)

| Key | LV | EN | |
|---|---|---|---|
| `event.practicalInfo` | Praktiskā informācija | Practical info | replaces `importantInfo` (removed) |
| `event.practicalInfoMembers` | Redzama tikai dalībniekiem | Shown only to people taking part | |
| `event.instructionsLocked` | (unchanged) | (unchanged) | |
| `event.onlineLinkLocked` | Saite būs redzama pēc tam, kad organizators apstiprinās tavu dalību. | The link shows once the organiser approves you. | Default 2 |
| `event.joinLink` | Pievienoties tiešsaistē | Join online | retext |
| `event.addToCalendar` | Pievienot kalendāram | Add to calendar | replaces `addToGoogleCalendar` |
| `event.share` | Dalīties | Share | replaces `shareEvent` |
| `event.runningNow` | Notiek tagad | On now | the tag |
| `event.runningUntil` | Notiek tagad · līdz {until} | On now · until {until} | card, panel, Informācija |
| `event.organiser.title` | Rīkotājiem | For organisers | replaces `organiserTitle` |
| `event.organiser.going` | Iet | Going | count label |
| `event.organiser.approved` | Apstiprināti | Approved | |
| `event.organiser.requests` | Pieteikumi | Requests | |
| `event.organiser.waitlist` | Gaidīšanas sarakstā | On the waiting list | |
| `group.frame.breadcrumb` | Ceļš | Breadcrumb | nav label |
| `eventWizard.createTitle` | Jauns pasākums | New event | R9a-2 |
| `eventWizard.TIME_SKIPPED` | Šāda laika tajā naktī nav: pulksteņus pagriež uz priekšu. Izvēlies citu laiku. | That time doesn't exist that night: the clocks go forward. Pick another time. | R9a-2 |

Removed when unused after the change (grep first): `event.dateAndTime`, `event.location`, `event.areYouComing`, `event.badgeRequest`, `event.importantInfo`, `event.addToGoogleCalendar`, `event.shareEvent`, `event.organiserTitle`, `event.goingCount`, `event.approvedCount`; R9a-2: `eventWizard.step*` stay, label-icon-only keys none. `event.wentCount`, `aboutPeople`, `tookPlace`, `full`, `membersOnly`, `state.request`, `allEvents` stay (reused).

## 9. Builder steps and commits

**R9a-1** (Sonnet build, Opus review):
1. `feat(R9a): one timing rule; a running event says "Notiek tagad · līdz …" on cards and panels` — `lib/event-dates.ts` (`eventTiming`), `lib/event-when.ts`, `getNextVisibleEvents` (skip finished, `running`), `card-activity.ts`, `GroupCardActivity`, `GroupPanel`, `NextMeetingRow`, seed (7), i18n `runningUntil`/`runningNow`.
2. `feat(R9a): getEventPage, the event page's typed context` — `lib/services/event-page.ts`, `EventService.getEventPage`, `lib/event-json-ld.ts`. **Stop and report** (stop point).
3. `feat(R9a): the event page in the new look` — `events/[eventSlug]/page.tsx`, `components/events/page/{EventArticle,EventPicture,EventFacts,EventTextSection}.tsx`, `AddToCalendar`, `ShareEventButton`, i18n.
4. `feat(R9a): Visi pasākumi as a breadcrumb in the banner; Rīkotājiem box` — `BannerName.tsx`, `GroupBanner.tsx`, `create-event/page.tsx` back link removed, `EventOrganiserBox`, `OrganiserPeople` (old `EventOrganiserPanel`, `EventManageActions` deleted), `UI` constants.
5. `docs(R9a): handbook event page, breadcrumb, times; UI elements; status` — section 5.

**R9a-2** (Sonnet build, Opus review for the time check):
6. `refactor(R9a): the event form split into forms/event/*` (pure move).
7. `feat(R9a): the event form in the new look; a skipped hour cannot be chosen` — 6.2, 6.3, `localTimeExists`.
8. `docs(R9a): form done; status`.

## 10. Acceptance (builder runs it; the reviewer repeats it)

Checks: `npm run typecheck`, `npx eslint <changed files>`, `npm run i18n:check`. Browser: both locales (`/lv/…`, `/en/…`), widths **360, 768, 1024, 1280, 1440, 1920**; light and dark once each at 375 and 1280. Seed accounts on localhost only.

**R9a-1**
- [ ] Banner: on an event page "Group › Visi pasākumi", both links work; on Informācija/Biedri the plain name; one `<h1>` per page (the event title); no gap/back link between banner and surface at every width.
- [ ] Surface ≤ 760 px, left-aligned with the page column at 1024–1920; at 360 nothing overflows (long title, long address, 3 sub-categories, "Pieteikšanās · Pilns · Tikai biedriem").
- [ ] Event without own image: no picture. With own image: 16:9, rounded, inside the surface.
- [ ] "Par pasākumu" and "Praktiskā informācija" identical in type, colour and spacing (compare computed styles); no red, no tint.
- [ ] Open event with instructions, signed out: text visible, no lock line. Request event signed out / signed in not approved / pending / waitlisted: heading + lock sentence, and the instructions text is **absent from the HTML** (view source / `get_page_text`); approved and organiser: text + "Redzama tikai dalībniekiem".
- [ ] Online request event: link absent from the HTML and JSON-LD for non-approved viewers (Default 2), present for approved/organiser.
- [ ] Signed out: "12 iet" only (no names, no avatars in the HTML); signed in: faces + name; going viewer: "Tu un vēl …".
- [ ] Step for each case (open / request / full / pending / approved / waitlisted / declined / past); sign-in pop-up from "Eju" continues after sign-in; "Dalīties" on the step's line.
- [ ] Members-only event: member sees it with "Tikai biedriem"; non-member and signed out get the one sentence + banner "Sazināties"; a slug that does not exist → 404.
- [ ] Past event: "Šis pasākums jau ir noticis.", "N piedalījās", no calendar link, Rīkotājiem only "Dzēst"; `/edit` redirects to the event.
- [ ] Running seed event: "Notiek tagad" tag on the page; its group card on discovery and its group panel say "Notiek tagad · līdz <end day>" (not yesterday's date); no hydration warning in the console.
- [ ] An event that ended earlier today is not the card's next meeting; it still shows under today in Pasākumi.
- [ ] Rīkotājiem (owner@local): counts, lists open/close (keyboard too), Apstiprināt/Noraidīt/Uzņemt work and refresh, Slēgt/Atvērt pieteikšanos only on request events, Dzēst confirms and lands on Pasākumi.
- [ ] Viewer zone ≠ Riga (set the `tz` cookie to `Europe/London`): page shows the London time followed by the zone's short name; with `Europe/Riga` no zone name.
- [ ] Metadata title "Event | Group"; members-only for an outsider: `noindex`, no title.

**R9a-2**
- [ ] Create and edit as owner@local in both locales: every field saves; the times shown on the event page equal the times entered (zone Riga, and again with the browser zone set to `Europe/London` via the preview's emulation or the OS: entered 17:00 London = 19:00 on a Riga-zone page).
- [ ] DST: start 29.03.2026 03:30 → `TIME_SKIPPED` under the start; 25.10.2026 02:00 + 2 h end reads 04:00 (existing wall-clock rule).
- [ ] Edit an event whose language has a translation: `LanguageEditor` keeps both drafts across steps (C4 behaviour unchanged).
- [ ] Request → Open with waiting people asks first and lets them in (invariant 6).
- [ ] Radios work with keyboard (Tab into the group, arrows choose); errors replace help texts; submit disabled while pending.
- [ ] Form ≤ 560 px, left-aligned with its heading; 360 px: date + time fit on one line.

## 11. Risks

- **Instructions leak** (invariant 4): the new page must take instructions only from `getEventPage`; the reviewer greps the HTML for the seed instructions text as a non-approved viewer. Same for the online link (Default 2) and JSON-LD.
- **Time parsing moving to the server** in the split (3): `useEventForm` must keep `handleSubmit(zodResolver)` on the client before the action. The Opus reviewer creates an event with the browser zone ≠ server zone.
- **Hydration** from "now": `running` is computed on the server; client components only format given instants.
- **`useSelectedLayoutSegments`** must be read from the group layout's level; check the edit and create pages, not only the event page.
- **`getNextVisibleEvents` filter** changes the card, the group panel and Informācija together (intended); lists and the day strip are untouched.
- Large service file (984 lines): new code goes to `event-page.ts`; don't grow `event.service.ts` beyond the one cached method.

## 12. Out of scope

- An `.ics` download (Default 3), counters on rich-text fields (their caps are HTML caps), the group header's image format (C5, R9b), event series, a banner/image picker, reporting from the event page (unchanged where it is).

## 13. Owner questions (the builder uses the default unless the owner objects)

1. **Wording for a running event** on cards, panels and Informācija: **Default "Notiek tagad · līdz svētd., 18. okt."** (same day: "līdz 19:00"); EN "On now · until Sun, 18 Oct".
2. **Online link of an approval event** (the meeting link is practical info): **Default: withheld until the organiser approves you**, like the practical info ("Saite būs redzama pēc tam, kad organizators apstiprinās tavu dalību."). Open events keep showing it to everyone who can see the event.
3. **"Pievienot kalendāram"**: **Default: opens Google Calendar, as today** (works on phones and computers); an `.ics` file for Apple/Outlook calendars later if wanted.
