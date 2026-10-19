# Execution Handoff: Ejam Kopā

> The living "what's next" list. Read `AGENTS.md` first, then this file, then run `npm run feedback` (open notes from the site admins). Product/UI questions: `docs/handbook/README.md`.
> Release work (R1a–R12) follows `docs/development/build-plan.md` section 8 ("Process and status"): specs in `docs/development/specs/`, status table there. Tick or update items here in the same commit as the work.
> Finished work is not kept here: it moves to `docs/archive/` (not required reading; search it for the history of a decision).

**Last updated:** 2026-10-15 (R1a–R8, the quick batch, R6b, C2 and C4 live; R9a-1 event page and R9a-2 event form live).

---

## Current state

- Redesign signed off 13 Oct 2026 (tag `redesign-v9.8.1`), built and released as R1a–R12 one by one.
- **Live:** R1a Identity, R1b Dizains, R2a Header/menus/own-area frame, R2b Behaviour pieces, R3a Group frame, R3b Sazināties/pending/"…", R4 Discovery data, R5a Filters/drawer/cards, R5b Events by day, R6 Panels, R7 Search (with the Session A owner-notes batch), R8 Own area.
- [x] **R8 Own area live** (`2f4b554`..`3d1165c`, review fixes `605807b`, `3d1165c`): Manas grupas sections, Ziņas in the frame, Paziņojumi page, messages and bell as click dropdowns, the "new" count, groups you belong to open their full page; migration `add_user_my_groups_seen_at`; Prisma `relationJoins` preview on. Notes cmv9ajgmd, cmv9aist6, cmv9aom44, cmv9ak7k4, cmv9al64n, cmv9amjft, cmv9ahbt5 done.
- **Next:** R9b, R10 (Citur), R11 (Admin frame), R12 (everything else). Cards, owner decisions OD-01…OD-27 (all decided) and the old → new map are in `build-plan.md`.
- Workflow per release: Opus spec → Sonnet build → Opus review (independent review for migrations and R4-like data work) → reviewer pushes.
- Review (2026-10-15): group panel (lookingFor, no-next-meeting line checked LV/EN at 375 and 1280) and search theme fixes verified; a page category the search does not know is now dropped.

## Standing owner rules

