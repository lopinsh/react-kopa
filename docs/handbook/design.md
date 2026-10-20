# Design

UI work follows this chapter. A new screen picks one of the page layouts and uses the components below; it does not invent its own. The drawings are on the [redesign page](/admin/development/redesign); a rule id like `AR-06` points to its entry there. The real components are on [UI elements](/admin/handbook/ui-elements).

## Page layouts

Five layouts cover every screen. A new screen picks one of them.

| Layout | Name | Used for |
|---|---|---|
| A | Browse | Category drawer + filter line + grid or list. Discovery, Manas grupas. On discovery the category drawer (a 232 px column from 1024 px, folds to a rail), the filter line (Kur, Tēma, the Veids chips, the Grupas | Pasākumi switch) and group cards from 768 px (rows on phones) fill the frame. |
| B | Group page or your own area | A head (a banner for a group, your picture and name for you) and the pages down the left (a ☰ drawer on phones). A group's banner is 96 px: always the category tint and mark, never a picture (C5); the group's picture is a 16:9 picture at the top of Informācija only (a category tile when it has none); on phones a 64 px bar with ☰ for the pages. Group pages from R3a (AR-47, AR-48), your own area from R2a (AR-21, AR-60). |
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

**Colour means category (AR-06).** A category tone appears only on dots, category icons, soft tints (up to 15 %), the group banner and the picture fallback. Every button, link, active tab, toggle, checkbox, focus ring and selected chip uses the site colour. Filled colours carry their own text colour (`text-primary-foreground`, `--on-cat`), never `text-white`, because the dark site colour is light.

