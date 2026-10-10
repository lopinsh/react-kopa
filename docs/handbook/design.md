# Design

> **Draft:** the coherent look is being designed with the user (2026-10-10). The structure below (layouts, screen map, foundations, components) is the current proposal; the visual direction may change.

UI work follows this chapter. A new screen picks one of the page layouts and uses the components below; it does not invent its own.

## Page layouts

Six layouts cover every screen. A new screen picks one of them; it doesn't invent a seventh.

| Layout | Name | Used for |
|---|---|---|
| A | Browse | Category rail + filters + grid or list. Discovery, my groups. |
| B | Group home | Full banner header + group sidebar. Only the Information page. |
| C | Group page | Slim bar + page title + sub-tabs + content. Every other group page. |
| D | Focus | One centred column, max 560 px, no sidebar. Sign-in, register, wizards, onboarding. |
| E | Two panes | List + detail; on mobile one at a time with a back link. Messages. |
| F | Reading | Text column, max 680 px. About, privacy, profiles. Admin uses F with tables. |

### C · Group page, the frame every group page shares

Slim bar → page title (with the page's one action on the right) → sub-tabs if any → content at one width (max 760 px). Same positions on Events, Members, Announcements and Settings.

On desktop the group sidebar sits to the left (Informācija, Pasākumi, Jaunumi, Biedri). On phones the slim bar is compact (photo, name, category · city · members, the "…" menu) and the bottom navigation (Atklāt, Grupas, +, Ziņas, Es) replaces the sidebar.

Rule: only a group's Information page has the full banner header. Every other group page uses the slim bar, so the group's own content starts near the top. The slim bar always carries the at-a-glance signals (photo, name, category, city, members) and the same Join / Contact button as the full header, so a visitor who lands on an event page still knows whose event it is and can join.

## Every screen and its layout

The screen list from the screen review (see the screen map in `docs/execution_handoff.md`), with the layout each screen should use. "Change" marks screens that don't follow it yet.

| Step | Screen | Layout | Today |
|---|---|---|---|
| Find | Discovery: groups and events | A | follows |
| Find | My groups | A | change: own layout today |
| Create | Create group wizard | D | follows |
| Join | Group Information | B | follows |
| Join | Join / Contact pop-up, sign-in pop-up | pop-up | follows (2.4b) |
| Join | Sign in, register, onboarding | D | follows |
| Talk | Announcements | C | change: 2.4d + 2.22 |
| Talk | Messages | E | follows (2.4b) |
| Talk | Notifications | panel | follows |
| Group life | Members, Requests | C | change: full header today |
| Group life | Events tab | C | change: no page title |
| Group life | Event page | C | change: own hero (3.3) |
| Group life | Create / edit event | C | change: picker (2.22) |
| Group life | Group settings (Group · Sections · Owner) | C | change: 3 tabs (2.22) |
| Me | Own and public profile | F | change: header seam (2.14i) |
| Me | Edit profile | D | check |
| Static | About, privacy, 404 | F | follows |
| Admin | Dashboard, reports, taxonomy, moderation, handbook | F + tables | check |

## Foundations

Few values, used everywhere. Today the code has 11 corner roundings, 6 heading sizes and 4 font weights; this cuts them to the set below.

### Colour

Neutrals carry the page. Colour means something: **category colour** inside a group, **indigo** for the site's own actions, and three status colours. No other colours, no hardcoded `red-500`.

| Role | Token |
|---|---|
| Background | `--background` |
| Surface | `--surface` |
| Text | `--foreground` |
| Quiet text | `--foreground-muted` |
| Site action (indigo) | `--primary` |
| Group (L1 category colour) | `--accent` |
| Danger | `--danger` (new) |
| Success | `--success` (new) |
| Warning | `--warning` (new) |

### Type

Geist, three weights (400, 600, 700). No black weight.

| Role | Size / weight | Example |
|---|---|---|
| Page title | 24 / 700 | Pasākumi |
| Section | 18 / 600 | Par mums |
| Item title | 15 / 600 | Ķemeru purva taka |
| Body | 15 / 400 | Satiekamies pie stacijas, ejam apmēram 12 km. |
| Small | 13 / 400 | Sestdien 10:00 · Ķemeri · 6 piedalās |
| Label | 11 / 600 caps | Only for table headers |

### Shape

Three roundings: 8 px for buttons and fields, 16 px for cards and pop-ups, round for chips and avatars.

### Space and depth

- 4 px grid. Page sides 16 px (phone), 24–32 px (desktop).
- Content widths: 760 group pages, 680 reading, 560 focus, 1200 browse.
- Gaps: 8 inside a row, 12–16 between items, 24–32 between sections.
- Shadows: soft card shadow on cards; the stronger float shadow only on things above the page (menus, pop-ups, header). None in dark mode.

## Components

One component per job, in `components/ui/`. Pages use these and don't restyle them.

- **Button.** Primary is filled, one per area. Inside a group it takes the group colour; elsewhere indigo. Variants: primary, site primary, secondary, plain, danger (text), working (disabled, "Sūta…"). A filled red button appears only inside the delete dialog.
- **Chips and badges.** Chips filter (clickable). Badges label (not clickable). Examples: chips "Visas", "Personīgās", "Grupu"; badges "Pārgājieni" (category), "Tikai biedriem", "Pieteikšanās", "Pilns".
- **Form field.** Label above, input, optional help text below; an error replaces the help text, in red, under the field.
- **Pop-up.** One shell: title + close, body, buttons right. On phones it opens as a sheet from the bottom. Example: "Dzēst jaunumu?" with Atcelt and Dzēst.
- **Announcement card.** Meta line (when, who), bold title, short text.
- **Empty state.** Outline icon, one sentence, at most one action. Example: "Vēl nav ziņu".

The real components, as they look today, with their `data-ui` names and file paths, are shown on the admin page `/admin/handbook/ui-elements` (the last entry in the Handbook's chapter list).

Also one each: sub-tabs (underline), the "…" menu, toast, skeleton, avatar, the slim bar, the date and time fields. Icons only from `lucide-react`, 16 or 20 px, always next to a word unless the meaning is universal (close, menu, back).

## Undecided

1. **Primary button colour inside a group.** Draft: the group's category colour. Alternative: always indigo, category colour only for signals. Some category colours (yellow, light green) need dark text on them.
2. **Capital-letter labels.** Draft: almost none (today 97 places). Only table headers and tiny labels. Sub-tabs become normal case ("Gaidāmie", not "GAIDĀMIE").
3. **Where the components live.** Draft: the rules are here and in `AGENTS.md`; the components become code in `components/ui/` with an admin-only preview page (3.0).
