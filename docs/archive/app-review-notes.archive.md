# App Review Notes — Ejam Kopā

This document captures issues and observations from a manual app review. Items are categorized by severity and type. Coding agents should read `AGENTS.md` and `execution_handoff.md` before addressing any item.

---

## 🔴 Bugs (Broken Functionality)

### ✅ B1 — Footer text invisible in light mode — **Resolved in Chunk 10**
### ✅ B2 — Many images broken (404) — **Resolved in Chunk 9**
### ✅ B3 — Message Center broken — **Resolved in Chunk 12** (placeholder route added)
### ✅ B4 — Duplicate search bars — **Resolved in Chunk 13**
### ✅ B5 — Discovery sidebar persisting across unrelated views — **Resolved in Chunk 13**
### ✅ B6 — Join button transparency issue — **Resolved in Chunk 10**
### ✅ B7 — Group member avatar not refreshing after profile changes — **Resolved in Chunk 12**
### ✅ B8 — Slug transliteration not handling Latvian diacritics — **Resolved in Chunk 9**
### ✅ B9 — Event detail page styling inconsistent — **Resolved in Chunk 12**
### ✅ B10 — Missing translation strings — **Resolved in Chunk 12**
### ✅ B11 — Orphaned `app/[locale]/groups/` route — **Resolved in Chunk 9**
### ✅ B12 — `discovery-actions-updates.ts` unmerged file — **Resolved in Chunk 9**
### ✅ U1 — Membership status not shown when already a member — **Resolved in Chunk 10**
### ✅ U2 — "My Groups" page does not distinguish membership roles — **Resolved in Chunk 11**
### ✅ U3 — Profile dropdown redundant link — **Resolved in Chunk 10**
### ✅ U4 — Settings link leads nowhere — **Resolved in Chunk 10**
### ✅ U5 — Event section left panel layout broken — **Resolved in Chunk 12**
### ✅ U6 — Member cards not linked to public profiles — **Resolved in Chunk 12**

### ✅ B13 — Discovery sidebar layout shift on hover — **Resolved in Chunk 13d**
When the `DiscoverySidebar` expands on hover, the content area shifts because icon sizes differ between collapsed and expanded states. Fix: keep icon size identical in both states (`h-5 w-5`), only show/hide the text label on expand/collapse.

### ✅ B15 — Group creation friction (too many fields) — **Resolved in Chunk 22**
Step 4 was overly complex. Social links removed (moved to Settings) and "Accepts invitations" defaulted to true.

### ✅ B16 — Group header styling inconsistent with Discovery UI — **Resolved in Chunk 22**
Group breadcrumbs re-rebranded to match the new filter bar chips (icons + dynamic accent colors).

### B14 — Discovery filter bar: view toggle on separate row
The card/list view toggle renders below the filter controls row instead of inline with them. Will be resolved in Chunk 13d.

---

## 🔵 Feature Placeholders (Backend exists, no Frontend)

### ✅ P1 — Peer-to-peer messaging — **Placeholder added in Chunk 12**

### P2 — Notification preferences
`/profile/edit` does not expose notification settings. Add a "Notifications" section to the edit page with placeholder toggles (disabled, "coming soon" tooltip).

### P3 — Avatar customization
`avatarSeed` field exists in schema and edit form (disabled). Future chunk — expose DiceBear config options as simple toggles.

---

## 🟢 Decisions / Open Questions

### D1 — Translated URL slugs + L2 Tag System — **Planned, scoped**

#### Static route segments (fully translatable)
Built-in routes translated via next-intl `pathnames` config in `i18n/routing.ts`.

#### L2 slugs + full tag lifecycle (dedicated chunk)

**Schema additions required:**
- `CategoryAlias` model — `(id, categoryId, value)` — locale-agnostic string aliases pointing to a canonical L2.
- `slugLv String?` on `Category` — optional LV slug, admin-set, falls back to `slug` if missing.

**L2 creation flow:**
1. User types L2 name during group creation
2. Fuzzy search across `CategoryTranslation.title` + `CategoryAlias.value`
3. Match → use existing. No match → create `PENDING_REVIEW` category
4. Admin review queue for new categories

**This is a dedicated chunk** — do not combine with other work.

### D4 — DM system architecture — **RESOLVED: Option B**
New `DirectMessage` model, Pusher delivery. Implement in Chunk 14.

### D5 — Discovery UI architecture — **RESOLVED**
- `DiscoverySidebar` — L1 navigation, expressive design, hover-to-expand, discovery page only
- `DiscoveryFilterBar` — L2 chips + search + city + toggle, inline on discovery page
- `Sidebar` — group/internal pages only, classic nav style
- Multi-select L2 tags via `?tags=slug1,slug2` (OR logic) — implementing in Chunk 13d