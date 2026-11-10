# Admin frame spec · Two sticky rows and a page sidebar (AF)

> Owner approved 10 Nov 2026. Ledger first: every decision is a row with an id (AF-01…), status **Confirmed** (owner decided), **In progress** (my default, the owner hasn't answered) or **Changed** (replaced; the row names what replaced it). Briefs, commits and reviews cite the ids.
>
> Two build sessions: **AF-1** (the frame: rows, sidebar, Handbook and Design) and **AF-2** (Būvplāns: the drawing's sections, fluid frames, no guessed heights). Each is about 40 tool calls. AF-2 needs AF-1 merged.

Read with: `docs/handbook/design.md` → Page layouts (Fluid, Bars and menus stay in reach, Admin pages are cards), Space and depth; AGENTS.md "UI & styling"; rule [AR-68](../redesign.html#AR-68) (admin frame) and [AR-21](../redesign.html#AR-21) (navigation). Where this spec and AR-68 disagree, this spec wins (AR-68 is history).

## Feature ledger

### Frame
| Id | Feature | Status | Notes |
|---|---|---|---|
| AF-01 | **Two sticky rows at the top.** Row 1 = the sections (`AdminSections`, look unchanged). Row 2 = the open section's pages, a horizontal tab row under it, hidden when the section has one page (Komanda). Both stick under the header with no gap (design.md, Bars and menus stay in reach). | Confirmed | 10 Nov. |
| AF-02 | **The left pages column is removed everywhere** (`AdminFrame` `lg:grid-cols-[14rem_…]`, `AdminPagesNav variant="side"`). | Confirmed | 10 Nov. |
| AF-03 | **The phone drawer stays as is** (`AdminDrawer` + `AdminPagesNav variant="drawer"` with parts indented). Row 2 shows from `lg`, where the drawer bar hides (`lg:hidden`); between `sm` and `lg` it is row 1 + the drawer bar, as today. | Confirmed | 10 Nov (drawer); the `lg` breakpoint is my default, matching the drawer. |
| AF-04 | Row 2 sits in the same `container mx-auto px-4` as row 1 so the tabs start on the same line; each tab = icon + label + badge (the counts the side column showed), current tab underlined like row 1. Parts (Design parts, Handbook chapters) are **not** in row 2; they move to the page sidebar (AF-12). | In progress | Default. |
| AF-05 | **Measured, not guessed.** Both rows sit in one sticky wrapper; `AdminFrame` measures it with a `ResizeObserver` and sets `--admin-bars` on the frame root (a CSS variable set at layout level, allowed by AGENTS.md). Everything that has to clear the rows (sidebar `top`, heading `scroll-mt`) reads `var(--admin-bars)`. No `calc(100dvh-…rem)` anywhere in admin. | In progress | Default. |
| AF-06 | Pages without a sidebar keep today's centred `container` and `py-6` (all moderation, structure, translations, team, feedback pages). | In progress | Default; only the column goes. |

### Page sidebar
| Id | Feature | Status | Notes |
|---|---|---|---|
| AF-10 | **Pages with sections get a sticky left sidebar at the window's left edge**, content filling the rest to the right edge (no centred container, like discovery in R20). Width `w-aside` (17.5 rem, inside design.md's 260–280 px side-column allowance), `border-r border-border`, `bg-background`. Content column `min-w-0 flex-1 px-gutter`. | Confirmed | 10 Nov (sidebar, edge, fill); width token is my default. |
| AF-11 | The sidebar lists the page's own sections: label, status chip (Apstiprināts / Procesā / Atvērts), version and date. Click = jump; the current one is marked (`aria-current="location"`, `bg-tint weight-strong`). | Confirmed | 10 Nov. |
| AF-12 | **Tabs sit at the top of the sidebar**, sections under a hairline. Būvplāns: Plāns + one tab per drawing (Mezgli/hub). Handbook: the chapters + UI elementi (from `useAdminParts`). Design: its parts (with the flagged dot), no sections. | Confirmed (10 Nov: Būvplāns; Handbook and Design the same, owner question 2) | The column is gone, so chapters and parts need a home; this is the one pattern for all three. |
| AF-13 | Spec tab and Handbook chapters: sections = the H2 headings, **no status, no version, no date**. | Confirmed | 10 Nov (spec tab); Handbook follows. |
| AF-14 | **Below `lg` the sidebar folds** to a "Sadaļas ▾" button above the content (quiet small button, `ChevronDown`, `aria-expanded`). It opens an in-flow panel (not a floating menu) with the same tabs and sections; choosing one closes it. Hidden when there is nothing to list. | Confirmed | 10 Nov (fold); in-flow panel is my default. |
| AF-15 | Handbook's right "On this page" column (`HandbookShell` `xl:grid-cols-[…_14rem]`) is removed; its headings move into the left sidebar (AF-13). | Confirmed | 10 Nov, owner question 2: one place for a page's sections. |
| AF-16 | Which pages have a sidebar is a field on the nav item, `frame?: 'sidebar' \| 'fill'` in `lib/constants/adminNav.ts`: `buildPlan: 'fill'`, `handbook: 'sidebar'`, `design: 'sidebar'`. `AdminFrame` reads it from `location.item` and drops the container for both. | In progress | Default (Constants Law). |

### Būvplāns
| Id | Feature | Status | Notes |
|---|---|---|---|
| AF-20 | **No guessed heights; the drawing fills the space under the sticky rows.** `fill` pages: the frame root is `flex h-full flex-col` inside `<main>` (a definite-height flex item of the shell scroller), the body below the rows is `flex min-h-0 flex-1`, the iframe `min-h-0 flex-1`. The outer scroller does not scroll; the iframe and the spec pane scroll inside. The slim footer stays visible below. | Confirmed | 10 Nov (no guess, fill); the flex chain is my default. AF-1 built it with a measured `--admin-fill` (scroller height minus footer) on the frame root instead of `h-full`, because `main` is content-sized in the scroller (risk 1 fallback). |
| AF-21 | On `fill` pages the sidebar scrolls its own list (`overflow-y-auto`) and needs no `sticky`. | In progress | Default. |
| AF-22 | **Drawing sections carry data attributes** the sidebar reads from the same-origin iframe: on each `<section>`: `id`, `data-label`, `data-st` (`approved` \| `progress` \| `open`), `data-v` (`v13`), `data-d` (`2026-11-10`, ISO date). A drawing without them simply lists no sections. | Confirmed (data attributes, date field) | Codes are my default; the visible chip text in the drawing stays Latvian. |
| AF-23 | Each screen in `docs/development/kanali/hub.html` gets a `d` field next to `st` and `v`; the heading line in the drawing shows it after the version ("v13 · 10. nov."). All current screens get `2026-11-10` (v12 and v13 were both published that day, commits a6a9c72 and 249418f). | Confirmed | 10 Nov, owner question 3. |
| AF-24 | The parent reads sections on the iframe's `load` event (`iframe.contentDocument.querySelectorAll('section[data-st]')`); `srcDoc` without `sandbox` inherits the admin origin, so this works. Jump = `section.scrollIntoView({ block: 'start' })` (`behavior: 'smooth'` only without `prefers-reduced-motion`). Current = the last section whose top is above one third of the iframe's height, recomputed on the iframe window's `scroll` (passive, one `requestAnimationFrame` per frame). | In progress | Default. |
| AF-25 | The jump writes the section id to the parent URL hash with `history.replaceState` (`?d=hub#board-one`); opening such a link jumps after load. | In progress | Default; makes a section linkable in feedback replies. |
| AF-26 | **Fluid desktop frames.** What forces the min width: `addBox` in `hub.html` (~l.507) sets `box.style.width = w + 'px'` and the column is `shrink-0` inside an `overflow-x-auto` row, so the 1280 and 1920 frames are fixed. New: the 375 frame stays fixed; a desktop frame is `width: 100%`, `max-width: <w>px`, `min-width: 64rem` (1024, so it never drops to the tablet layout), column `w-full`. The drawing reflows (its layout uses `@container` queries), never scales; the row scrolls sideways only when the pane is under 1024 px. Caption: "līdz 1280 px". | Confirmed | 10 Nov, owner question 1: frames reflow between 1024 px and their drawn width, no scaling (replaces the "frames full size" rule). |
| AF-27 | The Plāns / Mezgli tab row at the top of the page goes; the tabs move into the sidebar (AF-12). `?d=` stays the URL. | Confirmed | 10 Nov. |

### Checks
| Id | Feature | Status | Notes |
|---|---|---|---|
| AF-30 | Checked at 360, 768, 1024, 1280, 1440, 1920 px, lv and en, light and dark. | Confirmed | 10 Nov. |
| AF-31 | Visual baseline: **no listed screens.** `tests/visual/screens.visual.spec.ts` has no admin screen, so every diff after this release is a bug. No admin screen is added (needs a signed-in admin and the drawings load CDN fonts, so not deterministic). | In progress | Default. |

## Invariants (must stay exactly as today; the reviewer checks each)

1. Row 1 (`AdminSections`): same links, badges, order, look; hidden below `sm`. Only its `sticky top-0 z-30` moves to the shared wrapper.
2. Phone drawer (`AdminDrawer`, `AdminPagesNav variant="drawer"`, `PhoneBar` title + part): same content, still `lg:hidden`, parts still indented in the drawer.
3. Every admin page keeps its own guard (`requireAdminPage` / `requireOwnerPage` / `requireHandbookAccess`); the layout still only decides whether to show the frame.
4. URLs unchanged: `/admin/design?part=`, `/admin/handbook/<chapter>`, `/admin/handbook/ui-elements`, `/admin/development/build-plan?d=`.
5. The drawing iframe keeps `data-feedback-frame={current}` and `srcDoc` (the feedback tool reads it) and gets **no** `sandbox` attribute (it would cut the same-origin read, AF-24).
6. `DevelopmentService` keeps reading and injecting as today; no new fs paths.
7. Design: the flagged-part dot (`flaggedParts` from `DesignEditor` via `setFlaggedParts`) still shows next to the part, now in the sidebar.
8. The Design chapter's drawings block (`DesignDrawings`, `?d=` + `#drawings`) works as today; "drawings" stays its last sidebar section.
9. No new colours, radii or shadows; type roles only; no `[Npx]` spacing (`npm run ui:check`).

## 0. Motivation and design alignment

The build-plan page guesses the frame height in three breakpoints (`build-plan/page.tsx` l.46, `h-[calc(100dvh-7.0625rem)]…`); when the guess is short the outer scroller scrolls and the tab row slides under the sticky sections bar. The fix is structural (a flex chain, AF-20) and a measured variable for anything that must clear the rows (AF-05). The 14 rem pages column inside a centred container leaves the drawings about 1150 px at a 1440 window; pages across (AF-01, design.md "Bars and menus stay in reach") and a left-edge sidebar with the content to the right edge (the R20 discovery exception in "Fluid") give the drawing the rest of the window. Laws: no Prisma or new services (Service Law untouched); location and counts still come from `AdminFrameProvider` (Context Law: the sidebar reads `useAdminFrame()`, nothing is prop-drilled from the layout); the `frame` field lives in `lib/constants/adminNav.ts` (Constants Law); no accent work (Taxonomy Law n/a).

## 1. Who sees what (both sessions)

| Viewer / state | Row 1 | Row 2 | Sidebar |
|---|---|---|---|
| Site admin, section with several pages, `lg`+ | yes | yes | only on `frame` pages |
| Site admin, Komanda (one page) | yes | no | no |
| Site admin, below `lg` | from `sm` | no (drawer bar) | folded "Sadaļas ▾" on `frame` pages |
| Handbook reader without admin (`requireHandbookAccess`) | no frame (layout renders `children` only) | no | Handbook pages render their sidebar outside the frame: it must work without `AdminFrameProvider` (see 3.4) |
| Signed out | redirected by the page guard | | |
| Būvplāns between plans (no spec) | yes | yes | no sidebar; the empty note in the centred container |
| Owner only: Design | yes | yes | parts |

## 2. Data and migrations

None. No schema, no service changes beyond 4.2 (an exported heading helper). The drawing's data lives in `hub.html`.

## 3. The frame (AR-68 rewrite) (AF-1)

### 3.1 `lib/constants/adminNav.ts` (edit)
Add `frame?: 'sidebar' | 'fill'` to `AdminNavItem` with a one-line doc; set it on `design`, `handbook`, `buildPlan` (AF-16).

### 3.2 `components/admin/frame/AdminFrame.tsx` (rewrite, ≤ 90 lines)
- One sticky wrapper (`sticky top-0 z-30 bg-background`) holding `<AdminSections />` and `<AdminPagesNav variant="row" />` (AF-01). A `ref` + `ResizeObserver` writes `--admin-bars` (px) on the frame root via `style`; clean up on unmount (AF-05).
- `PhoneBar` stays, inside `container mx-auto px-4`, right under the wrapper (unchanged position).
- `location.item?.frame`: none → `container mx-auto px-4` + `py-6` (AF-06); `'sidebar'` → `children` directly (the page renders `AdminSidebarLayout`); `'fill'` → root `flex h-full flex-col`, children in `flex min-h-0 flex-1 flex-col` (AF-20).
- Delete the `single`/grid branch (AF-02). Update the doc comment.

### 3.3 `AdminSections.tsx` (edit) and `AdminPagesNav.tsx` (edit, ≤ 110 lines)
- `AdminSections`: drop `sticky top-0 z-30` from its `<nav>` (the wrapper has it). Nothing else.
- `AdminPagesNav`: `variant: 'row' | 'drawer'`. `row`: `hidden lg:block border-b border-border`, `<ul className="container mx-auto flex gap-1 overflow-x-auto px-4">`, each item a `Link` with the same classes as an `AdminSections` tab plus the item icon (`size-4`) and `AdminBadge` (`danger` for reports); returns null when `section.items.length <= 1` (AF-01, AF-04). No `Parts` in `row`. `drawer` unchanged. Keep `useAdminParts` exported (the sidebar uses it).
- Reuse `UI.tabs` as `data-ui` on the row nav (the `ui:check` tab rule).

### 3.4 New `components/admin/frame/AdminSidebarLayout.tsx` (client, ≤ 120 lines)
Props: `{ tabs?: SidebarTab[]; sections: SidebarSection[]; current: string | null; onJump?: (id: string) => void; children }` where
`SidebarTab = { id; href; label; current: boolean; flagged?: boolean }`, `SidebarSection = { id; label; status?: 'approved' | 'progress' | 'open'; version?: string; date?: string }`. Export the types.
- `tabs` absent → from `useAdminParts(location.item)` with `current = p.id === location.part`. Read the frame with a **non-throwing** variant: if `AdminFrameProvider` is absent (Handbook reader without admin, §1) show no tabs. Check how `useAdminFrame` behaves without a provider; add `useOptionalAdminFrame()` in `AdminFrameProvider.tsx` if it throws.
- `lg`+: `<aside className="sticky top-[var(--admin-bars,0px)] hidden max-h-[calc(100dvh-var(--spacing-header)-var(--admin-bars,0px))] w-aside shrink-0 self-start overflow-y-auto border-r border-border lg:block">` (AF-10). In `fill` mode the parent passes `fill` and the aside is `self-stretch` with no `sticky`/`max-h` (AF-21).
- Tabs: a `nav` (`aria-label` `admin.nav.pageTabs`), rows like `PageNavLink` without icon (`min-h-11`, `rounded-item`, `bg-tint weight-strong` when current), flagged dot as in today's `Parts` (copy its markup and sr-only text, then delete it from `AdminPagesNav` only if no longer used by the drawer: it is, so keep it).
- Sections: a second `nav` (`aria-label` `admin.nav.pageSections`) under a hairline; each row a button when `onJump` is given, else an `<a href="#id">`. Row: label (`text-body-sm`, two lines max `line-clamp-2`), then a meta line: status chip, version, date (`useFormatter().dateTime(new Date(date), { day: 'numeric', month: 'short' })`). Chip: reuse an existing status pill from `components/ui` if one exists; otherwise `inline-flex h-5 items-center gap-1 rounded-pill px-2 text-tag`, Apstiprināts `bg-tint text-foreground` + `Check size-3`, Procesā `bg-tint text-foreground-muted`, Atvērts `line text-foreground` (the drawing's own mapping, `hub.html` l.532).
- Current section: `aria-current="location"`; the aside scrolls the current row into view (`block: 'nearest'`) when it changes.
- Below `lg`: render `<AdminSidebarFold>` above `children`.
- Layout: `lg:flex`, content `min-w-0 flex-1 px-gutter` (`py-6` unless `fill`).

### 3.5 New `components/admin/frame/AdminSidebarFold.tsx` (client, ≤ 70 lines)
`buttonClass('quiet', …, 'sm')` button "Sadaļas" + `ChevronDown` (rotates when open, `motion-safe`), `aria-expanded`, `aria-controls`. Panel in flow below it (`mt-2 rounded-2xl line bg-surface p-2`), same tab and section rows (share a `SidebarList` render function exported from `AdminSidebarLayout`, don't duplicate markup). Choosing a row closes it. Returns null when tabs and sections are both empty (AF-14).

### 3.6 Handbook and Design pages (edit)
- `components/handbook/HandbookShell.tsx`: drop the right TOC grid (AF-15); render `<AdminSidebarLayout sections={headings.map(h => ({ id: h.id, label: h.text }))} current={…}>` around the article. It is server; `AdminSidebarLayout` is client, so pass plain data. The current heading: an `IntersectionObserver` on the heading ids inside the sidebar layout (`useActiveSection`, 3.7). `wide` (UI elementi) passes no sections.
- `components/handbook/HandbookMarkdown.tsx`: `scroll-mt-24` on h2/h3 → `scroll-mt-[calc(var(--admin-bars,0px)+1rem)]` (if `ui:check` rejects this, keep `scroll-mt-24` and note it in the commit). Same for `DesignDrawings`' `scroll-mt-24`.
- `app/[locale]/admin/design/page.tsx`: wrap the body in `<AdminSidebarLayout sections={[]} current={null}>` (tabs come from the parts). Content stays `space-y-6`; add `max-w-browse` on the inner wrapper so the editor keeps its width.

### 3.7 New `components/admin/frame/useActiveSection.ts` (client hook, ≤ 60 lines)
`useActiveSection(ids: string[], doc?: Document, root?: Element | null): string | null`. Default rule (AF-24): the last id whose element's top is above one third of the viewport (or `root`) height; listen to `scroll` on `doc.defaultView` / `root` (passive, rAF-throttled) and on `resize`. Used by the Handbook (main document), the spec pane and the drawing iframe (AF-2).

### 3.8 UI elementi specimens (`components/handbook/AdminFrameDemos.tsx`, `ui-elements/page.tsx`)
`AdminPagesDemo` (non-drawer) becomes the row (horizontal tabs); add an `adminSidebar` specimen (`AdminSidebarDemo`: two tabs, three sections with the three chips, one current) with `files={['components/admin/frame/AdminSidebarLayout.tsx']}`. The drawer specimen stays.

## 4. Būvplāns (AF-2)

### 4.1 `docs/development/kanali/hub.html` (edit)
- `screens` (~l.479–503): add `d: '2026-11-10'` to every screen (AF-23).
- The section builder (~l.529–533): set `section.dataset.label = s.label`, `dataset.st` from a map `{ 'Apstiprināts': 'approved', 'Procesā': 'progress', 'Atvērts': 'open' }`, `dataset.v = s.v`, `dataset.d = s.d` (AF-22); add the date after `s.v` in the heading meta (`' · ' + day + '. ' + monthShort`, Latvian short month, a tiny local formatter in the script).
- `addBox` (~l.507–527): AF-26. Phone (`w === 375`) unchanged. Otherwise: `col.className = 'w-full'`, `box.style.width = '100%'`, `box.style.maxWidth = w + 'px'`, `box.style.minWidth = '64rem'`. The fixed type/gutter tokens (`fl`) stay. Caption (`cap`) reads "…, līdz 1280 px". Update the comment on l.528 ("owner rule: frames are never shrunk…") to: frames reflow between 1024 px and their width, never scale; under 1024 the row scrolls.
- Bump the version line (l.11) to v14 with the commit's local time (AGENTS.md drawings rule).
- Mention AF-22 in the file's top comment: the admin sidebar reads `section[data-st]`; future drawings follow it.

### 4.2 `lib/services/handbook.service.ts` (edit, small)
Export the existing `parse` heading extraction as `markdownHeadings(markdown): HandbookHeading[]` (or export `parse` under that name) so the build plan reuses it. No new logic.

### 4.3 `app/[locale]/admin/development/build-plan/page.tsx` (rewrite, ≤ 70 lines)
Guard, metadata, `drawingId` and the empty note stay (the empty note keeps its centred box: wrap it in `container mx-auto px-4 py-6`, since `fill` drops the container). Build `tabs` on the server: `{ id: 'spec', href: '/admin/development/build-plan', label: t('planTab'), current: !current }` + one per `PLAN.drawings`. Spec: `sections = markdownHeadings(markdown)`. Render `<BuildPlanView tabs sections drawing={current ? { id, title, html } : null}>{markdown && <HandbookMarkdown markdown={markdown} />}</BuildPlanView>`. No `h-[calc(…)]`, no `min-h-96` (AF-20, AF-27).

### 4.4 New `components/admin/plan/BuildPlanView.tsx` (client, ≤ 140 lines)
- `AdminSidebarLayout` in `fill` mode with the server tabs.
- Drawing: `<iframe key={id} ref data-feedback-frame={id} title srcDoc={html} className="min-h-0 w-full flex-1 border-0 bg-background">`. `onLoad`: read `section[data-st]` into `SidebarSection[]` (AF-24); state resets on `key` change. `useActiveSection(ids, iframe.contentDocument)`. `onJump`: scroll inside the iframe + `replaceState` hash (AF-25). After load, if `location.hash` matches an id, jump.
- Spec: `<div ref className="min-h-0 flex-1 overflow-y-auto py-6"><article className="max-w-5xl min-w-0">{children}</article></div>`; `useActiveSection(ids, document, paneRef.current)`; `onJump` scrolls the heading inside the pane. Keep `max-w-5xl` (today's width; not a new token).
- `fill` content column: `flex min-h-0 min-w-0 flex-1 flex-col` with `px-gutter` only on the spec pane (the iframe goes edge to edge, AF-10). Below `lg` the fold button sits above the iframe/pane with `px-gutter pt-2`.

## 5. i18n (both files, same commit; `npm run i18n:check`)

| Key | lv | en | Session |
|---|---|---|---|
| `admin.nav.pageTabs` | Lapas daļas | Page parts | AF-1 |
| `admin.nav.pageSections` | Sadaļas | Sections | AF-1 (fold button text and nav label) |
| `admin.nav.pageSectionsToggle` | Rādīt vai slēpt sadaļas | Show or hide sections | AF-1 (fold button `aria-label` addendum only if the visible text is not enough; skip if unused) |
| `admin.development.status.approved` | Apstiprināts | Approved | AF-2 |
| `admin.development.status.progress` | Procesā | In progress | AF-2 |
| `admin.development.status.open` | Atvērts | Open | AF-2 |
| `admin.handbook.uiElements.adminSidebar` (+ its description key, follow the existing `adminPages` specimen keys) | Lapas sānjosla | Page sidebar | AF-1 |

Check `admin.nav.sections` is an object (the section names): the new keys must not collide with it. `admin.handbook.onThisPage` becomes unused after AF-15: remove it from both files in AF-1 if nothing else reads it (grep first).

## 6. Handbook updates (AF-1 unless noted)

- `docs/handbook/design.md`, "Admin pages are cards (R11b)": replace "(sections across, pages down the left, parts indented, one drawer on phones)" with: sections across and the open section's pages in a second row, both sticky; pages with sections (Būvplāns, Handbook, Design) add a sidebar at the window's left edge with the page's parts at the top and its sections under them, the content filling to the right edge; below 1024 px a "Sadaļas" button; one drawer on phones. Cite this spec's ids.
- Same chapter, "Fluid": add admin pages with a sidebar to the R20 exception (column at the left edge, content to the right edge).
- Same chapter: one sentence under Templates or Components that a review page reads a drawing's sections from `section[data-label][data-st][data-v][data-d]` (AF-2).
- `docs/execution_handoff.md`: tick the AF items as each session lands.
- `.claude` memory "Drawing frames full size" is the owner's to change after question 1; the orchestrator updates it, not the builder.

## 7. Commit plan

AF-1 (one session):
1. `refactor(admin): frame item field and measured bars` — 3.1, 3.2 wrapper + `--admin-bars`, 3.3 row variant, column removed (AF-01..06, AF-16).
2. `feat(admin): page sidebar with fold` — 3.4, 3.5, 3.7, i18n AF-1 keys.
3. `feat(handbook): chapters and headings in the admin sidebar` — 3.6 (Handbook, Design).
4. `docs(admin): frame in design.md and UI elementi` — 3.8, §6 handbook text.

AF-2 (one session, after AF-1):
5. `docs(kanali): hub drawing v14; section data attributes, dates, fluid frames` — 4.1.
6. `feat(admin): build plan fills the window; sidebar reads drawing sections` — 4.2, 4.3, 4.4, AF-2 i18n keys.
7. `docs(admin): design.md drawing sections note; handoff ticked`.

Each commit typechecks on its own. Commit by explicit paths.

## 8. Acceptance (builder runs it; the reviewer repeats it)

At 360, 768, 1024, 1280, 1440, 1920 px, lv and en, light and dark (AF-30):
1. `/admin` (Moderācija): row 1 + row 2 (Pārskats, Ziņojumi, Aktivitāte) from 1024; no left column; content centred as before; scrolling a long page keeps both rows under the header with no gap.
2. `/admin/team`: row 2 absent.
3. 360 and 768: drawer bar and drawer as before (open it, parts still indented under Dizains and Rokasgrāmata).
4. `/admin/handbook/design`: sidebar at the left edge from 1024 with the chapters on top and the H2s under them; scrolling marks the current H2; clicking one lands it just under row 2 (not hidden); "Zīmējumi" last and its drawing still loads. Below 1024: "Sadaļas" button opens the list in flow.
5. `/admin/design`: parts in the sidebar, the flagged dot appears when a part has a contrast issue; `?part=` switches without a scroll jump.
6. `/admin/development/build-plan`: the spec in its pane, H2 list in the sidebar, current marked. `?d=hub`: sidebar lists all 24 screens with chip, version, date; click jumps inside the iframe and sets `#id`; reload with the hash lands there; the outer scroller never scrolls (check `document.getElementById('main-content').scrollTop` stays 0 while scrolling the iframe); the tab row bug is gone at every width.
7. Drawing at 1440 and 1920: the 1280 frame shows complete without a sideways scrollbar at 1440 (pane ≈ 1440 − 280); at 1024 the desktop frame is 1024 wide and the row scrolls; the 375 frame unchanged.
8. Keyboard: Tab through row 1, row 2, sidebar tabs, sidebar sections; focus rings visible; the fold button toggles with Enter/Space.
9. `npm run typecheck`, `npx eslint <changed>`, `npm run i18n:check`, `npm run ui:check`, `npm run build`, `npm run test:smoke`; `scripts/visual-docker.sh` with **zero** diffs (AF-31).

## 9. Risks

- **`h-full` inside `<main>` (AF-20).** `main` is `flex-1` in the scroller's column, which should make its height definite; if the frame's `h-full` still resolves to `auto` (an extra wrapper, a template), measure: `getComputedStyle` on the frame root at 1280. Fallback, in this order: give the admin layout's wrapper `h-full`; else set `--admin-fill` from a `ResizeObserver` on `#main-content` (`clientHeight` minus the footer). Never a rem guess.
- **Footer on `fill` pages.** The slim footer stays under the iframe; on phones the scroller's bottom padding for the nav stays. Acceptable; don't hide the footer from the admin layout.
- **`useAdminFrame` outside the frame (§1).** Handbook pages render for handbook readers without the admin frame; the sidebar must not throw there.
- **Same-origin read (AF-24).** Works only while the iframe is `srcDoc` without `sandbox`; a future `sandbox` must include `allow-same-origin`. Read on `load`; the Tailwind CDN restyles after load but doesn't change the sections.
- **Sticky inside the Design editor.** If `DesignEditor` has its own sticky bar (`top-*`), it now needs `top-[var(--admin-bars)]`; grep `sticky` under `components/admin/design/`.
- **Smooth scroll inside the iframe** ignores the parent's motion setting; check `matchMedia('(prefers-reduced-motion: reduce)')` in the parent.
- **`ui:check` and arbitrary values.** `top-[var(--admin-bars,0px)]`, `max-h-[calc(…)]`, `scroll-mt-[calc(…)]` use `var()`/`calc()`, which design.md allows for sizing against the screen; if the checker flags one, add `ui-allow:` with the reason, don't switch to a rem guess.

## 10. Builder and reviewer checklist

Builder
- [ ] Read this spec's ledger, Invariants and your session's sections only; design.md Page layouts + Space and depth.
- [ ] `npm run feedback` first; mark any note this fixes.
- [ ] No `calc(100dvh-…rem)` or `h-[calc` left under `app/[locale]/admin` and `components/admin` (`grep`).
- [ ] Files stay under their line caps; `AdminPagesNav` `Parts` still used by the drawer only.
- [ ] Both message files in the same commit; LV copy from §5.
- [ ] Drawing version line bumped (AF-2).
- [ ] Screenshots at the six widths in both locales looked at before reporting; stop the dev server at the end.

Reviewer
- [ ] Each Invariant 1–9 holds.
- [ ] Ledger ids cited in commits; AF rows still "In progress" are reported back, not silently decided otherwise.
- [ ] Context Law: no `location`/`counts` passed as props from the layout; the sidebar reads the provider.
- [ ] Acceptance 6 and 7 repeated at 1440 in the owner's pane width (~1150 px content before this release).
- [ ] Visual job: zero diffs.

## 11. Out of scope

New admin pages; a sidebar for other admin pages; changing the drawer; the Kanāli ledger content; the R-series drawings in `scripts/redesign/` (they don't carry `data-st` yet; they list no sections until a later release adds them).

## 12. Owner questions (answered 10 Nov, all with the defaults)

1. **Fluid frames vs the 11 Nov "never shrink" rule (AF-26).** Default: desktop frames reflow between 1024 px and their drawn width (no scaling), so 1280 fits a 1440 window; the 1920 frame shows at pane width. Alternative: keep fixed widths and only gain the wider pane.
2. **Handbook and Design use the same left sidebar (AF-12, AF-15).** Default: yes, chapters/parts on top, H2s under, the right "On this page" column removed.
3. **Every current hub screen dated 2026-11-10 (AF-23).** Default: yes, since v12 and v13 were both published that day.
