# Execution Handoff: Ejam Kopā

> The living "what's next" list. Read `AGENTS.md` first, then this file, then run `npm run feedback` (open notes from the site admins). Product/UI questions: `docs/handbook/README.md`.
> Tick or update items here in the same commit as the work. Finished work is not kept here: it moves to `docs/archive/` (history, not required reading; latest: `execution_handoff_2026-10-22.md`, R14 theme sweep to R17).

**Last updated:** 2026-10-24 (R21-C ticked; R22-2 and R23 listed next).

---

## Current state

- The redesign (signed off 13 Oct 2026, tag `redesign-v9.8.2`) is built and live: R1a–R9c, R6b, C2, C4, R11, R13, colour and space releases, R14 theme sweep, R15–R17. R10, R12 and the old R14 Kopā were cancelled or cleared by the owner. `docs/development/build-plan.md` is now closed history and the rule ledger (AR/AP ids, `npm run plan:check`); the specs in `docs/development/specs/` are frozen. Neither is required reading.
- Guards in place: eslint Laws, `ui:check` (type, space, look, field, button, motion, icon rules), `services:check`, CI smoke test.

## What's next

- [x] **R18 Ziņojumu dēlis** (spec `docs/development/specs/R18.md`): card, create card, phone row, handbook, ledger text built; reviewed, pushed, live; the owner's look at it still open.
- [x] **R19 Tēmu rādītājs** (spec `docs/development/specs/R19.md`, drawing `docs/development/r19-category-sidebar.html`): the category drawer and the Tēma drop-down as a quiet index (neutral icons, tone only on hover icon and the selected row, tint + dot, quiet search with Veidi, empty shows "0"); one session R19-1, no DB change; reviewed, pushed, live.
- [x] **R20 Dēļa galva** (spec `docs/development/specs/R20.md`, drawing `docs/development/r20-board-heading.html`): the title is the Grupas | Pasākumi switch with filter-following counts, one 28 px chip row, the column flush left and the board to the right gutter on shared row lines, header field over the title from 1024; sessions R20-1 (grid, title, counts, header) and R20-2 (chips, sticky veil, skeleton); no DB change; reviewed, pushed, live.

Agenda from the owner's 22 Oct feedback (order agreed; each release still gets a short plan and the owner's OK before spec/build):

