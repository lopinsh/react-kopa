# Design

UI work follows this chapter. A new screen picks one of the page layouts and uses the components below; it does not invent its own. The drawings are on the [redesign page](/admin/development/redesign); a rule id like `AR-06` points to its entry there. The real components are on [UI elements](/admin/handbook/ui-elements).

## Page layouts

Five layouts cover every screen. A new screen picks one of them.

| Layout | Name | Used for |
|---|---|---|
| A | Browse | Category drawer + filter line + grid or list. Discovery, Manas grupas. On discovery the category drawer (a 232 px column from 1024 px, folds to a rail), the filter line (Kur, Tēma, the Veids chips, the Grupas | Pasākumi switch) and group cards from 768 px (rows on phones) fill the frame. |
| B | Group page or your own area | A head (a banner for a group, your picture and name for you) and the pages down the left (a ☰ drawer on phones). A group's banner is 96 px: always a full category tone area (tint or solid, as the look's tiles) with the mark, never a picture (C5); the group's picture is a 16:9 picture at the top of Informācija only (a category tile when it has none); on phones a 64 px bar with ☰ for the pages. **Side column (R17):** an optional third column on the right from 1024 px (`FrameColumns` `aside`, width token `w-aside`, sticky), after the page on smaller screens. It holds who or what this space is about, never actions that belong to the page: for a group the picture, the members with faces, the next meeting and the links (not on settings or create-event); for your own area the profile card (Manas grupas, Paziņojumi, Iestatījumi; Ziņas keeps the full width). One box per thing you act on, no new colours. Group pages from R3a (AR-47, AR-48), your own area from R2a (AR-21, AR-60). |
| D | Focus | One centred column, max 560 px, no sidebar. Sign-in, register, wizards, onboarding. |
| E | Two panes | List + detail; on mobile one at a time with a back link. Messages. |
| F | Reading | Text column, max 680 px. About, privacy, profiles. Admin uses F with tables. |

**Fluid between the drawings.** The drawings are made at 375 and 1280 px; they show proportions, not fixed widths. Every layout is fluid between and beyond them: bars (header, footer, bottom bar, person header) span the full width with the brand at the left edge and the tools at the right edge, the search field grows in the middle up to `max-w-2xl`; a page's content sits in one centred container (`max-w-6xl` for frames and grids, the layout's reading width for D and F), never stuck to the left on a wide screen. Fixed pixel widths copied from a drawing are not used; fixed widths are kept only for side columns (a 260–280 px sidebar, the 190 px own-area menu), dialog sizes and small parts. Every screen is checked at 768, 1024, 1440 and 1920 px as well as 375 and 1280.

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
| Join | Group Informācija | B | R3a, R9b done (parts on one page, tabs jump; group picture) |
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

A template is a palette plus a style. Mierīgs is the default and what every statement in this chapter describes; the other two swap the shape tokens. Palette and style are chosen apart in `/admin/design` (Noskaņojumi, Krāsas, Kategoriju krāsas, Forma, Fonti); a look (Sūna, Jūra, Rudzu maize, Saule, Gaiss) is a ready-made set of all of them, with its own 15 category tones. Saule selects Drosmīgs, Gaiss selects Gaisīgs.

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

**Everything is a token, and the check enforces it.** The status colours, their inks, the scrim and the photo chip are part of the look (optional `danger`, `success`, `warning`, `scrim`, `photoChip` in a look's mode tokens; a look that names none gets Sūna's, the ink is derived). Sūna is the single source of the defaults (`lib/constants/theme.ts`); `app/globals.css` holds no look values. `npm run ui:check` fails on a hex/rgb/hsl/oklch literal, a Tailwind palette colour (`bg-red-500`, `text-white`, `bg-black/40`), a `dark:` variant, a bare `rounded`/`rounded-sm`/`rounded-[…]`, a raw `shadow-sm…2xl`/`shadow-[…]` and a `rounded-full` that is not a circle (`size-N`, equal `h-N w-N`). Such a line may carry `ui-allow: <reason>` (the OAuth brand colours, the logo dot, a size-by-prop disc). So a new look in `THEME_PRESETS` + `THEME_STYLES` changes every surface.

