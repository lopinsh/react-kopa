# Execution Handoff: Ejam Kopā

> The living "what's next" list. Read `AGENTS.md` first, then `docs/core_philosophy.md`.
> **How to use:** when starting a session, take the first unchecked item in the current stage. Keep items small (30–60 min), finish them fully, tick them off here in the same commit.
> Previous chunk-based backlog (Chunks 14–21) is retired; history lives in git.

**Last updated:** 2026-10-09

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

## Screen map

Every screen, grouped by the step of the core loop it serves. Update the row when a screen changes. **Status:** ✅ works and fits · 🟡 works, needs polish/decision · ❌ not walked end to end · 🧱 placeholder or dead. **Decision** (keep / fix / hide / remove) is agreed with the user; "proposed" = not agreed yet.

| Step | Screen | Route / component | Who | Status | Decision · next |
|---|---|---|---|---|---|
| Find | Discovery – groups | `/` (`?tab=groups`) | everyone | 🟡 | keep · 3.1 at-a-glance cards (grey no-banner cards, "Active" badge, tab title) |
| Find | Discovery – events | `/?tab=events` | everyone | ✅ | keep · paging later |
| Find | Search (filter-bar input + dropdown) | `DiscoveryFilterBar`, `searchContextual` | everyone | 🟡 | proposed: replace with one search modal (see search discussion) · accents later |
| Find | Header ⌘K search modal | `GlobalSearch.tsx`, `SearchModal.tsx` (unused) | — | 🧱 | proposed: becomes the real search modal |
| Find | `/discover`, `/groups` | redirect / orphan "my groups" copy | — | 🧱 | **remove `/groups`** (2.11) |
| Create | Create group wizard (4 steps) | `/create` | logged in | ✅ | keep · banner upload later |
| Join | Group page – About | `[l1]/group/[g]` | everyone | 🟡 | keep · 3.2 header (white title on light banner, blank role pill) |
| Join | Apply / withdraw | `ApplicationModal`, `MembershipPanel` | visitors | ✅ | keep · "Join X" → "Ask to join X" |
| Join | Auth gate | `AuthGateModal` (join button, discussions, mobile nav) vs sign-in page link (events) | visitors | 🟡 | **pop-up everywhere incl. events + add "Create account"; keep sign-in page** (see Sign-in decision) |
| Join | Sign in / Register / Onboarding | `/auth/*`, `/onboarding/username` | visitors | 🟡 | keep · user to click through one real sign-up (2.0) |
| Talk | Discussions | `[g]/discussions`, `DiscussionBoard` | members | ❌ | 2.4 |
| Talk | Ask the group (before joining) | `InquiryModal`, `SupportMessageModal` | visitors/members | ❌ | 2.4 |
| Talk | Messages / inbox | `/messages`, `MessagesLayout` | members | ❌ | 2.4 |
| Talk | Group-level messages page | `[l1]/messages` | — | 🧱 | **remove** (2.11) |
| Talk | Notifications | `NotificationCenter` (header) | members | ✅ | keep |
| Group life | Members + requests | `[g]/members` | members/admins | 🟡 | keep · stray "Private" text |
| Group life | Events tab | `[g]/events`, `EventRow`, `CompactGroupBar` | everyone | ✅ | keep |
| Group life | Event page + organiser panel | `[g]/events/[e]` | everyone | ✅ | keep · edit/delete missing (2.10) |
| Group life | Create event | `[g]/create-event` (modal + page) | organisers | 🟡 | keep · hide link-name field (2.10) |
| Group life | Group settings (6 tabs) | `[g]/settings` | owner/admin | 🟡 | keep · review together |
| Group life | Sections editor | `GroupSectionEditor` (settings tab) | owner/admin | 🟡 | **keep — core feature** (see Sections decision: all content as sections, first section fixed) |
| Group life | Report / hide group | `ReportModal`, `HideGroupModal` | any / admin | ✅ | keep |
| Me | Own profile | `/profile` | members | 🟡 | keep · **remove static "Events attended"** (2.11) |
| Me | Public profile | `/profile/[username]` | everyone | ✅ | keep · message button after 2.4 |
| Me | Edit profile | `/profile/edit` | members | ✅ | keep (new avatars) |
| Me | My groups | `/profile/my-groups` | members | ✅ | keep |
| Shell | Header + user menu | `Header`, `UserMenu` | everyone | 🟡 | 3.4 |
| Shell | Group sidebar + tab bar | `Sidebar`, `GroupTabs` | group pages | 🟡 | 3.4 · two navs for the same pages |
| Shell | Mobile bottom nav | `MobileNav` | everyone | 🟡 | 3.4 |
| Shell | Footer | `Footer` | everyone | 🟡 | 3.4 · "About" twice, second language switch |
| Static | About / Privacy / Cookie banner | `/about`, `/privacy`, `CookieConsent` | everyone | 🟡 | keep · About in owner's voice, Privacy contact (user) |
| Admin | Dashboard (tags, reports, moderation log) | `/admin` | admin | 🟡 | keep · duplicate nav row |
| Admin | Reports | `/admin/reports` | admin | ✅ | keep |
| Admin | Taxonomy | `/admin/taxonomy` | admin | ✅ | keep |
| Admin | Categorization override | `/admin/groups/[g]/categorization` | admin | 🟡 | keep · opened from the tag inbox ("used by groups") so an admin can re-tag a group; check it works |

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

