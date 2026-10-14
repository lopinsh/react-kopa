# R5a spec · Discovery: filters, drawer, cards

Just-in-time spec for release R5a of the [build plan](../build-plan.md) (card "R5a · Discovery: filters, drawer, cards"), written 14 Oct 2026 against `main` at `cc368da` (R1a–R4 live; **R4 has been live on its own**, which the contract migration below needs) and the redesign tag `redesign-v9.8.2`. Frozen once R5a is pushed. The redesign page (`docs/development/redesign.html`, generated from `scripts/redesign/`) wins over this spec where they disagree; the ledger line wins over a drawing.

**Owned rules:** [AR-22](../redesign.html#AR-22) the page (no title, no "Rāda:", no events strip on Grupas) · [AR-23](../redesign.html#AR-23) filter line, desktop, with [AP-01](../redesign.html#AP-01) (its date parts are R5b's) · [AR-25](../redesign.html#AR-25) Veids chips with [AP-02](../redesign.html#AP-02) ("+3" opens the Veids list) · [AR-26](../redesign.html#AR-26) Grupas | Pasākumi switch · [AR-27](../redesign.html#AR-27) filter line, phones · [AR-28](../redesign.html#AR-28) no chosen line · [AR-29](../redesign.html#AR-29) events filter like groups · [AR-30](../redesign.html#AR-30) category drawer · [AR-31](../redesign.html#AR-31) Veids list · [AR-32](../redesign.html#AR-32) place list · [AR-33](../redesign.html#AR-33) no results in a list · [AR-34](../redesign.html#AR-34) group card · [AR-36](../redesign.html#AR-36) group row · [AR-37](../redesign.html#AR-37) create card. **Also applied:** [AR-43](../redesign.html#AR-43) / [AP-07](../redesign.html#AP-07) (only the search-word chip "“sp” ×"; the "Atbilst arī:" line and the search overlay are R7's), [AR-35](../redesign.html#AR-35) (the card's note), [AR-57](../redesign.html#AR-57) (events by their own place; online only under Visur), AR-06 (every button, tick, switch and chosen chip in the site colour; category tone only on dots, icons, the picture fallback and the chosen Veids chip's soft tint), AR-08/AR-10 (pills, sentence case), AR-66/AR-67 (empty list, sheets: dim only, Esc/×/scrim/Back close).

**Backend items:** D7/D8 (several cities, counts; built in R4, wired here), D11 (each group's next meeting, `EventService.getNextVisibleEvents`, built in R3a, reused by the card). **Contract migration:** `require_event_city` (section 1).

**Owner decisions applied as written:** **OD-13** 24 cards, then "Rādīt vēl"; no endless scrolling. **OD-14** start on "Visur" (no `city` in the URL = Visur; nothing guessed); R10 adds "Kur tu esi?". **OD-07** private groups stay out of discovery: the `?type=` filter goes.

**Size:** L, one Sonnet session (about 40 files: ~24 new, 8 deleted, 1 migration, the rest edits). Seven commits. **Stop point 1** (mandatory) is the end of step 1, the migration: the builder stops, verifies, commits, then continues. **Stop point 2** (hand-over only if the session runs long) is the end of step 4: filter line and lists working on the old cards.

**Feedback notes folded in:** none. `npm run feedback` on 14 Oct shows one open note (`cmv5on08v`, own area, R8's); nothing tagged R4/R5a or about discovery, filters, the drawer or cards.

**Owner rule for every builder:** the drawings are illustrations at 375 and 1280 px, not pixel specs. Build the intent, fluid between and beyond: the page content sits in the shared `max-w-6xl` container, the card grid fills it (`auto-fill`, never a column count copied from a drawing), the filter line spans the container, the drawer is a side column (a fixed width is allowed there), the drop-down lists and the dialog keep their own small widths. Check at **360, 768, 1024, 1280, 1440 and 1920 px**, lv and en, light and dark. **Any small issue you find (about 4 minutes or less) you fix in the same release instead of listing it as a leftover.** Every new component stays under ~150 lines (limits per file below); `DiscoveryFilterBar` (572), `DiscoverySidebar` (232) and `GroupCard` (172) are deleted, not split.

## Drawings to match

On the redesign page, section "Discovery" ([#h-disc](../redesign.html#h-disc)) and "Search → Rādīt visus rezultātus" ([#q-all](../redesign.html#q-all)); source `scripts/redesign/gen.mjs` 59–60 (`discDeskGrupas`, `discPhGrupas`), 272–325, 391–398; parts `parts.mjs` 33–62 (`G`, `groupCard`, `createCard`, `groupRow`, `createRow`), 114–223 (`kurChip`, `temaChip`, `qChip`, `sw`, `vline`, `frow`, `frowPh`, `cats`, `placeList`, `subList`, `catSearch`); CSS `css.mjs` 159–232 (filter line, chips, lists), 251–300 (drawer, card, row).

| Drawing | What to see |
|---|---|
| "Desktop · Grupas · Jelgava · Sports un fitness → Nūjošana, Pastaigas" | header; the drawer at the left ("Kategorijas", fold button, "Meklēt kategoriju", "Visas" + 15 rows with tinted icon disc, name, count; the chosen row tinted; empty rows faded); right of it line 1 `[📍 Jelgava ×] [● Sports un fitness ×] … Notīrīt visu [Grupas | Pasākumi]`, line 2 the Veids chips (two chosen, tinted with ×, then the rest, then "+N"); then the cards, the create card last |
| "Phone · Grupas · Jelgava · Sports un fitness" | the switch as its own full-width line; under it Kur and Tēma on one line; the Veids line; group rows (name up to 2 lines, one quiet line "category · sub-categories · city · N biedri", the tone mark at the right); the create row last |
| The filter line (5 desktop crops, 2 phone) | nothing chosen: `[📍 Kur ▾] [▦ Tēma ▾]` + switch; one city: "Jelgava ×" alone, no "Notīrīt visu"; two cities "Jelgava +1"; a chosen button has a dark 1.5 px ring and a small ×; on phones "Notīrīt visu" sits at the end of the Veids line (or alone on that line without a Tēma). Date parts are R5b's: build line 1 without them |
| "Kur · several cities ticked" / "Kur · "je" typed" / "Kur · no match" | a 250 px list under the button: "Meklēt pilsētu" field on top, a plain "Visur" with its count (no tick box), a thin line, then cities with tick boxes and counts; typed: matches only (diacritics folded: "je" finds Jēkabpils); no match: "Nekas nav atrasts." + the quiet line about suggesting a place when creating a group |
| "Veids · "+3" opened · two ticked" / "Veids · "pe" typed" | the same list look from "+N": "Meklēt veidu", tick boxes, counts, zero rows faded, no "Visas" line |
| "Phone · the place list as a sheet" | the same list in a bottom sheet (grab handle, dim only) |
| The category drawer: "mū" typed / "nūj" typed / "No match" | search narrows the list; a sub-category shows as "Sports un fitness → Nūjošana" with its count; no match: "Nekas nav atrasts." + "Ieteikt jaunu kategoriju: „makšķerēšana”" in the site colour with + |
| Group card (photo + next meeting / "Ko meklējam?" note / no photo) and create card | name (Literata, 2 lines), the category line (dot + L1, sub-categories cut with "…" on one line), "Jelgava · 48 biedri" quiet; under a thin line the note in italic site colour: the team's line, or a calendar icon + "Nākamā tikšanās: piektd., 16. okt."; the photo on the right (about a fifth, at most 84 px, full card height), or the tone tint with the category icon; create card: dashed outline, round +, "Izveidot jaunu grupu", "šajā kategorijā" |
| Group row / create row | as the phone drawing; the 40 px tone mark with the icon; create row: round outlined + |
| "Desktop · discovery with the chip “sp” ×" | the word as the first button of line 1 (search icon, “sp”, ×), Kur kept; ignore the "Atbilst arī:" line (R7) and the URL text in the drawing (`vieta=` is illustration; the param stays `city`) |

## Orchestrator defaults (tell owner)

What the plan, the rules and the drawings leave open; one default each, labelled, to be confirmed by the owner later.

1. **Breakpoints.** Phones = below `md` (768 px): switch line, rows, sheets. From `md`: the one-line desktop filter line, cards, lists as drop-downs under their button. The drawer shows from `lg` (1024 px); between `md` and `lg` the Tēma button opens the same category list as a drop-down.
2. **When a choice applies.** In a desktop drop-down each tick applies at once (URL `replace`, the list stays open); in a phone sheet the ticks apply together when the sheet closes (one `push`). Single choices (a Tēma, a Veids chip, ×, "Notīrīt visu", the switch) `push`, so Back undoes them.
3. **List order.** Categories alphabetical in the viewer's language (AR-30). Kur: ticked first, then by count (high first), then name; zero-count cities faded but still choosable. Veids chips: chosen first, then by count; a zero-count Veids is never a chip (only in the list). Veids list: by count, then name.
4. **Veids = the Tēma's level-2 sub-categories.** Level-3 tags count inside their level-2 parent (as R4's counts already do) and are not shown on their own.
5. **The drawer's search finds Veidi of every category** ("Sports un fitness → Nūjošana"); choosing one sets that Tēma and that Veids.
6. **"Ieteikt jaunu kategoriju"** opens a small dialog (the word, a Tēma select pre-set to the chosen Tēma, "Ieteikt") and sends it through the existing `submitPendingTag` as a waiting Veids of that Tēma; admins are notified and see it in Admin → Kategorijas. Signed out: the sign-in pop-up. (The data model has no waiting top-level category, so none is invented.)
7. **The search word only filters by text.** Today's silent "snap to a category" goes: it was a hidden filter the buttons don't show (AR-28); R7's "Atbilst arī:" line replaces it.
8. **The switch keeps** the place, Tēma, Veidi and the word; "Notīrīt visu" clears all of them and keeps the switch side; × on the Tēma also clears its Veidi (drawing text).
9. **Create card at the true end:** after the last group when no "Rādīt vēl" is left, or alone when the chosen category is empty; Grupas only.
10. **"Rādīt vēl"** is a link that adds 24 through `?limit=` (works without JS, the URL stays shareable), keeps the scroll position, capped at 480.
11. **Pasākumi in R5a** keeps today's event cards (`EventCard` grid from `md`, `ListViewEventCard` on phones): upcoming events, up to 100, filtered by Kur, Tēma, Veids and the word, the drawer and the lists counting events. No date choices and no "Rādīt vēl" there (R5b).
12. **No profile city yet:** `User` has no city field, so signed-in people also start on Visur; OD-14's "signed in: the profile city" waits for R10.
13. **Old links:** `?view=` and `?type=` are ignored (private groups never listed); `?category=<a sub-category>` redirects to its Tēma with that Veids, so the buttons show what is chosen.
14. **Profiles use the same group list as discovery** (cards from `md`, rows on phones, with the note or the next meeting); R9b redesigns profiles.
15. **The drawer's fold** is remembered per device in a cookie (`ek_disc_rail`), read on the server, so the first paint is right.

## 0. Motivation and design alignment

- **Service Law.** Every query stays in `lib/services/`: lists (`DiscoveryService.getGroups`, `EventService.getDiscoverableEvents`), counts (`DiscoveryService.getCounts`), the card's next meeting (`EventService.getNextVisibleEvents`, R3a's, unchanged), categories and Veidi (`DiscoveryService.getDiscoveryCategories`, `TaxonomyService.getTaxonomy`), cities (`CityService.listActive`). The page stops calling the `getTaxonomy` Server Action for data. No Prisma in components or the page.
- **Context Law.** The page builds one plain `DiscoveryState` from those services and hands it to a new `DiscoveryProvider`; the filter line, the lists and the drawer read `useDiscovery()` (state) and `useCities()` (existing). The current choice is read from the URL (`useSearchParams`), never prop-drilled. Cards get their group as a prop (a list item, like today's row components), never a role or accent.
- **Taxonomy Law / AR-06.** Tones come from the services (`categoryColor` → `var(--cat-<slug>)`); a component only sets the service value as the CSS variable `--c` on the element that shows it (the established `CategoryDisc` / `CategoryLine` pattern). The page-level inline `--accent` goes: nothing on discovery uses the accent any more. Buttons, ticks, the switch and "Notīrīt visu" use site tokens.
- **Defensive Coding.** The suggestion dialog uses `isPending` and the shared `submitPendingTagSchema`; URL input is parsed by one pure function (`parseDiscoveryParams`, clamps and drops junk) on both server and client; navigations run inside `useTransition` and the filter line shows `aria-busy` while pending.
- **Action Consistency.** No new action and no new error code: the suggestion uses `submitPendingTag` (`ActionResponse`, `UNAUTHORIZED`/`VALIDATION_FAILED` mapped through `errors.*`).
- **Zero-Any / Constants.** Prisma-generated types; `DISCOVERY_GROUPS_PAGE = 24`, `DISCOVERY_GROUPS_MAX = 480`, `DISCOVERY_RAIL_COOKIE = 'ek_disc_rail'` in `lib/constants`; `DISCOVERY_VIEWS` / `DiscoveryView` deleted (B31).
- **Expand → contract.** This release is the contract half of R4's `add_event_city`: it may only run while R4's code serves (R4 always writes `city`). R4 is live alone (`cc368da`), so the order holds; never combine with another release whose code is older than R4.

## 1. Data: `require_event_city` (stop point 1)

`prisma/schema.prisma`, model `Event`:
```prisma
  /// The event's own place (AR-57): a `City.slug` like `Group.city`, no foreign key. '' only when its city was rejected (CityService.reject).
  city              String
```
(Remove the "Nullable until R5a" line.) Hand-written folder, sorts after `20261014100100_add_event_city`:

**`prisma/migrations/20261014200000_require_event_city/migration.sql`**
```sql
-- Events the R3 code created during the R4 deploy have no city: they take their group's (AR-57).
UPDATE "Event" AS e SET "city" = g."city" FROM "Group" AS g WHERE e."groupId" = g."id" AND e."city" IS NULL;

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "city" SET NOT NULL;
```
Name: the conventions name additive steps (`add_…`, `create_…`); a constraint on an existing column has no pattern, so `require_event_city` (the build plan's name, verb + entity + field) is confirmed. `Group.city` is `NOT NULL`, so the update leaves no NULL; R4's code (serving during the migrate) always writes `city`; `SET NOT NULL` scans the table once (small).

**Check (then commit, then continue):** `npm run db:generate`; `npx prisma migrate deploy` (applies the folder); `npx prisma migrate dev --create-only --name drift_check` (dev server stopped) must create nothing (if it does, fix the SQL and delete that folder); `npx prisma db execute --stdin` with `SELECT count(*) FROM "Event" WHERE "city" IS NULL;` → 0 and `SELECT is_nullable FROM information_schema.columns WHERE table_name='Event' AND column_name='city';` → `NO`; `npm run typecheck` shows exactly the places of 1.1 (fix them in this commit).

### 1.1 Every place that now gets a non-null city

- `lib/services/discovery-query.ts` `eventWhere`: the city part becomes `isOnline: false, city: { in: cities }`; delete the `city: null` / `group: { city … }` fallback and its "R5a deletes" comment. `loadEventFacetRows`: `toRow(e.city, …)`, drop `city` from the `group` select. `toRow(city: string, …)`.
- `lib/services/discovery-facets.ts`: `FacetRow.city: string` (groups may hold `''`; keep the `!!row.city` test).
- `lib/services/event.service.ts`: `DiscoverableEvent.city: string` (drop the "null only for…" comment), `DiscoverableEvent.group.city: string` (it is `String` in the schema), `NextEventView.city: string`.
- `lib/services/discovery.service.ts` `searchContextual`: `cityLabel(tCities, e.city)`; drop `group.city` from its select if nothing else reads it.
- `components/discovery/EventCard.tsx`, `ListViewEventCard.tsx`: `cityLabel(tCities, event.city)`.
- `components/forms/EventCreationWizard.tsx`: `EventToEdit.city: string` (keep `event?.city || groupCity`: `''` still falls back).
- `prisma/seed.ts` keeps `e.city ?? groupCityBySlug[…]` (seed input, not a read).
Grep proof P1 (section 9) must be empty afterwards.

## 2. Services and pure helpers

### 2.1 Counts: two totals and sub-categories everywhere (`lib/services/discovery-facets.ts`, `lib/types/discovery.ts`)

`DiscoveryCounts` gains:
```ts
    /** Cities, query, dates applied, topic not: the drawer's "Visas" row. */
    anyTopic: number;
    /** Topic, query, dates applied, cities not, online included: the place list's "Visur" row. */
    anyPlace: number;
```
`aggregateFacets`: `if (inCities) out.anyTopic++; if (inTopic) out.anyPlace++;` and count sub-categories without the L1 gate: `if (inCities) row.tagSlugs.forEach((s) => bump(out.bySubCategory, s));` (a tag under an L1 implies the row matches that L1 through `topicMatch`, so inside the chosen L1 the numbers are unchanged, and the drawer's search can show a count for any Veids). Update the `bySubCategory` doc comment ("every sub-category; cities, query, dates applied, tags not"). Bump the cache key prefix to `'discovery-counts-v2'`.

### 2.2 `DiscoveryService.getGroups` (`lib/services/discovery.service.ts`)

- Filters lose `type` (`GroupDiscoveryFilters.type` deleted; `groupWhere` always `type: 'PUBLIC'`, OD-07) and gain nothing else. Default `take = DISCOVERY_GROUPS_PAGE`.
- Drop the uncached `prisma.group.count` (`totalCount`): nothing shows a count heading any more (AR-22); counts come from `getCounts().total`. Return `{ groups, hasMore }`.
- The select adds `lookingFor: true` and `tags: { where: { status: 'ACTIVE' }, select: { level: true, slug: true, titles: { select: { lang: true, title: true } } } }` (via the card fragment, 2.3).
- Delete `snapInterest` and `getContextualTaxonomy` (+ `ContextualTaxonomy` type) once the page no longer calls them (grep: no other caller). Keep `searchContextual` and `actions/discovery-actions.ts`: R7's search overlay is their user.

### 2.3 The card shape (`lib/services/group-card.ts`)

- `GROUP_CARD_RELATIONS`: keep `_count`; replace the `members` preview (no card shows faces any more; grep that no consumer reads `.members` of a card) with the `tags` select of 2.2. Add `lookingFor` to `GroupCardSource` and to every select that feeds `toGroupCard` (`discovery.service.ts`, `user.service.ts` both places).
- `toGroupCard(group, lang)` returns: `id, name, slug, city, lookingFor, bannerImage, memberCount, category: { slug, l1Slug, l1Title, color }, subCategories: string[]` where `subCategories` = the level-2 tags' titles via `pickTitle(t.titles, lang, t.slug)` (the banner's rule in `GroupService`, line ~322), and `color` = the resolved accent (`categoryColor`). Drop `description`, `type`, `members`, `accentColor` duplicates if nothing reads them after the swap (`getMyGroups` spreads the card: check `MyGroupsListRow` keeps compiling; add back only what it reads).
- `GroupCardData` stays the exported type.

### 2.4 Pure helpers (no DB, client and server)

- `lib/discovery-params.ts` (≤ 70 lines) gains:
```ts
export type DiscoveryKind = 'groups' | 'events';
export interface DiscoveryParams { kind: DiscoveryKind; cities: string[]; category: string | null; tags: string[]; q: string; limit: number }
/** Reads `tab`, `city`, `category`, `tags`, `q`, `limit` from page searchParams or URLSearchParams; ignores `view`, `type` and anything else. */
export function parseDiscoveryParams(sp: URLSearchParams | Record<string, string | string[] | undefined>): DiscoveryParams
/** The discovery href for a change: `{ ...current, ...change }`, empty values dropped, `limit` dropped unless asked, `tab=events` only for events. */
export function discoveryHref(current: DiscoveryParams, change: Partial<DiscoveryParams>): string
/** How many things are chosen ("Notīrīt visu" from 2): the word, the place (1 however many cities), the Tēma, each Veids. */
export function chosenCount(p: DiscoveryParams): number
```
`q` trimmed, at most 100 characters; `tags` deduplicated; `limit` clamped to `DISCOVERY_GROUPS_PAGE…DISCOVERY_GROUPS_MAX` in steps as given (default 24). `discoveryHref` returns a locale-free path (`/?city=Riga&category=sports`) for the i18n `Link` / router.
- `lib/text-fold.ts` (≤ 10 lines): `foldText(s)` = NFD, strip `̀-ͯ`, lowercase (reuse from `lib/slug.ts` if it already exports such a helper). Used by every list search.

## 3. The page

### 3.1 `app/[locale]/(discovery)/page.tsx` (rewrite, ≤ 130 lines)

1. `p = parseDiscoveryParams(await searchParams)`. If `p.category` is a sub-category (`GroupService.findCategoryBySlug` → level > 1), `redirect(discoveryHref(p, { category: l1Slug, tags: [slug, …p.tags] }))` (Default 13). A `category` that doesn't exist is dropped (treated as none).
2. In parallel: `DiscoveryService.getDiscoveryCategories(locale)`, `TaxonomyService.getTaxonomy(locale)` (Veidi), `CityService.listActive(locale)`, `DiscoveryService.getCounts({ kind: p.kind, cities: p.cities, l1Slug: p.category ?? undefined, tags: p.tags, query: p.q || undefined }, locale)`, the list (`getGroups({ query, cities, categoryId, tags, take: p.limit })` for Grupas or `getDiscoverableEvents({ category, cities, tags, search, status: 'upcoming' }, locale, viewerId)` for Pasākumi), `cookies()` for `DISCOVERY_RAIL_COOKIE`.
3. Grupas: `EventService.getNextVisibleEvents(ids of groups without lookingFor, locale, viewerId)` → a `Record<groupId, Date>` of start dates passed down (only the date is shown).
4. Build `DiscoveryState = { kind, categories: [{ slug, title, color, count }] (sorted by title with Intl.Collator(locale)), veidi: [{ slug, title, l1Slug, count }] (ACTIVE level-2 of every L1), counts: { total, anyTopic, anyPlace, byCity, online } }` and render:
```tsx
<CitiesProvider cities={cities}>
  <DiscoveryProvider state={state}>
    <div className="flex min-h-full">
      <CategoryDrawer folded={rail === '1'} />          {/* hidden below lg */}
      <div className="min-w-0 flex-1 pb-20 pt-3 md:pt-4">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <FilterLine />
          {kind === 'groups' ? <GroupResults … /> : <EventResults … />}
        </div>
      </div>
    </div>
  </DiscoveryProvider>
</CitiesProvider>
```
No heading, no count line, no "Notīrīt visu" link under the filters (AR-22, AR-28).
5. `generateMetadata`: as today (title from the word, category name and cities); the hard-coded English description becomes `discovery.metaDescription` (small fix).

### 3.2 `components/providers/DiscoveryProvider.tsx` (new, client, ≤ 40 lines)

`DiscoveryProvider({ state, children })` and `useDiscovery(): DiscoveryState` (throws outside the provider, like `useGroupContext`). The `DiscoveryState` type lives in `lib/types/discovery.ts`.

### 3.3 `hooks/useDiscoveryNav.ts` (new, ≤ 40 lines)

`const { params, go, pending } = useDiscoveryNav()`: `params = parseDiscoveryParams(useSearchParams())`; `go(change, { replace?: boolean })` builds `discoveryHref(params, change)` and calls the i18n router's `push`/`replace` with `{ scroll: false }` inside `startTransition`; `pending` from `useTransition`. Every filter part uses it (Default 2 picks push or replace).

## 4. The filter line (`components/discovery/filter/`)

### 4.1 `FilterLine.tsx` (≤ 120 lines, client)

`data-ui={UI.filterLine}`, `aria-busy={pending}`. Reads `useDiscoveryNav().params`.
- **From `md`, line 1** (one line, never wraps: `flex items-center gap-1.5 min-w-0`): `SearchWordChip` (when `q`), `PlaceButton`, `TopicButton`, a flexible spacer, `ClearAll` (when `chosenCount ≥ 2`), `ViewSwitch` at the right end. **Line 2** (only with a Tēma): `VeidsChips`. Gap 8 px between lines; ~12 px under the line before the list.
- **Phones**: `ViewSwitch` full width; under it one line `SearchWordChip`, `PlaceButton`, `TopicButton` (each `min-w-0`, the longest name gives way with "…"); then `VeidsChips` with `ClearAll` at its end, or, without a Tēma and with 2+ chosen, a line holding only `ClearAll` at the right.
- Rendered twice is not allowed: one tree with responsive classes (`md:` order and visibility), the switch moved with `order-*`.

### 4.2 `FilterButton.tsx` (≤ 60 lines): the shared button look

Pill, height 32 px (`h-8`; a 44 px tap area on phones via `before:` padding or `min-h-11` wrapper, design.md touch rule), `px-2.5 text-[13px] font-medium`, `bg-surface ring-1 ring-inset ring-border`; **chosen**: `ring-[1.5px] ring-foreground` and a 20 px × button inside the pill (`aria-label` `discovery.clearChoice` "Notīrīt: {what}"); **open**: `ring-primary bg-tint`. Label `truncate min-w-0`; max widths: place `max-w-[9.5rem]`, word `max-w-[7.5rem]`, topic `max-w-[11rem]` and `shrink`. Unchosen ends in `ChevronDown` 14 px. The main part is a `button` with `aria-expanded`, `aria-controls`, and an `aria-label` carrying the full choice ("Vieta: Jelgava, Ozolnieki") so a cut name is still read in full. The × is a sibling button (not nested).

### 4.3 The buttons

- `SearchWordChip.tsx` (≤ 35): `Search` icon, “{q}” (typographic quotes from the message `discovery.searchWord`), × → `go({ q: '' })`. No drop-down. `data-ui={UI.searchWordChip}`.
- `PlaceButton.tsx` (≤ 90): `MapPin` + "Kur", or the first chosen city's name + "+N" (`em`, 12 px bold, not cut); × → `go({ cities: [] })`. Opens `PlaceList` in `FilterPopover`.
- `TopicButton.tsx` (≤ 70): `LayoutGrid` + "Tēma", or the tone dot (`--c`) + the category title; × → `go({ category: null, tags: [] })`. Opens `CategoryList` in `FilterPopover` (choosing closes it: single choice).
- `ViewSwitch.tsx` (≤ 50): two `Link`s in a `nav aria-label={discovery.viewLabel}` tray (`h-8 rounded-full bg-tint p-0.5`), the current half raised (`bg-surface shadow-sm font-semibold`, `aria-current="page"`), "Grupas" / "Pasākumi"; hrefs from `discoveryHref(params, { kind, limit: undefined })` (Default 8). Looks unlike the filters (no ring). Phones: full width, halves `flex-1`.
- `ClearAll.tsx` (≤ 25): text button "Notīrīt visu" (site colour, 12 px semibold, underlined) → `go({ q: '', cities: [], category: null, tags: [] })`.

### 4.4 `VeidsChips.tsx` (≤ 130 lines)

`role="group" aria-label={discovery.veids}`, one line, no wrap, no sideways scroll. Chips 26–28 px (`h-7 px-2.5 text-xs`), the chosen tinted with the Tēma tone (`bg-[color-mix(in_srgb,var(--c)_15%,var(--surface))]`, ring 45 %, semibold, × inside, `aria-pressed="true"`), others plain (`aria-pressed="false"`, tap = add that Veids, push). Order per Default 3. **Fit:** after mount and on resize (`ResizeObserver` on the line), measure the chips in an invisible measuring copy (`aria-hidden`, `absolute invisible`) and show the chosen plus as many others as fit, leaving room for "+N" (and for `ClearAll` on phones); the server renders all chips in an `overflow-hidden` line so nothing jumps far. "+N" (`moreChip`, semibold quiet, `aria-label` `discovery.moreVeidi`) shows the count of the Veidi not shown (zero-count ones included), and opens `VeidsList` in `FilterPopover` (AP-02). When every Veids fits, there is no "+N" (every choice is already on the line).

## 5. The lists (`components/discovery/lists/`, shared with R7)

### 5.1 `FilterPopover.tsx` (≤ 90 lines)

`FilterPopover({ open, onClose, title, anchorRef, children })`: from `md` an anchored panel under its button (`absolute z-40 mt-1.5 w-[250px] max-w-[calc(100vw-24px)] rounded-2xl bg-surface p-1.5 shadow-premium ring-1 ring-border`, `max-h-[min(60vh,420px)]` scrolling inside, flipped to stay on screen at the right edge), closing on Esc, click outside (`useClickOutside`) and Tab out, focus to the list's search on open and back to the button on close; on phones a `Sheet` with the same children (title visually hidden or the button's word). Uses a new `hooks/useMediaQuery.ts` (≤ 20 lines, `useSyncExternalStore`, server snapshot `false`). `data-ui={UI.filterList}`.

### 5.2 `ListSearch.tsx` (≤ 40 lines)

The search row on top of every list: `Search` 15 px, an `input type="search"` with a visible-on-focus label (`sr-only` label + placeholder "Meklēt pilsētu" / "Meklēt veidu" / "Meklēt kategoriju"), a thin line under it. Filtering with `foldText` (`includes`), the typed part not highlighted (the drawing's highlight is a nice-to-have; skip).

### 5.3 `PlaceList.tsx` (≤ 110 lines)

From `useCities()` + `useDiscovery().counts`. Top: a plain button "Visur" with `anyPlace` (tinted when no city is chosen; choosing it clears the cities), a thin line, then one `label` row per city: a native checkbox (`accent-primary`, 16 px), the name, the count (`byCity[slug] ?? 0`) quiet at the right; zero rows `opacity-45`. Order per Default 3. Desktop: each change → `go({ cities }, { replace: true })`; phones: local state, applied by `go({ cities })` when the sheet closes (Default 2). Typed and nothing matches: "Nekas nav atrasts." (italic quiet) + the quiet line `discovery.placeHint`. Online events are never under a city (AR-57).

### 5.4 `VeidsList.tsx` (≤ 90 lines)

The Tēma's Veidi from `useDiscovery().veidi` (filtered by `l1Slug`), each a checkbox row with its count (`bySubCategory` via `veidi[].count`), zero rows faded, no "Visas" line, search "Meklēt veidu", no match "Nekas nav atrasts." only. Apply as in 5.3.

### 5.5 `CategoryList.tsx` (≤ 130 lines): the drawer's body, the Tēma drop-down and sheet

`variant: 'drawer' | 'list'`, `folded?: boolean`. Search "Meklēt kategoriju" on top (hidden when folded). Rows are links (`Link` to `discoveryHref(params, { category, tags: [] })`), each: a 26 px `CategoryDisc` (tone from the service), the title (`truncate`), the count at the right (`count`), zero `opacity-45` (still a link, AR-37: an empty category offers the create card); the chosen row `bg-tint font-semibold`, `aria-current="true"`. First row "Visas" with `anyTopic` and the neutral "all" icon (`LayoutGrid`), current when no Tēma. Typed text also lists matching Veidi as "Sports un fitness → Nūjošana" with their count, linking to `{ category: l1Slug, tags: [slug] }` (Default 5). No match: "Nekas nav atrasts." then a site-colour row with `Plus` "Ieteikt jaunu kategoriju: „{word}”" opening `CategorySuggest` (Default 6). Folded: icons only, each with `aria-label` and `title` = its name and count. As a drop-down (`variant="list"`) a choice closes the panel.

### 5.6 `components/discovery/CategorySuggest.tsx` (≤ 100 lines)

`Modal` (dialog; sheet on phones), title `discovery.suggestTitle`, one quiet sentence `discovery.suggestText`, a text field "Nosaukums" pre-filled with the word (trimmed, ≤ the schema's max, `TextCounter`), a native select "Tēma" of the 15 categories pre-set to the chosen Tēma (required, `discovery.suggestPickTopic` when none), "Atcelt" / "Ieteikt" (`isPending`). Signed out (`useSession` status, as other sign-in gates): the button opens `AuthGateModal` instead. Success: close + toast `discovery.suggestSent` "Ieteikums nosūtīts"; error: toast through `errors.*`. Calls `submitPendingTag(label, l1Id, locale)` (needs the L1 id: add `id` to `DiscoveryState.categories`).

## 6. The drawer (`components/discovery/CategoryDrawer.tsx`, ≤ 90 lines, client)

`hidden lg:flex` aside, `aria-label` `shell.sidebar.categoriesNav`, sticky under the header (`sticky top-16 h-[calc(100dvh-4rem)] overflow-y-auto`), `border-r border-border bg-surface`, width `w-[232px]` open / `w-14` folded (side column widths are allowed fixed). Head: "Kategorijas" (quiet 13 px semibold) and a 28 px round fold button (`ChevronLeft`/`ChevronRight`, `aria-label` `shell.sidebar.collapse` / `expand`, `aria-expanded`) that toggles and writes the cookie (`document.cookie = 'ek_disc_rail=1; path=/; max-age=31536000; samesite=lax'`, or `=0`). Body: `CategoryList variant="drawer"`. Folding never moves the page content's container (it is centred in the remaining space). On desktop the drawer and the Tēma button show the same choice (both read the URL).

## 7. Cards and rows (`components/discovery/`)

### 7.1 `GroupCard.tsx` (rewrite, ≤ 90 lines, server-safe, no `"use client"`)

Props `{ group: GroupCardData; nextMeeting?: Date | null }`. A `Link` to `/${l1Slug}/group/${slug}` (i18n `Link`), `data-ui={UI.groupCard}`, `grid grid-cols-[minmax(0,1fr)_clamp(52px,20%,84px)] grid-rows-[auto_1fr] overflow-hidden rounded-2xl bg-surface` (no border, no shadow; hover `bg-tint/40`, focus ring site colour), `style={{ '--c': group.category.color }}`.
- Column 1, row 1 (`px-3.5 pt-3`, gap 3 px): the name `font-display text-[15px] font-semibold leading-snug line-clamp-2`; `CategoryLine` in a one-line form (add a `oneLine` prop to `CategoryLine`: `flex-nowrap overflow-hidden`, sub-categories `truncate`); the quiet line `cityLabel · memberCount` (`discovery.memberCount`, 13 px muted).
- Column 1, row 2, only with a note: a thin top line, `mx-3.5 mt-2 py-2 pb-[11px]`, italic 13 px `text-primary`: `lookingFor`, else `CalendarDays` 14 px + `discovery.nextMeeting` with `formatter.dateTime(date, EVENT_DAY)` (lowercase weekday mid-sentence, AR-11); neither → no row, the head gets `pb-3`.
- Column 2, both rows: `next/image` `fill` `object-cover` (`getSmartImageUrl`, `sizes="84px"`, `alt=""`), or the fallback `bg-[color-mix(in_srgb,var(--c)_20%,var(--surface))] text-[var(--c)]` with the `CategoryIcon` 26 px.
The date formatting needs the client formatter: put the note in a tiny client part `GroupNote.tsx` (≤ 25 lines) using `useDateFormatter()`, or format on the server with `getFormatter`; pick the server route if `lib/date-format.ts` offers it, else the client part.

### 7.2 `GroupRow.tsx` (new, ≤ 60 lines)

`data-ui={UI.groupRow}`, a `Link` row `flex items-center gap-2.5 py-2.5 border-t border-border first:border-t-0`, `style={{ '--c': … }}`: text column (`min-w-0 flex-1`): the name `font-display text-[15px] font-semibold line-clamp-2`; one quiet line (12 px, one line): `{l1Title} · {subCategories}` in a `truncate` span first, then `· {city} · {N biedri}` in a `shrink-0` span, so the sub-categories give way first (drawing text). At the right a 40 px `rounded-[10px]` mark with the tone tint and the `CategoryIcon` 20 px. No photo, no note (AR-36). The rows sit in one surface list (`rounded-2xl bg-surface px-3.5`).

### 7.3 `CreateCard.tsx` (new, ≤ 50 lines)

`CreateCard({ l1Slug, variant: 'card' | 'row' })` → `Link` to `/create?category={l1Slug}`. Card: transparent, `border-[1.5px] border-dashed border-border rounded-2xl`, centred: 34 px round outlined `Plus` (the bottom bar's icon), "Izveidot jaunu grupu" (display 15 semibold), "šajā kategorijā" (13 muted). Row: like `GroupRow` with the round outlined + at the right. `data-ui={UI.createCard}`.

### 7.4 `GroupList.tsx` (new, ≤ 60 lines) and `GroupResults.tsx` (new, ≤ 70 lines)

`GroupList({ groups, nextMeetings, createFor? })`: from `md` `grid gap-3 grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))]` of `GroupCard` (+ `CreateCard card`), on phones (`md:hidden`) the row list of `GroupRow` (+ `CreateCard row`). Both trees are server-rendered; the hidden one is `display:none` (not read by screen readers). Used by discovery and both profile pages (Default 14; they fetch `getNextVisibleEvents` for their groups too).
`GroupResults({ groups, hasMore, nextMeetings, l1Slug, limit })`: `GroupList` with `createFor = l1Slug` only when a Tēma is chosen and `!hasMore` (Default 9); empty: `EmptyState` (`Search` icon, `discovery.noGroupsFound`, one sentence `discovery.adjustFilters`) and, with a Tēma, the create card under it (AR-37 "also when it is empty"); `hasMore`: a centred quiet button-look `Link` "Rādīt vēl" to `discoveryHref(params, { limit: limit + 24 })` with `scroll={false}` (OD-13; no observer, no auto-load).

### 7.5 `EventResults.tsx` (new, ≤ 60 lines)

Today's rendering moved out of the page unchanged in look (Default 11): from `md` the `EventCard` grid (`grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))]`), on phones `ListViewEventCard` rows; the L1-slug computation as today (move it into a small helper next to the component). Empty: `EmptyState` with `discovery.noEventsFound`. R5b replaces all of this.

### 7.6 Deleted

`components/discovery/DiscoveryFilterBar.tsx`, `DiscoveryFilterBarWrapper.tsx`, `DiscoverySidebar.tsx`, `ListViewCard.tsx`, `InfiniteScrollTrigger.tsx`, the old `GroupCard.tsx` body (rewritten in place); `DISCOVERY_VIEWS`/`DiscoveryView` in `lib/constants`; `snapInterest`, `getContextualTaxonomy`, `ContextualTaxonomy`; `GroupDiscoveryFilters.type`. Keep `DISCOVERY_TABS` if still used, else delete.

### 7.7 Loading shape (`app/[locale]/(discovery)/loading.tsx`)

Match the new page: the drawer column only from `lg` (232 px), a 32 px filter line (phones: the switch line + one button line), then 6 card-shaped blocks in the same auto-fill grid from `md` and 6 row blocks on phones.

## 8. i18n (both files; `npm run i18n:check`)

| Key | lv | en |
|---|---|---|
| `discovery.where` | Kur | Where |
| `discovery.topic` | Tēma | Topic |
| `discovery.everywhere` | Visur | Everywhere |
| `discovery.placeLabel` | Vieta: {places} | Place: {places} |
| `discovery.topicLabel` | Tēma: {topic} | Topic: {topic} |
| `discovery.clearChoice` | Notīrīt: {what} | Clear: {what} |
| `discovery.clearAll` (value) | Notīrīt visu | Clear all |
| `discovery.searchWord` | “{word}” | “{word}” |
| `discovery.searchWordLabel` | Meklētais vārds: {word} | Search word: {word} |
| `discovery.viewLabel` | Ko rādīt | What to show |
| `discovery.groups` | Grupas | Groups |
| `discovery.events` | Pasākumi | Events |
| `discovery.veids` | Veids | Type |
| `discovery.moreVeidi` | {count, plural, zero {Vēl # veidi} one {Vēl # veids} other {Vēl # veidi}} | {count, plural, one {# more type} other {# more types}} |
| `discovery.searchPlace` | Meklēt pilsētu | Search for a city |
| `discovery.searchVeids` | Meklēt veidu | Search for a type |
| `discovery.searchCategory` | Meklēt kategoriju | Search for a category |
| `discovery.nothingFound` | Nekas nav atrasts. | Nothing found. |
| `discovery.placeHint` | Jaunu vietu var ieteikt, veidojot grupu; to apstiprina administratori. | You can suggest a new place when you create a group; the admins approve it. |
| `discovery.categories` | Kategorijas | Categories |
| `discovery.allCategories` | Visas | All |
| `discovery.suggestCategory` | Ieteikt jaunu kategoriju: „{word}” | Suggest a new category: “{word}” |
| `discovery.suggestTitle` | Ieteikt jaunu kategoriju | Suggest a new category |
| `discovery.suggestText` | Administratori to izskatīs. Izvēlies tēmu, kurai tā pieder. | The admins will look at it. Choose the topic it belongs to. |
| `discovery.suggestName` | Nosaukums | Name |
| `discovery.suggestPickTopic` | Izvēlies tēmu. | Choose a topic. |
| `discovery.suggestSend` | Ieteikt | Suggest |
| `discovery.suggestSent` | Ieteikums nosūtīts | Suggestion sent |
| `discovery.showMore` | Rādīt vēl | Show more |
| `discovery.nextMeeting` | Nākamā tikšanās: {date} | Next meeting: {date} |
| `discovery.createNewGroup` (en value) | Izveidot jaunu grupu | Create a new group |
| `discovery.metaDescription` | Atrodi cilvēkus, ar ko kopā sportot, spēlēt, dziedāt un darīt citas lietas savā pilsētā. | Find people to do sports, play, sing and do other things with in your town. |

Reuse `discovery.memberCount`, `inThisCategory`, `noGroupsFound`, `noEventsFound`, `adjustFilters`, `shell.sidebar.collapse`/`expand`/`categoriesNav`, `common.cancel`, `common.close`. Delete keys no code reads any more, in both files (grep each first): `discovery.gridView`, `listView`, `loadingMore`, `groupsFoundCount`, `eventsFoundCount`, `searchInputPlaceholder`, `searchPlaceholder`, `anyCategory`, `clearCategory`, `clearTag`, `active`, `topicsSection`, `groupsEventsSection`, `noDescription`, `typePrivate`, `typePublic`, `shell.sidebar.anyCity`/`everything`/`groups`/`events`. Sentence case everywhere (AR-10).

## 9. Handbook, UI elements, accessibility, grep proofs

**Handbook.** `docs/handbook/voice.md` fixed words, new rows: "A sub-category | Veids | Type"; "Every place | Visur | Everywhere"; "Load the next 24 | Rādīt vēl | Show more". `docs/handbook/design.md`: layout A's note "A notes the filter line and category drawer (R5a)" → one sentence describing it (drawer from `lg`, filter line, cards from `md`, rows on phones); the screen table row "Discovery: groups and events | A | R5a, R5b" → "R5a done (filters, cards), R5b"; the Components list gains "Filter line" and "Group card and row" (two lines each: what they are, where they are used). `docs/handbook/behaviour.md` "Empty": nothing new.

**UI elements** (`app/[locale]/admin/handbook/ui-elements/page.tsx`, `lib/handbook/ui-samples.ts`): the group card specimen shows the new `GroupCard` (one with a note, one with a next meeting, one without a photo), `GroupRow`, `CreateCard` (both); a "Filter line" specimen with `FilterButton` (unchosen / chosen / open), a Veids chip pair and `ViewSwitch` (static samples, no router: give these parts plain props where the page needs it, or wrap the specimen in a `DiscoveryProvider` with a sample state). `UI` names: add `filterLine: 'filter-line'`, `filterButton: 'filter-button'`, `searchWordChip: 'filter-search-word'`, `veidsLine: 'veids-line'`, `viewSwitch: 'view-switch'`, `clearAll: 'clear-all'`, `filterList: 'filter-list'`, `categoryDrawer: 'category-drawer'`, `groupRow: 'group-row'`, `createCard: 'create-card'` (the drawing's `el()` names); delete `groupListRow`.

**Accessibility.** Truncated names keep the full text in the button's `aria-label`; the × buttons say what they clear; lists are native checkboxes/buttons/links with visible labels (not ARIA listbox); Esc closes a list and returns focus; sheets use `Overlay` (Back closes); the switch is a `nav` with `aria-current`; the drawer's folded icons carry their names; targets ≥ 44 px on phones; motion only with `motion-safe`.

**Grep proofs (section 11 runs them):**
```bash
grep -rn "e\.city ??\|event\.city ??\|city: string | null\|city: null" lib/services/event.service.ts lib/services/discovery*.ts components/discovery components/forms/EventCreationWizard.tsx  # P1: 0 (event city is non-null)
ls components/discovery/{DiscoveryFilterBar,DiscoveryFilterBarWrapper,DiscoverySidebar,ListViewCard,InfiniteScrollTrigger}.tsx 2>/dev/null  # P2: nothing
grep -rn "DISCOVERY_VIEWS\|snapInterest\|getContextualTaxonomy\|groupListRow\|currentView" app components lib; grep -n "PRIVATE" lib/services/discovery-query.ts  # P3: 0 and 0
wc -l components/discovery/*.tsx components/discovery/*/*.tsx components/providers/DiscoveryProvider.tsx hooks/useDiscoveryNav.ts hooks/useMediaQuery.ts lib/discovery-params.ts "app/[locale]/(discovery)/page.tsx"  # P4: each ≤ 150 (limits above)
grep -rn "prisma" app components hooks | grep -v "@prisma/client"                                 # P5: 0
grep -rnE "#[0-9a-fA-F]{3,6}\b|bg-white|text-white|uppercase|style=\{\{ *backgroundColor" components/discovery  # P6: 0 (style only sets --c)
grep -rn "getTaxonomy(" "app/[locale]/(discovery)"                                                # P7: only TaxonomyService, not the action
git diff --name-only origin/main -- prisma/migrations                                              # P8: exactly 20261014200000_require_event_city
```

## 10. Builder steps and commits

Small commits, each passing `npm run typecheck`; messages end with the co-author line. Read the Next.js 16 guides under `node_modules/next/dist/docs/01-app/03-api-reference/` for `useRouter`, `useSearchParams`, `Link` (`scroll`), `redirect` and `cookies` before step 3.

1. **Migration (stop point 1).** Schema, the folder of 1 with its exact SQL, `db:generate`, `migrate deploy`, the checks of 1, the type fixes of 1.1. Commit "feat(R5a): require_event_city (contract), event city non-null everywhere". **Stop here, run the checks, commit, then continue.**
2. **Services and helpers.** 2.1–2.4, constants, `DiscoveryState` type. Run the counts part of the script of 11 (`anyTopic`, `anyPlace`, sub-category counts without an L1). Commit "feat(R5a): discovery params, card shape with note and sub-categories, counts for Visas and Visur".
3. **Page, provider, nav hook.** 3.1–3.3 with today's `GroupCard` temporarily fed the new shape only if it compiles cheaply; otherwise go straight to 7 in this commit. Commit "feat(R5a): discovery page from services through DiscoveryProvider".
4. **Filter line and lists.** 4, 5 (including `CategorySuggest`), the old filter bar and wrapper deleted. Commit "feat(R5a): filter line, place, Veids and category lists, search-word chip". **Stop point 2** (only if the session runs long): hand over with the build-plan row "built to step 4"; nothing is pushed.
5. **Drawer, cards, rows.** 6, 7 (incl. profiles on `GroupList`, loading shape), deletions of 7.6, i18n of 8. Commit "feat(R5a): category drawer, group card and row, create card, Rādīt vēl".
6. **Handbook and UI elements** (9). Commit "docs(R5a): handbook words and layout A, discovery parts on UI elements".
7. **Close-out.** Definition of done, the matrix and script of 11; small issues fixed now; `docs/development/build-plan.md` section 8: R5a "built, in review" with the commit range; tick the R5a line in `docs/execution_handoff.md`. Commit. Do not push (the reviewer pushes).

## 11. Acceptance

**Definition of done:**
```bash
npm run typecheck
npx eslint $(git diff --name-only --diff-filter=d origin/main...HEAD -- '*.ts' '*.tsx')
npm run i18n:check
npm run plan:check
npm run build          # needs AUTH_SECRET + DATABASE_URL
npx prisma migrate deploy   # "No pending migrations"
```
plus the grep proofs of 9.

**Matrix.** Dev server, freshly seeded DB. Widths **360, 768, 1024, 1280, 1440, 1920 px**; **lv and en**; **light and dark**; signed out and signed in. Side by side with the drawings at 375 and 1280.

| Where | Look for |
|---|---|
| `/` | starts on Visur (Kur unchosen), Grupas; no heading, no count, no "Rāda:"; the drawer from 1024 with 15 categories + "Visas" and counts; 24 cards at most, "Rādīt vēl" when more (script) |
| Filter line, desktop | one line at every width ≥ 768 even with a word, two cities and a long Tēma (cut with "…", full name read by a screen reader); "Notīrīt visu" only from 2 chosen; the switch at the right end; Veids line only with a Tēma, never wraps, "+N" correct |
| Filter line, phones | switch full width; Kur, Tēma (and the word) on one line at 360 in lv and en; "Notīrīt visu" at the Veids line's end; no sideways scroll on the page (`document.documentElement.scrollWidth === innerWidth`) |
| Kur | "Visur" + count, cities with ticks and counts, ticked first; tick two → "Rīga +1", list stays open (desktop), URL `?city=Riga,Jurmala`; phones: sheet, applied on close, Back closes the sheet; "je" finds Jelgava and Jēkabpils; "Ērgļi" → "Nekas nav atrasts." + the hint |
| Tēma / drawer | choosing in the drawer or the Tēma list sets both; × on Tēma clears its Veidi; fold → rail with icons, reload keeps it; "nūj"-like typed Veids → "Tēma → Veids" row; no match → "Ieteikt jaunu kategoriju" → dialog → a pending Veids in Admin → Kategorijas, admins notified; signed out → sign-in pop-up |
| Veids | chips tinted in the Tēma tone, chosen first with ×; "+N" opens the list; ticks narrow the list; counts in the list equal the cards you then see |
| Counts | for 3 place sets × 3 Tēmas: the Kur count of a city = cards with only that city; the drawer count = cards after choosing that category; Veids count = cards after ticking only it (Grupas and Pasākumi) |
| Word chip | header search "sp" → `/?q=sp`: first button “sp” ×, list filtered by text, no category chosen by itself; × → plain discovery, other choices kept |
| Switch | Pasākumi keeps place, Tēma, Veidi and word; events by their own city (the Ķemeri walk under Jūrmala), online only under Visur; today's event cards (grid from 768, rows on phones) |
| Cards | name 2 lines, category line one line with "…", city · members; note = "Ko meklējam?" (seed: koris-riga etc.) or "Nākamā tikšanās: …" with the icon, or nothing; photo at the right ≤ 84 px, or tone tint + icon; create card last in a chosen category (also when empty), not on Pasākumi |
| Rows (phones) | two lines, sub-categories give way first, city and members always visible at 360 |
| Profiles | `/profile` and `/profile/{username}`: the same cards/rows |
| Old URLs | `?view=list`, `?type=PRIVATE` change nothing (no private group listed); `?category=<a level-2 slug>` lands on its Tēma with that Veids chosen |
| Dark | chips, rings, tints and tone marks readable; no white blocks |

**Reviewer script** (throwaway, never committed; delete after): with the dev server running and a fresh seed.
1. Make 30 extra public groups in Rīga, sports (`tmp-r5a-groups.ts` at the repo root, git-ignored by `/tmp-*`): `prisma.group.create` × 30 with the seed's sports L1 id, `city: 'Riga'`, an owner from the seed; set one existing group's next event to `MEMBERS_ONLY` and remember its title. Run with `npx tsx --env-file=.env tmp-r5a-groups.ts`.
2. In the browser console on `http://localhost:3000/lv`, signed out or not (fetches go without cookies):
```js
const get = async (q, rsc = false) => (await fetch('/lv' + q, { credentials: 'omit', headers: rsc ? { RSC: '1' } : {} })).text();
const cards = (h) => (h.match(/data-ui="group-card"/g) ?? []).length;
const h1 = await get('?city=Riga&category=sports'); console.log('24 cards', cards(h1), h1.includes('Rādīt vēl'));
const h2 = await get('?city=Riga&category=sports&limit=48'); console.log('more', cards(h2));
const h3 = await get('?city=Riga&category=sports&limit=100000'); console.log('cap ≤ 480', cards(h3));
const h4 = await get('?type=PRIVATE', true); console.log('no private names', !/PRIVATE_GROUP_NAME/.test(h4));   // put a private group's name here
const h5 = await get('', true); console.log('members-only next meeting hidden', !h5.includes('MEMBERS_ONLY_TITLE')); // the title from step 1
const h6 = await get('?view=list'); console.log('view ignored', cards(h6) > 0 && !h6.includes('Saraksta skats'));
console.log('no heading', !(await get('')).includes('Rāda:'));
```
Expected: `24 true`, `48`, a number ≤ 480, `true` on every other line. Then sign in as a member of the group from step 1: its card shows the members-only meeting. Run `npm run db:seed` to restore the DB and delete the script.

**Blue/green check (reviewer, before push):** `gh run list --workflow deploy.yml -L 3` shows R4's deploy (`cc368da`) succeeded, so R4's code is what serves during R5a's migrate. Re-run the migration on a local DB that has a NULL city: check out `cc368da` in a second worktree against a scratch copy of the DB (or roll the local DB back with `npx prisma migrate resolve --rolled-back 20261014200000_require_event_city` after `ALTER TABLE "Event" ALTER COLUMN "city" DROP NOT NULL`), set one event's `city` to NULL, apply the migration again: the event gets its group's city and the column is `NOT NULL`.

## 12. Risks

- **The contract step.** Safe only while R4's code serves the migrate (it always writes `city`). Never push R5a together with an older release; check the last deploy first (11).
- **One line at 360 px** with a word, two cities and a long Tēma in lv and en: the max widths and `min-w-0` must hold; measure, don't trust the drawing.
- **Veids fit measuring** can jump on first paint or loop on resize; measure with an invisible copy and only on size changes.
- **History.** Desktop ticks `replace`, everything else `push`; the phone sheet's own Back entry (R2b `useBackClose`) must not be replaced by a filter navigation while it is open (apply on close).
- **Counts vs lists.** Faceted counts ignore their own facet (R4); the reviewer compares a count with the list after choosing it (matrix). The new `anyTopic`/`anyPlace` and ungated `bySubCategory` change the counts' cache key (`v2`).
- **Two trees (cards and rows)** double the markup for 24 groups; acceptable (server HTML, no JS); hidden trees are `display:none`.
- **Profiles change** to the new card/row in passing (plan: "GroupCard on profiles switches too"); R9b owns their full look.

## 13. Out of scope

Date choices, day strip, calendar, event rows, "Rādīt nākamo nedēļu" (R5b); panels on card click (R6); the search overlay, "Atbilst arī:", theme chips (R7); "Kur tu esi?", remembering a place, "Citur" (R10); a profile city; suggesting a new place from the place list; a top-level category suggestion type.
