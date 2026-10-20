# Execution Handoff: Ejam Kopā

> The living "what's next" list. Read `AGENTS.md` first, then this file, then run `npm run feedback` (open notes from the site admins). Product/UI questions: `docs/handbook/README.md`.
> Release work follows `docs/development/build-plan.md` section 8 ("Process and status"): specs in `docs/development/specs/`, status table there. Tick or update items here in the same commit as the work.
> Finished work is not kept here: it moves to `docs/archive/` (latest: `execution_handoff_2026-10-20.md`, the 15 Oct notes batch, R9a–R11b and quick batches 2–3).

**Last updated:** 2026-10-20 (everything up to R13 live; R14 spec written; R10 cancelled).

---

## Current state

- Redesign signed off 13 Oct 2026 (tag `redesign-v9.8.2`), built release by release.
- **Live:** R1a–R9c, R6b, C2, C4, R11 (a + b), R13 Templates, quick batches 1–3, accent-insensitive search.
- **Cancelled:** R10 Citur and "Kur tu esi?" (owner, 19 Oct). Its rule AR-38 stays unbuilt; discovery keeps starting on "Visur".

## What's next (in this order)

1. **R14 Kopā** (spec `docs/development/specs/R14.md`, written and approved): R14a faces (Facepile, "Eju · N" with faces, faces on group cards), then R14b ("Šonedēļ" strip, Informācija reorder, 3:1 picture). No migration.
2. **R12 Everything else**, the last redesign release: sign in, register, username, create-group wizard, Par mums, Privātums, 404, cookie banner, delete account (OD-27). Needs its spec.
3. **After R12:** reporting a person (OD-11, `add_report_target_user`), the banner picker (see Open follow-ups).

Workflow per release: spec agent → builder → reviewer (Opus for auth, migrations, time, messaging; Sonnet otherwise) → the reviewer pushes. Explain each release and get the owner's OK before its spec and build.

## Owner notes with no release yet

Open in `npm run feedback`; each needs a short discussion before it gets a home.

- `cmv9q3gb6` discovery cards don't show which groups you belong to (use the Manas grupas mark). Fits R14a, which already changes group cards.
- `cmvamisxc` getting back to discovery and to your groups is hard away from the main page (bottom bar, header).
- `cmv9uw02g` an "admin mode" for a group: edit only when switched on, view the page as member / non-member.
- `cmv9kcok8` Manas grupas: each part gets a visible heading matching its tab.
- `cmv9kj0qc`, `cmv9l90i3` (ideas): Manas grupas as an upcoming schedule; "Mans saturs" as the own area's landing page.
- R13 leftover: `font-serif` headings (AdminPageHeader and five more) ignore the theme's heading font.
- `cmv9addnl` ("Tikšanās nav izziņota") is answered by C2 (live) and can be closed.

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
- `cmv85o4gn` (idea): group discovery results visually by place while no filter is set. Was parked for R10, which is cancelled; parked with it.
- No owner decision is open: OD-01…OD-27 are decided.

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

- Possible Service Law violations in some actions and accent-colour prop-drilling (unverified, from a 2026-03 audit). Components over 150 lines (listed in `build-plan.md` section 6) are split when touched.
- `package.json` `overrides` pins `@swc/core` to 1.15.47 (pulled in by next-intl's plugin). 1.16.x refuses to start on the owner's Windows machine (`ERR_SWC_NATIVE_CACHE` cache-folder permission check), breaking `npm run dev` and `npm run build`. next-intl is held at 4.13.x for the same reason (4.14 needs SWC ~1.16). Revisit when SWC relaxes the check.
- A hidden leftover streamed copy `div#S:0[hidden]` stays in group subpages (settings in prod), duplicating ids; cause unknown.
- The accent-insensitive search sends every matching id back into the query uncapped: fine at prototype scale, move the match into one query before real scale.
- `npm audit`: `deepmerge-ts` inside the Prisma CLI (runs only during migrations, no user input); fixing needs a breaking Prisma change, accepted for now.
