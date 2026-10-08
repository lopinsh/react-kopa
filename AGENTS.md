# AGENTS.md

Source of truth for AI agents and human contributors working on **Ejam Kopā** ("Let's Go Together"): a non-profit Latvian platform for finding people to do things with — create a group, be found, join, talk. Read this file in full before starting a task. `CLAUDE.md` and `.agents/rules/project-rules.md` only point here.

**Before any task:** read `docs/execution_handoff.md` (current stage and next item). For product/UI decisions also read `docs/core_philosophy.md` (the why).

**Pushing to `main` deploys to production (ejam.lumm.eu)** via `.github/workflows/deploy.yml`. Never push without the user's explicit OK, and only after the Definition of done passes.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, `output: 'standalone'`) |
| Language | TypeScript 5 strict — no `any` |
| Styling | Tailwind CSS v4 (CSS-variable theming in `app/globals.css`) |
| Database | PostgreSQL 15 via Prisma ORM 6 |
| Auth | Auth.js / NextAuth v5 (beta) |
| Realtime | Pusher protocol via self-hosted Soketi |
| i18n | next-intl, locales `lv` (default) and `en` |
| Icons | `lucide-react` only |

## Setup

Requires Node 20+ and Docker.

```bash
cp .env.example .env          # local defaults match docker-compose
npm ci                        # .npmrc sets legacy-peer-deps (next-auth beta vs Next 16)
npm run db:up                 # Postgres on :5433, Soketi on :6001
npx prisma migrate deploy     # apply existing migrations
npm run db:seed               # optional demo data (prisma/seed.ts)
npm run dev                   # http://localhost:3000
```

## Commands

| Task | Command |
|---|---|
| Dev server | `npm run dev` |
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` (or `npx eslint <files>` for changed files only) |
| Locale key parity | `npm run i18n:check` |
| All checks | `npm run check` |
| Production build | `npm run build` (needs `AUTH_SECRET` + `DATABASE_URL`) |
| New migration | `npm run db:migrate -- --name <snake_case_name>` (stop dev server first) |
| Regenerate client | `npm run db:generate` (after every schema change) |
| Seed | `npm run db:seed` |
| E2E (live site) | `npx playwright test test-live-site.spec.ts` |

There is no unit-test suite yet. CI (`.github/workflows/ci.yml`) blocks on typecheck; lint and i18n parity are report-only until existing debt is cleared.

## Definition of done

Before reporting a task complete:
1. `npm run typecheck` passes.
2. `npx eslint <changed files>` reports no new errors.
3. `npm run i18n:check` reports no new drift (both `messages/en.json` and `messages/lv.json` updated together).
4. UI changes verified in a running app (both locales, mobile and desktop widths).
5. Schema changes ship with a named migration in `prisma/migrations/`.

## Directory map

```
app/[locale]/        Routes (App Router). Group pages: app/[locale]/[l1Slug]/group/[groupSlug]/
actions/             Server Actions — auth, call service, revalidatePath, notify
lib/services/        Business logic + all Prisma access (*.service.ts)
lib/validations/     Shared Zod schemas (client + server)
lib/constants/       Static lists (cities, group types, category slugs)
types/actions.ts     ActionResponse<T> and error-code registry
components/shell/    App shell (Header, Sidebar, Footer)
components/ui/       Atomic components
components/providers/ Context providers (GroupProvider, …)
messages/            en.json, lv.json
prisma/              schema.prisma, migrations/, seed.ts
scripts/             Maintenance scripts; scripts/debug/ holds ad-hoc local DB probes
docs/                execution_handoff.md (plan) and core_philosophy.md (why)
```

## The Laws (non-negotiable)

1. **Service Law** — No Prisma calls outside `lib/services/`. Services accept `locale` and return a typed context object (entity + resolved role/permissions + localized `title`), never a raw Prisma result.
2. **Context Law** — Layouts fetch context through services; providers (e.g. `GroupProvider`) hydrate client state from it; client components read it via hooks (`useGroupContext()`). Never prop-drill `userRole`, `accentColor`, or `membershipStatus`.
3. **Taxonomy Law (zero-flicker branding)** — Group colors derive from the L1 category. `--accent` and related CSS variables are set server-side in the layout via a `<style>` block; never resolve accent color on the client.
4. **Defensive Coding Law** — Every form/mutation has a submission guard (`isPending`/`isSubmitting`). Validation uses shared Zod schemas from `@/lib/validations`; never duplicate schema logic.
5. **Action Consistency Law** — Every Server Action returns `ActionResponse<T>` from `@/types/actions.ts`. Errors are uppercase codes (`UNAUTHORIZED`, `NOT_FOUND`, `JOIN_FAILED`), never English strings. Actions do auth, `revalidatePath`, and notifications; DB and permission logic live in services.
6. **Zero-Any Law** — No `any`, `as any`, or `@ts-ignore`. Use Prisma-generated types (`Prisma.GroupGetPayload<…>`), explicit interfaces, or `unknown` + type guards.
7. **Constants Law** — Static lists live in `@/lib/constants/index.ts`; components and Zod schemas import from there.

| Responsibility | Action | Service |
|---|---|---|
| Auth check | yes | no |
| DB query / business logic / permission check | no | yes |
| `revalidatePath`, UI notification | yes | no |

```ts
// @/types/actions.ts
type ActionResponse<T> =
  | { success: true; data?: T }
  | { success: false; error: string } // uppercase code, mapped to errors.* on the client
```

## UI & styling

- Tailwind v4 only — no CSS modules, styled-components, or inline `style` (except setting CSS variables at layout level).
- Use theme variables (`var(--background)`, `var(--surface)`, `var(--accent)`) and existing utilities (`shadow-premium`, `soft-press`); never hardcode colors, radii, or shadows.
- Mobile-first. Server Components by default; add `"use client"` only for interactivity.
- Keep components small; consider splitting past ~150 lines.

## Localization

- No hardcoded user-facing strings; every label lives in `messages/*.json` with namespaced keys (`group.members.requestsTab`).
- `en.json` and `lv.json` keep 1:1 key parity — add keys to both in the same change. Unknown Latvian copy: use `"[LV: key]"` placeholder rather than omitting the key.
- Dates/numbers/currency via next-intl formatters (`useFormatter`, `getFormatter`), never `toLocale*`.

## Conventions

- After creating or significantly updating an entity, redirect to its public page.
- Never derive display titles from slugs in UI; use the service-provided `title`.
- Migration names: `add_{entity}_{field}`, `remove_{entity}_{field}`, `create_{entity}_table`, `add_{relation}_relation`.
- Reuse before creating: search `lib/services`, `lib/validations`, `components/ui`, and `messages/` for existing pieces first.
- Don't create new docs (plans, audits, walkthroughs, reports). Progress goes into `docs/execution_handoff.md` as ticked items; anything else belongs in the commit message. Screenshots and tool output are git-ignored — don't commit them.
- Never commit secrets. `.env*` is ignored (except `.env.example`); MCP API keys are supplied via `${input:…}` prompts in `.vscode/mcp.json`.

## Agent workflow

- Non-trivial changes: produce a short plan first, including a **Motivation & Design Alignment** note tying the approach to the Laws, and wait for approval. Trivial fixes (typos, single strings) can proceed directly.
- Verify library APIs against current docs rather than guessing (Next.js 16, Prisma 6, next-intl 4, Auth.js v5 have all changed recently), and verify UI changes in a real browser.
- Known debt is listed under "Known code debt" in `docs/execution_handoff.md`. Don't add to it; fix adjacent violations only when in scope.
