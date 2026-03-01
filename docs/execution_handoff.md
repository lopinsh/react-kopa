# Execution Handoff: Ejam Kopā Refactoring

This document serves as a continuity guide for the ongoing codebase audit and refactoring process. It captures the overarching execution plan, current progress, and items discovered during completed chunks.

## Current Progress Status

| Phase | Title | Status |
|---|---|---|
| **Chunk 1** | Service Law Enforcement (High Impact) | ✅ Completed |
| **Chunk 2** | Type Safety & Component Props | ✅ Completed |
| **Chunk 3** | Zero-Flicker UI Refactor | ✅ Completed |
| **Chunk 4** | Notification Localization | ✅ Completed |
| **Chunk 5** | Route Consolidation (Debt Cleanup) | ✅ Completed |
| **Chunk 6** | Profile Overhaul — Chunk A | ✅ Completed |
| **Chunk 7** | Profile Overhaul — Chunk B (Username Onboarding) | ✅ Completed |
| **Chunk 8** | Chunk 5 Legacy Route Audit | ✅ Closed (resolved in Chunk 6) |

---

## Completed Work & Discovered Context

### Chunks 1–5
See previous entries. All architectural refactoring complete. Codebase is clean, well-typed, and follows AGENTS.md conventions throughout.

---

### Chunk 6: Profile Overhaul — Chunk A
**Goal:** Schema migration, own profile restructure, public profile page, route rename, real group card member avatars.
**Status:** Successfully completed.

**Delivered:**
- Schema: Added `username`, `bio`, `cities`, `avatarSeed` fields to `User` model. DB reset and reseeded.
- `UserService`: Added `getOwnProfile`, `getUserByUsername`, `getMyGroups`, `updateProfile`.
- `/profile` — own profile page restructured (avatar, @username, cities, bio, stats, group preview).
- `/profile/[username]` — public profile page with privacy checks, shared-group visibility logic, disabled Message button placeholder.
- `/profile/my-groups` — new route. Legacy `/groups` route deleted.
- `GroupCard.tsx` — real DiceBear member avatars (up to 5, +N overflow chip). `GroupMemberPreview` interface added. Fake placeholder stack removed.
- `DiscoveryService`, `GroupService.getUserMemberships` — extended with member preview data via shared `MEMBER_PREVIEW_SELECT` fragment.
- `user-actions.ts` — delegates fully to `UserService.updateProfile`. `USERNAME_TAKEN` error code added to registry.
- Navigation — UserMenu, Footer, `lib/navigation.ts` all updated to new routes.
- Translations — 9 keys added to `en.json` + `lv.json` with 1:1 parity.
- **Verification:** `tsc --noEmit` zero errors. `npm run build` passes. Browser verified on discovery, own profile, and public profile.

**Discovered Items (deferred):**
- **Toast hydration warning** — dev-mode only, pre-existing, related to `ToastContainer` attributes. Not introduced by this chunk.
- **Unsplash 404s** — some seed banner images returning 404. Pre-existing seed data issue.
- **Missing `group.applyToGroup` translation key** — noticed in group application modal. Out of scope, needs its own fix.
- **Bio is plain text** — rich text editor not yet in codebase. Bio stored and rendered as plain text for now. TODO: upgrade to rich text editor in a dedicated chunk.

---

### Chunk 7: Profile Overhaul — Chunk B (Username Onboarding)
**Goal:** Intercept users with no username post sign-in, route through `/onboarding/username`, clear intercept permanently on submit.
**Status:** Successfully completed.

**Delivered:**
- `types/next-auth.d.ts` — Session and JWT augmented with `username: string | null`.
- `lib/auth.ts` — JWT callback fetches `username` from DB on sign-in, updates on `trigger === "update"`. Session callback exposes `session.user.username`.
- `middleware.ts` — Composed function: session check → username intercept → delegate to next-intl. `/api/auth/*` correctly excluded from matcher.
- `lib/validations/onboarding.ts` — Dedicated Zod schema, `username` required.
- `actions/onboarding-actions.ts` — `checkUsernameAvailability` (read-only) + `setUsername` (mutation). Dedicated action was necessary because `updateProfile` requires `name` field — username-only payload would always fail validation.
- `components/onboarding/UsernameForm.tsx` — Debounced availability check, inline feedback, `isPending` guard, `update({ username })` JWT refresh before redirect.
- `/app/[locale]/onboarding/username/page.tsx` — Minimal layout, session/username guards, renders form.
- Translations — `onboarding.username.*` (9 keys) + `errors.USERNAME_TAKEN` added to both `en.json` and `lv.json`.
- Pre-existing fix: duplicate `cancel` key in `group` section of both translation files resolved.
- **Verification:** `tsc --noEmit` zero errors. All browser quality gates passed.

**Architectural note:** `setUsername` is intentionally separate from `updateProfile`. The profile action requires `name`; the onboarding action requires only `username`. Single-responsibility — do not merge them.

**Discovered Items (deferred):**
- `app/[locale]/groups/page.tsx` had a pre-existing TypeScript error (`members: []` missing from `GroupCard` props after Chunk A). Fixed as a side effect.

### Chunk 8: Legacy Route Audit (Chunk 5)
**Status:** Closed. `app/[locale]/groups/` was already deleted in Chunk 6. No remaining legacy route files found. Chunk 5 is fully resolved.

---

## Next Steps

### Immediate Task: Chunk 9 — Quick Fixes (Flash-tier)
Three pre-existing issues to clean up in a single Flash session:
1. Missing `group.applyToGroup` translation key in the application modal — check component for correct strings, add to both `en.json` and `lv.json`.
2. Unsplash 404s in `prisma/seed.ts` — replace with reliable placeholder URLs (e.g. `https://picsum.photos/seed/{word}/800/400`).
3. `ToastContainer` dev-mode hydration warning — investigate SSR attributes, fix or suppress correctly.
**Depends on:** Chunk 6 schema (`username` field) and `UserService`.

**Scope:**
1. Post sign-in intercept — detect if authenticated user has no `username` set.
2. Redirect to a dedicated `/onboarding/username` page (or modal) before allowing access to the app.
3. Username selection form — alphanumeric + underscores, 3–30 chars, unique, inline availability feedback.
4. On submit, save via `UserService.updateProfile` / existing action, then redirect to `/profile`.
5. Guard: once username is set, the onboarding route should redirect away (not re-accessible).

### Deferred / Backlog
- **Rich text bio editor** — upgrade from `<textarea>` to a proper editor with sanitization.
- **Fix `group.applyToGroup` missing translation key** — quick fix, Flash-tier task.
- **Fix Unsplash seed 404s** — update seed data to use reliable image URLs.
- **Toast hydration warning** — investigate `ToastContainer` SSR attributes.
- **DM feature** — `allowDirectMessages` field exists, Message button placeholder is live. Full UI is a future chunk.
- **Avatar seed word UI** — `avatarSeed` field exists in schema and edit form (disabled placeholder). Wire up DiceBear seed override when ready.
- **Notification preferences UI** — `/profile/edit` doesn't yet expose notification settings.
- **Event waitlist flow**
- **Discovery / search improvements**
- **Mobile experience audit**