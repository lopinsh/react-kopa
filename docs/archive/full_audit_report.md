# One-Shot Full Codebase Audit: Ejam Kopā

## Section 1: Project Map
The platform operates on a localized App Router structure with localized routes acting as the foundation (`/[locale]`). 

### Core Routing Structure
- **Global**: `/auth`, `/admin`, `/create`, `/profile`
- **Discovery**: `/discover`
- **Group Clusters (L1/L2)**: `/[l1Slug]/group/[groupSlug]` (Members, Events, Settings, Discussions nested within)
- **Legacy Group Routes** (Potential Debt): `/groups/[slug]`

### Architectural Layers
- **Actions (`/actions`)**: 10 files managing server mutations (e.g., `event-actions.ts`, `group-actions.ts`). Designed to handle auth, revalidation, and UI notification mapping.
- **Services (`/lib/services`)**: Business logic & DB queries. Includes `GroupService`, `EventService`, `AdminService`, `DiscoveryService`.
- **Validations (`/lib/validations`)**: Zod schemas for shared full-stack validation (`group.ts`, `event.ts`, `user.ts`).
- **Constants (`/lib/constants/index.ts`)**: Single source of truth for lists like `CITIES`, `GROUP_TYPES`, and `CATEGORY_SLUGS`.
- **UI & Shell**: Built with Tailwind v4, heavily reliant on a global app shell (`Sidebar`, `Header`, `Footer`) and modularized components (`/components/groups`, `/components/discovery`).

---

## Section 2: Issue Registry

| # | Severity | Area | File(s) | Issue | AGENTS.md Rule | Estimated Effort |
|---|---|---|---|---|---|---|
| 1 | 🔴 Critical | Architecture | `actions/event-actions.ts` | 100% of methods (`createEvent`, `toggleAttendance`, `updateEvent`) use raw `prisma` calls. Does not delegate to `EventService`. | Service Law | L |
| 2 | 🔴 Critical | Architecture | `actions/group-actions.ts` | `manageMembership` executes raw `prisma.membership.update` and deletes instead of using `GroupService`. | Service Law | S |
| 3 | 🔴 Critical | Architecture | `app/[locale]/groups/[slug]/settings/page.tsx` | Fetches data using `prisma.group.findFirst` directly inside the Server Component. | Service Law | S |
| 4 | 🔴 Critical | Architecture | `app/[locale]/profile/edit/page.tsx` | Fetches user via `prisma.user.findUnique` directly in the page component. | Service Law | S |
| 5 | 🟡 Medium | Type Safety | `actions/admin-actions.ts` | Uses `catch (error: any)` masking true type safety on boundary exceptions. | Zero-Any Law | S |
| 6 | 🟡 Medium | Type Safety | `components/groups/GroupHeader.tsx`, `members/page.tsx` | Bypasses strict checking by casting `member as any` and `group as any` when passing down to children. | Zero-Any Law | M |
| 7 | 🟡 Medium | Localization | `actions/event-actions.ts` (Lines 99, 100) | Hardcoded English notification strings: `"A new event {title} has been created..."`. | Localization | M |
| 8 | 🟡 Medium | UI/Design | `components/groups/GroupHeader.tsx` | Resolves accent color on the client using inline styles for gradients: `style={{ background: linear-gradient(...) }}`. | Taxonomy/Zero-Flicker | M |
| 9 | 🟡 Medium | Architecture | `app/[locale]/groups/[slug]/?` vs `app/[locale]/[l1Slug]/group/[groupSlug]/?` | Duplicated/legacy routing structure for groups creates ambiguity on the true source of truth for group pages. | Architectural Cleanliness | L |

---

## Section 3: Pattern Analysis

**1. The "Action Creep" Pattern**
While `GroupService` was refactored well, newer or peripheral actions (like `event-actions.ts`) were built before the Service Law was strictly enforced. Developers are treating Server Actions as controllers rather than just Next.js RPC boundaries, bleeding raw Prisma logic and permission checks directly into the action file.

**2. The Notification Hardcoding Pattern**
The system has a mature `next-intl` setup for the UI, but backend notifications generated in actions (`createNotification`) are frequently injecting hardcoded English directly into the payload. These need to be refactored to store translation keys and dynamic arguments (e.g., `type: 'NEW_EVENT', payload: { eventTitle: "..." }`) which are evaluated on the client.

**3. Type Casting Workarounds**
While explicit `any` usage has been reduced, developers are side-stepping complex Prisma relation types by casting `as any` at the component boundary (e.g., passing fetched Prisma members into `MemberCard`).

---

## Section 4: Feature Gap Assessment

- **Direct Messaging / Chat UI:** The database schema tracks `allowDirectMessages` on the User model, and the `discussions` board exists for groups, but there is no peer-to-peer messaging system or UI implemented, which is critical for a hyper-local community app.
- **Granular Notification Settings:** Notifications are being pushed automatically via actions, but there is no user-facing UI in `/profile/edit` to toggle notification preferences (email vs. in-app, mute specific groups).
- **Event Capacity Waitlists:** `toggleAttendance` correctly blocks RSVP if `maxParticipants` is reached, but it simply returns `EVENT_FULL`. There is no Waitlist flow implemented, which is standard for community events.

---

## Section 5: Recommended Flash Work Queue

This queue is structured for AI execution in isolated, highly-deterministic chunks.

### Chunk 1: Service Law Enforcement (High Impact)
1. **Extract Event Logic:** Refactor `actions/event-actions.ts`. Move all raw Prisma queries (`createEvent`, `updateEvent`, `toggleAttendance`) into `lib/services/event.service.ts`.
2. **Clean Group Actions:** Refactor `manageMembership` in `group-actions.ts` to delegate to `GroupService`.
3. **Clean Page Components:** Remove direct Prisma imports and logic from `groups/[slug]/settings/page.tsx` and `profile/edit/page.tsx`, replacing them with Service calls.

### Chunk 2: Type Safety & Component Props
1. **Purge `any` in UI:** Define strict interfaces for `Member` and `GroupContext` in `members/page.tsx` and `GroupHeader.tsx` to eliminate `as any` prop passing.
2. **Strict Error Catching:** Fix the `catch (error: any)` blocks in `admin-actions.ts` to use `unknown` and proper type guards.

### Chunk 3: Zero-Flicker UI Refactor
1. **Remove Inline Gradients:** Update `GroupHeader.tsx` to stop using inline `style={{ background: ...accentColor }}`. Rely strictly on the existing `--accent` CSS variable injected at the layout level, using Tailwind generic syntax (e.g., `from-[color:var(--accent)]`).

### Chunk 4: Notification Localization
1. **Payload Refactoring:** Update `createNotification` calls across all actions to pass structured data (`translationKey`, `argsObj`) rather than hardcoded English strings. Update the Notification Bell component to translate these dynamically.

### Chunk 5: Route Consolidation (Debt Cleanup)
1. **Deprecate Legacy Routes:** Audit the `/groups/[slug]` vs `/[l1Slug]/group/[groupSlug]` split. Implement Next.js redirects from the legacy paths to the canonical L1 paths and delete the dead code.
