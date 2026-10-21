# Release 3: content carries colour

Just-in-time spec, written 21 Oct 2026 against `main` at `b7fa957` (release 1 type roles and release 2 space live). Docs only; the owner approved the scope. One build, one session of about 60 tool calls, so no split. Read the sections you need; sessions are tagged.

**Rules:** [AR-34](../redesign.html#AR-34) group card (desktop), [AR-36](../redesign.html#AR-36) group row (phones, unchanged), [AR-06](../redesign.html#AR-06) colour means category, [AR-47](../redesign.html#AR-47)/[AR-48](../redesign.html#AR-48) group banner, [AR-21](../redesign.html#AR-21) tabs. Handbook: `docs/handbook/design.md` Colour (lines 73-95), Group card and row (line 176), banner (line 12), category tiles (line 137).
**Drawings:** `scripts/redesign/parts.mjs` and `css.mjs` for AR-34 (the card drawing is an illustration at 1280; the photo on top is the new intent, not in the drawing). Do not read `docs/development/redesign.html`.

## 0. Goal (all)

Content carries colour, chrome stays neutral. Four changes:

1. **GroupCard, from 768 px:** the photo moves from the side strip (`clamp(52px,20%,84px)`) to the full width at the top, 16:9. Name and text sit below.
2. **No photo:** the same 16:9 area is the category tile (`cat-tile`, so Mierīgs tints it and Drosmīgs fills it solid), with a larger `CategoryIcon`.
3. **Group banner and panel head:** a full tone area instead of the thin tint, text at least 4.5:1 in every look, light and dark.
4. **Tabs:** the row's bottom line and the tabs end at the content width, not the full column.

Not in scope: the phone `GroupRow` (AR-36), the looks (R13 already differ in base colour), any schema change.

## Invariants (the reviewer checks each)

- **Taxonomy Law.** The tone is `--c` (cards, panels, rows; set inline from the service's `category.color`) or `--accent` (group pages; set in the layout's `<style>`). No client resolves a colour. No image URL inside a `<style>`: the photo stays an `<Image>` element.
- **AR-06.** The tone is only on the tile, banner and panel head, dots, icons and tints. Buttons, links, tabs, focus rings and chips stay site colour (`primary`). Tab underline stays `border-primary`.
- **No hardcoded colours or hex.** Text on a tone uses `--on-cat` (never `text-white`); the tile's glyph and ink follow `--tile-on`.
- **Type roles and space scale** from releases 1 and 2: no raw `text-sm`, `leading-*`, `font-semibold`, no `[Npx]` or half-step spacing, `px-gutter`, `max-w-*` names. `npm run ui:check` stays strict and clean.
- **Equal card heights** in a grid row (R5b measure): name 2 lines, tagline 2, bottom line 2 are still reserved; the 16:9 area is the same height in every card of a row because the card width is the same.
- **Whole card is one link** (stretched `::after`; category links `z-[2]`), `data-ui={UI.groupCard}`, `data-panel-origin`, `data-card-link`, `data-opens-panel` unchanged. The photo is decorative (`alt=""`).
- No hardcoded user text, no new strings expected (see i18n), no migration, no new dependency, no new doc.

## 1. GroupCard (R3-1)

File: `components/discovery/GroupCard.tsx` (86 lines now).

- Replace the two-column grid (`grid-cols-[minmax(0,1fr)_clamp(...)] grid-rows-[1fr_auto]`) with a column: picture first, then the text block, then `GroupCardActivity`. Use `flex flex-col` on the card; the text block gets `flex-1` so the bottom line sits at the card's foot and a row stays level.
- Picture: `relative aspect-video overflow-hidden cat-tile`. With `bannerImage`: `<Image fill className="object-cover" sizes="(min-width: 1280px) 400px, 50vw">` (check the real column widths on discovery and the profile grids and set `sizes` to match). Without: the icon centred, `size={40}` (default; was 26). Keep `getSmartImageUrl`.
- Radius: the card already clips with `overflow-hidden rounded-2xl`; the picture needs no radius of its own. Top edge of the picture is flush with the card (no padding around it); the text block keeps `px-[var(--card-pad)]` with `pt-[var(--card-pad)]`. A hard-shadow look (`--shadow-room`) is untouched.
- Hover: the card keeps its hover tint; do not tint the picture on hover.
- Where the grid has `grid-cols-2` at 768 px, the 16:9 area gets about 340 px wide at 768: fine. Check discovery, Manas grupas and public profiles (all use this component; grep `GroupCard` for callers) and the create-card in the grid, which must match the new card height or stay as it is (check; default: leave it, align it only if it looks broken).
- Update the docblock (it says "photo at the right").
- The `fullPage` link variant and `role`/`requestCount` lines are untouched.

## 2. Banner and panel head (R3-2)

Files: `components/groups/frame/GroupBanner.tsx`, `components/panels/PanelPicture.tsx` (already a `cat-tile`; check only), the `banner-tint` and `mark-tint` utilities in `app/globals.css` (lines 250-257), and where panels without a photo draw a head (`GroupPanel.tsx`, `EventPanel.tsx`; grep `PanelPicture`).

- The group banner never has a photo (C5), so it always gets the tone area. Replace the 22 % to 7 % gradient with a **full tone area** that follows the look's tile token: add a utility `banner-tone` next to `cat-tile` in `globals.css`: background `color-mix(in srgb, var(--accent) var(--tile-mix), var(--surface))`, and an ink colour driven by `--tile-on` (see below). Default for the calm look: the 20 % tint is the tile; the banner uses `max(var(--tile-mix), 24%)`-style strength only if the 4.5:1 check passes; otherwise keep `--tile-mix`. One default: **the banner uses exactly the `--tile-mix` of the look** (same as the card tile), so the card and the banner of one group match.
- Ink: add `--tile-ink` and `--tile-ink-muted` set per tile style, next to `--tile-mix`/`--tile-on`:
  - tint: `--foreground` and `--foreground-muted` (as now).
  - solid: `--on-cat` for both (muted at about 85 % via `color-mix`).
  Set them where `--tile-mix` is set: the defaults at `globals.css` line 49 and in `lib/theme/css.ts` (lines 57-64, the `style.tile === 'solid'` branch). The banner replaces `text-foreground`/`text-foreground-muted` with `text-[var(--tile-ink)]`-style utilities defined as named utilities (`tile-ink`, `tile-ink-muted`) so no arbitrary values are used in components.
- `mark-tint` (the 34/44 px icon square): on a tone banner it needs contrast against the banner. Default: on the banner the mark is a `surface` square with the tone glyph (`bg-surface text-[var(--accent)]`), which reads on both tint and solid. Do not use it elsewhere.
- Banner contents that are not plain text: `CategoryLine` takes `color="var(--accent)"`: on a solid banner the tone dot and tone-coloured link text vanish. Pass the ink colour instead on the banner (the dot becomes `--tile-ink`); the AR-06 rule still holds because it is a tone area, not a control. `lookingFor` in `text-primary` fails on a solid tone: use the ink colour and italic. `GroupActions` buttons sit on the tone: they are `surface` or `primary` buttons with their own text colour, check the focus ring (`outline-primary`) against solid tones and use `outline-offset` so it stays visible.
- The bottom border stays (`border-b border-border`) in tint; on solid drop to no border (the area has its own edge) if it looks heavy (builder's eye; default: keep).
- **Contrast check (a gate):** write a throwaway node script in the scratchpad (not committed) that, for every look (the presets in `lib/theme/`), mode (light, dark) and one of the 15 tones, computes the ratio of the ink over the banner background (with `color-mix` replicated in sRGB) and fails under 4.5. The existing floor in `lib/theme/contrast.ts` (tone vs `--on-cat`: 4.5 light, 7 dark) covers the solid case; the tint case is the muted text over a 20 % tone mix on the surface. If a tint fails, lower the tint share for the banner only, never the text colour.
- Panel head: `PanelPicture` is already `cat-tile` with the icon at `size={28}`; raise the icon to match the card (`size={40}` on md) and check the head is full tone with the close button (`bg-surface`) readable. If a panel type has its own thin tint head, convert it to `cat-tile`.

## 3. Tabs end at the content width (R3-3)

- `components/ui/PartTabs.tsx`: the row (`sticky top-0 ... border-b border-border`) sits in a `contents` wrapper, so the line spans the whole column (1205 px at 1280). Fix: the wrapper becomes the width-limited element. Add an optional prop `width?: 'page' | 'focus'` (default `'page'`) that sets `max-w-page` or `max-w-focus` on the row. The sticky row itself stays the line owner: make the row `sticky ... max-w-page` so line and tabs end together, background kept so content scrolling under stays hidden (the `bg-background` on the row; the part right of the line is page background, so nothing shows through).
- Callers: `announcements`, `events`, `members` page tabs and `InfoSections.tsx` (all in a `max-w-page` column: default `page`). The settings page calls `<PartTabs title items={[]}>` (title only) and `SettingsTabs`.
- `components/groups/SettingsTabs.tsx`: wrap in `max-w-focus` (settings column is `max-w-4xl` today at `settings/page.tsx:117`; the content inside is focus width, builder confirms by measuring the forms: default `max-w-focus` if the forms are at most 560 px, else the measured named width). Its styles are old: `px-4 py-4 text-tag`, `border-border/60`, icons `h-3.5 w-3.5`. Align with `PartTabs`: type role `text-body-sm`, `weight-strong` for active, `border-border`, `gap-4`, no `transition-colors`/icons unless they carry meaning (default: drop the icons for consistency). Active tab stays `border-primary` and `text-foreground` (not `text-primary`; keep the one tab pattern).
- Phones: the row scrolls horizontally inside the width; unchanged below 768 px.
- Check the admin pages that also use tab rows (grep `UI.tabs`); apply the same width rule only if they show the same bug.

## 4. Handbook, plan, handoff (R3-3)

- `docs/handbook/design.md`: Group card and row (line 176) and the layout table row B (line 12): photo on top, 16:9, tile when none; banner: full tone area following the tile style, with ink tokens (add a line under Colour, "Colour means category", that the banner is a tone area and its ink is `--tile-ink`). Category tiles (line 137): add the banner. Tabs: say the tab row ends at the content width.
- `docs/handbook/ui-elements` page (`app/[locale]/admin/handbook/ui-elements/page.tsx`): specimens for the card (line ~333 region is tabs; grep `groupCard`) show the new card; `components/handbook/GroupFrameDemos.tsx` for the banner. Update `UiSpecimen` file lists if files change.
- `docs/development/build-plan.md`: note release 3 under the sequence if releases 1 and 2 have entries; AR-34 table row gets "photo on top (release 3)".
- `docs/execution_handoff.md`: tick the item after the push; note the new tokens.
- No new docs.

## i18n

No new strings expected. If the builder adds an accessible name, add it to `messages/lv.json` and `messages/en.json` in the same commit and run `npm run i18n:check`.

## Data and migrations

None. `GroupCardData` already has `bannerImage`, `category.color`, `category.l1Slug`.

## Commit plan

1. `feat(colour): release 3 pass A: group card with the photo on top, tile when none` (GroupCard and any grid cell tweaks).
2. `feat(colour): release 3 pass B: banner and panel head as a tone area, ink tokens` (`globals.css`, `lib/theme/css.ts`, GroupBanner, PanelPicture).
3. `feat(colour): release 3 pass C: tab rows end at the content width; handbook, handoff` (PartTabs, SettingsTabs, docs).

Each commit passes `npm run check`.

## Acceptance (builder runs; the reviewer repeats)

- `npm run typecheck`, `npx eslint <changed>`, `npm run i18n:check`, `npm run ui:check` clean.
- Widths 360, 768, 1024, 1280, 1440, 1920; `lv` and `en`; light and dark; every look (Admin, Dizains presets; at least Mierīgs and Drosmīgs plus any other preset in `lib/theme/`).
- Before/after screenshots with `scripts/screen-review/capture.ts` (run it before pass A for "before"): home/discovery, a group page with a photo group card and one without, a panel (with and without photo), group page banner, settings, a members or events tab page at 1280 and 1920.
- Cards: equal height in a row with mixed content (photo/no photo, with/without activity line, long names, `requestCount`); phones still show the `GroupRow` unchanged at 360 and 767.
- Banner: contrast script green for all looks, modes and tones; focus ring and action buttons visible on the tone.
- Tabs: at 1280 the line ends at 760 px (settings: 560 px, or the measured width); sticky still works; no horizontal overflow at 360.
- No category colour on any button, tab or link (grep your diff for `--accent`/`--c` on controls).

## Risks

- Solid looks make tone-coloured text on the banner disappear (CategoryLine, `lookingFor`): covered in section 2; check with every tone, not one.
- A tall 16:9 picture makes the grid long on discovery: acceptable; if the first-screen count drops below one row at 1280 with a short window, leave as is (the owner chose it).
- `PartTabs` width change affects `InfoSections` (client-selected tabs) and the sticky background: verify no gap shows right of the line.
- Photos of mixed aspect: `object-cover` crops; faces may be cut. Accept.
- Settings width: `max-w-4xl` column vs `max-w-focus` tabs may look inconsistent; measure before choosing.

## Owner questions (defaults are used unless you object)

1. The banner uses the same tint strength as the card tile (the look's `--tile-mix`) so one group looks the same in both. Default: yes. Alternative: a stronger banner tint than the tile.
2. The no-photo icon is 40 px (was 26) on the card and the panel head. Default: 40 px.
3. SettingsTabs loses its three small icons so it matches the other tab rows. Default: drop them.