**Colour means category (AR-06).** A category tone appears only on dots, category icons, soft tints (up to 15 %; the group card's tab is one, 12 % in light and 16 % in dark; the exception is the group card's no-photo band, 24 % in light and 30 % in dark, solid in Drosmīgs), the group banner and the picture fallback. The banner is a tone area (a 12 % tint in Mierīgs, solid in Drosmīgs); its text takes the area's ink (`tile-ink`, `tile-ink-muted`, from `--tile-on`), at least 4.5:1 on every tone, look and mode. Every button, link, active tab, toggle, checkbox, focus ring and selected chip uses the site colour. Filled colours carry their own text colour (`text-primary-foreground`, `--on-cat`), never `text-white`, because the dark site colour is light.

**The 15 category tones (AR-05)** each have a light and a dark value; they are listed with names on the [redesign page](/admin/development/redesign#h-id) and shown on UI elements. Category tones are part of the site theme, per mode. Site admins change the site colours, the tones and the fonts in Admin → Dizains (Noskaņojumi, Krāsas, Kategoriju krāsas, Forma, Fonti; one shared sample beside the parts): a preview for yourself first, then publish. The editor checks the contrast floor below as you pick and will not save a colour under it.

**Contrast floor.** Text is AA (4.5:1) on every surface in both modes. A tone is at least 4.5:1 with white (light) and 7:1 with near-black (dark). The line colour is a divider, never the only sign of a control.

### Type

Two families (AR-07): **Literata** for titles, **Commissioner** for everything else. Weights 400, 500, 600; 700 only for counts in chips. No 800 or 900, except Archivo Black, the Saule heading font: one black weight, the single exception, and headings never get synthetic bold.

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

Pages and components pick a role, never raw sizes: no `text-sm`, `text-[13px]`, `leading-*`, `tracking-*` or `font-medium/semibold/bold` (`npm run ui:check` lists them). A role carries size, line, tracking and weight; the heading roles use the heading font and the style's heading weight. Inside a role, a name or count that stands out takes `weight-medium` or `weight-strong` (weight only). Primary text (titles, descriptions) is `text-foreground`; `text-foreground-muted` is for meta. Page titles come from `PageHead` (title, optional lead, actions).

Nothing is smaller than 11 px.

### Shape

Pill buttons, chips, tags, avatars and the search field (AR-08). Cards, panels, pop-ups and boxes 16 px. Inputs, menu items and toasts 12 px; an event row's hover 8 px. Group cards carry a thin 1 px border (`border-border`) so they do not blend into the background; panels and pop-ups have none. Thin lines divide rows (the phone group row is a divided row, not a card).

Never a bare `rounded`, `rounded-sm`, `rounded-[…]` or `shadow-sm…2xl` (`ui:check` fails on them, see Colour): corners and depth come from the look. Tokens: `rounded-pill` for pills (full in Mierīgs), the radius scale `rounded-lg … rounded-4xl`, `rounded-menu` and `rounded-item`. Three utilities carry the edge: `line` for the edge of a surface or control (1 px soft border in Mierīgs, 2 px ink in Drosmīgs), `frame` for edges only Drosmīgs draws (0 px in Mierīgs), and dividers stay `border-border` (one-sided rules and `divide-*` never change). Avatars, dots, the switch knob and unread badges stay `rounded-full`.

### Motion and icons

- **Buttons.** A pill button or link is `Button` / `buttonClass` from `components/ui/Button`; a round icon-only control is `IconButton` (`aria-label` required by type; sizes sm 28, md 40, lg 44) or `iconButtonClass` for a Link or menu trigger. Rows, tabs, chips, menu items and cards stay plain. A hand-rolled filled pill fails `ui:check`; a part of a control (clear mark in a chip, toggle in a bar) says `ui-allow: <reason>`.
- **Motion.** Three durations and one ease in `@theme`: `duration-quick` 120 ms (press, hover), `duration-base` 150 ms (the default), `duration-slow` 240 ms (drawers, toasts), `ease-standard`. Never `transition-all` (name the property: `transition-colors`, `-opacity`, `-transform`), raw `duration-N`, `delay-N`, `ease-*` or `animate-in`. Decorative animation (`animate-fade/pop/rise`) sits behind `motion-safe:`; a spinner may stay.
- **Icons.** lucide only, sized by `size-N` (never `size={…}` or an `h-N w-N` pair) and never `strokeWidth`: the look sets `--icon-stroke` once on `.lucide` (style token `iconStroke`: 2 in Mierīgs and Drosmīgs, 1.5 in Gaisīgs). A single emphasised icon may use a `stroke-N` class (check marks `stroke-3`).

### Space and depth

- 4 px grid; spacing steps 2.5 and 3.5 and arbitrary `[Npx]` spacing are not used (0.5 and 1.5 stay for hairline nudges). A control's padding is 12, a card's 20.
- Space tokens: `gutter` (page sides, `px-gutter`, 16 px on a phone to 32 px) and `section` (the gap between page sections, `gap-section`, 32 to 64 px).
- Width tokens: `max-w-browse` 1200 (discovery, frames), `max-w-page` 760 (group and event pages), `max-w-focus` 560 (forms, wizard), `max-w-reading` 66ch (running text: Par mums, custom sections, announcements, event descriptions, rich text). No `max-w-[Npx]`; `calc()` and viewport units are the only arbitrary widths, for sizing against the screen.
- Fewer boxes: a box is for one thing you act on as a unit (a card in a grid, a dialog, the wizard, the next-meeting box). Group page sections sit on the page under their heading, announcements are rows divided by hairlines.
- Gaps: 8 inside a row, 12–16 between items, 24–32 between sections.
- Space inside a card is never more than the space between cards: 20 px inside (padding, 6 px between lines), 20 px visible air between cards in the grid (Drosmīgs adds `--shadow-room` so the hard shadow does not eat it).
- Cards are flat. The float shadow (`shadow-premium`) is only for things above the page: menus, drop-downs, pop-overs, toasts, drawers. Dialogs use `shadow-dialog`. Shadows are the same in dark mode.
- Drosmīgs gives cards and controls a hard offset shadow (`shadow-card`, `shadow-control`); `shadow-room` leaves space inside a clipping parent (chip rows) and `press` sinks a filled button onto its shadow (position change kept under reduced motion, transition dropped).
- Gaisīgs draws no shadow, so everything that floats (menus, pop-ups, panel picture button, preview bar, slide-over) carries `line` or `frame` as its edge.
- Category tiles (card picture, row icon, panel picture) use `cat-tile`; the group banner follows the same tile style (`banner-tone`, share `--banner-mix`): Mierīgs tints the tone (20 % on the surface, tone as glyph), Drosmīgs fills it solid with the on-tone glyph (`--tile-mix`, `--tile-on`; style token `tile`).

## Identity

- **Logo (AR-03).** "Ejam *kopā*" in Literata, the site colour, with two overlapping circles (the second at 45 %). Phones use the smaller size. The favicon is the two circles. The brand is written "Ejam kopā".
- **Small tags (AR-09).** `text-tag` (12 px), a pill, sentence case, never clickable, never in a category tone. A tag with a tick says "Eju"; roles say "Īpašnieks", "Mod", "Biedrs" and "Gaida", each in its own colour: the four role tones belong to the look's palette (`--role-owner|mod|member|pending` with their ink, text on them 4.5:1 in every look and mode), solid for Īpašnieks and Mod, a soft tint for Biedrs and amber for Gaida (still reads as waiting). A plain member has no tag. Quiet facts ("Tikai biedriem") are grey.
- **Category line.** The category with a tone dot, then its sub-categories in quiet text, on one wrapping line.
- **Words and numbers (AR-10).** Sentence case everywhere, table headers included: no capitals, no letter-spacing. Numbers in text are plain digits.
- **Dates (AR-11).** With the weekday: "Svētd., 18. okt." and "Svētd., 18. okt. 17:00", English "Sun, 18 Oct, 17:00". 24-hour time in the viewer's zone. Latvian weekdays are capitalised at the start of a line.
- **Ziņojumu dēlis.** A group is a note on a notice board. Two touches carry it and nothing else: a **sticker** (the main category, tilted -2°, over the photo's bottom edge, its own opaque base) and a **tear-off tab** (the card's bottom: a neutral perforation with scissors at the left, tinted below). No cork, pins, tape, handwriting or paper grain. Hover and the tilt only behind `motion-safe`; in Drosmīgs the perforation is ink, in Gaisīgs thin. See Group card and row.

## Components

One component per job, in `components/ui/`. Pages use these and don't restyle them.

- **Button.** Pill. Primary (filled, one per area), secondary (tint), quiet (ring), danger. Sizes md (44 px on phones, 40 from `md`) and sm (32 px). Always the site colour, never the group's. Round icon-only: `IconButton` (see Motion and icons).
- **Badge and RoleTag.** Badge is the small tag: tone `tag`, `outline` or `muted`. Tone `role` is a solid pill in the look's colour for that role. RoleTag shows Īpašnieks, Mod, Gaida (and a quiet Biedrs on discovery) in those colours, and nothing for a member elsewhere; the colour is fixed once there, so every place it appears has it.
- **FilterChip.** Filters (clickable). Off: surface with a ring. On: site colour tint with a stronger ring.
- **CategoryIcon, CategoryDisc, CategoryLine.** The icon of a main category; the icon on a tinted disc in the tone; the category line.
- **Logo.** Wordmark in two sizes, or the circles only.
- **Form field.** Label above, input, optional help text below; an error replaces the help text, in the danger colour, under the field.
- **Panel.** The opened card and the event panel: from 768 px a centred overlay that grows out of the card or row you clicked and closes back into it (only a short movement, none with reduced motion), a sheet from the bottom below 768 px; the picture with ×, the name, the category line, the facts, the text, one main button and a text link. An opened panel shows at least everything its card shows. It has its own address (the group's or the event's page): Back closes it, a reload or a shared link opens the full page. It opens from any page (discovery, a group's Pasākumi, Manas grupas, Ziņas, profiles); a group's home from inside the same group, an event from its own forms, and the group wizard and admin open the full page. A group you belong to or wait for opens its full page, never the panel.
- **Who is going.** Up to three faces and one name for signed-in viewers ("Ilze un vēl 11 iet"), the number for visitors ("12 iet"); people whose profile is private are counted but never shown.
- **Pop-up.** Overlay is the one shell. Modal (dialog: dim + 1.5 px blur, title + close, body, buttons right; a sheet from the bottom on phones), Sheet, side panels and drawers (dim only). A small confirmation for an undoable step is a pop-over at the button.
- **Group card and row.** The card (grid, from `md`): the photo 5:2 (none: a slim tone band with the category pattern) with the role pill top right and the category **sticker** (a link that filters by the main category) on its bottom edge; the name (2 lines), the sub-categories as links, the tagline (2 lines); then the **tab**, always the same two-row height so a grid row stays even: row one is the note on one line with an ellipsis (running meeting, next meeting, newest announcement, "Ko meklējam?"), row two is up to three faces with the empty seat ("Vieta tev": visitors and non-members; none for members; a clock for Gaida) and `place · members`. The phone row: a 56 px rounded photo or tone tile, the name on one line, the category line, and a mini tab chip (no perforation) with the note; the seat or the role tag on the right. The create card has the same shape and tab height.
- **Announcement card.** Meta line (when, who), bold title, short text.
- **Empty state.** Outline icon, a short title, one italic sentence in the site colour, at most one action.
- **Toast.** One line at the bottom (above the bottom bar on phones), inverted (foreground on background), one at a time, goes by itself (after "Nosūtīt": "Ziņa nosūtīta").
- **Skeleton.** Neutral tint in the shape of the content it stands for.
- **Language editor.** One bar above the fields of owner text: "Valoda" and a pill with the language's own name and "Oriģināls" on the original; the other versions as quiet links ("Citas valodas: English"); "+ Pievienot tulkojumu". The menu lists the versions with their state (ir teksts, tukšs, jālabo) and the actions for the language on screen (make it the original, remove the translation; hidden when they do not apply). Used by the event form, group sections and the create-group wizard.
- **Text counter.** Under the field's right end: quiet "71 / 2000", the warning colour in the last tenth, red "2013 / 2000 · 13 par daudz" past the limit.

- **Shell.** The header (AR-12, AR-13) is the logo, a search field (a click, a tap or the first letter opens the search), "LV ▾" and, signed in, messages, bell and your picture; the shield joins for site admins. Messages and the bell open small lists on a click (the last five, then "Visas ziņas" / "Visi paziņojumi"); on phones the bell opens Paziņojumi. The three menus (profile, shield, language) are one `Menu` component: same look, same keys. Light and dark is the Izskats setting in Iestatījumi, not a header control. On phones the bottom bar has Atklāt, Grupas, +, Ziņas, Es; a group page marks the tab you came from (AR-20). The footer is a slim line on discovery and reading pages only (AR-16). Every header and bar control is at least 40 px.

- **Part tabs.** Links, the site colour under the open one, the page's one action at the right end ("Izveidot pasākumu"); on phones the page's name stands over them.

- **The "…" menu.** The shared Menu anchored to its chip: your role as a quiet first line, then what you can do; rows hidden, never greyed; an undoable step asks in a pop-over at the chip.
- **Switch.** A pill track in the site colour; the label is the row's text.
- **Filter line.** Kur and Tēma as 32 px pills (chosen: dark ring and a small ×; open: site-colour ring), the Veids chips of the chosen Tēma on one line with "+N" for the rest, "Notīrīt visu" from two chosen things and the Grupas | Pasākumi switch at the right end (a full-width line on phones). Lists open under their button, as a bottom sheet on phones. With a search word the word is the first chip (“sp” ×) and a line "Atbilst arī:" under it offers the themes and Veidi the word also matches (a tap chooses it in place of the word). Used on discovery.
- **Search.** The header field opens it: on computers a panel under the header over the dimmed page, on phones the full screen with ← and the field. At its top the Kur button and, once letters are typed, the themes that match the word as choice chips (none before; a theme already chosen, such as the page's category, stays) (one at a time: the chosen one tinted with ×, the others step aside); below, groups as group rows and events as event rows with the word marked in the site colour; with an empty field the recent searches. "Rādīt visus rezultātus" opens discovery with the word as the first chip and "Atbilst arī:" above the list.
- **Highlight.** The matched letters in the site colour, semibold.
- **Group card and row.** The card (from 768 px) shows name, category line, place and members, the group's tagline (the first words of its public home text), the group's note (the next meeting or "Notiek tagad · līdz …", else the newest public announcement, else the tagline; nothing when none) with a short photo band on top (5:2, about half the old height; tag top right and faces bottom right stay on it) or, without a photo, a slim category-coloured strip with the icon, the L1 name and the tag, so the text leads; no hover growth; cards are at least 16rem wide, so three fit where two did; every card in a grid is the same height (name, tagline and note each reserve two lines). The row (phones) is two quiet lines, the tagline and a tone mark. Where the viewer is signed in, discovery tags the groups that are theirs, on the picture's top right (card, an opaque pill that reads on any photo and on the tile) and before the tone mark (row), and the card's picture carries up to three member faces with "+N" bottom right (public profiles only, one batched query per page; visitors get none): Īpašnieks, Mod, a quiet Biedrs for a plain member, and Gaida while a request waits (Manas grupas leaves the member tag out, AR-09, as every group there is yours). Both end with the create card in a chosen category. Used on discovery and the profiles.
- **Event page.** The panel's content in full inside the group frame, one surface 760 px wide: the event's own picture only (16:9, rounded), title, category line, the status words (Pieteikšanās · Pilns · Tikai biedriem), when with "Pievienot kalendāram" (or the tag "Notiek tagad"), where with "Atvērt kartē", "Par pasākumu" and "Praktiskā informācija" as identical sections (a lock line "Redzama tikai dalībniekiem" when only participants see it), who is going, the step and "Dalīties" on one line, and the team's "Rīkotājiem" box at the bottom (counts that open their lists, Labot, Slēgt pieteikšanos, Dzēst).
- **Tabs.** A page's tab row and its line end at the content width (`max-w-page`, the settings tabs `max-w-focus`), not at the column's edge.
- **Breadcrumb.** A group's subpage that belongs to a list names it after the group in the banner: "Vēja zirdžiņš › Visi pasākumi"; pages never put a back link between the banner and the content.
- **Event row.** One row everywhere: the time, the category dot, the name and the city on line one; "Eju" (or outlined "Gaida") under the time, its tick starting where the time's first digit starts; line two the group as a link, the category and sub-categories; last the first words of the description, one line. Thin lines between rows, 8 px hover radius. Rows sit under day headings ("Šodien · pirmd., 12. okt.", "Rīt · …", then the date) on one surface, in two columns when the list is wide. A group's own pages leave line two out. After the city a quiet word for events you cannot simply join: "Pieteikšanās" (the organiser approves) or "Pilns". The row opens the event's panel; no join button on it.
- **Day strip and date picker.** The strip shows seven days, Monday first, the month between ‹ and ›, a dot under days with events, weekends on the tint, the list's first day filled in the site colour; a tap starts the list at that day. The filter line holds Šodien · Šonedēļ · Nedēļas nogalē and the calendar as one pill (one date button where the line is narrow and on phones, opening the same choices above the calendar). The calendar shows one month; a first tap picks a day, a second a range; "Rādīt N" applies it.

Also one each: sub-tabs (underline), avatar, the date and time fields. Icons only from `lucide-react`, 16 or 20 px, always next to a word unless the meaning is universal (close, menu, back).
