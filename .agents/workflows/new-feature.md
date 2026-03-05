---
description: How to implement new features. Guides the agent through a structured, architecture-compliant feature build for the platform. 
---

# Workflow: 
## Step 1 — Orient
Before writing a single line of code:
1. Read `AGENTS.md` in full.
2. Read `docs/audit_report.md` — flag any open issues relevant to this feature.
3. State the affected layers: which services, actions, components, providers, and translation keys will be touched.

## Step 2 — Discover Existing Patterns
Search the codebase before creating anything new:
- Is there an existing Service method that covers this? (`/lib/services`)
- Is there an existing Zod schema? (`/lib/validations`)
- Is there an existing component? (`/components/ui`, `/components/shell`)
- Are there existing translation keys that can be reused? (`/messages`)

Report findings. Do not duplicate what already exists.

## Step 3 — Implementation Plan
Produce a written plan covering:

### Motivation & Design Alignment
Why does this approach fit the existing architecture? Reference specific laws from `AGENTS.md` where applicable.

### Affected Files
List every file to be created or modified, with a one-line description of the change.

### Data Flow
Describe the full flow: Server Action → Service → DB → Context → Client Component.

### i18n Impact
List any new translation keys required (both `en.json` and `lv.json`).

### Edge Cases & Guards
Identify double-submission risks, auth requirements, and error states.

**Wait for explicit approval before proceeding.**

---

## Step 4 — Implement (in order)
Execute in this sequence to avoid dependency issues:
1. Constants (`/lib/constants/index.ts`) — if new static values needed
2. Types (`/types/`) — new interfaces or ActionResponse extensions
3. Zod schemas (`/lib/validations`) — shared client/server validation
4. Service layer (`/lib/services`) — business logic and DB queries
5. Server Action (`/actions`) — auth check, call service, revalidate, notify
6. Context/Provider updates (`/components/providers`) — if new state needed
7. UI Components — Server Components first, add `"use client"` only if required
8. Translation keys — add to both `en.json` and `lv.json` in the same change

## Step 5 — Verify
After each phase:
- Use `next-devtools` to inspect route structure and server/client boundaries
- Use `chrome-devtools` to check for console errors, layout issues, network requests
- Confirm no Prisma calls exist outside `/lib/services`
- Confirm all strings are localized
- Confirm all mutations have submission guards and return `ActionResponse<T>`

---

## Hard Stops (stop and fix before continuing)
- Direct Prisma call found outside a Service → refactor first
- `any` type used anywhere → fix before moving on
- Hardcoded UI string found → add translation key first
- Client-side accent color resolution → move to layout level