- [x] **R21-0 Screenshot baseline** (`tests/visual/`, `npm run test:visual`, CI job `visual`, rule in AGENTS.md "Visual baseline"): Playwright `toHaveScreenshot` of the key screens at 360/768/1280/1920, light + dark, `lv`, seeded DB, frozen clock. Every later release lists the screens it means to change; any other diff blocks it.
- [x] **A Phone pass (R21-A, spec R21.md):** footer gap, header search shape, group and event slide-over, Tēma and date chip drop-downs, Ziņas layout (fix as a class, handbook rule).
- [x] **B Board rows (R21-B, spec R21.md):** event row leads with the event name ("Notiek tagad" a small badge), titles up to 2 lines on phone, one status marker (badge, not badge + icon).
- [x] **D + E Wizard and admin (R21-DE, spec R21.md):** wizard Basics first, Tēma second; terms sweep ("Kategorizēšana"/"kategorija" → Tēma); admin build-plan page cleared (ledger file kept), Design + Pārveide merged into one design handbook page. Reviewed, pushed, live.
- [x] **F + H Group page and board switch (R21-FH, spec R21.md):** tagline in the banner, no phone "Informācija" heading, phone sticky ☰ bar, board view switch with accent underline. Reviewed, pushed, live.
- [x] **G Group card (R21-G, spec R21.md, drawing `docs/development/r21-group-card.html`):** built 23 Oct, no group slide-over, event pop-ups stay; visual baselines `board-groups`, `search`, `profile` to regenerate in Docker, `group-slide-over` removed (and its PNGs). Reviewed, pushed, live.
- [x] **R22-1 Type storage and CSS (spec `docs/development/specs/R22.md`):** built 23 Oct; `SiteTheme.type` (nullable JSON, migration `site_theme_type`), `themeTypeSchema` (weights 400-700), `TYPE_ROLES`, font `weights` + `snapWeight`, `lib/theme/type-vars.ts` (`--type-<role>-*` vars + rules only when set), type utilities read the vars with today's literals as fallback, service/draft hook carry `type` (look choice keeps it, site Reset clears it). No admin UI (R22-2). Unset = byte-identical `themeCss` (5 presets x 3 styles + Archivo/Atkinson, also `{v:1}`); visual: no new diff vs e5e545f. Review: Design page now carries `type` into the editor; upper-case tag rule yields to explicit case utilities. Open: board-groups (all widths) and board-behind 768/1280/1920 baselines still predate the R21-G card (CI visual red since e5e545f), and 768 board screens render nondeterministically (a few px between identical runs). Pushed, live.
- [x] **Visual CI green:** board lists had no tie-break (events with equal start date, groups with equal createdAt came back in arbitrary order: the 768 flake); now `id` breaks ties (event.service, discovery.service, discovery-search). Baselines regenerated for board-groups (R21-G card), board-events, date-chip-open, event-slide-over, header-search-open, topic-chip-open (new stable order / board behind). Two full Docker runs identical, final run 84 passed.
- [x] **Group page feedback (cmvms0kal0008qs01p4qyndl3, cmvmp9ze60001pa01v6onowhi):** the latest announcement is a compact preview in the side column (link "all" for everyone); the announcements page and its menu item are open to visitors (public, not archived ones; private groups none); the banner name wraps to 2 lines and the "…" and site-admin menus are rows in the left menu (`GroupMenuActions`, pop-ups in `GroupDialogsProvider`). Reviewed, pushed, live; group page baselines regenerated.
- [x] **C Es / Jaunumi (R21-C, c9577e0, pushed, live):** Es opens Manas grupas (public profile reachable from there), one title, pencil round button for Labot profilu; second bottom-nav slot becomes Jaunumi (news feed, own release).
- [x] **R22-2 Burti page** (spec `docs/development/specs/R22.md` sessions table, drawing `docs/development/r22-type-system.html`): Admin > Dizains type tuning (base, contrast, heading weight, leading, tag case, per-role overrides, live sample) on the R22-1 storage. Built 24 Oct (`?part=type`): Sistēma controls, Lomas list with role editor (1 px steps), role-ladder sample scoped to `#design-sample-box` (typeDefaultVars + scoped rules, no leak from the published type). Fonti stays its own part. Reviewed 24 Oct: visual baseline 84 passed, 0 px (the local login failure was an unseeded DB); Lomas names follow the draft fonts; walked 768-1920, dark, en+lv. Pushed, live.
- [ ] **R23 Admin tool panel** (spec `docs/development/specs/R23.md`, drawing `docs/development/r23-admin-drawer.html`).
  - [x] **R23-1 Panel** (built 24 Oct): one shield item "Rīku panelis", floating/docked/sheet panel, tabs Atsauksmes and Tulkot, cookie `admin_panel`; old pills, toggles, loaders and setters removed. Reviewed 24 Oct (submission guard on tab switch/close added), pushed, live.
  - [x] **R23-2 Dizains tab** (built 24 Oct): click a text to pick its type role (capture-phase, Pauze gives clicks back), edit it with the Burti role editor, debounced save to the draft then refresh, outline of the role's texts, hover chip, count, Publicēt/Atmest footer. Reviewed 24 Oct, pushed, live.

## Standing owner rules

