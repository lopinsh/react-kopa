# Execution Handoff: Ejam Kopā

> The living "what's next" list. Read `AGENTS.md` first, then `docs/core_philosophy.md`.
> **How to use:** when starting a session, take the first unchecked item in the current stage. Keep items small (30–60 min), finish them fully, tick them off here in the same commit.
> Previous chunk-based backlog (Chunks 14–21) is retired; history lives in git.

**Last updated:** 2026-10-08

---

## North star

Ejam Kopā is a non-profit, non-addictive place to find people to do things with — a gym buddy in Jelgava, a book club, a choir looking for singers. It removes the social awkwardness of reaching out.

**The core loop:** create a group → be found → join → talk.
Every task is judged by whether it makes this loop work better. If it doesn't, it waits.

## Product decisions (2026-10-08)

- **Groups are the heart; events belong to groups.** Events are for things a group does: public ones anyone can join (concerts, neighbourhood cleanups) and members-only ones (rehearsals). Schema already supports this via `Event.visibility` (`PUBLIC` / `MEMBERS_ONLY`).
- **At-a-glance cards are a core idea, not noise.** A visitor should understand a group without reading the title: colour = category, city, member count (introverts may prefer small groups). "Calm" means making these few signals clear and consistent while removing everything else that competes with them.
- **Moderation matters.** Admin taxonomy tools (tag approval/merge) stay — they keep groups findable as content grows. Not a current priority because they already work.
- **Footer stays, but only with links that lead somewhere real.** No `#` links. One honest About page beats five empty ones.
- **No placeholder features.** Don't build half-features behind links; hide things until they exist.

## Working rules

- Pushing to `main` deploys to ejam.lumm.eu. Before any push: `npm run typecheck`, `npx eslint <changed files>`, `npm run i18n:check`.
- Simple, well-described items here are suitable for a cheaper model session (e.g. Sonnet). Use Opus for design direction, messaging, and anything that "feels wrong" without a clear cause.

## Instructions for the agent working through a stage

- Items in the current stage are **pre-approved** — no separate plan/approval round per item. But if an item turns out bigger than described, ambiguous, or needs a product/architecture decision, **stop and ask** instead of guessing.
- One commit per item; tick the checkbox in the same commit. **Never push** — the stage ends with a review, then the user pushes.
- Items marked **(needs user)** — skip them and list them at the end.
- Verify every fix in the running app (`npm run dev`, both `/lv` and `/en`) — typecheck can't catch raw keys or wrong-language text. If the app can't run locally (see 0.1), say so clearly per item; never report an unverified UI fix as done.
- When finished, report: done items, skipped items, anything surprising you noticed but didn't fix.

---

## Stage 0 — Local setup (needs user, once)

