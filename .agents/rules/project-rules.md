---
trigger: always_on
---

# Ejam Kopā — Project Rules

> Loaded automatically into every session. These are non-negotiable.
> Full context, patterns, and examples live in `AGENTS.md` (project root).

---

## Stack
- **Framework:** Next.js 16 App Router
- **Language:** TypeScript 5+ strict — `any` is prohibited, always
- **Styling:** Tailwind CSS v4 + CSS variables — no modules, no inline styles
- **DB:** PostgreSQL via Prisma ORM v6
- **Auth:** NextAuth.js v5 (Auth.js)
- **Icons:** `lucide-react` only
- **i18n:** `next-intl` — full LV/EN parity required at all times

---

## The Laws (non-negotiable)

**Service Law**
- No Prisma calls outside `/lib/services` — ever
- Services accept `locale`, return a typed context object (entity + role + permissions + resolved title)
- Actions delegate all DB and business logic to services

**Context Law**
- Layouts fetch server context via services
- Providers hydrate client state from that context
- Client components consume via hooks — no prop-drilling of `userRole`, `accentColor`, `membershipStatus`

**Taxonomy Law**
- Accent color resolved at layout level via `<style>` block — never on the client
- CSS variables (`--accent`, etc.) set server-side to prevent hydration flicker

**Defensive Coding Law**
- All forms and mutations must have a submission guard (`isPending` / `isSubmitting`)
- Shared Zod schemas from `@/lib/validations` — never duplicate schema logic

**Action Consistency Law**
- All actions return `ActionResponse<T>` from `@/types/actions.ts`
- All actions: auth check → delegate to service → revalidatePath → notify
- Error strings are uppercase codes only: `UNAUTHORIZED`, `NOT_FOUND`, `JOIN_FAILED`

**Zero-Any Law**
- Use Prisma-generated types, strict interfaces, or `unknown` + type guards
- No `any`, no `@ts-ignore`, no loose props

**Constants Law**
- All static lists (cities, group types, category slugs) live in `@/lib/constants/index.ts`
- Components and Zod schemas import from there — no local duplications

---

## i18n Rules
- Zero hardcoded strings in components — all keys in `messages/en.json` + `messages/lv.json`
- Keys are namespaced: `group.members.requestsTab`, `errors.unauthorized`
- Dates/numbers/currency use `next-intl` formatters exclusively
- Action error codes map to `errors.*` translation keys on the client
- Both locale files must be updated in the same change — always

---

## UI Rules
- Server Components by default — justify every `"use client"`
- Mobile-first responsive layouts
- Tailwind v4 theme variables only — no hardcoded values

---

## Action / Service Separation

| Responsibility | Action | Service |
|---|---|---|
| Auth check | ✅ | ❌ |
| Raw DB query | ❌ | ✅ |
| Business / permission logic | ❌ | ✅ |
| `revalidatePath` | ✅ | ❌ |
| UI notification | ✅ | ❌ |

---

## Before Every Task
1. Read `AGENTS.md` for full context
2. Check `docs/audit_report.md` for open issues
3. Search for existing patterns before creating anything new
4. Produce an implementation plan — wait for approval before coding

## MCP Tools (use proactively)
- `context7` — before any Next.js, Prisma, next-intl, or Auth.js work
- `next-devtools` — inspect routes and component boundaries at runtime
- `chrome-devtools` — verify live UI after every change

## When in Doubt
- Do not guess — use `context7` or `next-devtools`
- Do not invent patterns — follow what exists
- Do not skip the plan