- **Pushing:** reviewed work is pushed by the agent itself, never ask (the owner reviews on ejam.lumm.eu). Report afterwards. Before a push: typecheck, eslint on changed files, `npm run i18n:check`.
- **Orchestration:** the main session only plans and delegates; builders are Sonnet, reviewers matched to risk (Opus for auth, migrations, time, messaging). A fresh review session pushes; earlier sessions are never resumed.
- **Design talk:** short, one default per small detail. An owner note first gets a short review/discussion, then a fix. A defect the owner reports is fixed as a class (AGENTS.md / handbook / build plan), not once.
- **Prototype stage:** ejam.lumm.eu is a test server, not production in the security sense. Seed/dev-password sign-ins (`ALLOW_DEV_PASSWORDS`, seed admin accounts) are intended. Builders and reviewers must not fix, flag or report this, nor ask about `AUTH_SECRET` rotation. No real users: no DB backups before migrations, placeholders are fine.
- **No small debt:** anything an agent can fix in about 4 minutes is fixed now. Tell builders and reviewers.
- **The "tree" idea** (https://claude.ai/artifact/KxCiZs1x2Cz31jdJApsmLi) is parked until everything else works.
- **Session hygiene:** start the dev server only via the browser pane (`.claude/launch.json`, config "dev"); only one session may run it. If something already listens on :3000 (`Get-NetTCPConnection -LocalPort 3000 -State Listen`) it is a leftover `next dev`: confirm it is this repo's and stop it. Stop your own server before reporting done. Don't run `npm run build` while dev runs. Switching seed accounts (`owner@local`, `member@local`, …) is fine on localhost, never on ejam.lumm.eu. Native `confirm()` blocks the browser pane: set `window.confirm = () => true` first.

## Product decisions (not recorded in the handbook or build plan)

- **Groups are the heart; events belong to groups.** Event `visibility` (`PUBLIC` / `MEMBERS_ONLY`) and join mode (Open / Request to join) are independent; any combination is allowed. Members-only events are 404 for everyone else.
- **Open events:** "Eju" with a visible count; the size number is context only and never blocks. **Request-to-join events:** the organiser approves or declines; description is visible to all who can see the event, **instructions only to approved people and organisers** (stripped server-side). The organiser marks an event "Full" by hand (never automatic); then the button is "Join waitlist", the waitlist is in join order and is released by hand. An approved person cancelling while Full notifies the organiser; unmarking Full notifies the waitlisted. Switching Request → Open moves everyone pending or waitlisted to going in one transaction with one notification each and a confirmation first.
- **No "Interested".** Event wording fits any event type (rehearsal, birthday, hike): people and joining, never seats or tickets.
- **Joining always needs approval,** public or private; the owner can close a group to new requests (`isAcceptingMembers`).
- **Hidden by moderation:** the owner still opens the group and sees "Hidden by a site admin: <reason>" (no restore button); everyone else except site admins gets 404.
- **Group sections are a core feature:** everything on a group page is a section. The first ("About us" / Informācija) is fixed: always public, cannot be deleted or moved, and is the group's summary for cards and discovery. New groups also get a members-only sample section "Practical info". Default section titles show in the visitor's language until renamed; owner-written text is never auto-translated.
- **Multilingual owner text** (sections and events): `GroupSectionTranslation` rows per language, `originalLang` set from the owner's locale; visitors get their language if present, otherwise the original with a small language label and a `lang` attribute. No machine translation; search covers all languages; group names stay as typed.
- **Max 2 sub-categories per group** (`MAX_GROUP_TAGS`); pending tags count.
- **City suggestions:** a suggested city is usable at once, shown as typed everywhere, and a site admin approves or rejects it.
- **Notification layout:** one compact layout for all types: group · time, one headline naming the person (`notifications.headline.<TYPE>`), then the content itself (message, post excerpt, event title, hide reason) in the `excerpt` arg (trimmed to 160). New types follow this. Admin notices live in the bell's "Administrācija" tab; the admin who causes an event is not notified of it.
- **Footer links lead somewhere real** (no `#`), and no half-built features behind links: hide until they exist.
- **Create-group wizard order (22 Oct):** step 1 Basics (name, tagline, description, place), step 2 Tēma, step 3 as now. The same wizard from the + button and from "add a group here"; from inside a category the Tēma step is pre-filled (selected, "Mainīt"), never skipped.
- **Sign-in:** a pop-up for actions inside the site (with a "Create account" link; registration returns the person to where they were), the sign-in page for direct visits and protected URLs; both share one form and wording.

- **Bottom bar (23 Oct, R21-C, pushed, live):** Atrast · Jaunumi · + · Ziņas · Es. Jaunumi opens the notifications list (bell count); Es opens Manas grupas, which starts with the profile card (picture, name, round pencil to Labot profilu, quiet link to the public profile) on phones. Desktop header unchanged.

## Known code debt (fix when touching nearby code, not as a project)

- Possible Service Law violations in some actions and accent-colour prop-drilling (unverified, from a 2026-03 audit). Components over 150 lines (listed in `build-plan.md` section 6) are split when touched.
- `package.json` `overrides` pins `@swc/core` to 1.15.47 (pulled in by next-intl's plugin). 1.16.x refuses to start on the owner's Windows machine (`ERR_SWC_NATIVE_CACHE` cache-folder permission check), breaking `npm run dev` and `npm run build`. next-intl is held at 4.13.x for the same reason (4.14 needs SWC ~1.16). Revisit when SWC relaxes the check.
- A hidden leftover streamed copy `div#S:0[hidden]` stays in group subpages (settings in prod), duplicating ids; cause unknown.
- The accent-insensitive search sends every matching id back into the query uncapped: fine at prototype scale, move the match into one query before real scale.
- `npm audit`: `deepmerge-ts` inside the Prisma CLI (runs only during migrations, no user input); fixing needs a breaking Prisma change, accepted for now.
