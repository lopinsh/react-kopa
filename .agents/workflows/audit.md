---
description: A full architectural health check of the "Ejam Kopā" codebase — or a scoped check before touching a specific feature area. Run this before any significant task, after merging branches, or when something feels off.
---

Step 1 — Define Scope
State the audit scope:

Full audit — entire codebase scan
Scoped audit — specific feature, route, or file group (state which)

Load docs/audit_report.md and note any previously identified open issues. Do not re-investigate already-documented issues unless the scope requires it.

Step 2 — Service Law Violations
Scan for direct Prisma calls outside /lib/services:
ts// Red flags to search for in /actions, /app, /components:
import { prisma } from ...
prisma.findMany(
prisma.create(
prisma.update(
prisma.delete(
For each violation found:

File path
Line reference
Recommended fix (which service it should delegate to)


Step 3 — Type Safety Violations
Scan for any usage:
ts// Search for:
: any
as any
<any>
// @ts-ignore
// @ts-expect-error
For each violation found:

File path
What the correct type should be (Prisma-generated, explicit interface, or unknown + type guard)


Step 4 — Context Law Violations
Check for prop-drilling of context values:
ts// Red flags — these should never be passed as props:
userRole=
accentColor=
membershipStatus=
Verify that:

 Layouts fetch context via Service Layer
 Providers hydrate from that server context
 Client components consume via hooks (useGroupContext(), etc.)
 No redundant client-side fetches for data already in context


Step 5 — Zero-Flicker Branding Check
For any group/category page:

 Accent color resolved at layout level via <style> block
 No useState or useEffect used to set accent/color values
 CSS variables defined server-side: --accent, --accent-border, etc.


Step 6 — Action Consistency Check
Scan /actions for violations:

 All actions return ActionResponse<T> from @/types/actions.ts
 All actions start with an auth check (auth())
 All actions call revalidatePath after mutations
 No raw DB logic in actions — all delegated to services
 Error strings are uppercase codes (UNAUTHORIZED, NOT_FOUND) — no English sentences


Step 7 — Localization Audit

 No hardcoded strings in JSX (search for " inside return statements in components)
 No native date/number formatters (toLocaleDateString, toLocaleString)
 en.json and lv.json have identical key structures — check for orphaned keys in either file
 Action error codes map to errors.* translation keys on the client


Step 8 — Constants Law Check

 No locally defined arrays for cities, group types, or category slugs in components
 All static lists imported from @/lib/constants/index.ts
 Zod schemas reference constants — no hardcoded enum values duplicated


Step 9 — UI & Styling Check

 No CSS modules, inline styles, or styled-components
 No hardcoded color values — all use CSS variables from @theme
 No icon libraries other than lucide-react
 All new components are Server Components by default — "use client" justified where used


Step 10 — Audit Report Output
Produce a structured report:
## Audit Report — {date} — {scope}

### Critical (must fix before any new work)
- [ ] ...

### Warnings (fix soon, not blocking)
- [ ] ...

### Clean (confirmed compliant)
- ...

### Previously Known Issues (from audit_report.md)
- Status update on each open item
Save or append the report to docs/audit_report.md.

Hard Stops

Any Critical violation found → do not proceed with new feature work until resolved
audit_report.md does not exist → create it before concluding