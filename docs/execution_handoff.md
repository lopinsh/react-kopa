# Execution Handoff: Ejam Kopā

> The living "what's next" list. Read `AGENTS.md` first, then this file, then run `npm run feedback` (open notes from the site admins). Product/UI questions: `docs/handbook/README.md`.
> Release work (R1a–R12) follows `docs/development/build-plan.md` section 8 ("Process and status"): specs in `docs/development/specs/`, status table there. Tick or update items here in the same commit as the work.
> Finished work is not kept here; history lives in git.

**Last updated:** 2026-10-15 (R1a–R7 live, main `d056213`; next: R8 Own area).

---

## Current state

- Redesign signed off 13 Oct 2026 (tag `redesign-v9.8.1`), built and released as R1a–R12 one by one.
- **Live:** R1a Identity, R1b Dizains, R2a Header/menus/own-area frame, R2b Behaviour pieces, R3a Group frame, R3b Sazināties/pending/"…", R4 Discovery data, R5a Filters/drawer/cards, R5b Events by day, R6 Panels, R7 Search (with the Session A owner-notes batch).
- **Next: R8 Own area** (Manas grupas, Ziņas in the frame, Paziņojumi page and bell list; migration `add_user_my_groups_seen_at`). Then R9a, R9b, R10 (Citur), R11 (Admin frame), R12 (everything else). Cards, owner decisions OD-01…OD-27 (all decided) and the old → new map are in `build-plan.md`.
- Workflow per release: Opus spec → Sonnet build → Opus review (independent review for migrations and R4-like data work) → reviewer pushes.

## Standing owner rules

- **Pushing:** reviewed work is pushed by the agent itself, never ask (the owner reviews on ejam.lumm.eu). Report afterwards. Before a push: typecheck, eslint on changed files, `npm run i18n:check`.
- **Orchestration:** the main session only plans and delegates; builders are Sonnet, reviewers matched to risk (Opus for auth, migrations, time, messaging). A fresh review session pushes; earlier sessions are never resumed.
- **Design talk:** short, one default per small detail. An owner note first gets a short review/discussion, then a fix. A defect the owner reports is fixed as a class (AGENTS.md / handbook / build plan), not once.
- **Prototype stage:** ejam.lumm.eu is a test server, not production in the security sense. Seed/dev-password sign-ins (`ALLOW_DEV_PASSWORDS`, seed admin accounts) are intended. Builders and reviewers must not fix, flag or report this, nor ask about `AUTH_SECRET` rotation. No real users: no DB backups before migrations, placeholders are fine.
- **No small debt:** anything an agent can fix in about 4 minutes is fixed now. Tell builders and reviewers.
- **The "tree" idea** (https://claude.ai/artifact/KxCiZs1x2Cz31jdJApsmLi) is parked until everything else works.
- **Session hygiene:** start the dev server only via the browser pane (`.claude/launch.json`, config "dev"); only one session may run it. If something already listens on :3000 (`Get-NetTCPConnection -LocalPort 3000 -State Listen`) it is a leftover `next dev`: confirm it is this repo's and stop it. Stop your own server before reporting done. Don't run `npm run build` while dev runs. Switching seed accounts (`owner@local`, `member@local`, …) is fine on localhost, never on ejam.lumm.eu. Native `confirm()` blocks the browser pane: set `window.confirm = () => true` first.

## Waiting on the owner

- `cmv5on08v` (Your own area: one space, like a group): "this is ok, but will still review". Leave open until the owner has looked at R8.
- `cmv85o4gn` (idea): group discovery results visually by place while no filter is set. Parked until R10 ("Kur tu esi?"); needs a discussion first (Riga would push small towns down).
- Nothing else is awaiting an OK: OD-01…OD-27 and the former "Still open 1–18" are decided.

## Open follow-ups not in any release

- BUG `cmv987j9t`: the "Dejas" choice chip in the search/filter is pre-selected before anything is typed; suggestions should appear only after letters are entered (check against R7).
- BUG `cmv988s2d`: `/lv/?city=Riga&category=travel` applies the city but not the category in the initial filters.
- Reporting a person (OD-11): later, after R12; needs migration `add_report_target_user`. Until then only "Ziņot par grupu" and event reports exist.
- Banner picker: one picker (group wizard, group settings, event wizard) replacing the plain URL field in `BasicsSection`: ~6–8 curated Unsplash photos per L1 category (URLs and photographer credit in `lib/constants`) plus "no image" (category-colour tile). "Search for another photo" via a server action needs an Unsplash app and production approval from the owner; follow the Unsplash API rules (hotlink, `download_location`, credit). Mockup and owner OK first.

## Parked ideas

- Event series (recurring events): members-only events only, each date its own event with RSVP per date; public events never recur.
- Private groups with an invite mechanism (today a private group is link-only, "Tikai biedriem").
- Accent-insensitive search ("lugsanu" vs "lūgšanu").
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
- `npm audit`: `deepmerge-ts` inside the Prisma CLI (runs only during migrations, no user input); fixing needs a breaking Prisma change, accepted for now.