## Session rules (every session)

- Workflow: Opus plans a task with the user → Sonnet implements and reports here → a **new** Opus session reviews, fixes, and pushes. Earlier sessions are never resumed, so whatever they left running is orphaned.
- Start the dev server only via the browser pane (`.claude/launch.json`, config "dev"). Two dev clients on localhost make each other reload endlessly, so only one session may run it.
- **Start of session:** if something already listens on :3000 (`Get-NetTCPConnection -LocalPort 3000 -State Listen`), it is a leftover `next dev` from an earlier session — confirm the command line is this repo's `next dev`, stop it with `Stop-Process -Id <pids> -Force` (allowed via `.claude/settings.local.json`), then start your own.
- **End of session:** stop your dev server (`preview_stop`) before reporting done.
- Don't run `npm run build` while the dev server is running; stop it first (a build alongside dev left the watcher stale and served old translations).
- Switching between **local seed accounts** in the browser pane (sign out / sign in as `owner@local`, `member@local`, …) is fine on localhost. Never on ejam.lumm.eu. Most seed accounts have no username and land on `/onboarding/username` (pre-filled) — expected.
- Native `confirm()` dialogs block the browser pane; when testing, override `window.confirm = () => true` via the JS tool first.

## Product decisions (2026-10-08, later)

- **Joining always needs approval** — public or private. No instant join ("can get out of control fast"). Owners can still close a group to new requests (`isAcceptingMembers`).
- **Public** = listed and findable via filters and search; anyone can request to join.
- **Private** = invite only. A non-member opening its URL sees a short card only (name, category, city, member count, "invite only") — no description, posts, events, members, no join button. Needs an invite mechanism first → Opus queue.
- **Hidden by moderation:** the owner can still open their group and sees "Hidden by a site admin: <reason>" (no restore button); everyone else except site admins gets 404.
- **Existing features need a quality pass.** Many were added as placeholders without attention to detail or to how they fit the whole site. Before polishing (Stage 3), take an inventory (2.7), then decide per feature with the user: keep & fix / hide / remove.
- **Notifications** (redone 2026-10-08): one compact layout for all types — group · time, one headline with the person's name, then the content itself (their message, post excerpt, event title, hide reason). Keys: `notifications.headline.<TYPE>`; the text someone wrote goes in the `excerpt` arg (trimmed to 160 chars by `NotificationService`). New notification types must follow this.

- **Events** (decided 2026-10-08):
  - Two independent settings. **Visibility** = who can see the event: *Public* (everyone, incl. logged out, discovery and search) or *Members only* (group members only — on the Events tab **and** in discovery/search; everyone else 404). **Join mode** = how people take part: *Open* or *Request to join*. Any combination is allowed.
  - **Open:** button "I'm going" (count shown, to encourage others). The size number ("About how many people?") is context only — never blocks, going count may exceed it. Instructions visible to everyone who can see the event.
  - **Request to join:** button "Request to join" → pending → organiser approves/declines. Description is visible to everyone who can see the event; **instructions only to approved people and organisers** (stripped server-side). Organiser can manually mark the event **"Full"** (and unmark it). Never automatic. When Full, the button becomes "Join waitlist"; organiser sees the waitlist in join order and lets people in by hand. If an approved person cancels while Full, the organiser is notified (with waitlist size). Unmarking Full keeps the waitlist and notifies waitlisted people that there is room again (they request again / organiser lets them in).
  - **"Interested" is removed.** Wording must fit any event type (rehearsal, birthday, hike): no seats/tickets/places — people and joining.
  - **Recurrence:** later, members-only events only (public events never recur — no abandoned public series). Planned as a real series (each date its own event, RSVP per date). Until then the wizard has no recurring option.

