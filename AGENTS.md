# AGENTS.md: Project Context & Rules

> **This file is the source of truth for all AI and human developers.**
> Before starting any task, read this file in full. No exceptions.

---

## 🎯 Project Goal
**"Ejam Kopā"** (Let's Go Together) is a Latvian community platform built to minimize friction for creating groups and events. Optimized for local connections and hyper-local activities.

---

## 🛠 Technology Stack
| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5+ (Strict Mode — no `any`) |
| Styling | Tailwind CSS v4 (CSS variable–driven theming) |
| Database | PostgreSQL via Prisma ORM v6 |
| Auth | NextAuth.js v5 (Auth.js) |
| Icons | Lucide-React **only** |
| Localization | next-intl (full LV/EN parity required) |

---

## ⚖️ The Senior Dev Laws
These are non-negotiable. Violating them is grounds to stop and refactor before continuing.

### 1. The Service Law
- **No direct Prisma calls** in Components, Pages, or Layouts — ever.
- All data must flow through dedicated services in `/lib/services` (e.g., `GroupService`).
- Services must return a unified **context object** containing: the entity, resolved user permissions/role, and pre-resolved localized metadata.
- Services must accept a `locale` parameter for localized DB content.

### 2. The Context Law
- Layouts fetch server-side context via the Service Layer.
- Providers (e.g., `GroupProvider`) hydrate client state from that context — no redundant client-side fetching.
- Client components must consume context via hooks (e.g., `useGroupContext()`) — **no prop-drilling** of `userRole`, `accentColor`, or `membershipStatus`.

### 3. The Taxonomy Law (Zero-Flicker Branding)
- Group visual identity (colors, borders) derives from its L1 category.
- CSS variables (e.g., `--accent`) must be defined at the **layout level** via a `<style>` block to prevent hydration flickering.
- Never resolve accent color on the client side.

### 4. The Defensive Coding Law
- All forms and mutations must include a submission guard (`isPending` / `isSubmitting`) to prevent double-submissions.
- Use shared Zod schemas from `@/lib/validations` for both client and server validation — never duplicate schema logic.

### 5. The Action Consistency Law
- All Server Actions must return `ActionResponse<T>` from `@/types/actions.ts`.
- Errors must use **uppercase codes** (e.g., `UNAUTHORIZED`, `NOT_FOUND`, `JOIN_FAILED`) — never hardcoded English strings.
- Actions are responsible for: authentication checks, `revalidatePath`, and UI notifications.
- Actions must **never** contain raw DB logic — delegate to the Service Layer.

### 6. The Zero-Any Law
- `any` is prohibited. Use Prisma-generated types, strict interfaces, or `unknown` with type guards.
- All component props, service return types, and action payloads must have explicit TypeScript definitions.

### 7. The Constants Law (Single Source of Truth)
- Static lists (cities, group types, category slugs) must live in `@/lib/constants/index.ts`.
- Components and Zod schemas must import from this central registry — no local duplications.
- Purpose: ensures consistent dropdowns and validation across the platform.

---

## 🎨 UI & Styling Rules
- **Tailwind v4 only.** No CSS modules, no inline styles, no styled-components.
- Use semantic CSS variables from the `@theme` block in `globals.css`: `var(--background)`, `var(--surface)`, `var(--accent)`, etc.
- Use established utility classes: `shadow-premium`, `soft-press`, smooth transitions.
- **Icons:** `lucide-react` exclusively — no other icon libraries.
- **Mobile-first:** All layouts must be responsive. Start from mobile breakpoint up.
- **Server Components by default.** Add `"use client"` only when interactivity is explicitly required.
- Minor UI inconsistencies (shadows, border radius) must use Tailwind v4 theme variables — never hardcode values.

---

## 🌍 Localization (i18n)
- **Zero hardcoded strings** in UI components. Every user-facing label lives in `messages/*.json`.
- `en.json` and `lv.json` must maintain **1:1 key parity** at all times.
- Use descriptive, namespaced keys: `footer.nav.about`, `group.members.requestsTab`, etc.
- Dates, numbers, and currencies must use `next-intl` formatters — never `toLocaleDateString()` or similar.
- Action error codes map to translation keys on the client — never return UI-visible English strings from actions.

---

## 📂 Directory Structure
```
/actions              → Server Actions (auth checks, revalidation, notifications)
/lib/services         → Business logic & DB queries (Service Law enforced here)
/lib/validations      → Shared Zod schemas (used by both client & server)
/lib/constants        → Centralized constants (cities, group types, category meta)
/types/actions.ts     → Shared ActionResponse<T> type & error code registry
/components/shell     → Global App Shell (Header, Sidebar, Footer)
/components/ui        → Atomic components (Button, Input, Modal, etc.)
/components/providers → Context Providers (GroupProvider, etc.)
/messages             → Translation files (en.json, lv.json)
```

All session reference documents (audit reports, walkthroughs, implementation plans)
live in /docs/. AGENTS.md remains in the project root.

---

## 🔁 Common Patterns

### Action / Service Separation
| Responsibility | Action | Service |
|---|---|---|
| Auth check | ✅ | ❌ |
| DB query | ❌ | ✅ |
| Business logic | ❌ | ✅ |
| `revalidatePath` | ✅ | ❌ |
| UI notification | ✅ | ❌ |
| Permission check | ❌ | ✅ |

### Post-Mutation Navigation
- After creation or major updates, always redirect to the entity's **public page** (not an admin/settings view).
- Goal: immediate user validation of the live state.

### Display Title Resolution
- Never resolve titles manually from slugs in UI components.
- The Service context must return a pre-resolved, i18n-aware `title` field.

### Standardized Responses
```ts
// @/types/actions.ts
type ActionResponse<T> =
  | { success: true; data?: T }
  | { success: false; error: string } // error = uppercase code e.g. "UNAUTHORIZED"
```

---

## 🤖 Agent Behavioral Protocols
These rules govern how the AI approaches every task.

### Before Writing Any Code
1. **Read this file** (`AGENTS.md`) in full.
2. **Check `audit_report.md`** for known issues relevant to the task.
3. **Map the affected files** — identify existing services, actions, components, and translation keys before touching anything.
4. **Check for existing patterns** — reuse before creating. Search for similar components, service methods, or Zod schemas first.

### Planning Requirement
- **Always produce an implementation plan before writing code.**
- Every plan must include a **"Motivation & Design Alignment"** section explaining *why* the chosen approach fits the project architecture.
- Wait for explicit approval before implementing — unless the task is trivially small (e.g., a single string fix).

### MCP Tool Usage (Mandatory)
These tools are available and **must be used proactively**, not as a last resort:

| Tool | When to Use |
|---|---|
| `context7` | Before implementing any `next-intl`, Next.js, Prisma, or Auth.js logic — read the docs first |
| `next-devtools` | Inspect route structure, component tree, and server/client boundaries at runtime |
| `chrome-devtools` | Audit live UI for layout issues, console errors, and network requests after every change |

- **Verify in the live environment** after every phase before concluding a task.
- Do not assume — use tools to confirm.

### Code Quality Standards
- Strict TypeScript throughout — no `any`, no loose props.
- Modular, small components. If a component exceeds ~150 lines, consider splitting.
- Prefer Server Components. Justify every `"use client"` directive.
- All new strings must have translation keys added to **both** `en.json` and `lv.json` in the same commit/change.
- All new mutations must include submission guards and return `ActionResponse<T>`.

### When in Doubt
- **Do not guess.** Use `context7` to read documentation or `next-devtools` to inspect runtime behavior.
- **Do not invent patterns.** Follow what already exists in the codebase.
- **Do not skip the plan.** Even for small tasks, briefly state what you're changing and why.