- **Pushing:** reviewed work is pushed by the agent itself, never ask (the owner reviews on ejam.lumm.eu). Report afterwards. Before a push: typecheck, eslint on changed files, `npm run i18n:check`.
- **Orchestration:** the main session only plans and delegates; builders are Sonnet, reviewers matched to risk (Opus for auth, migrations, time, messaging). A fresh review session pushes; earlier sessions are never resumed.
- **Design talk:** short, one default per small detail. An owner note first gets a short review/discussion, then a fix. A defect the owner reports is fixed as a class (AGENTS.md / handbook / build plan), not once.
- **Prototype stage:** ejam.lumm.eu is a test server, not production in the security sense. Seed/dev-password sign-ins (`ALLOW_DEV_PASSWORDS`, seed admin accounts) are intended. Builders and reviewers must not fix, flag or report this, nor ask about `AUTH_SECRET` rotation. No real users: no DB backups before migrations, placeholders are fine.
- **No small debt:** anything an agent can fix in about 4 minutes is fixed now. Tell builders and reviewers.
- **The "tree" idea** (https://claude.ai/artifact/KxCiZs1x2Cz31jdJApsmLi) is parked until everything else works.
- **Session hygiene:** start the dev server only via the browser pane (`.claude/launch.json`, config "dev"); only one session may run it. If something already listens on :3000 (`Get-NetTCPConnection -LocalPort 3000 -State Listen`) it is a leftover `next dev`: confirm it is this repo's and stop it. Stop your own server before reporting done. Don't run `npm run build` while dev runs. Switching seed accounts (`owner@local`, `member@local`, …) is fine on localhost, never on ejam.lumm.eu. Native `confirm()` blocks the browser pane: set `window.confirm = () => true` first.

## Owner notes batch 15 Oct (planned, not built)

Decisions C1–C5 and D are recorded in `build-plan.md` section 6 ("Owner decisions 15 Oct"); release-bound notes are in the R8, R9a and R9b cards. Order: quick batch below → R6b (centred overlay, C1) → `LanguageEditor` (C4) → R9a …

- [x] **Quick batch** (83175ee, bd933df, bd16140, 343b17e; the group row's dot is on every `GroupRow`, not only in search) (each under ~4 min): drop the "Kategorijas" drawer heading, keep it for screen readers (cmv9ae721); search result rows get the category dot of the cards (cmv9aaifn); event form "Adrese" → "Kur?" + hint (cmv9b418s); settings "Ko meklējam?" → "Sauklis"/"Tagline" (cmv9bbzze); whole section row opens it, chevron ▾/▴ (cmv9bd0na, cmv9bdszj); seed events: public open, request-to-join, members-only, several dates per group (cmv9as5hl).
- [x] **Accent-insensitive search** (5ac1d36, 81f6532; the "par" chip was dropped because chips need a count above zero and the counts used accent-sensitive ILIKE) (cmv9a8pkg, promoted from Parked ideas): theme chips already fold (`lib/search-topics.ts`), so first reproduce why "par" showed no "Pārgājieni" chip; group results use Postgres `ILIKE` → Postgres `unaccent` extension (migration `add_unaccent_extension`, expand only).
- [x] **R6b** centred overlay growing from the card (C1) (b7a7774 placement, c2c1dc4 grow; View Transitions driven by hand, 560 px overlay from 768 px; review fix 5eeb69a: search results are never grown; pushed, live).
- [x] **C2** card bottom line = latest activity (next event › public announcement › tagline › nothing); tagline always in panel and group header. `cardActivities` (lib/services/card-activity.ts) holds the one public-announcement filter R9b plugs into; panel drops "no meeting" line; tagline in banner from md and on Informācija on phones. (`0310185`, review `b50e650`; pushed, live)
- [x] **C4** `LanguageEditor` (`bbe5cd1` piece, `d41720e` event form and sections, `4c00bcf` create-group wizard, `5bbc026` docs; review `787d698`: a lost connection mid-save keeps the form instead of the error page, screen-reader names; pushed, live): one control for owner text in every language on the event form, group sections (also before the first save) and the create-group wizard ("Par mums" per language); notes cmv9az6sn, cmv9b0tth, cmv9b1v6h, cmv9bemab done. Spec `docs/development/specs/C4.md`.

- [x] **R9a-1 Event page** (`5927a8d` one timing rule and "Notiek tagad · līdz …" on cards, panels and Informācija, seed; `d18bdca` `getEventPage` service; `356e8f9` the page in the new look; `92f661f` banner breadcrumb and Rīkotājiem box; `0beedc2` fixes and UI-elements specimen; `0ad728f` docs; review fix "Dzēst redirects in the action": Dzēst (event and group) redirects inside the server action instead of a client timer, the members-only gate page has its own `<h1>`, messages files back to LF; pushed, live): notes cmv9b6daz (Praktiskā informācija) and cmv9b80zl (Visi pasākumi as a breadcrumb) done, C2 review item (running event on the card) done. Spec `docs/development/specs/R9a.md`. Next: **R9a-2** the event form (spec section 6: split of `EventCreationWizard`, restyle, skipped-hour check).
- [x] **R9a-2 Event form** (`ca9cfa5` `EventCreationWizard` split into `forms/event/*`; `e3196d6` new look (Field, radio rows, Button, ConfirmDialog, left-aligned page heads) and `localTimeExists`: a time in the skipped DST hour is refused on step 1 with `eventWizard.TIME_SKIPPED`; checked create and edit LV/EN at 360-1920 px, skipped hour 28 Mar 2027 03:30; review fix: time logic moved to `useEventTimes` (useEventForm under the size limit), re-checked create/edit LV/EN 360-1920, skipped hour refused, repeated 25 Oct hour saved as its first occurrence; reviewed, pushed, live). R9a-2 leftovers closed (`a08b634` useEventForm split into useEventSave, both under 150 lines; open-switch verified; the double h1 is Next's hidden previous route (display:none), not a bug; create and edit smoke-checked in LV at 360 and 1280). Next: **R9b**. Spec `docs/development/specs/R9a.md` section 6.
- [x] **R9b-1 Jaunumi** (`e4860ef` migration `add_announcement_visibility`, `29f41c5` visibility in services and cards, new Jaunumi page `components/groups/announcements/*`, `347fe8f` newest announcement on Informācija; awaiting Opus review and push). Services and page share one commit so each typechecks. Next: R9b-2 Biedri, R9b-3.
- [x] **Quick batch 2** (`5b2db44` menus/pop-ups stay open in feedback mode, cmv2rea3z; `128a12d` footer at the bottom, cmv9l06dg; `a2b7443` Veidi always chips, cmv9k2uey; `81e3202` search finds and suggests Veidi, cmv9lczhq; `74c8d12` Tavi pieteikumi as group rows, cmv9keww2; reviewed, pushed, live; notes marked done; cmv2rea3z newer request, recolor the floating icons by state, still open).
- [x] **Quick batch 3** (`3dc4830` saving Par mums of a group without section rows no longer says NOT_FOUND: the virtual "about" section is now created on first save, cmv9usuov, cmv9v5u7a; `e3178e4` Tēma is a left side drawer on phones and the Kur sheet list scrolls inside, cmv9l0zno, cmv9kyl0x; `e4b288f` report reasons Spams / Kaitīgs saturs / Aicinājums uz vardarbību / Cits, no migration (Report.reason is a string), cmv9uxtk9; sticky horizontal menus under the header: admin menu, part tabs, settings tabs, filter line, cmv9kq33f; review `cf1eeeb` new reports accept only offered reasons, `60c47e3` phone filter line sticks at 48 px, the view switch scrolls away). Reviewed, pushed, live.

## Waiting on the owner

- `cmv5on08v` (Your own area: one space, like a group): "this is ok, but will still review". Leave open until the owner has looked at R8.
- `cmv85o4gn` (idea): group discovery results visually by place while no filter is set. Parked until R10 ("Kur tu esi?"); needs a discussion first (Riga would push small towns down).
- Nothing else is awaiting an OK: OD-01…OD-27 and the former "Still open 1–18" are decided.

## Open follow-ups not in any release

- Reporting a person (OD-11): later, after R12; needs migration `add_report_target_user`. Until then only "Ziņot par grupu" and event reports exist.
- Banner picker: one picker (group wizard, group settings, event wizard) replacing the plain URL field in `BasicsSection`: ~6–8 curated Unsplash photos per L1 category (URLs and photographer credit in `lib/constants`) plus "no image" (category-colour tile). "Search for another photo" via a server action needs an Unsplash app and production approval from the owner; follow the Unsplash API rules (hotlink, `download_location`, credit). Mockup and owner OK first.

## Parked ideas

- Event series (recurring events): members-only events only, each date its own event with RSVP per date; public events never recur.
- Private groups with an invite mechanism (today a private group is link-only, "Tikai biedriem").
- Owners uploading their own group image (needs storage).
- Owner-chosen date/number format in settings (today European format, Monday first, 24 h, in both languages).
- A "town hall" message board for a whole town (the removed `[l1]/messages` placeholder).

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
- **Sign-in:** a pop-up for actions inside the site (with a "Create account" link; registration returns the person to where they were), the sign-in page for direct visits and protected URLs; both share one form and wording.

## Known code debt (fix when touching nearby code, not as a project)

- Remaining `confirm()` in admin: ReportList, CitiesSection, PendingCityCard, PendingInboxCard, TaxonomyAdminClient → `ConfirmDialog` / `ConfirmPopover` (planned in R11).
- Possible Service Law violations in some actions and accent-colour prop-drilling (unverified, from a 2026-03 audit); `TagPicker` `as any` is planned for R9b. Components over 150 lines (listed in `build-plan.md` section 6) are split when touched.
- `package.json` `overrides` pins `@swc/core` to 1.15.47 (pulled in by next-intl's plugin). 1.16.x refuses to start on the owner's Windows machine (`ERR_SWC_NATIVE_CACHE` cache-folder permission check), breaking `npm run dev` and `npm run build`. next-intl is held at 4.13.x for the same reason (4.14 needs SWC ~1.16). Revisit when SWC relaxes the check.
- A hidden leftover streamed copy `div#S:0[hidden]` stays in group subpages (settings in prod), duplicating ids; cause unknown.
- The accent-insensitive search sends every matching id back into the query uncapped: fine at prototype scale, move the match into one query before real scale.
- `npm audit`: `deepmerge-ts` inside the Prisma CLI (runs only during migrations, no user input); fixing needs a breaking Prisma change, accepted for now.
