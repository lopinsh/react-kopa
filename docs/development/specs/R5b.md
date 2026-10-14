# R5b spec · Discovery: events by day

Just-in-time spec for release R5b of the [build plan](../build-plan.md) (card "R5b · Discovery: events by day"), written 14 Oct 2026 against `main` at `440348b` (R1a–R5a live) and the redesign tag `redesign-v9.8.2`. Frozen once R5b is pushed. The redesign page (`docs/development/redesign.html`, generated from `scripts/redesign/`) wins over this spec where they disagree; the ledger line wins over a drawing.

**Owned rules:** [AR-24](../redesign.html#AR-24) Pasākumi opens on "Šonedēļ"; "Šodien" looks chosen only once tapped · [AR-39](../redesign.html#AR-39) day strip · [AR-40](../redesign.html#AR-40) date picker · [AR-54](../redesign.html#AR-54) the one event row. **Also applied:** [AR-11](../redesign.html#AR-11) dates (weekday short form, 24 h, viewer's zone, Monday first, weekend tint), [AR-23](../redesign.html#AR-23) / [AP-01](../redesign.html#AP-01) (the date parts of the filter line: Šodien · Šonedēļ · Nedēļas nogalē · the calendar, a range "15.–18. okt." with ×), [AR-27](../redesign.html#AR-27) (one date button on phones), [AR-58](../redesign.html#AR-58) (a group's Pasākumi uses the same rows, without line two), [AR-10](../redesign.html#AR-10) ("Eju"), AR-09 (small tags), AR-06 (site colour for every chosen day, button and dot; category tone only on the row's dot).

**Backend items:** D9 (date range, limit, count per day: `EventService.getDiscoverableEvents` / `countEventsPerDay`, built in R4, wired here). **No new migration** (section 1). If the builder finds one is needed, stop and report; do not write it.

**Owner decisions applied as written:** **OD-15** the day strip as drawn (seven days, Monday first, the month between ‹ and ›). **OD-16** weekends on a soft tint (`--tint`) in the strip and every calendar. **OD-17** the phone date button opens a sheet with the quick choices above the calendar. **OD-19** members-only events look like any event on the row (no lock word on the row).

**Size:** L (the card says M/L; the feedback step and the group card make it L), one Sonnet session, about 40 files (~15 new, 4 deleted, the rest edits). Eight commits. **No mandatory stop point** (no migration). **Stop point (hand-over only if the session runs long)**: the end of step 4 (the row live on a group's Pasākumi, discovery still on old cards).

**Feedback notes folded in** (step 6, own commit; the **reviewer** marks them done with `npm run feedback -- done <id> "…"`, never the builder):
- `cmv80zn460001qt01ld3scjvx` (BUG, `/lv/?city=Jelgava`, 1920 px): in the Kur list, clicking the city's name (the whole row), not only the tick box, must tick the city at once. Same class in the Veids list.
- `cmv810xd00006qt016p4jaxdo` + `cmv81zsos000bqt01h101jp03` (QUESTION + IMPROVEMENT, group cards): cards in a grid differ in height because of the note line; the owner wants every card the same size **and** a tagline (a short idea of what the group is about).

**Rules for the builder and the reviewer (owner, copied as given):**
- Drawings are illustrations at 375 and 1280 px, not pixel specs: build the intent, fluid; check at **360, 768, 1024, 1280, 1440, 1920** px; the reviewer judges against intent, not the drawing's pixels.
- Fix small issues found (≤ ~4 min) instead of listing them as leftovers; only report items that need a decision or real effort.
- Prototype stage: seed/dev-password sign-ins on ejam.lumm.eu and `ALLOW_DEV_PASSWORDS` are intended; never "fix" or report them.
- Dev server only through the browser preview tool (`preview_start` name "dev"), stop it at the end; logged-out checks with `fetch(..., {credentials:'omit'})` because the pane is often signed in as admin; prefer text checks over screenshots.
- Never push.

Every new component stays under ~150 lines (limits per file below). `forms/DateField.tsx` (223) shrinks by extracting the month grid; `groups/EventRow.tsx`, `discovery/EventCard.tsx`, `discovery/ListViewEventCard.tsx` are deleted, not split.

## Drawings to match

On the redesign page, "Discovery" ([#h-disc](../redesign.html#h-disc)), "An event → the event row" ([#h-event](../redesign.html#h-event)) and "A group" ([#h-group](../redesign.html#h-group)). Sources: `scripts/redesign/gen.mjs` 43–47 (sample days; the page's "today" is Monday 12 Oct 2026), 287–288 and 292–293 (the filter line on Pasākumi, desktop and phone, and "What counts as chosen"), 297 and 301 (the calendar), 334–345 (Pasākumi desktop and phone, the day strip and date picker notes), 468 and 477 (a group's Pasākumi), 486–494 (the event row); `parts.mjs` 22–26 (`pill`: "Eju", outlined "Gaida"), 64–79 (`ev`, `textLink`, `dayh`, `evList`), 132–144 (`QUICK`, `dateGroup`, `dateChip`, `nChosen`), 158–176 (`frow`, `frowPh` with the date parts), 223–236 (`calendar`, `dayStrip`); CSS `css.mjs` 178–195 (date group), 233–248 (calendar), 307–346 (day list, row, text link, day strip).

| Drawing | What to see |
|---|---|
| "Desktop · Pasākumi · Jelgava · Sports un fitness · drawer folded" | the folded rail; line 1 `[📍 Jelgava ×] [● Sports un fitness ×] [Šodien · **Šonedēļ** · Nedēļas nogalē · 📅] … Notīrīt visu [Grupas \| Pasākumi]`; line 2 the Veids chips; the day strip (a framed surface: "Oktobris 2026" in the middle, ‹ › at the two ends, seven days P…Sv with the day number, a dot under days with events, Saturday and Sunday tinted, the chosen day filled in the site colour, empty days greyed); then one surface list: day headings ("Šodien · pirmd., 12. okt.", "Rīt · otrd., 13. okt.", "Ceturtd., 15. okt." …) with rows in two columns read down then across; days without events have no heading; "Rādīt nākamo nedēļu" centred under the list as a plain text link |
| "Phone · Pasākumi · … · Tuesday tapped" | the switch line; Kur, Tēma and one date button "Šonedēļ ▾" on one line; the strip with Tuesday filled and Monday (today) outlined; the list starts on Tuesday ("Otrd., 13. okt."), one column |
| "Desktop · Pasākumi · two cities and a range from the calendar" (AP-01) | "Jelgava +1", the Tēma, the three quick choices unchosen and the fourth segment reading "📅 15.–18. okt. ×" chosen; "Notīrīt visu" |
| "The calendar button · a range · a month only" | a 300 px drop-down under the calendar segment: "2026. gada oktobris" with ‹ › right next to it, P O T C Pk S Sv, weekend columns tinted, past days faded, today bold and underlined, the range 15–18 as a filled start and end with a soft site-colour band between; footer "Ceturtd., 15. – svētd., 18. okt." and the button "Rādīt 23". No quick choices inside |
| The event row (2) | line one: time (muted, tabular), the category dot, the name (semibold, cut with "…"), the city at the right (left out when one city is chosen); under the time the "Eju" tag whose tick starts where the time's first digit starts; line two (12 px): the group as an underlined link, "· category · sub-category"; last line: the short description, muted, one line, "…"; thin lines between rows, 8 px hover radius |
| "Desktop · Pasākumi · group team" / "Phone · Pasākumi · member" | tabs Gaidāmie / Pagājušie with "Izveidot pasākumu" at the right end (R3a, unchanged); the same day list, rows without line two |

## Orchestrator defaults (tell owner)

What the rules and drawings leave open; one default each, to be confirmed by the owner later.

1. **Dates in the URL.** `date` holds the choice: absent = Šonedēļ; `today`, `weekend` (relative words, so a shared link means "today" for whoever opens it); `2026-10-15` a day; `2026-10-15..2026-10-18` a range; `2026-11` a month. `day=2026-10-13` is where the list starts inside the choice (the strip's tap). Both only with `tab=events`.
2. **A tap on the strip** starts the list at that day (to the end of the choice), as in the phone drawing; the filter line's choice does not change. A tap on a day outside the choice (e.g. Thursday while "Šodien" is chosen) makes that day's week the choice and starts there.
3. **‹ › and "Rādīt nākamo nedēļu"** go to the adjacent week: the choice becomes that Monday–Sunday range (it reads "19.–25. okt." with × on the filter line); going back to this week returns to plain Šonedēļ. Discovery shows no past weeks, so ‹ is off on this week. "Rādīt nākamo nedēļu" shows under the list when the choice is a week (Šonedēļ or a Monday–Sunday range), also when the week is empty; it scrolls to the top. On phones a sideways swipe on the strip also moves a week (the drawing's note).
4. **Upcoming only.** The list starts at today (viewer's zone) even when the choice starts earlier (Šonedēļ on a Wednesday starts on Wednesday; AR-24: Šodien is still not marked). A choice that ended before today (an old shared link) redirects to plain Šonedēļ.
5. **The calendar** (desktop drop-down and phone sheet): the first tap picks a day, the second a range (taps in either order); "Rādīt N" applies it. Before any tap the footer offers "Viss mēnesis" (the shown month, from today if it is this month). Ranges are at most 62 days (`DISCOVERY_DAY_RANGE_MAX`): days beyond are disabled while picking the end. Months from this one to 12 ahead. N is summed from per-day counts loaded with the page for this month and the next; beyond that the button reads plain "Rādīt". The drawing's "a month only" means the picker shows one month without quick choices; choosing a whole month is this default's extra.
6. **When the line is too narrow** for the four date segments (the filter line's own width below 56 rem, i.e. most widths with the drawer open below ~1280 px), desktop shows the phone's single date button, which opens the same quick choices above the calendar as a drop-down. One tree, a container query, nothing wraps.
7. **The switch, "Notīrīt visu" and counts.** Switching to Grupas drops `date` and `day`; back on Pasākumi it starts on Šonedēļ. "Notīrīt visu" clears dates too. A date other than Šonedēļ counts as one chosen thing ("Notīrīt visu" from 2; the drawing's `nChosen`). The drawer, Kur and Veids counts on Pasākumi apply the list's dates, so a count equals the rows you then see.
8. **At most 200 events** per list (`DISCOVERY_EVENTS_MAX_LIMIT`); when more match, a quiet line under the list says so and suggests a shorter time or a place.
9. **The row has no join button** (joining moves to the panel in R6; until then the row opens the event page, which has it). Tags: "Eju" when you go, outlined "Gaida" when you asked or wait; nothing else on the row: no lock word (OD-19), no request/full/closed word (AR-56 is R6's and adds its quiet word to this row), no title-language label (the title keeps its `lang` attribute; the page shows the label). On a group's Pasākumi the team's "Pārvaldīt · N jauni" leaves the row; the event page's organiser box keeps it.
10. **Multi-day events** sit under the first shown day they cover (the same rule as R4's per-day counts), with "kopš 12. okt." after the city when they started earlier.
11. **Two columns** when the list itself is at least 48 rem wide (a container query), read down then across within each day; one column on phones and with the drawer open at 1024.
12. **Weekday letters** in the strip and calendars come from messages (`P O T C Pk S Sv` / `Mo Tu We Th Fr Sa Su`), because Intl's narrow Latvian form repeats letters (P, S); full dates in labels still come from the formatter.
13. **Group page rows keep the city** (AR-54: "only line two is left out"); online events read "Tiešsaistē" there and on discovery.
14. **Tagline (Proposal, orchestrator default; notes `cmv810xd` + `cmv81zsos`).** The data model has no short-description field (`Group` has `description`, the long home text, and `lookingFor`, 60 chars, which is already the card's note). So no new field and no migration: the tagline is **the first words of the group's public home section** ("Par mums", order 0) in the viewer's language (the written language when there is no translation), plain text, cut by the service at 160 characters. The card shows it in two muted lines under the place line; the row (phones, short lists) as one muted line, cut with "…", the same as the event row's description line. A members-only home section gives no tagline (never the `description` column, which mirrors that section). The redesign card has no tagline line (`parts.mjs` 50–55: name, category line, place, note); this adds one, so it is a proposal for the owner. The alternative is a dedicated field ("Īsi par grupu", ~100 characters, written in settings), which needs a migration and a release of its own.
15. **One card height (Proposal, same notes).** Every card reserves the same lines whatever it holds: the name two lines, the category line one, the place line one, the tagline two, and under the thin line the note two (the team's "Ko meklējam?" may take two lines; the next meeting takes one). The grid also uses equal row heights, so the whole grid, not just one row, has one height at every width. A group with neither note shows the quiet line "Tikšanās vēl nav izziņota" instead of an empty strip.
16. **Kur/Veids rows (note `cmv80zn46`).** A click anywhere on a row (name, count, tick) ticks or unticks it at once, exactly like the tick box (desktop: applied at once, the list stays open; phones: applied when the sheet closes, R5a default 2). Several choices stay possible; a click on a name does not mean "only this city".

## 0. Motivation and design alignment

- **Service Law.** Every query stays in `lib/services/`: the discovery list and per-day counts (`EventService.getDiscoverableEvents`, `countEventsPerDay`, R4's), a group's rows (`EventService.getGroupEventRows`, replaces `getGroupEvents`), facet counts with dates (`DiscoveryService.getCounts`, R4's `from`/`to`), the card's tagline (`toGroupCard` via `GROUP_CARD_RELATIONS`). One shape for every event row, `EventRowData`, built in `lib/services/event-row.ts` the way `group-card.ts` builds `GroupCardData`: localized title, excerpt, resolved category title and tone, sub-categories, the viewer's tag. No Prisma in components or pages.
- **Context Law.** The discovery page puts its date state (`today`, the choice's days, the strip's week and counts, the calendar's counts) into `DiscoveryState.dates`; the date parts read `useDiscovery()` and the URL through `useDiscoveryNav()`. The new `EventRow` gets its event as a list item (like `GroupCard`), never a role, an accent or a `canManage` flag: the old row's `canManage`/`pendingCount` props and the event cards' `accentColor` prop go (the plan's Context Law note for `EventRow`).
- **Taxonomy Law / AR-06.** The row's dot takes the service's category tone as `--c` on the row (the established `CategoryLine` / `GroupCard` pattern); chosen days, ranges, the dot under a day, "Rādīt N", the text link and the date segments use site tokens (`primary`, `tint`, `foreground`). No inline `--accent`.
- **Defensive Coding.** URL dates are parsed by one pure function (invalid dates, reversed ranges, too-long ranges and junk are cleaned, never thrown); navigations run inside `useTransition` (`aria-busy` on the filter line, R5a); "Rādīt N" is disabled while a navigation is pending.
- **Action Consistency.** No new action, no new error code.
- **Zero-Any / Constants.** Plain string day keys (`YYYY-MM-DD`) and typed unions; `DISCOVERY_DAY_RANGE_MAX`, `DISCOVERY_EVENTS_MAX_LIMIT` reused; new `DISCOVERY_CALENDAR_MONTHS_AHEAD = 12`, `GROUP_TAGLINE_MAX = 160`, `EVENT_EXCERPT_MAX = 140` in `lib/constants`.
- **Time.** All day arithmetic is on day strings (UTC calendar maths, no local-zone getters); instants come only from `zonedDayStart(day, zone)`, so a week across a clock change is 167 or 169 hours, as it must be.

## 1. Data: none

No schema change and no migration. The tagline reads existing `GroupSection` / `GroupSectionTranslation` rows; the event excerpt reads `EventTranslation.description`; per-day counts and ranges are R4's. Proof P7 (section 9) must be empty.

## 2. Pure helpers

### 2.1 `lib/discovery-dates.ts` (new, ≤ 140 lines, no imports beyond constants; server and client)

```ts
/** A plain calendar day, 'YYYY-MM-DD'. */
export type DayKey = string;
export type DateChoice =
    | { kind: 'week' }                                  // Šonedēļ (the default; never in the URL)
    | { kind: 'today' } | { kind: 'weekend' }
    | { kind: 'day'; day: DayKey }
    | { kind: 'range'; from: DayKey; to: DayKey }       // inclusive, from < to, at most DISCOVERY_DAY_RANGE_MAX days
    | { kind: 'month'; month: string };                 // 'YYYY-MM'
export interface DayPeriod { from: DayKey; to: DayKey } // inclusive

export function isDayKey(s: string): boolean            // a real calendar date
export function addDays(day: DayKey, n: number): DayKey // Date.UTC maths
export function weekdayIndex(day: DayKey): number       // 0 = Monday … 6 = Sunday
export function mondayOf(day: DayKey): DayKey
export function dayInZone(at: Date, zone: string): DayKey            // Intl 'en-CA' parts in `zone`
export function zonedDayStart(day: DayKey, zone: string): Date       // the instant `day` begins in `zone`
export function parseDateChoice(raw: string | undefined): DateChoice // junk → { kind: 'week' }; reversed range swapped; long range cut
export function serializeDateChoice(c: DateChoice): string | null    // week → null
export function resolvePeriod(c: DateChoice, today: DayKey): DayPeriod
export function periodBounds(p: DayPeriod, zone: string): { from: Date; to: Date } // [start of from, start of to + 1 day)
export function isThisWeek(c: DateChoice, today: DayKey): boolean    // week, or the range Monday–Sunday of today's week
export function weekRange(monday: DayKey): DateChoice                 // the Monday–Sunday range
```
- `resolvePeriod`: week → `mondayOf(today)…+6`; today → `today…today`; weekend → this week's Saturday–Sunday (`today…today` on a Sunday); day, range as given; month → first…last day of the month.
- `zonedDayStart`: guess `Date.UTC(y, m-1, d)`, subtract the zone's offset at the guess (Intl `timeZoneName: 'longOffset'`, as `lib/event-dates.ts` reads it), then re-read the offset at the result and correct once more if it differs (a clock change between UTC midnight and local midnight). If local midnight does not exist (a zone whose clocks jump at midnight), return the first instant whose local day is `day`.
- `lib/event-dates.ts` `startOfTodayInRiga` becomes `zonedDayStart(dayInZone(now, DEFAULT_TIME_ZONE), DEFAULT_TIME_ZONE)` (one copy of the offset maths; behaviour unchanged).
- Never `getDay()`, `getDate()`, `getHours()` or `toLocale*` (proof P8).

### 2.2 `lib/discovery-window.ts` (new, ≤ 80 lines, pure): everything the page needs from the date choice

```ts
export interface EventWindow {
    today: DayKey;
    choice: DateChoice;          // 'this week' ranges normalised to { kind: 'week' }
    period: DayPeriod;           // the choice's days
    expired: boolean;            // period.to < today → the page redirects without `date`/`day`
    listFrom: DayKey;            // max(period.from, today, day when inside the period)
    bounds: { from: Date; to: Date };       // periodBounds({ from: listFrom, to: period.to }, zone): the list's and the facet counts' range
    week: DayKey;                // the strip's Monday: mondayOf(listFrom)
    weekBounds: { from: Date; to: Date };   // [start of week, start of week + 7)
    calendar: DayPeriod;         // max(today, first of period.from's month) … last day of the next month, at most 62 days
    calendarBounds: { from: Date; to: Date };
}
export function eventWindow(params: Pick<DiscoveryParams, 'date' | 'day'>, today: DayKey, zone: string): EventWindow
```
A `day` outside the period, or before today, is ignored (no redirect).

### 2.3 `lib/discovery-params.ts` (extend; stays ≤ 90 lines)

`DiscoveryParams` gains `date: DateChoice` and `day: DayKey | null`. `parseDiscoveryParams` reads `date` (via `parseDateChoice`) and `day` (`isDayKey` or null) only when `tab=events`; for groups both are `{ kind: 'week' }` / null. `discoveryHref` writes `date` (via `serializeDateChoice`, omitted for week) and `day` only for events, and drops both when the change switches to groups (Default 7); a change of `date` without `day` in it drops `day` (a new choice starts at its beginning). `chosenCount` adds 1 when `date.kind !== 'week'`. Keep the `%2C` unescaping; `..` needs none.

### 2.4 `lib/event-days.ts` (new, ≤ 40 lines, pure)

`groupByDay<T extends { startDate: Date }>(rows: T[], from: Date, zone: string): Array<{ day: DayKey; rows: T[] }>`: each row under `dayInZone(max(startDate, from), zone)`, days in order of the rows (ascending lists ascending, Pagājušie descending), rows kept in their order. Same rule as R4's `bucketByDay`, so a strip dot and a heading never disagree.

## 3. Services

### 3.1 `lib/services/event-row.ts` (new, ≤ 110 lines): the one row shape

```ts
/** Spread into an event `include`: what every event row needs (titles and descriptions only; never instructions). */
export const EVENT_ROW_INCLUDE = (lang) => ({
    translations: { select: { lang: true, title: true, description: true } },
    group: { select: { name: true, slug: true, category: { include: TaxonomyResolver.getInclude(lang) },
        tags: { where: { status: 'ACTIVE' }, select: { level: true, slug: true, titles: { select: { lang: true, title: true } } } } } },
}) satisfies Prisma.EventInclude;

export interface EventRowData {
    id: string; slug: string; title: string; titleLang: TextLang;
    startDate: Date; endDate: Date | null;
    city: string; isOnline: boolean;
    /** First words of the description, plain text, at most EVENT_EXCERPT_MAX characters; null when there is none. */
    excerpt: string | null;
    /** The viewer's tag: 'going' → "Eju", 'waiting' → outlined "Gaida" (PENDING or WAITLISTED); null otherwise or signed out. */
    tag: 'going' | 'waiting' | null;
    group: { name: string; slug: string };
    category: { l1Slug: string; l1Title: string; color: string };
    subCategories: string[];   // the group's level-2 tag titles, as on the group card
}
export function toEventRow(e: EventRowSource, lang: TextLang, status: AttendanceStatus | null): EventRowData
```
Title and description through `resolveEventText(e.translations, lang, e.originalLang, true)` (instructions never read), excerpt with `plainExcerpt(text.description, EVENT_EXCERPT_MAX)`, category through `TaxonomyResolver.resolve` (`l1Slug`, `l1Title`, `accentColor`) and sub-categories with `pickTitle` exactly as `toGroupCard` does (share a small helper if it saves lines). The href is built by the row from `category.l1Slug`, `group.slug`, `slug`.

### 3.2 `EventService.getDiscoverableEvents` (`lib/services/event.service.ts`)

- Returns `{ events: EventRowData[]; hasMore }`; `DiscoverableEvent` and its select are deleted (grep: only the old cards, `EventResults` and `ui-samples` used it).
- The cached public loader maps its rows to `EventRowData` **inside** the cached function (minus `tag`), so the cache holds the narrow shape, not full descriptions; dates are revived with `new Date(...)` after the cache as today. Bump the key to `events-discovery-v4-…`.
- Signed in: one more uncached query `attendance.findMany({ where: { userId, eventId: { in: ids }, status: { in: ['GOING', 'PENDING', 'WAITLISTED'] } }, select: { eventId, status } })` fills `tag` (members-only rows are already uncached).
- Unchanged: filters, the members-only merge, ordering, `limit + 1` for `hasMore`. The page asks with `from`/`to` and `limit: DISCOVERY_EVENTS_MAX_LIMIT`.

### 3.3 `EventService.getGroupEventRows(groupId, locale, viewerId, when: 'upcoming' | 'past')` (replaces `getGroupEvents`)

Same visibility as today (members and site admins see members-only events; others only public), the same selection (the `GROUP_EVENTS_LIMIT` newest by start, split by `isEventPast`), ascending for upcoming, newest first for past; `EVENT_ROW_INCLUDE` instead of attendee lists; the viewer's tag from one attendance query. Returns `EventRowData[]`. Delete `getGroupEvents` (its only caller is the Pasākumi page; grep).

### 3.4 Counts with dates (no service change)

`DiscoveryService.getCounts` already takes `from`/`to` (R4); the page passes `window.bounds` on Pasākumi. `countEventsPerDay` is called twice (strip week, calendar window); both are cached by range. Note: per-day counts put a multi-day event on its first day inside the asked range, so "Rādīt N" can be lower than the list by the events already running at the range's start; acceptable, the reviewer checks it is never higher.

### 3.5 The group card's tagline (`lib/services/group-card.ts`; Defaults 14–15)

- `GROUP_CARD_RELATIONS` gains `sections: { where: { order: 0 }, take: 1, select: { visibility: true, originalLang: true, translations: { select: { lang: true, content: true } } } }` and `_count.select.sections: true`.
- `toGroupCard` adds `tagline: string | null`: the order-0 section when it is `PUBLIC` (the viewer's language's `content`, else the original language's) → `plainExcerpt(…, GROUP_TAGLINE_MAX)`; `GroupCardSource.description` is read only when the group has no section rows at all (`_count.sections === 0`, old groups, as `getVirtualSections` does); a members-only home section → null. Add `description` to the selects that feed `toGroupCard` (`discovery.service.ts`, `user.service.ts` ×2) for that fallback.
- Bump `groups-search-v2` → `groups-search-v3` (the cached shape changed).
- `actions/group-actions.ts`: `reorderSectionsAction` and `deleteSectionAction` also call `updateTag('groups')` (they can change which text is the home section; `upsertSectionAction` already does).

## 4. The shared month grid

### 4.1 `components/ui/MonthGrid.tsx` (new, client, ≤ 140 lines), moved out of `forms/DateField.tsx`

```ts
type Props = {
    month: string;                 // 'YYYY-MM' shown
    onMonth: (month: string) => void;
    today: DayKey;
    /** One day, or a range being built / chosen. */
    selected: { from: DayKey; to: DayKey } | null;
    isDisabled?: (day: DayKey) => boolean;
    onPick: (day: DayKey) => void;
    onEscape?: () => void;
    minMonth?: string; maxMonth?: string;
    labels: { prev: string; next: string };
};
```
The header: the month title (`format.dateTime(utcNoon, { month: 'long', year: 'numeric', timeZone: 'UTC' })`) with ‹ › **right next to it** (centred group, AR-40), `aria-live="polite"` on the title. Weekday letters from `common.weekdayInitials` (Default 12), Saturday and Sunday columns on `bg-tint` (OD-16; the empty cells of those columns too). Days are buttons (`role="gridcell"`, roving `tabIndex`, keyboard moves as today: arrows, PageUp/Down, Home/End, Esc → `onEscape`), each named with the full date (`dateStyle: 'full'`); past or `isDisabled` days `disabled` and faded (`opacity-55`); today `font-bold underline underline-offset-4` (`aria-current="date"`); a single chosen day or a range's two ends `bg-primary text-primary-foreground` (start rounded left, end rounded right); days between `bg-[color-mix(in_srgb,var(--primary)_15%,var(--surface))]` (`aria-selected` on all of them). Day strings only: cells are built from `Date.UTC` and formatted with `timeZone: 'UTC'`. No popover chrome (the parent places it).

### 4.2 `components/forms/DateField.tsx` (edit, ≤ 130 lines)

Keeps the text box, the calendar button and its own absolute panel (`w-[19rem]`, as today), renders `<MonthGrid>` inside it with `selected = value ? { from: value, to: value } : null`; today from the browser as now (the form is R9a's; behaviour unchanged). The local `MonthGrid` function, `pad` and `dayKey` go (use `lib/discovery-dates.ts`). Check the event form's date picking once (create event) after the move.

## 5. The one event row (AR-54, AR-58)

### 5.1 `components/events/EventRow.tsx` (new, ≤ 90 lines, server-safe, no `"use client"`)

Props `{ event: EventRowData; showGroup: boolean; showCity: boolean; headingDay: DayKey }`. `data-ui={UI.eventRow}`, an `article` with `style={{ '--c': event.category.color }}`, `relative grid grid-cols-[2.75rem_0.5rem_minmax(0,1fr)_auto] gap-x-2 items-center rounded-lg px-1.5 py-1.5 border-b border-border last:border-b-0 break-inside-avoid hover:bg-tint` (thin lines between rows, 8 px hover radius, design.md shapes).
- **Line one:** the time (`formatter.dateTime(start, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })`, 13 px muted `tabular-nums`); the 8 px dot `bg-[var(--c)]`; the name, the row's one link, `truncate font-semibold`, `lang={langAttr(...)}`, to `/${l1Slug}/group/${group.slug}/events/${slug}` (i18n `Link`), stretched over the row with `after:absolute after:inset-0` (no nested links); at the right, 13 px muted: the city (`cityLabel`) or `event.online` "Tiešsaistē" when `showCity` (always for online events), then "· kopš {date}" when the event started before `headingDay` (Default 10, `event.continuesFrom`).
- **Under the time** (column 1, row 2, `self-start`): `Badge` "Eju" (`tone="tag"`, `Check` icon) or "Gaida" (`tone="outline"`), from `common.tag.going` / `common.tag.pending`; pulled left by the badge's own padding (`-ml-2`) so the tick's left edge is the time's first digit (AR-54; measured in 11).
- **Line two** (only `showGroup`; columns 3–4, 12 px muted, one line): the group name as a link (`relative z-10 underline decoration-border underline-offset-2 text-foreground font-medium truncate`, to the group page), "· {l1Title}", "· {subCategories.join(', ')}"; the sub-categories give way first, then the category, the group name last (flex shrink order as `css.mjs` 320–323).
- **Last line** (columns 3–4): `excerpt`, 13 px muted, `truncate`; none → no line.
No join button, no lock, no request/full word, no fallback-language label (Default 9).

### 5.2 `components/events/EventDayList.tsx` (new, ≤ 70 lines, server)

Props `{ days: Array<{ day: DayKey; rows: EventRowData[] }>; today: DayKey; showGroup: boolean; showCity: boolean; columns?: boolean; footer?: ReactNode }`. One surface (`rounded-2xl bg-surface px-3.5 pb-2.5`, `@container/events`): per day a heading `h3` (13 px semibold muted, `border-t border-border pt-3 pb-0.5`, none on the first) reading "Šodien · pirmd., 12. okt." / "Rīt · otrd., 13. okt." (`discovery.dayToday` / `dayTomorrow` with `{date}`) or the capitalised date (`capitalizeFirst(format.dateTime(utcNoon(day), { ...EVENT_DAY, timeZone: 'UTC' }))`), then the rows in a div that is `@3xl/events:columns-2 @3xl/events:gap-x-6` when `columns` (Default 11). `footer` (the text link or the cut note) sits centred under the last day.

### 5.3 A group's Pasākumi (`app/[locale]/[l1Slug]/group/[groupSlug]/events/page.tsx`, edit)

`EventService.getGroupEventRows(group.id, locale, viewerId, currentTab)`; `today = dayInZone(new Date(), await getTimeZone())`; `groupByDay(rows, new Date(0), zone)` for Pagājušie (each under its start day) and `groupByDay(rows, zonedDayStart(today, zone), zone)` for Gaidāmie; `<EventDayList showGroup={false} showCity columns={false} />`. Tabs, "Izveidot pasākumu" and the empty states unchanged. The `isEventPast` import, the big prop mapping and `requireSignIn` go. Delete `components/groups/EventRow.tsx`.

## 6. Discovery: Pasākumi by day

### 6.1 `app/[locale]/(discovery)/page.tsx` (edit, stays ≤ 150 lines)

For `kind === 'events'`:
1. `zone = await getTimeZone()` (next-intl, the `tz` cookie via `i18n/request.ts`); `today = dayInZone(new Date(), zone)`; `w = eventWindow(p, today, zone)`. If `w.expired`: `redirect(discoveryHref(p, { date: { kind: 'week' }, day: null }))`.
2. In the same `Promise.all` as today: `getCounts({ …, from: w.bounds.from, to: w.bounds.to })`, `getDiscoverableEvents({ category, cities, tags, search, from: w.bounds.from, to: w.bounds.to, limit: DISCOVERY_EVENTS_MAX_LIMIT }, locale, viewerId)`, `countEventsPerDay({ …same filters…, ...w.weekBounds }, zone, viewerId)`, `countEventsPerDay({ …, ...w.calendarBounds }, zone, viewerId)`.
3. `state.dates = { today, choice: w.choice, period: w.period, listFrom: w.listFrom, week: w.week, weekCounts: Record<DayKey, number>, calendar: w.calendar, calendarCounts: Record<DayKey, number> }` (type `DiscoveryDates` in `lib/types/discovery.ts`, `DiscoveryState.dates?: DiscoveryDates`; `DateChoice` is plain data, so it crosses to the client).
4. Render `<EventResults events={…} hasMore={…} window={w} params={p} />`.
Groups: unchanged. If the file would pass 150 lines, move the events branch into a server helper `app/[locale]/(discovery)/load-events.ts` (calls services only).

### 6.2 `components/discovery/EventResults.tsx` (rewrite, ≤ 80 lines, server)

`DayStrip` (6.3), then `EventDayList` with `groupByDay(events, w.bounds.from, zone)`, `showGroup`, `showCity={p.cities.length !== 1}`, `columns`. Footer: when `w.choice` is a week → `TextLink` "Rādīt nākamo nedēļu" (`discovery.showNextWeek`) to `discoveryHref(p, { date: weekRange(addDays(w.week, 7)), day: null })` (default scroll, Default 3); when `hasMore` → the quiet note `discovery.eventsCut` instead (Default 8). Empty: `EmptyState` (`CalendarDays`, `discovery.noEventsThisWeek` when the choice is this week, else `discovery.noEventsInPeriod`; description `discovery.adjustFilters`) with the same text link under it for week choices.

### 6.3 `components/discovery/dates/DayStrip.tsx` (new, ≤ 110 lines, server) + `SwipeWeek.tsx` (client, ≤ 40)

`data-ui={UI.dayStrip}`, `nav aria-label={discovery.days}`, a framed surface (`rounded-2xl bg-surface ring-1 ring-inset ring-border p-2 pb-1.5 mb-3`). Head: ‹ (Link to the previous week, `aria-label` `discovery.previousWeek`; a disabled `span` on this week), the month in the middle (`format.dateTimeRange(monday, sunday, { month: 'long', year: 'numeric', timeZone: 'UTC' })`, capitalised; display 14 semibold), › (`discovery.nextWeek`). Hrefs: `discoveryHref(p, { date: weekRange(…) or { kind: 'week' } when it is this week, day: null })` (Default 3).
Grid of seven equal columns (`grid-cols-7 gap-1`); each day a `Link` (44 px tall at least) to `discoveryHref(p, { day })` (or to its week + day when outside the choice, Default 2), `scroll={false}`, `aria-label` = full date + `discovery.dayEvents` ("{count, plural, …}"): the weekday letter (10 px semibold muted), the number (display 17 semibold `tabular-nums`), a 5 px dot `bg-primary` when the day has events (invisible otherwise, so heights stay). States: Saturday/Sunday `bg-tint` (OD-16); **chosen** = `w.listFrom` `bg-primary text-primary-foreground` (dot `bg-primary-foreground`), `aria-current="true"`; **today** (when not chosen) `bg-background ring-[1.5px] ring-inset ring-border`, `aria-current="date"`; **no events** number muted at 60 %; **past** days `aria-disabled`, not links, muted. `SwipeWeek` wraps the grid (`touch-action: pan-y`), and a horizontal pointer move of 48 px or more pushes the previous/next week's href (both passed in as strings). The strip scrolls away with the list (not sticky).

### 6.4 The date parts of the filter line (`components/discovery/dates/`)

- `date-label.ts` (≤ 40 lines, client-safe): `dateChoiceLabel(choice, today, format, t)`: week "Šonedēļ", today "Šodien", weekend "Nedēļas nogalē", day "15. okt." (`{ day: 'numeric', month: 'short', timeZone: 'UTC' }`), range `format.dateTimeRange(a, b, { day: 'numeric', month: 'short', timeZone: 'UTC' })` ("15.–18. okt.", "15 Oct – 2 Nov"), month capitalised `{ month: 'long' }` (+ year when not this year). Day strings become dates with `Date.UTC(y, m - 1, d, 12)`.
- `QuickChoices.tsx` (≤ 60 lines, client): Šodien · Šonedēļ · Nedēļas nogalē as three pill segments in a `role="group" aria-label={discovery.dateLabel}` with `aria-pressed`; Šonedēļ pressed when the choice is this week, Šodien only when `date=today` (AR-24). Props `{ onPick(choice), variant: 'line' | 'sheet' }`. Tap → `go({ date, day: null })` (push).
- `DateChoices.tsx` (≤ 110 lines, client): the desktop segmented control (`css.mjs` 192–195: one 30 px framed pill, segments 26 px, the chosen segment `bg-tint font-semibold ring-[1.5px] ring-inset ring-foreground`): `QuickChoices variant="line"` + a fourth segment: the calendar icon (`aria-label` `discovery.pickDates`) or, for a day/range/month/other week, `CalendarDays` + the label + a × button (`discovery.clearChoice`) back to Šonedēļ. The fourth segment opens `MonthCalendar` in `FilterPopover` (anchored, flipped at the right edge; the panel is 300 px for this list, so give `FilterPopover` a `width` prop, default 250). `data-ui={UI.dateChoices}`.
- `DateButton.tsx` (≤ 70 lines, client): the phones' (and narrow desktop's, Default 6) single `FilterButton`: `CalendarDays` + `dateChoiceLabel`; unchosen look with ▾ on Šonedēļ, chosen ring and × otherwise (× → Šonedēļ); `max-w-[8rem]`; opens `DateSheet` in `FilterPopover` (sheet on phones, drop-down from `md`). `data-ui={UI.datePhone}`.
- `DateSheet.tsx` (≤ 50 lines, client): `QuickChoices variant="sheet"` (full-width segments, tapping applies and closes) above a thin line and `MonthCalendar` (OD-17).
- `MonthCalendar.tsx` (≤ 120 lines, client): `MonthGrid` with the state of Default 5: `start: DayKey | null`, `end: DayKey | null`, shown month (the choice's month, or today's); `isDisabled` = before today, or more than 61 days after `start` while picking the end; months `today`'s … +12. Footer (`border-t pt-2 mt-2 flex justify-between gap-2`, 12 px muted): the picked text (`format.dateTimeRange(… { ...EVENT_DAY, timeZone: 'UTC' })` "Ceturtd., 15. – svētd., 18. okt.", or the day, or `discovery.pickEnd` hint after one tap), or before any tap a text button "Viss mēnesis" (`discovery.wholeMonth`); at the right `Button size="sm"` "Rādīt {count}" (`discovery.showCount`, N = sum of `dates.calendarCounts` over the picked days when they all lie in `dates.calendar`, else `discovery.show` "Rādīt"), disabled until a day or month is picked and while pending. Apply → `go({ date, day: null })` (push) and close. `data-ui={UI.datePicker}`.

### 6.5 `components/discovery/filter/FilterLine.tsx` (edit, ≤ 60 lines)

Add `@container/filter` on the line. On Pasākumi, after `TopicButton`: `<DateChoices className="hidden @4xl/filter:flex" />` and `<DateButton className="@4xl/filter:hidden" />` (phones always the button, AR-27; Default 6). Nothing else moves: the word chip, Kur, Tēma, the date part and "Notīrīt visu" on line 1, the switch at the right end; the Veids line as in R5a. `ClearAll` also clears `date` and `day`. Check at every width that line 1 never wraps with a word, two cities, a long Tēma and a range chosen, in lv and en; tune the 56 rem threshold if needed (measure, don't guess).

### 6.6 Deleted

`components/discovery/EventCard.tsx`, `components/discovery/ListViewEventCard.tsx`, `components/groups/EventRow.tsx`; `DiscoverableEvent`; `EventService.getGroupEvents`; `UI.eventCard`, `UI.eventListRow`; message keys no code reads any more (grep each in both files first; candidates: `event.goingCount`, `approvedCount`, `aboutPeople`, `wentCount`, `badgeRequest`, `manage`, `requestsWaiting`, and whatever only the old cards read).

## 7. Feedback fixes (step 6, own commit)

### 7.1 Whole row ticks (`cmv80zn46`)

Reproduce first, at 1920 px in light (the owner's viewport) with the mouse, and on a phone width: click the name and the count of a Kur row, and of a Veids row. Find the cause before changing anything (look at what receives the click: `document.elementFromPoint`, the popover's `mousedown`/`blur` handlers, the sheet's drag handling). Then extract `components/discovery/lists/CheckRow.tsx` (≤ 40 lines: the `label` row with the native checkbox, the name, the count, the faded zero state) used by `PlaceList` and `VeidsList`, with the fix inside it, so the whole row toggles at once (Default 16). Check the category list and the Veids chips for the same class (they are links/buttons, expected fine).

### 7.2 One card height and the tagline (`cmv810xd`, `cmv81zsos`; Defaults 14–15)

`components/discovery/GroupCard.tsx` (stays ≤ 90 lines):
- Text column: the name `line-clamp-2 min-h-[2lh]`; `CategoryLine oneLine`; the place line `truncate`; the tagline `mt-1 line-clamp-2 min-h-[2lh] text-[13px] leading-snug text-foreground-muted` (empty but reserved when null).
- The note row always renders: thin top line, `line-clamp-2 min-h-[2lh]` italic `text-primary`: `lookingFor`, else the calendar icon + next meeting, else `discovery.noNextMeeting` "Tikšanās vēl nav izziņota" in `text-foreground-muted` (not italic, not site colour).
- `GroupList`'s card grid adds `auto-rows-fr`. Measure: every `[data-ui="group-card"]` in the grid has the same `offsetHeight` at 768, 1024, 1280, 1440, 1920, with groups that have no photo, no note, a long name, a 60-character "Ko meklējam?" and no tagline mixed (the seed plus the reviewer's temp groups).
`components/discovery/GroupRow.tsx`: a third line, the tagline, 12 px muted, one line, `truncate` (absent when null); no other change (AR-36: still no photo, no note). The UI elements card specimens get a tagline (one without).

## 8. i18n (both files, `npm run i18n:check`)

| Key | lv | en |
|---|---|---|
| `discovery.dateLabel` | Datums | Date |
| `discovery.today` | Šodien | Today |
| `discovery.thisWeek` | Šonedēļ | This week |
| `discovery.weekend` | Nedēļas nogalē | This weekend |
| `discovery.pickDates` | Izvēlēties datumus | Pick dates |
| `discovery.dateChoiceLabel` | Datums: {when} | Date: {when} |
| `discovery.days` | Dienas | Days |
| `discovery.dayEvents` | {date}, {count, plural, zero {# pasākumu} one {# pasākums} other {# pasākumi}} | {date}, {count, plural, one {# event} other {# events}} |
| `discovery.previousWeek` | Iepriekšējā nedēļa | Previous week |
| `discovery.nextWeek` | Nākamā nedēļa | Next week |
| `discovery.previousMonth` | Iepriekšējais mēnesis | Previous month |
| `discovery.nextMonth` | Nākamais mēnesis | Next month |
| `discovery.wholeMonth` | Viss mēnesis | Whole month |
| `discovery.pickEnd` | Izvēlies beigu dienu vai spied „Rādīt” | Pick the last day or press “Show” |
| `discovery.show` | Rādīt | Show |
| `discovery.showCount` | Rādīt {count} | Show {count} |
| `discovery.showNextWeek` | Rādīt nākamo nedēļu | Show next week |
| `discovery.dayToday` | Šodien · {date} | Today · {date} |
| `discovery.dayTomorrow` | Rīt · {date} | Tomorrow · {date} |
| `discovery.noEventsThisWeek` | Šonedēļ pasākumu nav | No events this week |
| `discovery.noEventsInPeriod` | Šajā laikā pasākumu nav | No events at this time |
| `discovery.eventsCut` | Rādīti pirmie {count}. Izvēlies īsāku laiku vai vietu. | Showing the first {count}. Pick a shorter time or a place. |
| `discovery.noNextMeeting` | Tikšanās vēl nav izziņota | No meeting announced yet |
| `event.continuesFrom` | kopš {date} | since {date} |
| `common.weekdayInitials.mon` … `sun` | P · O · T · C · Pk · S · Sv | Mo · Tu · We · Th · Fr · Sa · Su |

Reuse `common.tag.going` ("Eju"), `common.tag.pending` ("Gaida"), `event.online` ("Tiešsaistē"), `discovery.clearChoice`, `discovery.adjustFilters`, `common.close`. `DateField` keeps its `eventWizard.previousMonth`/`nextMonth`. Dates and times only through next-intl formatters (`useDateFormatter` / `createDateFormatter`); sentence case (AR-10); "Šodien · …" headings keep the lower-case weekday after the dot (AR-11).

## 9. Handbook, UI elements, accessibility, grep proofs

**Handbook.** `docs/handbook/design.md`: the screen rows "Discovery: groups and events | A | R5a done (filters, cards), R5b" → "R5a, R5b done" and "Pasākumi tab | B | R3a (rows R5b) done" → "R3a, R5b done"; the Components list gains "Event row" (one row everywhere; line two left out on a group's pages; "Eju" under the time) and "Day strip and date picker" (Monday first, weekends tinted, quick choices on the filter line, the calendar a month only); the "Group card and row" entry mentions the tagline and the one card height. `docs/handbook/voice.md` fixed words: "Today / this week / this weekend | Šodien / Šonedēļ / Nedēļas nogalē"; "Load the next week | Rādīt nākamo nedēļu | Show next week". `behaviour.md`: one line under dates: weeks start on Monday in both languages; "today" is the viewer's day in their time zone.

**UI elements** (`app/[locale]/admin/handbook/ui-elements/page.tsx`, `lib/handbook/ui-samples.ts`): the `eventCard` specimen goes; the `eventRow` specimen shows an `EventDayList` of `EventRowData` samples (with line two and a description, one "Eju", one "Gaida", one online, one running since an earlier day) and the same without line two; a "Dates" specimen with `DayStrip` (static hrefs `#`), `MonthCalendar` with a range (a tiny client sample wrapper with a no-op apply) and `QuickChoices`. `UI` names: add `dayStrip: 'day-strip'`, `dateChoices: 'date-choices'`, `datePhone: 'filter-date-phone'`, `datePicker: 'date-picker'`, `textLink: 'text-link'` (the drawing's `el()` names); delete `eventCard`, `eventListRow`. A small `components/ui/TextLink.tsx` (≤ 20 lines: site colour, 14 px semibold, underline in `--border`, `underline-offset-4`) if nothing like it exists.

**Accessibility.** Strip days and calendar days are named with the full date (and the strip's with the count); the chosen day `aria-current="true"`, today `aria-current="date"`; past days are not links; ‹ › named; the quick choices `aria-pressed`; the range × says what it clears; the calendar traps nothing (a drop-down: Esc closes and returns focus to its segment; the sheet: Back and × close); the row's one link is the name, the group link sits above the stretched area; targets ≥ 44 px on phones; motion only with `motion-safe`.

**Grep proofs (section 11 runs them):**
```bash
ls components/discovery/{EventCard,ListViewEventCard}.tsx components/groups/EventRow.tsx 2>/dev/null           # P1: nothing
grep -rn "accentColor\|userRole\|canManage\|pendingCount" components/events/EventRow.tsx components/events/EventDayList.tsx components/discovery/dates  # P2: 0
grep -rn "DiscoverableEvent\b\|getGroupEvents\|eventCard\|eventListRow" app components lib                    # P3: 0
wc -l components/events/*.tsx components/discovery/dates/* components/discovery/*.tsx components/discovery/*/*.tsx components/ui/MonthGrid.tsx components/forms/DateField.tsx lib/discovery-*.ts lib/event-days.ts lib/services/event-row.ts "app/[locale]/(discovery)/page.tsx"  # P4: each ≤ 150 (limits above)
grep -rn "prisma" app components hooks | grep -v "@prisma/client"                                              # P5: 0
grep -rnE "#[0-9a-fA-F]{3,6}\b|bg-white|text-white|uppercase|--accent" components/events components/discovery/dates  # P6: 0
git diff --name-only origin/main -- prisma/                                                                     # P7: empty (no migration)
grep -rnE "getDay\(|getDate\(|getHours\(|getMonth\(|toLocale" lib/discovery-dates.ts lib/discovery-window.ts lib/event-days.ts components/discovery/dates components/events  # P8: 0
```

## 10. Builder steps and commits

Small commits, each passing `npm run typecheck`; messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Before step 5 read `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/{use-router,use-search-params,redirect}.md` and the `Link` reference (`scroll`), and the Tailwind v4 container-query syntax (`@container/name`, `@4xl/name:`) in `node_modules/tailwindcss` docs or the v4 changelog.

1. **Pure helpers.** 2.1–2.4, `startOfTodayInRiga` on the new helper, constants. Run the date script of 11 (all lines `true`). Commit "feat(R5b): day keys, zoned day starts, date choices in the discovery URL".
2. **Services.** 3.1–3.4 (row shape, discovery list with excerpt and tag, `getGroupEventRows`), cache key bumps; temporarily keep the old cards compiling only if cheap, else let step 4/5 replace them in the same commit. Commit "feat(R5b): one event row shape from the services".
3. **Month grid.** 4.1–4.2, `common.weekdayInitials`. Check the event form's date picker. Commit "refactor(R5b): shared month grid out of DateField".
4. **The row on a group's Pasākumi.** 5.1–5.3, delete `groups/EventRow.tsx`. Commit "feat(R5b): the one event row and day list on a group's Pasākumi". **Stop point** (only if the session runs long): hand over with the build-plan row "built to step 4"; nothing is pushed.
5. **Discovery by day.** 6.1–6.6, i18n of 8. Commit "feat(R5b): Pasākumi by day: date choices, day strip, calendar, Rādīt nākamo nedēļu".
6. **Feedback fixes.** 7.1–7.2 (+ 3.5 if not done in step 2). Commit "fix(R5b): whole row ticks a city or a Veids; group cards one height with the group's short text". Do **not** mark the notes done (the reviewer does).
7. **Handbook and UI elements** (9). Commit "docs(R5b): handbook dates and event row, UI elements specimens".
8. **Close-out.** Definition of done, the matrix and scripts of 11; small issues fixed now; `docs/development/build-plan.md` section 8: R5b "built, in review" with the commit range; tick the R5b line in `docs/execution_handoff.md`. Commit. Do not push (the reviewer pushes).

## 11. Acceptance

**Definition of done:**
```bash
npm run typecheck
npx eslint $(git diff --name-only --diff-filter=d origin/main...HEAD -- '*.ts' '*.tsx')
npm run i18n:check
npm run plan:check
npm run build          # needs AUTH_SECRET + DATABASE_URL
```
plus the grep proofs of 9.

**Date script** (throwaway `tmp-r5b-dates.ts` at the repo root, git-ignored by `/tmp-*`, `npx tsx tmp-r5b-dates.ts`, deleted after). Each line must print `true`:
```ts
import { zonedDayStart as z, dayInZone, mondayOf, resolvePeriod, periodBounds, parseDateChoice } from './lib/discovery-dates';
const iso = (d: Date) => d.toISOString(), h = (p: { from: Date; to: Date }) => (p.to.getTime() - p.from.getTime()) / 3_600_000;
console.log(iso(z('2026-10-19', 'Europe/Riga')) === '2026-10-18T21:00:00.000Z');
console.log(iso(z('2026-10-26', 'Europe/Riga')) === '2026-10-25T22:00:00.000Z');
console.log(h(periodBounds({ from: '2026-10-19', to: '2026-10-25' }, 'Europe/Riga')) === 169);   // clocks back on Sun 25 Oct
console.log(h(periodBounds({ from: '2026-03-23', to: '2026-03-29' }, 'Europe/Riga')) === 167);   // clocks forward on Sun 29 Mar
console.log(iso(z('2026-11-01', 'America/New_York')) === '2026-11-01T04:00:00.000Z' && iso(z('2026-11-02', 'America/New_York')) === '2026-11-02T05:00:00.000Z');
console.log(dayInZone(new Date('2026-10-18T22:30:00Z'), 'Europe/Riga') === '2026-10-19' && dayInZone(new Date('2026-10-18T22:30:00Z'), 'UTC') === '2026-10-18');
console.log(mondayOf('2026-10-18') === '2026-10-12' && mondayOf('2026-10-12') === '2026-10-12' && mondayOf('2026-11-01') === '2026-10-26');
console.log(JSON.stringify(resolvePeriod({ kind: 'weekend' }, '2026-10-14')) === '{"from":"2026-10-17","to":"2026-10-18"}');
console.log(JSON.stringify(resolvePeriod({ kind: 'weekend' }, '2026-10-18')) === '{"from":"2026-10-18","to":"2026-10-18"}');
console.log(JSON.stringify(resolvePeriod({ kind: 'month', month: '2026-02' }, '2026-01-10')) === '{"from":"2026-02-01","to":"2026-02-28"}');
console.log(JSON.stringify(parseDateChoice('2026-10-18..2026-10-15')) === '{"kind":"range","from":"2026-10-15","to":"2026-10-18"}');
console.log(parseDateChoice('2026-02-30').kind === 'week' && parseDateChoice('junk').kind === 'week' && parseDateChoice(undefined).kind === 'week');
const long = parseDateChoice('2026-10-01..2027-03-01'); console.log(long.kind === 'range' && long.to === '2026-12-01');  // cut to 62 days
```

**Matrix.** Dev server, freshly seeded DB. Widths **360, 768, 1024, 1280, 1440, 1920 px**; **lv and en**; **light and dark**; signed out and signed in (a member of a group with a members-only event). Side by side with the drawings at 375 and 1280.

| Where | Look for |
|---|---|
| `/?tab=events` | opens on Šonedēļ (pressed), Šodien not pressed even though the list starts today; the strip shows this week Monday–Sunday with today outlined and chosen (filled) as the list's first day, weekends tinted, dots only on days with events, past days not clickable; day headings "Šodien · …", "Rīt · …", then dates; no heading for empty days; "Rādīt nākamo nedēļu" under the list |
| Strip | tap Thursday → list starts Thursday, Šonedēļ still pressed, Back returns; › → next week (filter line "19.–25. okt. ×", ‹ enabled), ‹ back → plain Šonedēļ; ‹ off on this week; phones: swipe moves a week; the month text spans two months as one ("2026. g. oktobris – novembris" or the formatter's equivalent) |
| Quick choices | Šodien → only today, Šodien pressed, strip chosen = today; Nedēļas nogalē → Saturday–Sunday (on a Sunday: Sunday only); each push, Back undoes |
| Calendar | opens under its segment (300 px) with no quick choices; Monday first, weekend columns tinted, past days off, today bold underlined; tap 15 then 18 → range band, footer text and "Rādīt N"; N equals (or is at most) the rows then listed; days > 61 after the start are off; "Viss mēnesis" chooses the month; ‹ off on this month, › stops 12 months ahead; Esc closes and returns focus |
| Filter line | Pasākumi line 1 never wraps at 768–1920 with a word, two cities, a long Tēma and a range, lv and en, drawer open and folded; the four segments where there is room, else the single date button (Default 6); "Notīrīt visu" appears when a date plus one more thing is chosen and clears the date too; switch to Grupas drops the date (URL) |
| Phones | Kur, Tēma and the date button on one line at 360 (lv/en); the button opens a sheet: quick choices on top, the calendar under; Back closes; no sideways page scroll (`scrollWidth === innerWidth`) |
| Rows | line one time · dot · name · city (city gone with one city chosen, online "Tiešsaistē" under Visur); line two group link, category, sub-categories (cut first); description one line "…"; "Eju" tick aligned with the time's first digit (`tick.getBoundingClientRect().left` − `time.getBoundingClientRect().left` within ±1 px) for your events, outlined "Gaida" for a request; two columns from a 48 rem list, read down then across; the name opens the event page, the group link the group |
| Counts | drawer, Kur and Veids counts on Pasākumi equal the rows after choosing them, for Šonedēļ, Šodien and a range |
| Group Pasākumi | `/{l1}/group/{slug}/events`: day headings, rows without line two but with the city and description, Gaidāmie ascending, Pagājušie newest first; members see members-only events with no lock; the team's "Izveidot pasākumu" unchanged |
| Time zone | see the script below |
| Feedback 7.1 | Kur and Veids: a click on the name or the count ticks/unticks at once (desktop list stays open; phone sheet applies on close) |
| Feedback 7.2 | every group card in the grid the same height at 768–1920 (`new Set([...document.querySelectorAll('[data-ui="group-card"]')].map(e => e.offsetHeight)).size === 1`), taglines in two muted lines, the note area two lines, "Tikšanās vēl nav izziņota" for a group without a note; rows on phones show the tagline as a third line; a group whose home section is members-only shows no tagline (also logged out) |
| Dark | strip, tints, chosen day, range band, tags readable |

**Reviewer script** (throwaway, never committed; delete after; restore with `npm run db:seed`).
1. `tmp-r5b-events.ts` (`npx tsx --env-file=.env tmp-r5b-events.ts`): in a seeded public sports group in Jelgava create events at `2026-10-25T20:30:00Z` (Sun 25 Oct 22:30 Riga, after the clock change), `2026-10-25T22:30:00Z` (Mon 26 Oct 00:30 Riga) and one starting `2026-10-17T08:00:00Z` ending `2026-10-21T15:00:00Z` (multi-day); set one seed group's home section (order 0) to `MEMBERS_ONLY` and remember its name. Remember the titles.
2. In the browser console on `http://localhost:3000/lv` (fetches without cookies, so the zone is Riga):
```js
const get = async (q) => (await fetch('/lv' + q, { credentials: 'omit' })).text();
const w = await get('?tab=events&city=Jelgava&date=2026-10-19..2026-10-25');
console.log('Sun 22:30 in week', w.includes('SUN_TITLE'), 'Mon 00:30 not', !w.includes('MON_TITLE'));
const n = await get('?tab=events&city=Jelgava&date=2026-10-26..2026-11-01'); console.log('Mon 00:30 next week', n.includes('MON_TITLE'));
console.log('multi-day under Monday with kopš', /kopš 17\. okt\./.test(w));
const old = await fetch('/lv?tab=events&date=2020-01-01', { credentials: 'omit', redirect: 'manual' }); console.log('expired redirects', old.type === 'opaqueredirect' || old.status === 307 || old.status === 308);
const j = await get('?tab=events&date=junk'); console.log('junk = Šonedēļ', /aria-pressed="true"[^>]*>Šonedēļ/.test(j));
const g = await get(''); console.log('members-only home text never a tagline', !g.includes('MEMBERS_ONLY_HOME_TEXT_START'));
```
Expected: `true` everywhere. 3. Signed in (the pane): set `document.cookie = 'tz=Pacific/Kiritimati; path=/'`, reload `/?tab=events` once the page has refreshed itself (TimeZoneSync puts the browser zone back on the next load, so read the strip right after the first render via `fetch('/lv?tab=events').then(r => r.text())`): the strip's `aria-current="date"` day equals `new Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Kiritimati' }).format(new Date())`. Reload normally afterwards so the cookie is the browser's zone again.

## 12. Risks

- **Time zones.** Server and client must agree on "today": it is computed once on the server from the `tz` cookie and handed down in `DiscoveryState.dates`; client parts never call `new Date()` for it. First visits render in Riga until `TimeZoneSync` refreshes (existing behaviour).
- **DST weeks.** Only `zonedDayStart` makes instants; the script covers both European changes and New York.
- **One line at every width.** Four date segments are wide; the container-query switch (Default 6) must be measured with real names in both languages, drawer open and folded.
- **Cache shape changes.** `events-discovery-v4`, `groups-search-v3`: old entries must never be read with the new shape.
- **Description in the cache.** The discovery loader keeps only the excerpt; instructions are never selected.
- **Tagline privacy.** Only a PUBLIC home section feeds it; `Group.description` only for groups without sections. Proof in the reviewer script.
- **Equal heights** cost space: cards grow by about two lines; owner may trim (Defaults 14–15 are proposals).
- **Group page loses inline joining** until R6 (Default 9); the event page still has it.

## 13. Out of scope

The panels (a row opens the event page until R6) and AR-56's quiet words on the row (R6); faces (R6); search results as rows (R7); Manas grupas' "Gaidāmie" section with these rows (R8); the event form's look (R9a; only the month grid is shared now); a dedicated tagline field (owner's call, Default 14); a sticky strip; past weeks on discovery; "Citur" (R10).