- **Group sections are a core feature** (user, 2026-10-09): owners build their group page from several sections, each shown as its own part of the page, to cater to different needs. Never remove or merge them away. **Intent:** everything on the group page is sections. The **first section ("About us") is fixed** (user, 2026-10-09): always public, can't be deleted or moved — it describes the group to people who haven't joined yet and is the group's summary (cards, discovery). Other sections are free. "Instructions" was meant as a *sample section* the owner can rename/rewrite, not a separate field.
  - **Today (rechecked 2026-10-09):** a new group gets exactly one section, "About us", from the wizard description; its title is stored in English, so `/lv` shows English. There is **no** instructions field in the wizard and **no** Instructions tab (`needsInstructions` in `GroupTabs.tsx` is never set — dead code). `Group.instructions` is a legacy field, only shown as a virtual section for old groups without sections. `deleteSection` locks the first section — correct, keep.
  - **Default titles are multilingual** (user, 2026-10-09): default section titles show in the *visitor's* language until the owner renames them; owner-written text is shown as written, never auto-translated.
  - **Sample second section: yes** (user, 2026-10-09): the wizard also creates "Practical info" (members-only; short sample text — when/where you meet, what to bring — that the owner rewrites or deletes). Then move legacy `Group.instructions` content into a section and remove the field and the dead `needsInstructions` tab code.
  - **Multilingual owner text** (approved 2026-10-09: sections **and events together**; fallback = show the available language with a label so browser translation tools can handle it). Built in 2.13a–c:
    - Data: new table `GroupSectionTranslation { sectionId, lang (lv|en), title, content, updatedAt }`, unique per section+lang (same pattern as category titles); `GroupSection.originalLang`. Default sections get titles in both languages at creation; sample text only in the owner's language.
    - Visitors: their language if present, else the original with a small label ("Latviski" / "In English") and a `lang` attribute on the text.
    - Owner (sections editor): LV | EN switch per section with a filled/empty dot; empty language shows "Not translated yet — visitors see the Latvian text" + "Start from the Latvian text" (copies the original). Original language set from the owner's locale, changeable.
    - Scope: sections first; event title/description later with the same pattern; group names stay as typed; no machine translation; search covers all languages.
    - Migration: existing section text → `lv` rows; existing "About us" titles → default titles in both languages.
- **Sign-in** (user, 2026-10-09): keep the **pop-up** for actions inside the site (join, post, mobile nav) so people stay on the group page; add a **"Create account"** link to it (registration must also return the person to where they were). Event pages switch to the pop-up too (user, 2026-10-09). Keep the **sign-in page** for direct visits, the header Sign in button and protected URLs. Goal: one streamlined flow — both should share the same form and wording. Details in the screen review.
- **Past events look finished** (proposed 2026-10-09, awaiting user OK): event page notice "This event took place on …", greyed banner, no join button, "N went"; greyed Past-tab rows; organiser panel hidden.

## Opus queue (not for Sonnet)

- 2.4 Messaging: group inquiry, DMs, conversations — fragile, own session.
- Decisions on the 2.7 feature inventory, together with the user.
- Event recurrence as a series (members-only events only) — after 2.10.
- **Later, not planned (user, 2026-10-09):** private groups with invites; accent-insensitive search ("lugsanu" vs "lūgšanu"). They come when the site feels stable.
- ~~Realtime on production~~ — fixed 2026-10-08 (Opus + user): Soketi had been running with its default `app-key`/`app-secret` (the `SOKETI_*` lines were missing from the server `.env`), and the browser bundle pointed at `soketi`. Now: real `SOKETI_APP_ID/KEY/SECRET` in `/root/ejam-kopa/.env`, GitHub secret `NEXT_PUBLIC_PUSHER_KEY` = the new key, Nginx Proxy Manager routes `/app/` on ejam.lumm.eu → `192.168.0.34:6001` (Advanced tab, WebSockets on), browser build baked with `ejam.lumm.eu:443` TLS. Verified: default key rejected, new key connects over `wss://`, admin hide works. GitHub secrets `NEXT_PUBLIC_PUSHER_HOST/PORT` are unused now (can be deleted).
- Minor, unexplained: dev-only sidebar flash on mobile.

**For the user (production):** check `/admin` → Moderation that all three junk groups are hidden (hide worked after the realtime fix, 2026-10-08); do one real sign-up (2.0).

## Next session A — Screen review prep (Sonnet, read-only)

**Done 2026-10-09.** Artifact: https://claude.ai/artifact/FDMvHXWVVQKayoP7o1UEbD (private). Re-capture: dev server on :3000, then `CHROME_PATH=<chromium exe> npx tsx scripts/screen-review/capture.ts [filter]`. Screens not fully captured: onboarding (all seed accounts have usernames), second-section editor states (test group has one section), the open message-member modal.

Goal: gather facts so the user and Opus can review every screen together in one sitting. **Report facts, not fixes or opinions** — change no app code.

1. Start Docker, `npm run db:up`, dev server via the browser pane (session rules). Use the local seed accounts (`DEV_PASSWORDS` in `lib/auth.ts`): logged out, `user@local` (non-member), `member@local`, `owner@local` (group owner), `admin@local` (site admin).
2. Write a Playwright script `scripts/screen-review/capture.ts` (run with `npx tsx`; sign-in through the credentials form) that screenshots every screen in the **Screen map** at desktop (1440×900) and mobile (390×844), in `/lv`, as each role that can see it (skip combinations that just redirect). Include open states that matter: join modal, create-event modal, notifications open, user menu open, mobile filter sheet, organiser panel, each group-settings tab, each section in the sections editor. Save to `screen-review/` (add `/screen-review/` to `.gitignore`). Name files `<step>-<screen>-<role>-<width>.png`.
3. Publish one **private Artifact** "Screen review" (load the artifact skills first; upload the screenshots as assets). One block per screen, ordered by the Screen map steps (Find → Create → Join → Talk → Group life → Me → Shell → Static → Admin). Per screen:
   - desktop + mobile screenshot (click to enlarge);
   - **who** sees it and what changes per role;
   - **what's on it**: main elements and every action (button/link → where it goes or what it does);
   - **how you get here** (which screens link to it) and **where you go next**;
   - **facts noticed**: untranslated text, dead or duplicate controls, broken layout, inconsistent styling vs. other screens, empty states. One line each, no proposals.
