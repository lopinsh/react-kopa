# SYSTEM_BLUEPRINT.md

## 1. Architecture & Tech Stack
**Framework & Logic**
The platform is built on Next.js App Router (v14+ / React 19 rc) using TypeScript. It adheres to a strict Server Components default, injecting `"use client"` primarily for interactive forms and UI toggles. The "Shell" architecture splits the layout dynamically: a global Navigation Shell (Header & Discover Sidebar) wraps standard routes, while group-specific routes load a contextual Group Sidebar to minimize distraction and focus navigation.

**Data Flow**
Data flows linearly through Server Actions (`actions/`) down to Prisma ORM, which communicates with a PostgreSQL database (hosted via Docker locally). All mutations (creating groups, events, membership toggling) go through these typed server actions. Real-time updates utilize a local Soketi instance mimicking the Pusher protocol.

**Authentication**
NextAuth.js (Auth.js beta) handles user sessions via the Prisma Adapter. In development, a Credentials provider is mocked with predefined roles.
*Role Logic (Membership table):*
- **OWNER:** Can edit group details, approve members, delete group, create events.
- **ADMIN:** Can create events and approve pending members.
- **MEMBER:** Can view private events and participate in discussions.
- **PENDING:** Applied to join a `PRIVATE` group; awaiting approval before accessing restricted content.

## 2. The Taxonomy Engine (Core Logic)
**Hierarchy**
A strict 3-level taxonomy categorizes activities:
- **L1 (Root):** Broad themes (e.g., "Sports & Fitness"). Holds the base theme color.
- **L2 (Sub-theme):** Groupings (e.g., "Running").
- **L3 (Tag/Type):** Specific activities (e.g., "Trail Running").
Groups must associate with at least one target category (usually L2 or L3). They can optionally hold secondary tags.

**The Wildcard System**
If a user cannot find their interest, they can type a custom topic in the `GroupCreationWizard`. This creates an L3 Category flagged with `isWildcard = true` and `status = PENDING_REVIEW`, attaching it to an existing L2 parent. Admins can later map or approve these wildcard inputs.

**Localization**
Categories are fully localized. Instead of hardcoding titles on the `Category` model, the `CategoryTranslation` model explicitly maps `lang` ('lv' or 'en') to a localized `title`. `next-intl` dictates the current locale, which the server actions use to filter the correct translation joins.

## 3. Component & UI Hierarchy
**Shell (`components/shell/`)**
- `Header.tsx`: Sticky global nav containing search, User Menu, Theme Toggle, and Language Switcher.
- `Sidebar.tsx`: The primary desktop navigation.
  - *Contextual Logic:* If the route is `/groups/[slug]`, it yields to `GroupSidebarContent.tsx`, which renders group-specific navigation (About, Events, Members, Chat). Otherwise, it renders the Discovery UI.
- `MobileNav.tsx`: Bottom bar mirroring sidebar logic for small viewports.

**Discovery Engine**
The home page and `/discover` routes use URL search parameters (`?q=`, `?city=`, `?cat=`, `?type=`) to filter groups.
- `getGroups` (Server Action) processes these params, actively tracing the category tree up to L1 to inherit theme colors.
- *Meetup-style Chips:* The UI renders groups utilizing inherited L1 colors as subtle accents (e.g., background tints on category badges).

**The Wizard (`components/forms/GroupCreationWizard.tsx`)**
A 5-step interactive process handled by `react-hook-form` and `zod`:
1. **Basics:** Name & Description.
2. **Location:** City selection.
3. **Categorization:** `TaxonomyPicker` for strict L1->L2->L3 selection or wildcard input.
4. **Additional Topics:** `MultiTaxonomyPicker` for secondary tags.
5. **Type:** Public, Private, or Single Event.
Each step triggers schema validation before advancing.

## 4. Feature & Function Registry
**Groups (`actions/group-actions.ts`)**
- `createGroup`: Handles slug collision, category mapping, and wildcard creation.
- `joinGroup`: Fast-tracks public joins to `MEMBER`; sets private joins to `PENDING` and spawns an `ApplicationMessage`.
- `manageMembership`: Owners/Admins approve/decline pending requests.

**Events (`actions/event-actions.ts`)**
- `createEvent`: Bound strictly to Owners/Admins. Validates max capacities.
- `toggleAttendance`: Handles the RSVP logic. Rejects if `maxParticipants` is reached.

**Social/Safety (`actions/notification-actions.ts` & `report-actions.ts`)**
- **Notifications:** Triggered during Membership applications, approvals, and when new events are posted to a joined group.
- **Reporting:** Users can submit reports on Groups or Events (status defaults to `PENDING`).

## 5. Performance & Standards
**Tailwind Strategy**
Styling is strictly utility-first. To support category theming without writing inline styles heavily, components define a CSS variable (`style={{ '--accent': category.color }}`) at the wrapper level. Tailwind classes then utilize this variable (e.g., `focus:ring-[var(--accent)]`).

**Caching (`unstable_cache`)**
Because the taxonomy tree is relationally heavy, Next.js's `unstable_cache` is heavily utilized in `actions/discovery-actions.ts`:
- `getDiscoveryCategories` (L1 themes) cached for 1 hour.
- `getContextualTaxonomy` (Full L1->L3 tree for a given ID) cached for 1 hour.
- `getGroups` (The main search query) cached for 60 seconds to optimize rapid filter switching.

---

### ⚠️ Technical Debt & Audit Notes
1. **Component Cleanliness:** `GroupCreationWizard` is quite massive (367 lines). Consider breaking down the individual step rendering into sub-components.
2. **File Placement Issue:** Discovered a misplaced or wrongly pathed `GroupCreationWizard.tsx`; it resides in `components/forms/`, but might have been expected in `components/groups/`.
3. **Real-time implementation pending:** While the Soketi server is running and Docker is configured, the front-end components for live chat / realtime notifications (via pusher-js) appear lacking or incomplete compared to the DB schema design. 
