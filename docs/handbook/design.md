# Design

UI work follows this chapter. A new screen picks one of the page layouts and uses the components below; it does not invent its own. The approved drawings are the last section of this page ([drawings](#drawings)). The real components are on [UI elements](/admin/handbook/ui-elements).

## Page layouts

Five layouts cover every screen. A new screen picks one of them.

| Layout | Name | Used for |
|---|---|---|
| A | Browse | Category drawer + filter line + grid or list. Discovery, Manas grupas. On discovery the title is the Grupas | Pasākumi switch with a count on each tab, under it one chip row (Kur, the chosen Tēma, the Tēma picker below 1024 px, dates, Veidi, the word, "Notīrīt visu"), then group cards from 768 px (rows on phones). From 1024 px the category drawer is a column flush at the left edge (gutter + 228 px wide, its icons under the logo; folds to a 56 px rail) and the board fills the rest to the right gutter, cards in an auto-fill grid (16 rem minimum, 20 px gap). Column and board share their row lines: "Tēmas" on the title baseline, the drawer search on the chip row, "Visas" on the first card row (R20). |
| B | Group page or your own area | A head (a banner for a group, your picture and name for you) and the pages down the left from 1024 px (a ☰ drawer below that; own area from 768 px). A group's head is a solid category-tone info tile on the page grid (`tone-fill`, with the mark, never a picture as its background, C5): full on Informācija, compact on other pages. On Informācija the group's picture is a tile beside it over the side column (it opens the gallery with one picture); on phones a 3:1 strip under the tile that expands to 16:9 in place; with no picture there is no tile and no fallback, the info tile spans the full width. ☰ for the pages sits in the tile below 1024 px (groups). **Side column (R17):** an optional third column on the right from 1024 px (`FrameColumns` `aside`, width token `w-aside`, sticky), after the page on smaller screens. It holds who or what this space is about, never actions that belong to the page: for a group the next meeting (one-line description), the latest news (Informācija only; title, one-line excerpt, author and time, "Visi jaunumi") and the members box with faces, count and the links (a link to Biedri for members and the team only; not on settings or create-event). On Informācija with tabs it starts level with the first section text, under the tabs divider (one section: at the top); below 1024 px the next meeting follows the first section and the rest follows the page. for your own area the profile card (Manas grupas, Paziņojumi, Iestatījumi; Ziņas keeps the full width). One box per thing you act on, no new colours. Group pages from R3a (AR-47, AR-48), your own area from R2a (AR-21, AR-60). |
| D | Focus | One centred column, max 560 px, no sidebar. Sign-in, register, wizards, onboarding. |
| E | Two panes | List + detail; on mobile one at a time with a back link. Messages. |
| F | Reading | Text column, max 680 px. About, privacy, profiles. Admin uses F with tables. |

**Fluid between the drawings.** The drawings are made at 375 and 1280 px; they show proportions, not fixed widths. Every layout is fluid between and beyond them: bars (header, footer, bottom bar, person header) span the full width with the brand at the left edge and the tools at the right edge, the search field grows in the middle up to `max-w-2xl`; a page's content sits in one centred container (`max-w-browse` for frames and grids, the layout's reading width for D and F), never stuck to the left on a wide screen. One exception: discovery (layout A), where the column sits at the left edge and the board fills to the right gutter with no centring, so a wide screen gets more card columns instead of empty bands (R20). Fixed pixel widths copied from a drawing are not used; fixed widths are kept only for side columns (a 260–280 px sidebar, the 190 px own-area menu), dialog sizes and small parts. Every screen is checked at 768, 1024, 1440 and 1920 px as well as 375 and 1280.

**Content starts right under the bars.** A page's first line sits at the frame's top spacing (12 px on phones, 18 px from 768 px), level with the pages menu: the layout owns that spacing, a page never adds its own top margin, container or card around itself. The same for group pages, your own area and admin.

**Bars and menus stay in reach.** The header is always sticky, and so is a page's own horizontal menu (the admin menu, a group's or your own area's menu bar, the filter line) — it sits right under the header with no gap, so moving to another section never needs a scroll back to the top. Owner, 19 Oct 2026, after comparing other sites: all of them keep the header and horizontal menu sticky.

**Admin pages are cards (R11b).** Inside the admin frame (sections across, pages down the left, parts indented, one drawer on phones) every page opens with the same title block (serif h1, one quiet line, an optional action at the right) and then sits in `rounded-2xl border border-border bg-surface` cards, as the settings pages do: no shadow, no entrance animation, tokens only. Lists of rows (hidden groups, removed content, reports, suggestions, team, notes) are card rows on phones and a table from 768 px where a table already carried columns. A text field with a limit in its shared schema (category and city names) shows the character counter (AR-71). Who sees what: every site admin sees all five sections; the Komanda roles and deleting in Pārskats are the owner's alone, inside the page.

Rule: the group's own content starts near the top. The banner carries the at-a-glance signals (name, category, city, members) and the same "Sazināties" for visitors on every group page.

## Every screen and its layout

"Today" names the release of the build plan (`docs/development/build-plan.md`) that brings the screen to its drawing; until then it keeps its old layout with the new colours, fonts and tags.

| Step | Screen | Layout | Today |
|---|---|---|---|
| Find | Discovery: groups and events | A | R5a, R5b done (filters, cards, events by day) |
| Find | Group and event panels | centred overlay (sheet on phones) | R6b done |
| Find | Search | header field, panel (full screen on phones) | R7 done |
| Find | Manas grupas | A | R8 done |
| Create | Create group wizard | D | R4 done (field), R12 |
| Join | Group Informācija | B | R3a, R9b done (parts on one page, tabs jump; group picture), R28 section pictures |
| Join | Join / Contact pop-up, sign-in pop-up | pop-up | R3b done |
| Join | Sign in, register, onboarding | D | R12 |
| Talk | Jaunumi | B | R9b done |
| Talk | Messages | E | R8 done |
| Talk | Notifications | header dropdown, page (phones: the page) | R8 done |
| Group life | Biedri, Requests | B | R9b done |
| Group life | Pasākumi tab | B | R3a, R5b done |
| Group life | Event page | B | R9a done (page; the form follows) |
| Group life | Create / edit event | B | R4 done (place), R9a |
| Group life | Group settings | B | R4 done (field), R9c done (settings cards like Iestatījumi; language bar wraps by group) |
| Me | Own profile, Manas grupas, Ziņas, Paziņojumi, Iestatījumi | B (frame) | R2a frame; R8 done (Manas grupas, Ziņas, Paziņojumi); R9c done (Mans profils shows what others see; Privātums in Iestatījumi) |
| Me | Public profile | F | R9c done |
| Me | Edit profile | D | R9c done ("Labot profilu" is a page of its own; the switches are in Iestatījumi) |
| Static | About, privacy, 404 | F | R12 |
| Admin | Five sections across (Moderācija, Struktūra, Vietne, Komanda, Izstrāde), pages down the left, parts indented under the open page, one drawer on phones; a one-page section (Komanda) is full width | F + tables | R11 |

## Foundations

Few values, used everywhere. The tokens live in `app/globals.css`; the site theme (`/admin/design`) sets the same names on the server, so the first paint is already right.

### Templates

A template is a palette plus a style. Mierīgs is the default and what every statement in this chapter describes; the other two swap the shape tokens. Palette and style are chosen apart in `/admin/design` (Noskaņojumi, Krāsas, Kategoriju krāsas, Forma, Fonti, Burti); a look (Sūna, Jūra, Rudzu maize, Saule, Gaiss) is a ready-made set of all of them, with its own 15 category tones. Saule selects Drosmīgs, Gaiss selects Gaisīgs.

| | Mierīgs (calm) | Drosmīgs (bold) | Gaisīgs (airy) |
|---|---|---|---|
| Corners | 6–32 px scale, 14 / 10 px menus | 4–12 px, pills 6 px | 2–4 px, pills stay round |
| Lines | 1 px soft border | 2 px ink | 1 px soft border, `frame` 1 px |
| Shadows | none on cards, soft float above the page | hard offset, no blur (3–6 px) | none at all (`--shadow-*: none`); the edge is the line |
| Press | scale | sinks 3 px onto its shadow | scale |
| Headings | 600 | 700 | 600 |
| Category tiles | tint | solid | solid |
| Card space (`--card-pad`, `--card-gap`) | 20 px | 20 px | 28 px |

### Colour

Neutrals carry the page. Colour means something (AR-04, AR-06): the **site colour** (Sūna, a moss green) is for buttons and links, a **category tone** marks a category, and three status colours say danger, success and warning. No other colours, no hardcoded `red-500`, no hex in components.

| Role | Token | Light | Dark |
|---|---|---|---|
| Background | `--background` | `#f4f4ef` | `#161814` |
| Surface (cards, panels) | `--surface` | `#fdfdfb` | `#1e211c` |
| Tint (quiet fill, hover, weekends) | `--tint` | `#e8eae1` | `#282c25` |
| Line | `--border` | `#dcdfd4` | `#353a31` |
| Text | `--foreground` | `#1f221c` | `#eceee7` |
| Quiet text | `--foreground-muted` | `#5f6558` | `#a8ae9f` |
| Site colour | `--primary` | `#4B5E3B` | `#b5c79e` |
| Text on the site colour | `--primary-foreground` | `#ffffff` | `#111111` |
| Category tone | `--accent` (set by the group page from `--cat-<slug>`) | tone | tone |
| Text on a tone | `--on-cat` | `#ffffff` | `#161814` |
| Danger | `--danger` | `#A63A2E` | `#EE9A8E` |
| Success | `--success` | `#3D6B34` | `#9CCB8C` |
| Warning | `--warning` | `#8A5B0B` | `#E2B65A` |
| Text on danger / success / warning | `--danger-foreground`, `--success-foreground`, `--warning-foreground` | derived (white or near-black, whichever reads better) | derived |
| Pop-up scrim | `--scrim` | black 30 % | black 50 % |
| Chip on a photo, text and rings on it | `--photo-chip`, `--photo-ink` | black 55 %, white | the same |
| Viewer's status on a group card or row (exception, R21-G) | `--role-live`, `--role-live-ink` | `#1DB954`, `#0B2414` | `#1ED760`, `#0B2414` |

**Three colour exceptions (owner's call 23 Oct, R21-G; third R27).** The status of the viewer on group cards and rows (Dalībnieks, Īpašnieks, Organizators, Gaida: every role the same) is one bright green with dark text (`--role-live`), a colour outside the palette; `MemberRow` keeps the role colours. The card's "Sazināties" button takes the group's Tēma colour (dashed outline at rest, filled on hover), not the site colour. The group head tile's button is a light pill with dark text in both modes (`Button` `onTone`, `--tone-btn`), because a site-colour button on a category tone fails contrast.

**Everything is a token, and the check enforces it.** The status colours, their inks, the scrim and the photo chip are part of the look (optional `danger`, `success`, `warning`, `scrim`, `photoChip` in a look's mode tokens; a look that names none gets Sūna's, the ink is derived). Sūna is the single source of the defaults (`lib/constants/theme.ts`); `app/globals.css` holds no look values. `npm run ui:check` fails on a hex/rgb/hsl/oklch literal, a Tailwind palette colour (`bg-red-500`, `text-white`, `bg-black/40`), a `dark:` variant, a bare `rounded`/`rounded-sm`/`rounded-[…]`, a raw `shadow-sm…2xl`/`shadow-[…]` and a `rounded-full` that is not a circle (`size-N`, equal `h-N w-N`). Such a line may carry `ui-allow: <reason>` (the OAuth brand colours, the logo dot, a size-by-prop disc). So a new look in `THEME_PRESETS` + `THEME_STYLES` changes every surface.

**Colour means category (AR-06).** A category tone appears only on dots, category icons, soft tints (up to 15 %; the group card's tab is one, 12 % in light and 16 % in dark; the exception is the group card's no-photo band, 24 % in light and 30 % in dark, solid in Drosmīgs), the group head tile and the picture fallback. The head tile is solid tone in every look (`tone-fill`, text `--on-cat`, no muted ink; hierarchy comes from size and weight), at least 4.5:1 on every tone and mode. Every button, link, active tab, toggle, checkbox, focus ring and selected chip uses the site colour. Filled colours carry their own text colour (`text-primary-foreground`, `--on-cat`), never `text-white`, because the dark site colour is light.

**The 15 category tones (AR-05)** each have a light and a dark value; they are listed with names on the [approved drawings](#drawings) and shown on UI elements. Category tones are part of the site theme, per mode. Site admins change the site colours, the tones and the fonts in Admin → Dizains (Noskaņojumi, Krāsas, Kategoriju krāsas, Forma, Fonti, Burti; one shared sample beside the parts): a preview for yourself first, then publish. The editor checks the contrast floor below as you pick and will not save a colour under it.

**Contrast floor.** Text is AA (4.5:1) on every surface in both modes. A tone is at least 4.5:1 with white (light) and 7:1 with near-black (dark). The line colour is a divider, never the only sign of a control.

### Type

Two families (AR-07): **Literata** for titles, **Commissioner** for everything else. Weights 400, 500, 600; 700 only for counts in chips. No 800 or 900, except Archivo Black, the Saule heading font: one black weight, the single exception, and headings never get synthetic bold. The Admin > Dizains editor is an experiment tool and may go outside these limits (weights 100–1000, sizes 8–120 px); the defaults follow the table.

| Role (utility) | Font | Size / line / weight | Example |
|---|---|---|---|
| Display `text-display` | Heading | 32–52 fluid / 1.05 / heading weight | Hero lines |
| Page title `text-title` | Heading | 26–36 fluid / 1.1 / heading weight | Pasākumi |
| Section `text-section` | Heading | 20–24 fluid / 1.2 / heading weight | Par mums |
| Item title `text-item` | Heading | 17–19 fluid / 1.3 / heading weight | Ķemeru purva taka |
| Body `text-body` | Body | 16 / 1.6 / 400 | Satiekamies pie stacijas. |
| Body small `text-body-sm` | Body | 15 / 1.5 / 400 | Descriptions in dense lists |
| Button `text-button` (`-sm`) | Body | 15 (14) / 1.2 / 500 | Pievienoties |
| Meta `text-meta` | Body | 13 / 1.45 / 400 | Sestdien 10:00 · Ķemeri |
| Tag `text-tag` | Body | 12 / 1.2 / 600, +0.02em | Eju |
| Human note `human-note` | Body italic | 14 / 400, site colour | Nākamā tikšanās: sestd., 17. okt. |

Pages and components pick a role, never raw sizes: no `text-sm`, `text-[13px]`, `leading-*`, `tracking-*` or `font-medium/semibold/bold` (`npm run ui:check` lists them). A role carries size, line, tracking and weight; the heading roles use the heading font and the style's heading weight. Inside a role, a name or count that stands out takes `weight-medium` or `weight-strong` (weight only). Their steps over the role weight (+100 and +200 by default, 0–400) are a theme setting: Burti > Izcēlums, also in the Dizains panel when the clicked text is emphasised. There is no emphasis setting per role or per element. Primary text (titles, descriptions) is `text-foreground`; `text-foreground-muted` is for meta. Page titles come from `PageHead` (title, optional lead, actions).

An admin edits a role without leaving the page: the Dizains tab of the admin tool panel (R23-2) picks the role of a clicked text and saves each change to the draft theme, which the server renders on every page until published. A clicked text also shows why it looks so: its role and weight, the emphasis and what it adds, pelēks, and a selected or pressed state.

Nothing is smaller than 11 px. The admin can tune the type system (base size, contrast, heading weight, leading, per-role overrides) in Admin > Dizains; the roles read `--type-<role>-*` variables set by the theme, and the table above is what applies when nothing is set.

### Shape

Pill buttons, chips, tags, avatars and the search field (AR-08). Cards, panels, pop-ups and boxes 16 px. Inputs, menu items and toasts 12 px; an event row's hover 8 px. Group cards carry a thin 1 px border (`border-border`) so they do not blend into the background; panels and pop-ups have none. Thin lines divide rows (the phone group row is a divided row, not a card).

Never a bare `rounded`, `rounded-sm`, `rounded-[…]` or `shadow-sm…2xl` (`ui:check` fails on them, see Colour): corners and depth come from the look. Tokens: `rounded-pill` for pills (full in Mierīgs), the radius scale `rounded-lg … rounded-4xl`, `rounded-menu` and `rounded-item`. Three utilities carry the edge: `line` for the edge of a surface or control (1 px soft border in Mierīgs, 2 px ink in Drosmīgs), `frame` for edges only Drosmīgs draws (0 px in Mierīgs), and dividers stay `border-border` (one-sided rules and `divide-*` never change). Avatars, dots, the switch knob and unread badges stay `rounded-full`.

### Motion and icons

- **Buttons.** A pill button or link is `Button` / `buttonClass` from `components/ui/Button`; a round icon-only control is `IconButton` (`aria-label` required by type; sizes sm 28, md 40, lg 44) or `iconButtonClass` for a Link or menu trigger. Rows, tabs, chips, menu items and cards stay plain. A hand-rolled filled pill fails `ui:check`; a part of a control (clear mark in a chip, toggle in a bar) says `ui-allow: <reason>`.
- **Motion.** Three durations and one ease in `@theme`: `duration-quick` 120 ms (press, hover), `duration-base` 150 ms (the default), `duration-slow` 240 ms (drawers, toasts), `ease-standard`. Never `transition-all` (name the property: `transition-colors`, `-opacity`, `-transform`), raw `duration-N`, `delay-N`, `ease-*` or `animate-in`. Decorative animation (`animate-fade/pop/rise`) sits behind `motion-safe:`; a spinner may stay. Hover and focus feedback is never movement alone: a colour, edge or label change carries it and works under reduced motion; movement is an extra.
- **Icons.** lucide only, sized by `size-N` (never `size={…}` or an `h-N w-N` pair) and never `strokeWidth`: the look sets `--icon-stroke` once on `.lucide` (style token `iconStroke`: 2 in Mierīgs and Drosmīgs, 1.5 in Gaisīgs). A single emphasised icon may use a `stroke-N` class (check marks `stroke-3`).

### Space and depth

- 4 px grid; spacing steps 2.5 and 3.5 and arbitrary `[Npx]` spacing are not used (0.5 and 1.5 stay for hairline nudges). A control's padding is 12, a card's 20.
- Space tokens: `gutter` (page sides, `px-gutter`, 16 px on a phone to 32 px) and `section` (the gap between page sections, `gap-section`, 32 to 64 px).
- Width tokens: `max-w-browse` 1200 (frames; not discovery, whose board fills to the right gutter since R20), `max-w-page` 760 (group and event pages), `max-w-focus` 560 (forms, wizard), `max-w-reading` 66ch (running text: Par mums, custom sections, announcements, event descriptions, rich text). No `max-w-[Npx]`; `calc()` and viewport units are the only arbitrary widths, for sizing against the screen.
- Fewer boxes: a box is for one thing you act on as a unit (a card in a grid, a dialog, the wizard, the next-meeting box). Group page sections sit on the page under their heading, announcements are rows divided by hairlines.
- Gaps: 8 inside a row, 12–16 between items, 24–32 between sections.
- Space inside a card is never more than the space between cards: 20 px inside (padding, 6 px between lines), 20 px visible air between cards in the grid (Drosmīgs adds `--shadow-room` so the hard shadow does not eat it).
- Cards are flat. The float shadow (`shadow-premium`) is only for things above the page: menus, drop-downs, pop-overs, toasts, drawers. Dialogs use `shadow-dialog`. Shadows are the same in dark mode.
- Drosmīgs gives cards and controls a hard offset shadow (`shadow-card`, `shadow-control`); `shadow-room` leaves space inside a clipping parent (chip rows) and `press` sinks a filled button onto its shadow (position change kept under reduced motion, transition dropped).
- Gaisīgs draws no shadow, so everything that floats (menus, pop-ups, panel picture button, preview bar, slide-over) carries `line` or `frame` as its edge.
- Category tiles (card picture, row icon, panel picture) use `cat-tile`: Mierīgs tints the tone (20 % on the surface, tone as glyph), Drosmīgs fills it solid with the on-tone glyph (`--tile-mix`, `--tile-on`; style token `tile`).

## Identity

- **Logo (AR-03).** "Ejam *kopā*" in Literata, the site colour, with two overlapping circles (the second at 45 %). Phones use the smaller size. The favicon is the two circles. The brand is written "Ejam kopā".
- **Small tags (AR-09).** `text-tag` (12 px), a pill, sentence case, never clickable, never in a category tone. A tag with a tick says "Eju"; roles say "Īpašnieks", "Mod", "Biedrs" and "Gaida", each in its own colour: the four role tones belong to the look's palette (`--role-owner|mod|member|pending` with their ink, text on them 4.5:1 in every look and mode), solid for Īpašnieks and Mod, a soft tint for Biedrs and amber for Gaida (still reads as waiting). A plain member has no tag. Quiet facts ("Tikai biedriem") are grey.
- **Category line.** The category with a tone dot, then its sub-categories in quiet text, on one wrapping line.
- **Words and numbers (AR-10).** Sentence case everywhere, table headers included: no capitals, no letter-spacing. Numbers in text are plain digits.
- **Dates (AR-11).** With the weekday: "Svētd., 18. okt." and "Svētd., 18. okt. 17:00", English "Sun, 18 Oct, 17:00". 24-hour time in the viewer's zone. Latvian weekdays are capitalised at the start of a line.
- **Ziņojumu dēlis.** A group is a note on a notice board. Two touches carry it and nothing else: a **sticker** (the main category, tilted -2°, over the photo's bottom edge, its own opaque base) and a **tear-off tab** (the card's bottom: a neutral perforation with scissors at the left, tinted below). No cork, pins, tape, handwriting or paper grain. Hover and the tilt only behind `motion-safe`; in Drosmīgs the perforation is ink, in Gaisīgs thin. See Group card and row.

## Components

One component per job, in `components/ui/`. Pages use these and don't restyle them.

- **Button.** Pill. Primary (filled, one per area), secondary (tint), quiet (ring), danger, `onTone` (light pill, only on the group head tile). Sizes md (44 px on phones, 40 from `md`) and sm (32 px). Always the site colour, never the group's. Round icon-only: `IconButton` (see Motion and icons).
- **Badge and RoleTag.** Badge is the small tag: tone `tag`, `outline` or `muted`. Tone `role` is a solid pill in the look's colour for that role. RoleTag shows Īpašnieks, Mod, Gaida (and a quiet Biedrs on discovery) in those colours, and nothing for a member elsewhere; the colour is fixed once there, so every place it appears has it.
- **FilterChip.** Filters (clickable). Off: surface with a ring. On: site colour tint with a stronger ring.
- **CategoryIcon, CategoryDisc, CategoryLine.** The icon of a main category; the icon on a tinted disc in the tone; the category line.
- **Logo.** Wordmark in two sizes, or the circles only.
- **Form field.** Label above, input, optional help text below; an error replaces the help text, in the danger colour, under the field.
- **Panel.** The opened card and the event panel: from 768 px a centred overlay that grows out of the card or row you clicked and closes back into it (only a short movement, none with reduced motion), a full-height sheet below 768 px (a close bar with × on top, then the picture); from 768 px the picture with ×, the name, the category line, the facts, the text, one main button and a text link. An opened panel shows at least everything its card shows. It has its own address (the group's or the event's page): Back closes it, a reload or a shared link opens the full page. It opens from any page (discovery, a group's Pasākumi, Manas grupas, Ziņas, profiles); a group's home from inside the same group, an event from its own forms, and the group wizard and admin open the full page. A group you belong to or wait for opens its full page, never the panel.
- **Admin tool panel.** One box with the tabs Atsauksmes, Tulkot, Dizains and, on group pages, Grupa (the group's status, facts, hide with a typed reason, restore, open reports, the last log entries; deleting stays in Admin > Moderācija), opened from the shield. Floats from 768 px (drag by the top bar, dock to the right edge), pushes the page aside when docked from 1280 px, a bottom sheet above the nav on phones. Layer `z-[58]`: above slide-overs and the nav, below the dialogs it opens. The root is marked `data-admin-panel`.
- **Who is going.** Up to three faces and one name for signed-in viewers ("Ilze un vēl 11 iet"), the number for visitors ("12 iet"); people whose profile is private are counted but never shown.
- **Pop-up.** Rule (R21): below 768 px every pop-up and drop-down is a bottom sheet: filter lists (Tēma, Kur, date) and dialogs (header menus stay a full-width list under the header). The big ones (the opened card, the event panel) are a full-height sheet with a close bar on top and the content scrolling under it; a chat opened from the Ziņas list is a full screen with a back arrow. Never a side drawer or an anchored popover on a phone: its rows must be tappable and nothing may sit off screen. A choice made in a sheet closes it first and then navigates (`afterOverlayClose`), so the sheet's own Back never swallows the push. Overlay is the one shell. **Gallery** belongs to the family: one dialog for every picture set (section pictures, the group picture), ← / → buttons and keys, "n / N", the credit, focus back to the opening tile, the two neighbours preloaded; one picture hides arrows and counter. Modal (dialog: dim + 1.5 px blur, title + close, body, buttons right; a sheet from the bottom on phones), Sheet, side panels and drawers (dim only). A small confirmation for an undoable step is a pop-over at the button.
- **Group card and row.** The card (grid, from `md`): the photo 5:2 (none: a slim tone band with the category pattern) with the role pill top right and the category **sticker** (a link that filters by the main category) on its bottom edge; the name (2 lines), the sub-categories as links, the tagline (2 lines); then the **tab**, always the same two-row height so a grid row stays even: row one is the note on one line with an ellipsis (running meeting, next meeting, newest announcement, "Ko meklējam?"), row two is up to three faces with the empty seat ("Vieta tev": visitors and non-members; none for members; a clock for Gaida) and `place · members`. The phone row: a 56 px rounded photo or tone tile, the name on one line, the category line, and a mini tab chip (no perforation) with the note; the seat or the role tag on the right. The create card ("Izveidot jaunu grupu") has no tab: the dashed card outline only, stretched to the grid row height, the + and the title centred in the whole card with "šajā kategorijā" as a small muted line right under the title; the phone row has the same muted line, no chip.
- **Category drawer (Tēmu rādītājs).** An index, never louder than one card. Head "Tēmas" on the filter line's row with the fold button in it; a quiet search under it (icon and placeholder "Meklēt tēmu", no line, the site-colour ring on focus) that also finds Veidi, listed under a muted "Veidi" label with the matched letters underlined, and offers "Ieteikt jaunu tēmu: „…”" when nothing matches; "Visas", a dashed rule, then the fifteen. Every category icon carries its tone at rest (`text-[var(--c)]`, no disc), in the open list, the rail and the drop-down; the colours are a fun element and stay always. Only "Visas" is neutral. The selected row adds the tab's soft tint (12 / 16 %) and an 8 px tone dot at the row's end (the rail: a 6 px corner dot). Hover backgrounds are the neutral tint. "Visas" selected is the neutral tint with a site-colour dot. Names stay in text colour at the plain role weight (400), only the selected row is emphasised (weight 600), counts muted and tabular; an empty category is a muted name with "0", never faded. Each row sets `--c` from its category colour (Taxonomy Law). Drosmīgs adds the ink frame and hard shadow to the selected row (`topic-chosen`). The Tēma drop-down below 1024 px is the same list with 44 px rows on phones and no head.
- **Announcement card.** Meta line (when, who), bold title, short text.
- **Empty state.** Outline icon, a short title, one italic sentence in the site colour, at most one action.
- **Toast.** One line at the bottom (above the bottom bar on phones), inverted (foreground on background), one at a time, goes by itself (after "Nosūtīt": "Ziņa nosūtīta").
- **Skeleton.** Neutral tint in the shape of the content it stands for.
- **Language editor.** One bar above the fields of owner text: "Valoda" and a pill with the language's own name and "Oriģināls" on the original; the other versions as quiet links ("Citas valodas: English"); "+ Pievienot tulkojumu". The menu lists the versions with their state (ir teksts, tukšs, jālabo) and the actions for the language on screen (make it the original, remove the translation; hidden when they do not apply). Used by the event form, group sections and the create-group wizard.
- **Text counter.** Under the field's right end: quiet "71 / 2000", the warning colour in the last tenth, red "2013 / 2000 · 13 par daudz" past the limit.

- **Shell.** The header (AR-12, AR-13) is the logo (the way to Atklāt; there is no Atklāt link in the header), a search field (a click, a tap or the first letter opens the search), signed in "Manas grupas" (a text link right of the field from 1024 px, an icon beside the logo at 768 to 1023), "LV ▾" and, signed in, messages, bell and your picture; the shield joins for site admins (its menu: the panel and Administrēšana, the queues with counts, and on a group page that group's tools). Messages and the bell open small lists on a click (the last five, then "Visas ziņas" / "Visi paziņojumi"); on phones the bell opens Paziņojumi. The three menus (profile, shield, language) are one `Menu` component: same look, same keys. From 768 px the header's sides are `px-gutter`, so the logo sits on the page gutter. On discovery from 1024 px with the column open the field starts so its magnifier stands over the title's first letter (CSS only, from the drawer's state), elsewhere it is centred. Light and dark is the Izskats setting in Iestatījumi, not a header control. On phones the bottom bar has Atklāt, Grupas, +, Ziņas, Es; a group page marks the tab you came from (AR-20). The footer is a slim line on discovery and reading pages only (AR-16). Every header and bar control is at least 40 px.

- **Part tabs.** Links, the site colour under the open one, the page's one action at the right end ("Izveidot pasākumu"); on phones the page's name stands over them.

- **The group's action rows (AR-51).** Under the pages in the left menu (desktop column and phone drawer), no "…" in the banner: what you can do: Dalīties; "Tava dalība" (role line, write to the team, withdraw, leave); Ziņot par grupu as a quiet link last. Site-admin tools never sit in a group's menu (shield and Grupa tab); rows hidden, never greyed; an undoable step asks in a pop-over at its row. The head tile's foot keeps the one role button: Sazināties, the pending state, or Labot grupu for the team. The group name wraps to 2 lines in the tile.
- **Switch.** A pill track in the site colour; the label is the row's text.
- **Board heading and filter row (R20).** The title is the switch: "Grupas | Pasākumi" in `text-title`, the current one in ink, the other muted, a small muted count after each word that follows the filters, a 1 px cap-height rule between. No tray, no second title, no context line. Under it (16 px) one row of 28 px chips, one family for every filter: Kur (always first), the chosen Tēma (second at every width, tinted with ×; the Tēma picker chip shows below 1024 px only), the dates (segments where the row is wide, one chip otherwise), a thin rule and the Veids chips of the chosen Tēma (chosen first, "+N" for the rest; phones scroll the row sideways instead), the word, and "Notīrīt visu" as a chip at the end from two chosen things. Chosen = soft tint + ×: the theme tone for Tēma and Veidi, moss for place, word and date; open: site-colour ring. The row sticks 8 px under the header on a soft background gradient, chips solid, no line. The loading skeleton draws the same rows at the same heights. Lists open under their button, as a bottom sheet on phones. With a search word the word is the first chip (“sp” ×) and a line "Atbilst arī:" under it offers the themes and Veidi the word also matches (a tap chooses it in place of the word). Used on discovery.
- **Search.** The header field opens it: on computers a panel under the header over the dimmed page, on phones the full screen with ← and the field. At its top the Kur button and, once letters are typed, the themes that match the word as choice chips (none before; a theme already chosen, such as the page's category, stays) (one at a time: the chosen one tinted with ×, the others step aside); below, groups as group rows and events as event rows with the word marked in the site colour; with an empty field the recent searches. "Rādīt visus rezultātus" opens discovery with the word as the first chip and "Atbilst arī:" above the list.
- **Highlight.** The matched letters in the site colour, semibold.
- **Group card and row.** The card (from 768 px) shows name, category line, place and members, the group's tagline (the first words of its public home text), the group's note (the next meeting or "Notiek tagad · līdz …", else the newest public announcement, else the tagline; nothing when none) with a short photo band on top (5:2, about half the old height; tag top right and faces bottom right stay on it) or, without a photo, a slim category-coloured strip with the icon, the L1 name and the tag, so the text leads; no hover growth; cards are at least 16rem wide, so three fit where two did; every card in a grid is the same height (name, tagline and note each reserve two lines). The row (phones) is two quiet lines, the tagline and a tone mark. Where the viewer is signed in, discovery tags the groups that are theirs, on the picture's top right (card, an opaque pill that reads on any photo and on the tile) and before the tone mark (row), and the card's picture carries up to three member faces with "+N" bottom right (public profiles only, one batched query per page; visitors get none): Īpašnieks, Mod, a quiet Biedrs for a plain member, and Gaida while a request waits (Manas grupas leaves the member tag out, AR-09, as every group there is yours). Both end with the create card in a chosen category. Used on discovery and the profiles.
- **Banner picker.** One field in three forms (create-group wizard step Tēma, group settings, event form): a 16:9 preview, "Izvēlēties attēlu" / "Mainīt" and "Noņemt". It opens a dialog (a sheet on phones, centred from 768 px) with "no image" first, then the curated photos of the group's category, then a search of Unsplash (only when the key is set). A raw image address is for site admins only, under "Papildu". The photo credit ("Foto: name, Unsplash", both links with the UTM tags) sits under every big picture (group page, event page, panel, the gallery) and never on cards.
- **Section pictures.** Up to 8 per section, picked one at a time with the banner picker (no "no image" tile). A photo row under the section text: 3 tiles in the first section and 2 in later ones at a fixed 3:2 on every width, the last tile "+N" when there are more; a press opens the gallery there. No pictures, no row. The team sees every tile with × (confirmed at the button) and "Pievienot attēlus" right-aligned in the section head (a limit line at 8); reordering is in the settings section editor. No captions: alt = section title and number. The team's row differs from the public one; to see the public look, sign out.
- **Event page.** The panel's content in full inside the group frame, one surface 760 px wide: the event's own picture only (16:9, rounded, with the photo credit under it when it is from Unsplash), title, category line, the status words (Pieteikšanās · Pilns · Tikai biedriem), when with "Pievienot kalendāram" (or the tag "Notiek tagad"), where with "Atvērt kartē", "Par pasākumu" and "Praktiskā informācija" as identical sections (a lock line "Redzama tikai dalībniekiem" when only participants see it), who is going, the step and "Dalīties" on one line, and the team's "Rīkotājiem" box at the bottom (counts that open their lists, Labot, Slēgt pieteikšanos, Dzēst).
- **Tabs.** A page's tab row and its line end at the content width (`max-w-page`, the settings tabs `max-w-focus`), not at the column's edge.
- **Active marker.** In a tab row and in the title switch (Grupas | Pasākumi) the current one is strong text with an accent underline (2 px; the switch uses a short one under its word), the others muted; `aria-current` marks it. The same at every width.
- **Sticky context bar.** A page head that scrolls away on a phone (a group: below 1024 px) leaves a thin 40 px bar under the header with the menu button and the page name (group page: ☰ + group name). It hangs from a zero-height sticky wrapper so it never moves the page, and sticky tab rows stack under it via `--sticky-bar`.
- **Breadcrumb.** A group's subpage that belongs to a list names it after the group in the head tile: "Vēja zirdžiņš › Visi pasākumi"; pages never put a back link between the head tile and the content.
- **Event row.** One row everywhere: the time, the category dot, the name and the city on line one; "Eju" (or outlined "Gaida") under the time, its tick starting where the time's first digit starts; line two the group as a link, the category and sub-categories; last the first words of the description, one line. Thin lines between rows, 8 px hover radius. Rows sit under day headings ("Šodien · pirmd., 12. okt.", "Rīt · …", then the date) on one surface, in two columns when the list is wide. A group's own pages leave line two out. After the city a quiet word for events you cannot simply join: "Pieteikšanās" (the organiser approves) or "Pilns". The row opens the event's panel; no join button on it.
- **Day strip and date picker.** The strip shows seven days, Monday first, the month between ‹ and ›, a dot under days with events, weekends on the tint, the list's first day filled in the site colour; a tap starts the list at that day. The filter line holds Šodien · Šonedēļ · Nedēļas nogalē and the calendar as one pill (one date button where the line is narrow and on phones, opening the same choices above the calendar). The calendar shows one month; a first tap picks a day, a second a range; "Rādīt N" applies it.

Also one each: sub-tabs (underline), avatar, the date and time fields. Icons only from `lucide-react`, 16 or 20 px, always next to a word unless the meaning is universal (close, menu, back).