- [x] **0.1 Local environment** (done 2026-10-08). Start of every session: Docker Desktop on → `npm run db:up` → `npm run dev` → http://localhost:3000. DB data persists in the `db_data` volume. Local test accounts: see `DEV_PASSWORDS` in `lib/auth.ts` (e.g. `member@local`, `admin@local`); they only work outside production. Docker Desktop is a per-user install: if `docker` isn't on PATH in an agent shell, use `~/AppData/Local/Programs/DockerDesktop/resources/bin`.
- [x] **0.2 Security: dev passwords worked in production** (fixed and deployed 2026-10-08; user's own real account promoted to ADMIN first). `lib/auth.ts` accepted the hardcoded `DEV_PASSWORDS` (e.g. `admin@local`/`admin`, an ADMIN account) on the live site, and the live DB was seeded via `.github/workflows/seed.yml`. Fixed locally (guarded by `NODE_ENV`); deploy ASAP after confirming the user has another way to sign in to production (own account with a real password, or Google/GitHub). Afterwards consider whether production should hold seed accounts at all.

## Stage 1 — Stop looking broken  (done, deployed 2026-10-08)

Goal: a first-time visitor doesn't bounce. All found in the live-site sweep on 2026-10-08 (logged-out only). Item 1.10 first so the i18n check is green before other translation work.

- [x] **1.1 Footer links.** `components/shell/Footer.tsx`: "Discover" and the language link point to `/explore` (404) → use `/discover` / a real locale switch. Remove all `href="#"` links (Help Center, Guidelines, Contact, social icons, tagline link). Keep: Discover, My Groups, Create Group, About, Privacy.
- [x] **1.2 About + Privacy pages.** Create simple static `app/[locale]/about` and `app/[locale]/privacy` pages (LV + EN text via `messages/*.json`). The cookie banner's "Privacy Policy" link currently 404s. About = short honest "what this is and why", drafted from `docs/core_philosophy.md` in plain warm language — mark it as a draft for the user to rewrite in their own voice. Privacy = only true statements about what the app actually stores (check `prisma/schema.prisma`, auth providers, cookie banner); no invented legal claims; flag it for user review.
- [x] **1.3 Sign-in heading.** `app/[locale]/auth/signin/page.tsx:37` hardcodes "Ienākt" → translation key.
- [x] **1.4 Sign-in return path.** Visiting a protected page (e.g. `/en/create`) logged out lands on sign-in with `callbackUrl` = homepage. Should return to the original page. Also some routes redirect via `/api/auth/signin` and `/messages` via `/[locale]/auth/signin` — unify on the localized page (check Auth.js `pages.signIn` config and `proxy.ts`). Only same-origin relative callback paths may be honoured (no open redirect). Also: signing in from `/en/auth/signin` lands on `/lv/onboarding/username` — the locale must be kept.
- [x] **1.5 Event page translations.** `app/[locale]/[l1Slug]/group/[groupSlug]/events/[eventSlug]/page.tsx` and `components/events/RSVPButtons.tsx`: hardcoded English ("Important Info", "I'M GOING", "Capacity", "About Event", "Add to Google Calendar", "Share event", "Organizer", "Visit community", "Open in maps", "Please be on time…"). Dates must use next-intl formatters (show Latvian dates on `/lv`). Hide "Capacity" when `maxParticipants` is null/0.
- [x] **1.6 Raw key `group.noEvents`.** Group Events tab shows the key itself (`events/page.tsx:106`). Fix the namespace/key.
- [x] **1.7 Plurals & spacing.** "1members", "3biedri", "2pasākumi" in the group header → space + ICU plural messages. Latvian plural categories are `zero` / `one` / `other` (one = ends in 1 but not 11, e.g. 1 and 21 biedrs; zero = 0, 10–20, ends in 0, e.g. 0 biedru; other = 2 biedri). English uses `one` / `other`.
- [x] **1.8 City names with diacritics.** Cards/headers show "Jurmala", "Cesis". Display names should be "Jūrmala", "Cēsis". **Do not change the values in `CITIES`** (`lib/constants/index.ts`) — they are stored in `Group.city`, validated by `z.enum(CITIES)` and used in filters/URLs. Add display names as translations (e.g. `cities.Jurmala` in both message files) and use them wherever a city is shown (cards, headers, filter dropdowns, wizard, settings).
- [x] **1.9 Page titles.** Layout template is `'%s | Ejam kopā'` but pages also append it → "Ejam kopā | Ejam kopā". Group and event pages should have their own name as title (`generateMetadata`).
- [x] **1.10 i18n parity.** `npm run i18n:check` fails: `profile.message`, `shell.footer.about`, `wizard.back`, `wizard.done`, `wizard.next` exist in `lv.json` but not `en.json`.
- [x] **1.11 Real 404 for missing groups.** `/en/dancing/group/nonexistent` returns HTTP 200 with a not-found message → call `notFound()`.
  - 2026-10-08 (agent): pages already call `notFound()`, but the `loading.tsx` files above them (`app/[locale]/loading.tsx` etc.) start streaming first, so Next sends 200 + `noindex` (see `node_modules/next/dist/docs/01-app/02-guides/streaming.md`, "Status codes"). A real 404 needs the group lookup before any Suspense boundary (remove those skeletons, or check in `proxy.ts`). Needs a decision; left open.
  - 2026-10-08 (Opus review, user approved): removed the root and group-level `loading.tsx` (discover/groups keep theirs) and added a localized `app/[locale]/not-found.tsx`. Missing groups/events now return 404, and sign-in redirects are real 307s instead of a meta refresh.
- [x] **1.13 Admin pages translations.** User reports many broken strings on `/lv/admin` (2026-10-08). Sweep `app/[locale]/admin/**` for raw keys and hardcoded text (sign in locally as `admin@local`).
- [x] **1.14 Proxy matcher.** `proxy.ts` matcher `(?!.*api|…)` skipped every URL containing "api" anywhere (e.g. `capital-runners`, *terapija*) — no locale redirect, no onboarding intercept. Anchored to `/api/` only.
- [x] **1.15 Privacy copy for a live work-in-progress.** Cookie banner no longer claims traffic analysis; About drops the draft notice; Privacy notice and "your data" section reworded to stay true without "draft" wording. Still open: a public contact for data requests (needs user).
- [~] **1.12 Junk test groups** ("sdfasdfasdf", "hhhhhh", "gcbdchbdfhd") — moved to Stage 2.0b. They are owned by the seed `admin@local`, which cannot sign in on production, and only owners can delete groups. Seed groups stay on production as test content.

### Stage 1 review notes (agent, 2026-10-08)

Commits: `git log --oneline f893691..HEAD`. Done: 1.1–1.11, 1.13–1.15. Open: none (1.12 moved to 2.0b; Privacy contact address deferred by user). Reviewed by Opus: typecheck, i18n parity, production build pass; no new lint errors in changed files; open-redirect guard probed. Highest-risk change: auth redirects (`lib/auth-redirect.ts`, `proxy.ts`, sign-in page, `UsernameForm`).

Noticed, not changed:
- On a 404 under `/group/…` the desktop sidebar still shows the group menu (Informācija / Pasākumi) linking to the missing group.
- Sign-in and register pages are still mostly hardcoded English (only the heading was fixed).
- Event page "Share event" button has no handler. Taxonomy inbox "Reject" is an unimplemented placeholder (alert only).
- Search-dropdown subtitles (`discovery.service.ts`) still show raw city values.
- Event page times use `Europe/Riga` explicitly (agent's choice; `i18n/request.ts` default is UTC).
- `/discover` just redirects to `/`; footer links to `/` directly.
- "Please be on time…" on events is English seed data, not code.
- Local DB only: `admin@local` now has username `admin_local` (set while testing onboarding return path).

## Next session (Opus) — review of the 2026-10-08 Sonnet session

Session rules learned on 2026-10-08 (apply to every session):
- Workflow: Opus plans a task → Sonnet implements and reports here → a **new** Opus session reviews, fixes, and pushes. Earlier sessions are never resumed, so whatever they left running is orphaned.
- Start the dev server only via the browser pane (`.claude/launch.json`, config "dev"). Two dev clients on localhost make each other reload endlessly, so only one session may run it.
- **End of session:** stop your dev server (`preview_stop`) before reporting done.
- **Start of session:** if something already listens on :3000 (check with `Get-NetTCPConnection -LocalPort 3000 -State Listen`), it is a leftover `next dev` from an earlier session — stop it with `Stop-Process -Id <pids> -Force` (allowed via `.claude/settings.local.json`; confirm the command line is this repo's `next dev` first), then start your own.
- Don't run `npm run build` while the dev server is running; stop it first (a build alongside dev left the watcher stale and served old translations).
- Switching between **local seed accounts** in the browser pane (sign out / sign in as `owner@local`, `member@local`, …) is fine on localhost. Never do it on ejam.lumm.eu.
- Most seed accounts have no username, so they land on `/onboarding/username` after sign-in (pre-filled) — expected.

Review `git log --oneline 004a5b0..HEAD` (commits: `d197cab` 2.0b moderation, `16d7d44` 2.1 wizard, `272a493` 2.2/2.3 join + privacy fix, `e0e8d85` taxonomy Reject, plus an Opus review fix on top). Typecheck and i18n parity pass; each item was clicked through locally (dev server, `admin@local` / `member@local`). **Reviewed by Opus and pushed 2026-10-08** — no blockers. Follow-ups found in review, fixed the same day: `/admin` form actions now return to their tab with a translated error banner (`?error=CODE`); a report reason is trimmed/padded to the 5–500 char hide rule; `hideGroup`/`restoreGroup` update + log run in one transaction; notifications no longer hardcode English `'Someone'` (empty `authorName` → `notifications.someone`); `AdminAction.admin` is optional with `SetNull` (migration `update_admin_action_admin_relation`), so the log survives a deleted admin.

**User report (2026-10-08, later):** as admin they saw no UI to hide a group; "Apturēt grupu" on a report left the group visible and reachable; they could approve suggested sub-categories but not dismiss them. Diagnosis: `main` is 5+ commits ahead of `origin/main` (nothing pushed), so they were almost certainly on production with the *old* code — there "Apturēt grupu" only set `type = PRIVATE` (which still leaves the page reachable by URL) and no Hide menu exists. Confirm with the user which environment they tested; after deploy, re-test hide (··· menu on a group page you don't own, and Reports → Apturēt grupu, which now hides). The Hide item is hidden for groups the admin owns and is buried in the ··· menu — consider making it more discoverable.
Dismissing suggestions was a real bug, fixed in `e0e8d85`: the taxonomy inbox "Reject" was an alert-only placeholder, and `/admin` Reject failed whenever any group used the tag. Rejecting now detaches the tag from its groups and deletes it, in one transaction; only pending suggestions can be rejected, and a tag that is some group's *primary* category or has child categories is refused (translated error in the taxonomy inbox and on `/admin`). Opus review (2026-10-08): verified via script and clicked through in the taxonomy inbox (EN desktop, LV mobile) — tag detached from its group and deleted, toast shown. Same review fixed the inbox card's "Submitted by … on {date}" (raw key shown because a Date was passed to a plain `{date}` argument) and its button row overflowing on mobile.

**Review focus (highest risk first):**
- `lib/services/group.service.ts` `getGroupWithContext`: now hides hidden groups from non-admins, an extra `user.findUnique` per request, and filters PENDING members/application messages for non-admins. Check nothing relied on pending members being in `members` for non-admins (e.g. the applicant's own "Requested" state uses the membership looked up *before* filtering).
- `hiddenAt: null` coverage — added to discovery search/listing, global event discovery, event page, `getUserMemberships`, `getMyGroups`, profile groups, `app/[locale]/groups/page.tsx`. Not covered: `getGroupRole`, `getGroupSlugs*`, post/message services, `unstable_cache` keys (revalidated via tags `groups`/`events` on hide/restore).
- `moderation.service.ts` + `actions/moderation-actions.ts`; `AdminService.suspendReportedGroup` now delegates to hide (uses the report text as reason, prefixes "Reported:" if under 5 chars).
- `joinGroup` now notifies OWNER/ADMIN (`JOIN_REQUEST`) and rejects when `isAcceptingMembers` is false (`JOIN_FAILED`).

**Product direction stated by the user (2026-10-08) — implement/decide next:**
- **Public** = listed, findable via filters and search. **Private** = invite only; a non-invited user cannot join. Whether request-to-join changes is still undecided (groups can toggle `isAcceptingMembers` even when public). Today every join needs approval and there is no invite mechanism; the wizard text "Anyone can see and join" for Public is misleading.
- A hidden or private group stays reachable by its exact URL (intended). Note hidden-by-moderation is different: it 404s for non-admins by design — confirm that is still wanted given this statement.
- Search (diacritics: "lugsanu" vs "lūgšanu") is **deferred to its own session**.

**Still open:** header ⌘K search overlay is a visible placeholder (hide or build); sidebar Requests badge stale after approve; dev-only sidebar flash on mobile; user to hide the three junk groups on production once the bug above is solved; one real sign-up on production (2.0).

Next in line after review: 2.4 messaging (fragile — own session), then 2.5 events.

## Stage 2 — Walk the loop  ← CURRENT

Goal: each step of create → find → join → talk works end to end, logged in, on desktop and mobile. User signs in in the browser; agent tests and fixes. Expect messaging to be the fragile part (8 "final fix" PRs in May 2026; `actions/message-actions.ts` and `lib/services/message.service.ts` have the most lint errors).

- [ ] 2.0 Sign up (user feedback 2026-10-08 after registering on production):
  - Registration has no "repeat password" field — add confirmation (shared Zod schema, both client and server).
  - User wants two separate fields: a **display name** ("Oskars Feldmanis", capitals and spaces allowed, shown everywhere) and a **username/handle** auto-generated from it ("oskars_feldmanis", Latvian diacritics transliterated, editable, uniqueness checked). Today `actions/auth.ts` takes `name` and `app/[locale]/onboarding/username` asks for the handle separately, and in practice the user ended up entering the handle where they expected their name — investigate the actual flow before changing it.
  - 2026-10-08 (Opus): implemented. One register form: name → auto username (transliterated, editable, live availability, free `name2` suggestion), email, password (min 8) + repeat. Shared `registerSchema`; usernames lowercase and unique ignoring case; email matched ignoring case at sign-in. OAuth users get a pre-filled username on onboarding. Sign-in/register fully translated.
  - Verified in browser: form validation, auto username + taken handling, both locales, mobile. Service paths (create, duplicate email/username) verified against the local DB. **Not yet clicked through:** a full successful sign-up and the onboarding page with a username-less account — user to try once on localhost or right after deploy.
- [x] 2.0b Moderation (done 2026-10-08, verified locally: hide → 404 + gone from discovery + owner notified + log; restore works. **Still for the user:** hide the three junk groups on production after deploy): site admins can remove any group (decided 2026-10-08). Safeguards over role tiers, since the user is the only admin today:
  - **Hide, never hard-delete:** admin removal sets a hidden state (restorable); permanent delete stays owner-only. Hidden groups disappear from discovery and return 404 to non-admins.
  - **Reason required**, shown to the owner via a notification.
  - **Admin action log** (who, what, when, reason), viewable in `/admin`; also covers the existing admin power to edit any group (`isAppAdmin` in `group.service.ts`).
  - Then hide the three junk groups from 1.12 via the UI.
  - Later, when someone else moderates: add a `MODERATOR` role (hide groups, handle reports); `ADMIN` keeps role management, taxonomy and the log. Not now — no half-features.
  - **Spec (follow it; stop and ask if it doesn't fit):**
    - One migration `add_group_moderation`: `Group.hiddenAt DateTime?`, `Group.hiddenReason String?`, `Group.hiddenById String?` (optional relation to `User`); new model `AdminAction { id, adminId → User, action String (GROUP_HIDE | GROUP_RESTORE | GROUP_EDIT), targetType String, targetId String, reason String?, createdAt }`.
    - New `lib/services/moderation.service.ts`: `hideGroup(groupId, adminId, reason)`, `restoreGroup(groupId, adminId)`, `listActions(limit)`. Service checks `User.role === 'ADMIN'`, writes the `AdminAction` row and notifies the group owner(s) via `NotificationService.createNotification` (reason in the message, translated title key). Reason: required, 5–500 chars, Zod schema in `lib/validations`.
    - Hidden groups: filter `hiddenAt: null` in every public group query — currently ~14 `prisma.group.find*/count` calls in `group.service.ts`, `discovery.service.ts`, `event.service.ts`, `admin.service.ts` (grep them; decide per call). Events of hidden groups disappear with them. Group page: non-admins get `notFound()`; admins see a banner ("Hidden: <reason>") with a Restore button.
    - UI: on the group page, admins (not group owners) get "Hide group" in the existing settings/menu area → small modal with reason textarea. `/admin` gets a "Moderation log" list (latest 50 actions, admin name, action, target link, reason, date).
    - `updateGroup` by an app admin who is not a group admin/owner also writes a `GROUP_EDIT` action.
    - Done when: hide → group gone from discovery/search for a normal user (404 on its URL), owner has a notification, log shows it; restore brings it back. Then the **user** hides the three junk groups on production.
- [x] 2.1 Create a group (wizard), both locales (2026-10-08: walked all 4 steps on desktop EN; LV + mobile step 1 checked. Fixed: city error showed raw Zod text; invalid URL errors were untranslated/invisible on Social step; banner URL wasn't validated before advancing; server error showed a raw code. Created group redirects to its page.)
- [x] 2.2 Find it via discovery (category, city, search) (2026-10-08: category, city, combined and text search all work in EN/LV, desktop + mobile; new group appears immediately. **Decisions needed:** search is diacritic-sensitive — "lugsanu" does not find "lūgšanu" (Postgres `unaccent` or a normalised column?); the header ⌘K search overlay is a visible placeholder ("Global Search … placeholder") — hide it or build it, Stage 3.4.)
- [x] 2.3 Join as a second user (2026-10-08: member@local → onboarding → back to group → apply with message → owner notified → approved on Requests tab → member notified, role MEMBER. Fixed: owners/admins were never notified of join requests; server ignored `isAcceptingMembers`; application modal swallowed errors; **privacy leak** — group page payload sent applicants' messages and pending members to anonymous visitors (now admin/applicant only). **Decisions needed:** every join needs approval, but the wizard says Public = "Anyone can see and join" — either add an open-join option or reword; PRIVATE groups are hidden from discovery but their page is fully readable by URL; sidebar Requests badge stays stale after approving until reload.)
- [ ] 2.4 Talk: group inquiry / DM between members, notifications
- [ ] 2.5 Events: create public + members-only event, RSVP, check visibility rules

## Stage 3 — Make it calm

Goal: content first. One screen at a time; agree direction with the user before each.

- [ ] 3.1 Discovery cards — sharpen at-a-glance signals (category colour, city, size), drop the rest; fix missing-image grey cards; mobile filter bar overflow
- [ ] 3.2 Group page
- [ ] 3.3 Event page — currently stacks full group header + oversized hero with unreadable title
- [ ] 3.4 Header / navigation / footer

## Stage 4 — Invite real people

- [ ] 4.1 User creates their own real group (e.g. gym in Jelgava) and invites a few people; collect what confuses them

---

## Known code debt (fix when touching nearby code, not as a project)

- ESLint (2026-10-08): 88 errors / 138 warnings — mostly `no-explicit-any` (59) and `no-html-link-for-pages` (18 raw `<a>` causing full reloads).
- From the 2026-03 audit (unverified, file removed — see git history): Service Law violations in some actions, orphaned `app/[locale]/groups/` route, accent colour prop-drilling/inline styles, five modals mounted in `GroupHeader`.
- `package.json` `overrides` pins `@swc/core` to 1.15.47 (pulled in by next-intl's plugin). 1.16.x refuses to start on the user's Windows machine because of a cache-folder permission check (`ERR_SWC_NATIVE_CACHE`), breaking `npm run dev` and `npm run build`. next-intl is held at 4.13.x for the same reason (4.14 requires SWC ~1.16). Revisit when SWC relaxes the check.
- Remaining `npm audit` runtime finding: `deepmerge-ts` inside the Prisma CLI (only runs during migrations, no user input); fixing needs a breaking Prisma change — accepted for now.
- Unfinished from the taxonomy work: `/admin/groups/[groupSlug]/categorization` override route.
