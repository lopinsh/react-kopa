## Audit Report — 2026-03-05 (Updated after Audit Remediation Session)

### ✅ All Critical Issues Resolved

| Issue | Status |
|---|---|
| **Service Law Violations** — Direct Prisma calls in actions | ✅ Fixed — all moved to `/lib/services/` |
| **Context Law Violations** — `accentColor` prop drilling | ✅ Fixed — CSS variables injected server-side in group layout |
| **Context Law Violations** — `userRole` prop drilling | ✅ Fixed — consumed via `useGroupContext()` |
| **Type Safety** — `@ts-ignore` in `events/page.tsx` | ✅ Fixed — removed; service return type already correct |
| **Type Safety** — `TaxonomyTree` export from Server Action | ✅ Fixed — imports moved to `taxonomy.service.ts` in 12 files |
| **Action Consistency** — `revalidatePath` missing `'page'` arg | ✅ Fixed — standardized across `group-actions.ts`, `report-actions.ts` |
| **Zero-Flicker Branding** — inline `style as any` | ✅ Fixed — all group pages use `<style>` block server-side |

---

### Warnings (remaining — all pre-existing, not introduced by this session)

- **Lint Debt**: 185 remaining problems (85 errors / 100 warnings), down from 190. All errors are pre-existing:
  - `react-hooks/set-state-in-effect` — `setMounted(true)` in `ThemeToggle`, `CookieConsent`, `UserMenu`, `SearchModal`, `GlobalSearch`, `GroupInfoDrawer`
  - `@typescript-eslint/no-explicit-any` — spread across `GroupTabs`, `GroupHeader`, `DiscoveryFilters`, `EventCreationWizard`, shell components
  - `@typescript-eslint/no-require-imports` — `check_keys.js`, `tmp/audit-translations.js` (plain JS scripts)
  - `react/no-unescaped-entities` — literal quote marks in JSX (`RequestCard`, `TagPicker`, `groups/page.tsx`)
  - `@next/next/no-html-link-for-pages` — `<a href="/api/auth/signin">` in `UserMenu`, `<a href="/profile/edit">` in profile page

### Clean (confirmed compliant)

- `npx tsc --noEmit` — ✅ **exit 0, zero type errors**
- All `/actions/` files — no Prisma calls, no `any`, consistent `revalidatePath` usage
- All `/lib/services/` files — no `any`, proper return types
- Group layout — CSS variables injected server-side, no prop drilling of branding
- `events/page.tsx` — no `@ts-ignore`, no `as any` casts

---

### Suggested Next Session Focus

1. **Shell component hook patterns** — Fix `react-hooks/set-state-in-effect` in `ThemeToggle`, `UserMenu`, `CookieConsent`, `SearchModal` (use `useLayoutEffect` or initializer function)
2. **`UserMenu` sign-in link** — Replace `<a href="/api/auth/signin">` with `<Link>` or `signIn()` call
3. **`RequestCard` / `TagPicker`** — Escape quotes in JSX (`&apos;`, `&ldquo;`)
4. **Smoke test taxonomy admin flows** — `/admin/taxonomy`, `/admin/groups/{slug}/categorization`