4. Add a final block "How it fits together": a simple diagram of screens and the links between them (from step 3).
5. Commit only the script and `.gitignore` (one commit, never push). Put the Artifact link here under this heading, stop the dev server, report.

## Next session B — Screen review with the user (Opus)

Prompt to start with: *"Read AGENTS.md, docs/execution_handoff.md (Screen map, product decisions) and docs/core_philosophy.md. Open the 'Screen review' Artifact linked under Next session A. Walk the screens with me one loop step at a time (Find → Create → Join → Talk → Group life → Me → Shell → Static → Admin). For each screen: summarise what it does and the facts noticed in 2–3 lines, give one recommendation (keep / fix / hide / remove, plus the one change that matters most), and wait for my answer. Keep it short: one default per small detail, questions only for real product decisions. Record each agreed decision in the Screen map's Decision column as we go, and turn agreed fixes into small numbered Sonnet items in the right stage. Open questions to settle along the way: search as one modal with ready-made options (categories, cities, next events) replacing the filter-bar input; sign-in pop-up details (Create account link, return path; events pages move to the pop-up); sections as the only group content (sample second section yes/no, removing legacy `Group.instructions`); past-event look; group settings tabs."*

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
- [ ] 2.4 Talk: group inquiry / DM between members, notifications → **Opus queue**, not Sonnet.
- [x] 2.5 Events, walk and fix (2026-10-08, Sonnet; verified locally as owner/member/logged-out, EN + LV, desktop + mobile). Fixed: the event wizard had **no translations at all** (`eventWizard` namespace missing → raw keys) — added both locales, translated Zod errors, empty start date no longer slips through, invalid max participants shows an error, duplicate link name gives `EVENT_SLUG_TAKEN`; members-only events were readable by URL and listed on the group Events tab for everyone → now 404 / hidden for non-members and logged-out (site admins see them); RSVP did not check membership for members-only events, hidden groups, and capacity counted INTERESTED → now `MEMBERS_ONLY` / `EVENT_NOT_FOUND`, capacity counts GOING only (`EVENT_FULL` shows a translated message); RSVP errors were swallowed; logged-out visitors now get a sign-in button instead of dead RSVP buttons; group events list: missing keys `group.attendButton/attending/createEvent` (raw keys), card arrow button was dead (now links to the event), card dates now via next-intl in Europe/Riga, "Members only" badge, user's own RSVP no longer lost when they were not among the first 5 attendees; event page: dead mobile ⋯ button removed, Share button works (2.6c), create-event subtitle translated. Public events appear in global discovery; members-only never do.
  - **Decisions needed / not built:** (1) ~~Time zone bug~~ — not a bug (Opus review 2026-10-08): `zodResolver` converts the `datetime-local` value to a `Date` in the *browser*, and the server action receives that instant, so the server's time zone does not matter. Only an organiser whose browser is outside Latvia would enter times in their own zone; low priority. (2) No edit/delete event UI, though `updateEvent` exists. (3) Past events can still be RSVPed to. (4) No event notification when RSVPing to the organiser. (5) The slug field is shown to users (auto-filled on blur) — hide it? (6) Group header's `eventCount` includes members-only events for outsiders. (7) Event page still stacks the full group header over its own hero (3.3).
  - Original brief: test-and-fix like 2.1–2.3; EN + LV, desktop + mobile; as `owner@local`, `member@local` and logged out):
  - As group owner create one **public** and one **members-only** event (all form fields; validation errors translated; dates via next-intl formatters).
  - Members get a `NEW_EVENT` notification showing the event title (check it renders; don't redesign notifications).
  - RSVP as a member; change/cancel RSVP; capacity (`maxParticipants`) respected with a translated error; RSVP count updates.
  - Visibility: members-only events must not appear for non-members or logged-out users — group Events tab, global event discovery, direct event URL (404 or a clear "members only" state — use what the code already intends and report which). Public events visible to everyone.
  - Events of a hidden group disappear with it.
  - Fix what's broken if small; **list** anything needing a product decision (past events, editing/deleting events, time zones…) instead of building it.
- [x] 2.6 Small fixes (2026-10-08, Sonnet; a–h all done and checked in the running app: header without search, badge clears after approving, share (done with 2.5), 404 without group menu, owner sees hidden banner without Restore, notification links use `l1Slug`; wizard/settings Public text reworded in EN + LV; search-result subtitles use `cities.*`. Extra: `getGroupRole` now returns `exists`, hidden groups also count as missing for the sidebar.):
  - a. **Header ⌘K search overlay** is a visible placeholder ("Global Search … placeholder") → hide the trigger until search exists (`components/shell/GlobalSearch.tsx`, `Header.tsx`). No placeholder features.
  - b. **Sidebar Requests badge** stays stale after approving/declining a request until reload → refresh it after the action.
  - c. **Event "Share event" button** has no handler → `navigator.share` when available, else copy the URL with a translated toast.
  - d. **Search dropdown subtitles** (`lib/services/discovery.service.ts`) show raw city values ("Jurmala") → translated display names (`cities.*`, see 1.8).
  - e. **404 under `/…/group/…`**: the desktop sidebar still shows the group menu (Informācija / Pasākumi) linking to the missing group → hide it when the group doesn't exist.
  - f. **Wizard access step**: Public says "Anyone can see and join", but every join needs approval (decided) → reword Public to "anyone can find it and ask to join". Leave Private text alone until invites exist. LV + EN.
  - g. **Hidden group, owner view**: `getGroupWithContext` (`lib/services/group.service.ts`) returns null for everyone except site admins → also let the group OWNER in; show `HiddenGroupBanner` with the reason but **without** the restore button (restore stays admin-only). Everyone else still 404.
  - h. **Notification links** from `sendInquiry`, `manageMembership` and `sendApplicationInquiry` (`lib/services/group.service.ts`) use `group.category.slug` as the URL's L1 segment, but the group route only accepts a level-1 slug there → use `TaxonomyResolver.resolve(category).l1Slug` like the other call sites (works today only because all groups use L1 categories).
- [x] 2.7 (done 2026-10-08, table below) **Feature inventory — report only, no fixes.** Walk every user-facing feature as logged-out visitor, member, group owner and site admin (EN + LV, desktop + mobile). Add a table under this item, one row per feature: *feature · where (route/component) · who uses it · works? · what feels unfinished or out of place* — be concrete: placeholder text, dead buttons, English strings, duplicated info, styling inconsistent with the rest, unclear purpose. Cover at least: discovery (filters, cards, search), group page tabs (about, discussion, events, members, settings, sections editor), create wizard, profile (own + public), onboarding, messages/inbox, notifications, header/sidebar/footer/mobile nav, admin (dashboard, reports, taxonomy), about/privacy. Keep rows short; this feeds the keep/fix/hide/remove decisions with the user.
  - **Inventory (2026-10-08, Sonnet, local seed data; viewed as member, group owner, site admin and logged out; EN + LV, desktop + mobile where noted).** "Works?" = does what it says. A walk, not a pixel audit.

    | Feature | Where | Who | Works? | Unfinished / out of place |
    |---|---|---|---|---|
    | Discovery: group grid + filters | `app/[locale]/page.tsx`, `components/discovery/*` | everyone | yes | Cards with no banner are a grey gradient (3.1). Every card says "Active" — unclear what it means. Browser tab title is "Groups Found" / "Grupas atrastas" (a result heading, not a title). Category rail flashes full width on mobile load (Opus queue). `/discover` redirects to `/`; `/groups` looks like a "My groups" duplicate (orphaned route, see debt list). |
    | Discovery: events tab | `/?tab=events` | everyone | yes | Cards show a date overlay and time only; seed events all say 13:15. |
    | Discovery search | filter-bar input, `searchContextual` | everyone | partly | Diacritic-sensitive (Opus queue). Header ⌘K overlay now hidden (2.6a); `GlobalSearch.tsx` and `SearchModal.tsx` remain as unused files. |
    | Group page – Information | `[l1Slug]/group/[groupSlug]/page.tsx`, `GroupHeader.tsx` | everyone | yes | **Header title and meta are white on a light background when the group has no banner — unreadable** (3.2). An unlabeled shield pill (role badge, no text) and the "…" menu are unclear. |
    | Group page – tabs + sidebar | `GroupTabs.tsx`, `GroupSidebarContent.tsx` | members | yes | Two navs for the same pages (tab bar and left menu). Sidebar shows only Information/Events until the role request returns (visible flash). Information has a single "About" tab. |
    | Group – Discussions | `discussions/page.tsx`, `DiscussionBoard.tsx` | members | not walked end to end | Empty state fine. Posting/commenting not exercised (talk loop, 2.4). |
    | Group – Events | `events/page.tsx`, `groups/EventCard.tsx` | everyone | yes (fixed in 2.5) | Upcoming / My RSVPs / Past tabs; no edit or delete; "recurring" is only a label. |
    | Event page | `events/[eventSlug]/page.tsx` | everyone | yes | Stacks the full group header over its own hero; hero title unreadable on light banners (3.3). Description and instructions are rendered as raw HTML (`dangerouslySetInnerHTML`) from the rich-text editor — check sanitising before real users post. |
    | Group – Members | `members/page.tsx`, `MemberCard.tsx`, `RequestCard.tsx` | members/admins | yes | Stray "Private" text near the bottom of the page (leftover label?). "Inquire" and "Send message" depend on messaging (2.4). |
    | Group – Settings | `settings/page.tsx`, `components/groups/settings/*` | owner/admin | yes | **Raw key `wizard.fieldSlug` shown as a label** (`ProfileSection.tsx:41` uses the wrong namespace). Page title is the generic site title. Six settings tabs for a small group — heavy compared with the wizard. |
    | Group – Sections editor | `GroupSectionEditor.tsx` | owner/admin | not walked | Overlaps with description and instructions (three places to describe the group). |
    | Create group wizard | `/create`, `components/groups/create-wizard/*` | logged in | yes (2.1) | Four steps. Banner and social links are plain URL fields (no upload). Generic page title. |
    | Create event wizard | `create-event`, `EventCreationWizard.tsx` | owner/admin | yes (2.5) | Banner is a URL field; the "link name" slug is shown to users; opens as a modal from the group and as a full page by URL. |
    | Join / apply / withdraw | `ApplicationModal.tsx`, `MembershipPanel.tsx` | visitors | yes (2.3) | Modal says "Join {name}" though it is a request; private groups still fully readable (needs invites). |
    | Reports / hide | `ReportModal.tsx`, `HideGroupModal.tsx` | any / admin | yes | Reporting is only reachable from the "…" menu. |
    | Profile (own) | `/profile` | members | yes | "Events Attended 0" is a static stat (not computed from RSVPs). My Groups cards repeat the grey-gradient problem. Category titles on profile cards come back in Latvian on `/en`. |
    | Profile (public) | `/profile/[username]` | everyone | yes | No way to message the person from here. |
    | Profile edit | `/profile/edit`, `ProfileEditForm.tsx` | members | not walked | Reached from the user-menu item "Settings" — it is profile editing only. |
    | My Groups | `/profile/my-groups`, `MyGroupsListRow.tsx` | members | yes | Compact and fine; shows only "Groups I own" for this user. |
    | Onboarding (username) | `/onboarding/username` | new users | yes | Seed accounts without a username always land here (expected). |
    | Sign-in / register | `/auth/*` | visitors | yes (2.0) | GitHub and Google buttons always shown; only work if providers are configured in production. |
    | Messages / inbox | `/messages`, `MessagesLayout.tsx` | members | not walked | Empty state OK. Whole feature is Opus item 2.4. |
    | Notifications | `NotificationCenter.tsx` | members | yes | Compact layout works; "Mark all as read" present; no page for older notifications. |
    | Header | `Header.tsx`, `UserMenu.tsx` | everyone | yes | Search gone (2.6a). Language and theme toggles share one pill. User menu: My Groups, View Public Profile, Settings, Sign Out (+ Admin for admins). |
    | Left sidebar | `Sidebar.tsx` | group pages only | yes | Collapse works. |
    | Mobile bottom nav | `MobileNav.tsx` | everyone | yes | Discover / My Groups / + / Messages / Profile, shown logged out too (each leads to sign-in). |
    | Footer | `Footer.tsx` | everyone | yes | "About" appears twice (column heading and link); language switcher duplicates the header's. |
    | About / Privacy | `/about`, `/privacy` | everyone | yes | About is a draft for the owner to rewrite; Privacy has no public contact address (needs user). |
    | Cookie banner | `CookieConsent.tsx` | visitors | yes | Truthful after 1.15. |
    | Admin dashboard | `/admin` | admin | yes | Tabs Tags / Reports / Moderation **and** a second link row "Reports · Taxonomy" under the title duplicate each other; Reports and Taxonomy are also separate pages with different chrome (taxonomy page has no heading context or back link). |
    | Admin reports | `/admin/reports` | admin | yes | Clean empty state. Non-admins are redirected to `/` instead of seeing a 404. |
    | Admin taxonomy | `/admin/taxonomy` | admin | yes | Tree with Edit buttons; fine for one admin. `categorization` override route unfinished (debt list). |
    | Moderation log | `/admin` → Moderation | admin | yes | Done in 2.0b. |
    | Auth-gate modal | `AuthGateModal.tsx` | visitors | yes | Event page now uses a sign-in link; the group-list card button still opens the modal — two patterns for the same thing. |

- [x] 2.8 Events: join modes, waitlist, Events tab (spec: product decision **Events** above; test as `owner@local` (organiser), `member@local`, `user@local` (non-member) and logged out; EN + LV, desktop + mobile)
  - [x] **2.8a Model + permissions.** One migration `add_event_join_mode`: enum `EventJoinMode { OPEN, REQUEST }` → `Event.joinMode` default `OPEN`; `Event.isFull Boolean @default(false)`; `AttendanceStatus` becomes `GOING | PENDING | DECLINED | WAITLISTED` (delete existing `INTERESTED` rows in the migration; existing rows on REQUEST events don't exist yet). Rename nothing else; keep `maxParticipants` as the "about how many people" number (context only — remove the capacity check that blocks GOING). `EventService` returns a typed viewer context with the event: `{ canSee, canManage, canSeeInstructions, myStatus, goingCount, waitlistCount }`; `instructions` is **set to null server-side** when `!canSeeInstructions` (event page, Events tab, any other payload). Organisers = event creator + group OWNER/ADMIN. Service methods: `setAttendance` (OPEN: GOING/none), `requestToJoin` (REQUEST: PENDING, or WAITLISTED when `isFull`), `cancel`, `decide(approve|decline)`, `letInFromWaitlist`, `setFull(bool)`. `EVENT_FULL` only when someone tries to join a Full event directly (stale page) — the UI then offers the waitlist. Members-only rules from 2.5 stay. Group header `eventCount` must not count members-only events for outsiders.
  - [x] **2.8b Flows + notifications.** Wizard: remove the recurring toggle; add "How do people join?" (Open / Request to join, one-line explanation each); size field labelled "About how many people?" (optional); instructions field hint changes with the mode ("Shown only to people you approve" for Request to join). Event page: participant button per mode and state (I'm going / Going ✓ · Request to join / Request sent / You're in / Not this time · Join waitlist / On the waitlist); organiser panel with Full on/off switch, pending requests (approve/decline), waitlist in join order (Let in), going/approved list. Notifications (follow the compact notification layout rule): organiser ← new request; requester ← approved / declined / let in from waitlist; organiser ← approved person cancelled while Full (+ waitlist size); waitlisted ← room again after Full is switched off. All new strings in EN + LV; mark uncertain Latvian copy `[LV: …]` for the user.
  - [x] **2.8c Events tab + event page design — mockup first.** Problems today: the full group header (banner zone, white title on light background, blank white pill) eats a third of the screen above the tabs; event cards are tall and mostly empty, attendee avatar renders as a broken image, the owner sees a generic "Sign up". Target: compact group header on the Events tab and event page; compact event rows (date block · title · time and place · badges Members only / Request to join / Full · "N going" or "N approved · about M people" · one button per mode and state). Make a desktop + mobile mockup (screenshots of a quick prototype in the running app), **show the user and wait for OK**, then build. Also resolve inventory notes on these pages (two auth-gate patterns → use the sign-in link everywhere).
    - Done 2026-10-08 (Sonnet prototype, Opus finish; user OK). `CompactGroupBar` replaces the banner header on `/events…` routes; `EventRow` replaces the tall card; event page re-laid out. Past events have no button; organisers of Request-to-join events see "Manage · N new"; the sub-tab bar is hidden on an event page ("All events" link instead); "Going" / "You're in" are outlined, not filled; "My RSVPs" → "My events" (upcoming going + pending + waitlisted); on mobile organisers see the details before their panel; the Full switch is a "Close sign-ups" / "Reopen sign-ups" button. Tab bars used an undefined `no-scrollbar` class (visible scrollbar on mobile) → `scrollbar-none`. Logged-out rows show the sign-in link.
  - [x] **2.8d Discovery.** Members see members-only events of their groups in discovery and search (logged out / non-members never do). `getDiscoverableEvents` is cached with `unstable_cache` keyed without the user — keep the public part cached, fetch the member part uncached or key it by user. Fix the filter bug: `city` and `category` both set the `group` key via object spread, so selecting both drops one — combine them with `AND`. Request-to-join events show their mode badge in results. Discovery cards: `components/discovery/EventCard.tsx:82` has a hardcoded "going" — use `event.goingCount` (or `event.approvedCount` for Request-to-join), like the Events tab rows. Check `ListViewEventCard` too.
    - Done 2026-10-08 (Sonnet). Public events: shared 60s cache (no user in key). Members-only events of the viewer's own groups: separate uncached query merged in (`getDiscoverableEvents(filters, locale, userId)`). City + category now AND-combined. Cards show Members only / Request to join / Full badges and translated going/approved counts; returns a typed `DiscoverableEvent` (no `any` for events). Site admins who are not members do not see members-only events in discovery. Opus review: discovery card dates/times use the next-intl formatter in Riga time (`EVENT_TIME_ZONE` constant), so `/lv` shows "okt." and server time zone no longer shifts times.

- [x] 2.9 Security (2026-10-09, Opus): rich text (event description/instructions, group sections) was rendered as raw HTML — any organiser could run scripts in visitors' browsers. Now cleaned at render with `sanitizeRichText` (`lib/sanitize.ts`, `sanitize-html` ≥2.17.7, editor tags only, http/https/mailto links); event JSON-LD escaped (`jsonForScript`). Joining a past event is refused server-side (`EVENT_PAST`). **Past rule (user, 2026-10-09):** an event is past once its last day (end date, else start date) is before *today in Latvian time* — on its own day it stays joinable (people may come late). One helper, `isEventPast` (`lib/event-dates.ts`), drives the server check, Upcoming/Past/My events tabs, discovery and the event page. Verified with script/onerror/`javascript:` probes on the event and group pages.

- [ ] 2.10 Finish events (Sonnet; follow the **Events** product decision):
  - Organisers can **edit** an event (reuse the create wizard pre-filled; `EventService.updateEvent` exists) and **delete** it (confirm step; attendees get a notification in the compact layout; then redirect to the group's Events tab).
  - Hide the "link name" (slug) field in the wizard — generate it from the title, add `-2`, `-3` on clashes instead of `EVENT_SLUG_TAKEN`.
  - Past events: no join buttons anywhere (already on rows/page), the server refuses with `EVENT_PAST` (2.9) — show its translated error if a stale page tries.
  - Verify as organiser, member and logged out; EN + LV; desktop + mobile.

- [ ] 2.11 Cleanup (user-approved 2026-10-09, Sonnet): remove the orphan `app/[locale]/groups/` route; remove the placeholder `app/[locale]/[l1Slug]/messages/` page; remove the static "Events attended" stat from `/profile`. Delete now-unused components and message keys (both locales). Check nothing links to the removed routes.

- [ ] 2.12 Group sections: sample section + legacy cleanup (Sonnet; see the **Sections** decision). Wizard creates two sections: "About us" (first, fixed, public — existing guard stays) and "Practical info" (members-only, short sample text in the creator's locale: when/where you meet, what to bring). Move any legacy `Group.instructions` content into a members-only section (one-off script or migration), then remove `Group.instructions` (migration `remove_group_instructions`), `getVirtualSections`' instructions branch, `hasInstructions` and the dead `needsInstructions` tab code. Default titles for now via message keys (2.13 makes them per-language data).

- [ ] 2.13 Multilingual owner text — sections and events (after 2.10 and 2.12; see the **Sections** decision). Rule everywhere: show the viewer's language if present, else the original with a small label ("Latviski" / "In English") and a `lang="lv|en"` attribute on the text element so browser translation and screen readers work. Owner text is never machine-translated.
  - [ ] **2.13a Data + read path.** One migration `create_translation_tables`: `GroupSectionTranslation { id, sectionId → GroupSection (cascade), lang, title, content, updatedAt, @@unique([sectionId, lang]) }` and `EventTranslation { id, eventId → Event (cascade), lang, title, description?, instructions?, updatedAt, @@unique([eventId, lang]) }`; `GroupSection.originalLang` and `Event.originalLang` (`lv` default). Migrate existing text into `lv` rows (existing "About us" / "Practical info" titles → rows in both languages from the message files), then drop the old text columns (`GroupSection.title/content`, `Event.title/description/instructions`) in the same migration. Services return resolved `{ title, content|description, instructions, lang, isFallback }` for the request locale (Service Law: localized `title`); event instructions stripping (2.8a) applies to every language. Slug stays from the original title. Search (discovery + `searchContextual`) matches any language. Notifications keep using the title at send time. Pages render the label + `lang` attribute when `isFallback`.
  - [ ] **2.13b Sections editor.** LV | EN switch per section with a filled/empty dot; editing a language saves only that row. Empty language: "Not translated yet — visitors see the Latvian text" + "Start from the Latvian text" (copies the original into the editor). Original language = owner's locale at creation, changeable in the editor. Wizard writes the creator's locale + both default titles.
  - [ ] **2.13c Event wizard / edit.** Same LV | EN switch for title, description, instructions (one switch for the whole form); original language from the organiser's locale. Required fields are required only in the original language.
  - Verify each as owner and visitor on `/lv` and `/en`, desktop + mobile, including fallback labels and that members-only content / instructions never leak through a translation.

## Stage 3 — Make it calm

Goal: content first. One screen at a time; agree direction with the user before each.

- [ ] 3.1 Discovery cards — sharpen at-a-glance signals (category colour, city, size), drop the rest; fix missing-image grey cards; mobile filter bar overflow
- [ ] 3.2 Group page
- [ ] 3.3 Event page — currently stacks full group header + oversized hero with unreadable title
- [ ] 3.4 Header / navigation / footer

---

## Known code debt (fix when touching nearby code, not as a project)

- ESLint (2026-10-08): 88 errors / 138 warnings — mostly `no-explicit-any` (59) and `no-html-link-for-pages` (18 raw `<a>` causing full reloads).
- From the 2026-03 audit (unverified, file removed — see git history): Service Law violations in some actions, orphaned `app/[locale]/groups/` route, accent colour prop-drilling/inline styles, five modals mounted in `GroupHeader`.
- `package.json` `overrides` pins `@swc/core` to 1.15.47 (pulled in by next-intl's plugin). 1.16.x refuses to start on the user's Windows machine because of a cache-folder permission check (`ERR_SWC_NATIVE_CACHE`), breaking `npm run dev` and `npm run build`. next-intl is held at 4.13.x for the same reason (4.14 requires SWC ~1.16). Revisit when SWC relaxes the check.
- Remaining `npm audit` runtime finding: `deepmerge-ts` inside the Prisma CLI (only runs during migrations, no user input); fixing needs a breaking Prisma change — accepted for now.
- Unfinished from the taxonomy work: `/admin/groups/[groupSlug]/categorization` override route.
