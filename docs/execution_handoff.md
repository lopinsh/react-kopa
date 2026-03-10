# Execution Handoff: Ejam Kopā

> This document is the living progress reference for ongoing development.
> Agents must also read `AGENTS.md` before starting any task.
> Completed chunk history lives in `execution_handoff.archive.md`.

---

## Project State Summary

The core platform is built and functional. Authentication, group/event creation, discovery, profiles, notifications, and real-time messaging infrastructure are all in place. The codebase is clean, strictly typed, and follows the Service Law throughout.

**Stack:** Next.js 16 (App Router) · TypeScript strict · Tailwind CSS v4 · PostgreSQL + Prisma v6 · NextAuth.js v5 · next-intl (LV/EN) · Pusher · Lucide icons

---

## Locked-In Architectural Decisions

### Discovery UI
- `DiscoverySidebar` — L1 navigation only, expressive hover-to-expand, discovery page only
- `DiscoveryFilterBar` — L2 chips (multi-select, `?tags=slug1,slug2` OR logic) + search + city + view toggle, inline on discovery page
- `Sidebar` — group/internal pages only, classic nav style
- These are intentionally separate components with different visual languages

### Taxonomy
- L2 tags use a `CategoryAlias` model for cross-language deduplication (planned — Chunk 15)
- `slugLv` optional field on `Category` — falls back to `slug` if missing
- New L2 tags created by users enter as `PENDING_REVIEW`, groups save normally
- Admin approves, edits, or merges pending tags into existing canonicals

### DM System (Chunk 14)
- New `DirectMessage` model, Pusher delivery (Option B — decided)
- `/messages` route exists as placeholder shell

### Profiles
- `setUsername` action is intentionally separate from `updateProfile` — do not merge
- DiceBear avatars stored as `avatarSeed` field; customization UI planned (Chunk 17)

### Group Creation
- `SINGLE_EVENT` group type removed from enum
- Step 4 defaults `acceptsInvitations: true`; social links moved to Settings only
- Post-creation redirect goes to the group's public page

### Admin
- Existing `/admin` page with `/admin/reports` sub-route
- Admin taxonomy management planned at `/admin/taxonomy` (Chunk 15)
- Admin group categorization override at `/admin/groups/[groupSlug]/categorization` (Chunk 15)

### URL Routing
- Translated URL slugs via next-intl `pathnames` config — planned (Chunk 16)
- Group routes: `/[locale]/[l1Slug]/group/[groupSlug]/`

### Notifications
- Existing notification system used for all user-facing events
- Delivery: in-app only (no email for now)

---

## Backlog

| Chunk | Title | Notes |
|---|---|---|
| **14** | DM System | `DirectMessage` model, Pusher channels, inbox UI. `/messages` placeholder exists. |
| **15** | L2 Tag Lifecycle + Admin Taxonomy | See full scope below |
| **16** | Translated URL Slugs | next-intl `pathnames` config, `slugLv` on Category |
| **17** | Avatar Customization UI | DiceBear toggle groups in `/profile/edit`. `avatarSeed` field exists. |
| **18** | Rich Text Bio Editor | TipTap in `/profile/edit` |
| **19** | Notification Preferences UI | Toggles in `/profile/edit` |
| **20** | Event Waitlist Flow | — |
| **21** | Mobile Experience Audit | — |

---

## Chunk 15 — L2 Tag Lifecycle + Admin Taxonomy

### Schema changes
- `Category` — add `status: ACTIVE | PENDING_REVIEW`, `submittedById`, `submittedAt`, `slugLv?`
- `CategoryAlias` — new model: `(id, categoryId, value, locale?)`
- `CategoryTranslation` — already exists; admin fills EN + LV at approval time

### New service: `taxonomy.service.ts`
- `searchL2(query, l1Id)` — fuzzy search across `CategoryTranslation.title` + `CategoryAlias.value`
- `createPendingL2(name, l1Id, submittedById)` — creates `PENDING_REVIEW` category
- `approveL2(id, { nameEn, nameLv, slugEn, slugLv })` — sets ACTIVE, upserts translations
- `mergeL2(pendingId, canonicalId)` — migrates all group tag relations, creates alias, deletes pending (atomic)
- `createAlias(value, canonicalId, locale?)` — manual alias creation
- `adminUpdateGroupTags(groupId, tagIds)` — admin override for group categorization

### Updated components
- `TagPicker.tsx`, `TaxonomyStep.tsx`, `CategorizationSection.tsx` — fuzzy search with "create pending" fallback; pending tags show a subtle unreviewed badge
- `CategorizationSection.tsx` — admin role unlocks editing regardless of group ownership

### New routes
- `/admin/taxonomy` — Replaced tab-based design with a full-width Taxonomy Tree + Slide-over panel interface:
  - **Pending Inbox** — Collapsible strip for pending tags with quick approve/reject/merge actions.
  - **Tree View** — Visual representation of L1 and active L2 categories with bulk selection.
  - **Floating Action Bar** — Gmail-style bottom bar for bulk Approve, Merge, and Delete.
  - **Slide-over Panel** — Unified contextual editor with interactive cross-navigation.
- `/admin/groups/[groupSlug]/categorization` — admin override categorization editor

### Notifications
- On merge/replace: group owner notified via existing notification system

### Admin nav
- Extend `/admin` with Taxonomy link alongside Reports

### Suggested agent execution order
1. [x] Schema migration
2. [x] `taxonomy.service.ts`
3. [x] `taxonomy-actions.ts` updates
4. [x] `TagPicker` / `TaxonomyStep` / `CategorizationSection` fuzzy search + pending flow
5. [x] `/admin/taxonomy` page (Tree + Slide-over + Inbox)
6. [x] Sidebar Navigation (L1/L2 clicking)
7. [x] Bulk Actions (Checkboxes + Floating Bar + Merge Sidebar)
8. [ ] `/admin/groups/[groupSlug]/categorization` override route
9. [x] Notifications
10. [x] Translations (EN + LV parity)

---

## Lint Baseline

| Date | TSC | ESLint Errors | ESLint Warnings |
|---|---|---|---|
| 2026-03-05 (post-audit) | ✅ 0 | 85 | 100 |
| 2026-03-05 (post-lint cleanup) | ✅ 0 | 45 | 102 |

Remaining 45 errors are in unrelated/older modules. Not regressions.

---

## Open Items

| ID | Description |
|---|---|
| P2 | Notification preferences UI — `/profile/edit` missing toggles (Chunk 19) |
| P3 | Avatar customization — `avatarSeed` field exists, UI not exposed (Chunk 17) |