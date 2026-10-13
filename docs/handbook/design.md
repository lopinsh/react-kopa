# Design

UI work follows this chapter. A new screen picks one of the page layouts and uses the components below; it does not invent its own. The drawings are on the [redesign page](/admin/development/redesign); a rule id like `AR-06` points to its entry there. The real components are on [UI elements](/admin/handbook/ui-elements).

## Page layouts

Five layouts cover every screen. A new screen picks one of them.

| Layout | Name | Used for |
|---|---|---|
| A | Browse | Category drawer + filter line + grid or list. Discovery, Manas grupas. A notes the filter line and category drawer (R5a). |
| B | Group page or your own area | A head (a banner for a group, your picture and name for you) and the pages down the left (a ☰ drawer on phones). Group pages from R3a (AR-47, AR-48), your own area from R2a (AR-21, AR-60). |
| D | Focus | One centred column, max 560 px, no sidebar. Sign-in, register, wizards, onboarding. |
| E | Two panes | List + detail; on mobile one at a time with a back link. Messages. |
| F | Reading | Text column, max 680 px. About, privacy, profiles. Admin uses F with tables. |

Rule: the group's own content starts near the top. The banner carries the at-a-glance signals (name, category, city, members) and the same Join / Contact button on every group page.

## Every screen and its layout

"Today" names the release of the build plan (`docs/development/build-plan.md`) that brings the screen to its drawing; until then it keeps its old layout with the new colours, fonts and tags.

| Step | Screen | Layout | Today |
|---|---|---|---|
| Find | Discovery: groups and events | A | R5a, R5b |
| Find | Manas grupas | A | R8 |
| Create | Create group wizard | D | R4, R12 |
| Join | Group Informācija | B | R3a |
| Join | Join / Contact pop-up, sign-in pop-up | pop-up | R3b |
| Join | Sign in, register, onboarding | D | R12 |
| Talk | Jaunumi | B | R9b |
| Talk | Messages | E | R8 |
| Talk | Notifications | panel | R8 |
| Group life | Biedri, Requests | B | R9b |
| Group life | Pasākumi tab | B | R3a, R5b |
| Group life | Event page | B | R9a |
| Group life | Create / edit event | B | R4, R9a |
| Group life | Group settings | B | R4, R9b |
| Me | Own profile, Manas grupas, Ziņas, Iestatījumi | B (frame) | R2a frame; content R8, R9b |
| Me | Public profile | F | R9b |
| Me | Edit profile | D | R9b |
| Static | About, privacy, 404 | F | R12 |
| Admin | Dashboard, reports, taxonomy, moderation, handbook | F + tables | R11 |

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

Pill buttons, chips, tags, avatars and the search field (AR-08). Cards, panels, pop-ups and boxes 16 px. Inputs, menu items and toasts 12 px; an event row's hover 8 px. Cards have no border: a surface on the background. Thin lines divide rows.

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
- **Pop-up.** Overlay is the one shell. Modal (dialog: dim + 1.5 px blur, title + close, body, buttons right; a sheet from the bottom on phones), Sheet, side panels and drawers (dim only). A small confirmation for an undoable step is a pop-over at the button.
- **Announcement card.** Meta line (when, who), bold title, short text.
- **Empty state.** Outline icon, a short title, one italic sentence in the site colour, at most one action.
- **Toast.** One line at the bottom (above the bottom bar on phones), inverted (foreground on background), one at a time, goes by itself.
- **Skeleton.** Neutral tint in the shape of the content it stands for.
- **Text counter.** Under the field's right end: quiet "71 / 2000", the warning colour in the last tenth, red "2013 / 2000 · 13 par daudz" past the limit.

- **Shell.** The header (AR-12, AR-13) is the logo, a plain search field (R7 makes it the search), "LV ▾" and, signed in, messages, bell and your picture; the shield joins for site admins. The three menus (profile, shield, language) are one `Menu` component: same look, same keys. Light and dark is the Izskats setting in Iestatījumi, not a header control. On phones the bottom bar has Atklāt, Grupas, +, Ziņas, Es; a group page marks the tab you came from (AR-20). The footer is a slim line on discovery and reading pages only (AR-16). Every header and bar control is at least 40 px.

Also one each: sub-tabs (underline), the "…" menu, avatar, the date and time fields. Icons only from `lucide-react`, 16 or 20 px, always next to a word unless the meaning is universal (close, menu, back).