**The 15 category tones (AR-05)** each have a light and a dark value; they are listed with names on the [redesign page](/admin/development/redesign#h-id) and shown on UI elements. Category tones are part of the site theme, per mode. Site admins change the site colours, the tones and the fonts in Admin → Dizains (Krāsas, Kategoriju krāsas, Fonti): a preview for yourself first, then publish. The editor checks the contrast floor below as you pick and will not save a colour under it.

**Contrast floor.** Text is AA (4.5:1) on every surface in both modes. A tone is at least 4.5:1 with white (light) and 7:1 with near-black (dark). The line colour is a divider, never the only sign of a control.

### Type

Two families (AR-07): **Literata** for titles, **Commissioner** for everything else. Weights 400, 500, 600; 700 only for counts in chips. No 800 or 900.

| Role | Font | Size / weight | Example |
|---|---|---|---|
| Page title | Literata | 28 / 600 | Pasākumi |
| Section | Literata | 21 / 600 | Par mums |
| Item title | Literata | 15–17 / 600 | Ķemeru purva taka |
| Body | Commissioner | 15–16 / 400, line 1.6 | Satiekamies pie stacijas. |
| Button | Commissioner | 15 / 500 (small 14) | Pievienoties |
| Small, meta | Commissioner | 13 / 400–500 | Sestdien 10:00 · Ķemeri |
| Tag | Commissioner | 11 / 600 | Eju |
| Human note | Commissioner italic | 14 / 400, site colour | Nākamā tikšanās: sestd., 17. okt. |

Nothing is smaller than 11 px.

### Shape

Pill buttons, chips, tags, avatars and the search field (AR-08). Cards, panels, pop-ups and boxes 16 px. Inputs, menu items and toasts 12 px; an event row's hover 8 px. Group cards carry a thin 1 px border (`border-border`) so they do not blend into the background; panels and pop-ups have none. Thin lines divide rows (the phone group row is a divided row, not a card).

### Space and depth

- 4 px grid. Page sides 16 px (phone), 24–32 px (desktop).
- Content widths: 760 group pages, 680 reading, 560 focus, 1200 browse.
- Gaps: 8 inside a row, 12–16 between items, 24–32 between sections.
- Cards are flat. The float shadow (`shadow-premium`) is only for things above the page: menus, drop-downs, pop-overs, toasts, drawers. Dialogs use `shadow-dialog`. Shadows are the same in dark mode.

## Identity

- **Logo (AR-03).** "Ejam *kopā*" in Literata, the site colour, with two overlapping circles (the second at 45 %). Phones use the smaller size. The favicon is the two circles. The brand is written "Ejam kopā".
- **Small tags (AR-09).** 11 px, a pill, sentence case, never clickable, never in a category tone. A tag with a tick says "Eju"; roles say "Īpašnieks", "Mod" and, outlined, "Gaida". A plain member has no tag. Quiet facts ("Tikai biedriem") are grey.
- **Category line.** The category with a tone dot, then its sub-categories in quiet text, on one wrapping line.
- **Words and numbers (AR-10).** Sentence case everywhere, table headers included: no capitals, no letter-spacing. Numbers in text are plain digits.
- **Dates (AR-11).** With the weekday: "Svētd., 18. okt." and "Svētd., 18. okt. 17:00", English "Sun, 18 Oct, 17:00". 24-hour time in the viewer's zone. Latvian weekdays are capitalised at the start of a line.

## Components

One component per job, in `components/ui/`. Pages use these and don't restyle them.

- **Button.** Pill. Primary (filled, one per area), secondary (tint), quiet (ring), danger. Sizes md (44 px on phones, 40 from `md`) and sm (32 px). Always the site colour, never the group's.
- **Badge and RoleTag.** Badge is the small tag: tone `tag`, `outline` or `muted`. RoleTag shows Īpašnieks, Mod or Gaida and nothing for a member.
- **FilterChip.** Filters (clickable). Off: surface with a ring. On: site colour tint with a stronger ring.
- **CategoryIcon, CategoryDisc, CategoryLine.** The icon of a main category; the icon on a tinted disc in the tone; the category line.
- **Logo.** Wordmark in two sizes, or the circles only.
- **Form field.** Label above, input, optional help text below; an error replaces the help text, in the danger colour, under the field.
- **Panel.** The opened card and the event panel: from 768 px a centred overlay that grows out of the card or row you clicked and closes back into it (only a short movement, none with reduced motion), a sheet from the bottom below 768 px; the picture with ×, the name, the category line, the facts, the text, one main button and a text link. An opened panel shows at least everything its card shows. It has its own address (the group's or the event's page): Back closes it, a reload or a shared link opens the full page. It opens from any page (discovery, a group's Pasākumi, Manas grupas, Ziņas, profiles); a group's home from inside the same group, an event from its own forms, and the group wizard and admin open the full page. A group you belong to or wait for opens its full page, never the panel.
- **Who is going.** Up to three faces and one name for signed-in viewers ("Ilze un vēl 11 iet"), the number for visitors ("12 iet"); people whose profile is private are counted but never shown.
- **Pop-up.** Overlay is the one shell. Modal (dialog: dim + 1.5 px blur, title + close, body, buttons right; a sheet from the bottom on phones), Sheet, side panels and drawers (dim only). A small confirmation for an undoable step is a pop-over at the button.
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
- **Group card and row.** The card (from 768 px) shows name, category line, place and members, the group's tagline (the first words of its public home text), the group's note (the next meeting or "Notiek tagad · līdz …", else the newest public announcement, else the tagline; nothing when none) and the photo or the tone and icon at the right; every card in a grid is the same height (name, tagline and note each reserve two lines). The row (phones) is two quiet lines, the tagline and a tone mark. Both end with the create card in a chosen category. Used on discovery and the profiles.
- **Event page.** The panel's content in full inside the group frame, one surface 760 px wide: the event's own picture only (16:9, rounded), title, category line, the status words (Pieteikšanās · Pilns · Tikai biedriem), when with "Pievienot kalendāram" (or the tag "Notiek tagad"), where with "Atvērt kartē", "Par pasākumu" and "Praktiskā informācija" as identical sections (a lock line "Redzama tikai dalībniekiem" when only participants see it), who is going, the step and "Dalīties" on one line, and the team's "Rīkotājiem" box at the bottom (counts that open their lists, Labot, Slēgt pieteikšanos, Dzēst).
- **Breadcrumb.** A group's subpage that belongs to a list names it after the group in the banner: "Vēja zirdžiņš › Visi pasākumi"; pages never put a back link between the banner and the content.
- **Event row.** One row everywhere: the time, the category dot, the name and the city on line one; "Eju" (or outlined "Gaida") under the time, its tick starting where the time's first digit starts; line two the group as a link, the category and sub-categories; last the first words of the description, one line. Thin lines between rows, 8 px hover radius. Rows sit under day headings ("Šodien · pirmd., 12. okt.", "Rīt · …", then the date) on one surface, in two columns when the list is wide. A group's own pages leave line two out. After the city a quiet word for events you cannot simply join: "Pieteikšanās" (the organiser approves) or "Pilns". The row opens the event's panel; no join button on it.
- **Day strip and date picker.** The strip shows seven days, Monday first, the month between ‹ and ›, a dot under days with events, weekends on the tint, the list's first day filled in the site colour; a tap starts the list at that day. The filter line holds Šodien · Šonedēļ · Nedēļas nogalē and the calendar as one pill (one date button where the line is narrow and on phones, opening the same choices above the calendar). The calendar shows one month; a first tap picks a day, a second a range; "Rādīt N" applies it.

Also one each: sub-tabs (underline), avatar, the date and time fields. Icons only from `lucide-react`, 16 or 20 px, always next to a word unless the meaning is universal (close, menu, back).
