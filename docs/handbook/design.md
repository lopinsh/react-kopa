# Design

UI work follows this chapter. A new screen picks one of the page layouts and uses the components below; it does not invent its own. What happens on screen (pop-ups, saving, errors, dates) is in [Behaviour patterns](behaviour.md). The approved drawings close this page ([drawings](#drawings)); the real components are on [UI elements](/admin/handbook/ui-elements).

## Page layouts

Five layouts cover every screen.

| Layout | Name | Used for |
|---|---|---|
| A | Browse | Discovery, Manas grupas. A category column flush at the left edge from 1024 px (folds to a rail), the board filling the rest to the right gutter with no centring, so a wide screen gets more card columns, not empty bands. Column and board share their row lines. |
| B | Group, hub or your own area | A head tile, the pages down the left from 1024 px (a ☰ drawer below; own area from 768 px), the content, and an optional side column on the right. |
| D | Focus | One centred column (`max-w-focus`), no sidebar. Sign-in, register, wizards, onboarding, edit profile. |
| E | Two panes | List + detail; on phones one at a time with a back link. Messages. |
| F | Reading | A text column (`max-w-reading`). About, privacy, public profiles. Admin uses F with tables. |

**Group head (B).** A tile in the category tone (`tone-fill`, text `--on-cat`) with a duotone photo: the group's own picture, else its closest hub's, else the plain tone. The path above the name ("Kopiena un vide › Apkārtnes sakopšana") replaces the category line; its last part links to the closest open hub. The tile keeps the one role button (Sazināties, the pending state, or Labot grupu) and Dalīties. The group's own content starts right under it.

**Side column (B).** Who or what this space is about, never the page's actions: for a group the next meeting, the latest news (Informācija only) and the members; for your own area the profile card. Below 1024 px it follows the page.

**Fluid.** Drawings at 375 and 1280 px show proportions, not widths. Bars (header, footer, bottom bar) span the full width with the brand at the left edge and the tools at the right; content sits in one centred container. Discovery, hubs and admin pages with a sidebar fill to the right edge instead. Fixed widths only for side columns, dialogs and small parts. Every screen is checked at 360, 768, 1024, 1280, 1440 and 1920 px.

**Content starts right under the bars.** The layout owns the top spacing; a page never adds its own top margin, container or card around itself.

**Bars and menus stay in reach.** The header is always sticky, and so is a page's own horizontal menu (the admin menu, a group's menu bar, the filter row), right under it with no gap. A head that scrolls away on a phone leaves a thin context bar (☰ + the page's name).

**Admin.** Sections across the top, the open section's pages in a second row; pages with parts of their own add a sidebar at the left edge (a "Sadaļas" button below 1024 px). Every admin page opens with the same title block, then sits in cards (no shadow, no entrance animation). Lists are card rows on phones and tables from 768 px. Charts: numbers in text, small bars in the site colour only, one scale per chart, no colour per series and no red/green for up or down. Frame details: `docs/development/specs/admin-frame.md`.

## Every screen and its layout

| Step | Screen | Layout |
|---|---|---|
| Find | Discovery: groups and events; Manas grupas | A |
| Find | Group and event panels | centred panel (sheet on phones) |
| Find | Search | header field, panel (full screen on phones) |
| Find | Hub (kopiena) | B, no side column |
| Create | Create group wizard | D |
| Join | Group Informācija | B |
| Join | Contact pop-up, sign-in pop-up | pop-up |
| Join | Sign in, register, onboarding | D |
| Talk | Jaunumi | B |
| Talk | Messages | E |
| Talk | Notifications | header drop-down, page (phones: the page) |
| Group life | Biedri, Pieteikumi, Pasākumi, event page, create / edit event, group settings | B |
| Me | Own profile, Manas grupas, Ziņas, Paziņojumi, Iestatījumi | B |
| Me | Public profile | F |
| Me | Edit profile | D |
| Static | About, privacy, 404 | F |
| Admin | All sections | F + tables |

## Foundations

Few values, used everywhere. The tokens live in `app/globals.css`; the defaults in `lib/constants/theme.ts` (Sūna) are their single source, and the site theme (Admin › Dizains) sets the same names on the server, so the first paint is already right. A new look in `THEME_PRESETS` + `THEME_STYLES` changes every surface.

`npm run ui:check` enforces the token rules below: it fails on colour literals, Tailwind palette colours, `dark:` variants, bare or arbitrary radii and shadows, raw text sizes and weights, off-scale spacing, hand-rolled filled pills and `rounded-full` on anything but a circle. A real exception carries `ui-allow: <reason>`.

### Templates

A template is a palette plus a style, chosen apart in Admin › Dizains; a look (Sūna, Jūra, Rudzu maize, Saule, Gaiss) is a ready-made set of both, with its own 15 category tones. Mierīgs is the default and what this chapter describes.

| | Mierīgs (calm) | Drosmīgs (bold) | Gaisīgs (airy) |
|---|---|---|---|
| Corners | 6–32 px scale | 4–12 px, pills 6 px | 2–4 px, pills stay round |
| Lines | 1 px soft border | 2 px ink | 1 px soft border |
| Shadows | none on cards, soft float above the page | hard offset, no blur | none; the edge is the line |
| Press | scale | sinks onto its shadow | scale |
| Headings | 600 | 700 | 600 |
| Category tiles | tint | solid | solid |

The Dizains editor is an experiment tool, owner only: it may go outside the limits of this chapter. The defaults follow it.

### Colour

Neutrals carry the page. Colour means something: the **site colour** (`--primary`) is for buttons, links, active tabs, toggles, checkboxes, focus rings and selected chips; a **category tone** (`--accent`, from `--cat-<slug>`) marks a category; three **status colours** (`--danger`, `--success`, `--warning`) say what they say. No other colours.

Tokens: `--background`, `--surface`, `--tint` (quiet fill, hover, weekends), `--border`, `--foreground`, `--foreground-muted`, `--primary` / `--primary-foreground`, `--accent` / `--on-cat`, the status colours with their `-foreground`, `--scrim`, `--photo-chip` / `--photo-ink`, the four role tones `--role-owner|mod|member|pending` with their inks. Filled colours carry their own text colour, never `text-white`.

**A category tone appears only** on dots, category icons, soft tints (up to 15 %; the no-photo band on a group card goes higher), the group head tile and the picture fallback. The page's `--accent` is set server-side in the layout (Taxonomy Law).

**Three exceptions.** The viewer's status on group cards and rows is one bright green with dark ink (`--role-live`) whatever the role. The group card's Sazināties takes the group's Tēma colour. The head tile's button is a light pill (`Button` `onTone`), because the site colour on a tone fails contrast.

**Contrast floor.** Text is AA (4.5:1) on every surface in both modes. A tone is at least 4.5:1 with white (light) and 7:1 with near-black (dark). The editor will not save a colour under the floor. A line is a divider, never the only sign of a control.

### Type

Two families: **Literata** for headings, **Commissioner** for everything else. Weights 400, 500, 600; 700 only for counts in chips. No synthetic bold; the one black weight is Archivo Black, the Saule heading font. Nothing is smaller than 11 px.

| Role (utility) | Font | Size / line / weight | Example |
|---|---|---|---|
| `text-display` | Heading | 32–52 fluid / 1.05 / heading | Hero lines |
| `text-title` | Heading | 26–36 fluid / 1.1 / heading | Pasākumi |
| `text-section` | Heading | 20–24 fluid / 1.2 / heading | Par mums |
| `text-item` | Heading | 17–19 fluid / 1.3 / heading | Ķemeru purva taka |
| `text-body` | Body | 16 / 1.6 / 400 | Satiekamies pie stacijas. |
| `text-body-sm` | Body | 15 / 1.5 / 400 | Descriptions in dense lists |
| `text-button` (`-sm`) | Body | 15 (14) / 1.2 / 500 | Pievienoties |
| `text-meta` | Body | 13 / 1.45 / 400 | Sestdien 10:00 · Ķemeri |
| `text-tag` | Body | 12 / 1.2 / 600 | Eju |
| `human-note` | Body italic | 14 / 400, site colour | Nākamā tikšanās: sestd., 17. okt. |

Pages pick a role, never raw sizes, leading, tracking or font weights. Inside a role, a name or count that stands out takes `weight-medium` or `weight-strong` (weight only; the steps are a theme setting). Titles and descriptions are `text-foreground`; `text-foreground-muted` is for meta. Page titles come from `PageHead`.

### Shape

- Pills: buttons, chips, tags, avatars, the search field (`rounded-pill`). Cards, panels, pop-ups and boxes 16 px; inputs, menu items and toasts 12 px. Corners come from the look's scale (`rounded-lg … rounded-4xl`, `rounded-menu`, `rounded-item`).
- Edges: `line` for the edge of a surface or control, `frame` for edges only Drosmīgs draws; dividers stay `border-border`. Group cards carry a line so they don't blend into the background.
- Circles (avatars, dots, the switch knob, unread badges) stay `rounded-full`.

### Motion and icons

- Three durations and one ease: `duration-quick` (press, hover), `duration-base`, `duration-slow` (drawers, toasts), `ease-standard`. Never `transition-all`; name the property.
- Decorative animation sits behind `motion-safe:`. Hover and focus feedback is never movement alone: a colour, edge or label change carries it.
- Icons: `lucide-react` only, sized by `size-N`, stroke set once by the look. Always next to a word unless the meaning is universal (close, menu, back).

### Space and depth

- A 4 px grid. Space tokens: `px-gutter` for page sides, `gap-section` between page sections. Widths: `max-w-browse` (frames and grids), `max-w-page` (group and event pages), `max-w-focus` (forms, wizard), `max-w-reading` (running text). No `max-w-[Npx]`.
- Gaps: 8 inside a row, 12–16 between items, 24–32 between sections. Space inside a card is never more than the space between cards.
- **Fewer boxes.** A box is for one thing you act on as a unit: a card in a grid, a dialog, the wizard, the next-meeting box. Page sections sit on the page under their heading; lists are rows divided by hairlines.
- Cards are flat. The float shadow is only for things above the page (menus, pop-overs, toasts, drawers); dialogs use `shadow-dialog`. In Gaisīgs, which draws no shadow, everything that floats carries `line` or `frame`.

## Identity

- **Logo.** "Ejam *kopā*" in Literata, the site colour, with two overlapping circles (the second at 45 %). The favicon is the two circles.
- **Small tags.** `text-tag`, a pill, sentence case, never clickable, never in a category tone. Roles: Īpašnieks and Mod solid, Biedrs a soft tint, Gaida amber, each in the look's role colour; a plain member has no tag. Quiet facts ("Tikai biedriem") are grey.
- **Category line.** The category with a tone dot, then its sub-categories in quiet text, on one wrapping line.
- **Ziņojumu dēlis.** A group is a note on a notice board. Two touches carry it and nothing else: a **sticker** (the main category, tilted, over the photo's bottom edge) and a **tear-off tab** (the card's bottom, with a perforation and scissors). No cork, pins, tape, handwriting or paper grain.

## Components

One component per job, in `components/ui/`. Pages use them and don't restyle them. Hub parts (hub card, Ziņa row, Čats) are in [Kopienas](hubs.md).

- **Button.** Pill: primary (filled, one per area), secondary, quiet, danger, `onTone` (head tile only). The site colour, except the exceptions in Colour. Round icon-only controls are `IconButton` with a required `aria-label`. Rows, tabs, chips, menu items and cards stay plain. Every control in a bar is at least 40 px, 44 on phones.
- **Badge and RoleTag.** The small tag; RoleTag fixes each role's colour once, so every place shows the same.
- **FilterChip.** Off: surface with a ring. On: a soft tint with ×.
- **Form field.** Label above, input, optional help below; an error replaces the help. Text controls are `Input`, `Select`, `Textarea`.
- **Text counter** and **Language editor.** One each, used by every field that needs them (see Behaviour).
- **Pop-up family.** One overlay shell: Modal (title, close, body, buttons right), Sheet, side panels, the panel, and the Gallery (one dialog for every picture set, arrows and keys, "n / N", the credit, focus back to the tile).
- **Admin tool panel.** One box opened from the shield, with Atsauksmes, Tulkot, Dizains and, on group pages, Grupa (status, hide with a reason, reports; deleting stays in Admin › Moderācija).
- **Toast**, **Skeleton**, **Empty state**, **Switch**, sub-tabs, avatar, date and time fields: one each.
- **Shell.** The header: the logo (the way to Atklāt), the search field (a click or the first letter opens search), Manas grupas, language, and signed in messages, bell and your picture; the shield for site admins. Profile, shield and language are one `Menu`. Light and dark is a setting in Iestatījumi, not a header control. Phones have a bottom bar: Atklāt, Grupas, +, Ziņas, Es. The footer is a slim line on discovery and reading pages only.
- **Tabs and active marker.** A page's tab row ends at the content width; the current tab is strong text with a site-colour underline, the others muted. The page's one action sits at the right end.
- **Breadcrumb.** A group subpage that belongs to a list names it after the group in the head tile ("Vēja zirdžiņš › Visi pasākumi"); never a back link between the tile and the content.
- **Group's actions.** Under the pages in the left menu (the drawer on phones): Dalīties, "Tava dalība" (role, write to the team, withdraw, leave) and Ziņot par grupu as a quiet link last. No "…" in the head.
- **Group card and row.** The card (from 768 px): photo with the viewer's status top right and the category sticker on its bottom edge (no photo: a slim tone band); name, sub-categories and tagline, each reserving two lines so a grid row stays even; then the tear-off tab with the group's note (running or next meeting, newest public announcement, or "Ko meklējam?") and up to three faces with an empty seat ("Vieta tev") and place · members. Faces are public profiles only; visitors see none. The phone row: a small photo or tone tile, the name, the category line and the note as a chip. Manas grupas leaves out the member tag, since every group there is yours. In a chosen category the list ends with the create card. Cards are at least 16 rem wide, flat, with no hover growth.
- **Board heading and filter row.** The title is the switch "Grupas | Pasākumi" with a count that follows the filters. Under it one row of chips, one family for every filter: Kur first, the chosen Tēma, dates, the Veidi of the chosen Tēma, the search word, and "Notīrīt visu" from two chosen things. Chosen chips are tinted with ×: the topic tone for Tēma and Veidi, the site colour for the rest. A search word offers "Atbilst arī:" for the themes and Veidi it also matches.
- **Category column (Tēmas).** An index, never louder than one card: a quiet search that also finds Veidi, "Visas", then the fifteen categories, each icon in its tone always. Only the selected row is emphasised; an empty category shows "0", never faded. Below 1024 px the same list is the Tēma drop-down.
- **Search.** The header field opens a panel under the header (full screen on phones): Kur, the themes matching the word, then group rows and event rows with the word marked, recent searches when empty. "Rādīt visus rezultātus" opens discovery with the word as a chip.
- **Event row.** One row everywhere: time, category dot, name and city; "Eju" or "Gaida" under the time; the group and categories (left out on a group's own pages); the first words of the description. A quiet "Pieteikšanās" or "Pilns" after the city when you can't simply join. Rows sit under day headings ("Šodien · pirmd., 12. okt."). The row opens the event's panel; no join button on it.
- **Day strip and date picker.** Seven days, Monday first, a dot under days with events, weekends on the tint. Šodien · Šonedēļ · Nedēļas nogalē and the calendar as one control; the calendar picks a day or a range.
- **Event page.** The panel's content in full inside the group frame: picture, title, category line, status words, when (Pievienot kalendāram), where (Atvērt kartē), Par pasākumu and Praktiskā informācija as equal sections, who is going, the step and Dalīties, and the team's "Rīkotājiem" box at the bottom.
- **Banner picker.** One field everywhere a picture is chosen: a preview, then a dialog with "no image", the category's curated photos and an Unsplash search. A raw image address is for site admins only. The credit ("Foto: name, Unsplash") sits under every big picture, never on cards.
- **Section pictures.** Up to 8 per section, a row of tiles under its text ("+N" on the last), opening the gallery. No captions.
