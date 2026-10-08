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

---

## Stage 1 — Stop looking broken  ← CURRENT

Goal: a first-time visitor doesn't bounce. All found in the live-site sweep on 2026-10-08 (logged-out only).

- [ ] **1.1 Footer links.** `components/shell/Footer.tsx`: "Discover" and the language link point to `/explore` (404) → use `/discover` / a real locale switch. Remove all `href="#"` links (Help Center, Guidelines, Contact, social icons, tagline link). Keep: Discover, My Groups, Create Group, About, Privacy.
- [ ] **1.2 About + Privacy pages.** Create simple static `app/[locale]/about` and `app/[locale]/privacy` pages (LV + EN text via `messages/*.json`). The cookie banner's "Privacy Policy" link currently 404s. About = short honest "what this is and why" (see North star).
- [ ] **1.3 Sign-in heading.** `app/[locale]/auth/signin/page.tsx:37` hardcodes "Ienākt" → translation key.
- [ ] **1.4 Sign-in return path.** Visiting a protected page (e.g. `/en/create`) logged out lands on sign-in with `callbackUrl` = homepage. Should return to the original page. Also some routes redirect via `/api/auth/signin` and `/messages` via `/[locale]/auth/signin` — unify.
- [ ] **1.5 Event page translations.** `app/[locale]/[l1Slug]/group/[groupSlug]/events/[eventSlug]/page.tsx` and `components/events/RSVPButtons.tsx`: hardcoded English ("Important Info", "I'M GOING", "Capacity", "About Event", "Add to Google Calendar", "Share event", "Organizer", "Visit community", "Open in maps", "Please be on time…"). Dates must use next-intl formatters (show Latvian dates on `/lv`). Hide "Capacity" when `maxParticipants` is null/0.
- [ ] **1.6 Raw key `group.noEvents`.** Group Events tab shows the key itself (`events/page.tsx:106`). Fix the namespace/key.
- [ ] **1.7 Plurals & spacing.** "1members", "3biedri", "2pasākumi" in the group header → space + ICU plural messages (Latvian has its own plural rules: 1 biedrs / 2 biedri / 0 biedru).
- [ ] **1.8 City names with diacritics.** Cards/headers show "Jurmala", "Cesis". Display names should be "Jūrmala", "Cēsis" (check `lib/constants`; keep slugs ASCII).
- [ ] **1.9 Page titles.** Layout template is `'%s | Ejam kopā'` but pages also append it → "Ejam kopā | Ejam kopā". Group and event pages should have their own name as title (`generateMetadata`).
- [ ] **1.10 i18n parity.** `npm run i18n:check` fails: `profile.message`, `shell.footer.about`, `wizard.back`, `wizard.done`, `wizard.next` exist in `lv.json` but not `en.json`.
- [ ] **1.11 Real 404 for missing groups.** `/en/dancing/group/nonexistent` returns HTTP 200 with a not-found message → call `notFound()`.
- [ ] **1.12 Remove junk test groups** from the live DB ("sdfasdfasdf", "hhhhhh", "gcbdchbdfhd"). Needs the user — done via admin UI or a one-off script, not a migration.

## Stage 2 — Walk the loop

Goal: each step of create → find → join → talk works end to end, logged in, on desktop and mobile. User signs in in the browser; agent tests and fixes. Expect messaging to be the fragile part (8 "final fix" PRs in May 2026; `actions/message-actions.ts` and `lib/services/message.service.ts` have the most lint errors).

- [ ] 2.1 Create a group (wizard), both locales
- [ ] 2.2 Find it via discovery (category, city, search)
- [ ] 2.3 Join as a second user (public + approval-required groups)
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
- Unfinished from the taxonomy work: `/admin/groups/[groupSlug]/categorization` override route.
