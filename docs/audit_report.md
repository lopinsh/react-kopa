## Audit Report — 2026-03-10 — Full System Audit + Refactoring Opportunities

### Critical (must fix before any new work)
- [ ] **Service Law Violations**: Raw Prisma calls exist in `/actions/onboarding-actions.ts`, `/actions/notification-actions.ts`, and `/actions/group-actions.ts` (e.g. `getGroupDetails`, `getGroupRole`). These must be delegated to their respective services (`UserService`, `NotificationService`, `GroupService`).
- [ ] **Service/Component Law Violation**: `app/[locale]/groups/page.tsx` (the deprecated My Groups page) is making direct `prisma.membership.findMany` queries. This route should either be fully deleted or refactored to use `GroupService`.
- [ ] **Action Consistency Violations**: Several actions (`getNotifications()`, `getGroupPosts()`, `getGroupEvents()`, `getReports()`) do not return the `ActionResponse<T>` type and do not handle errors gracefully via the standard registry.

### Warnings (fix soon, not blocking)
- [ ] **Type Safety (`any` usages)**: Multiple instances of `: any` and `as any` found in components (`usePusher.ts`, `RichTextEditor.tsx`, `NotificationCenter.tsx`, `GroupHeader.tsx`, `TagPicker.tsx`, `EventCard.tsx`, group feature pages). Need to be replaced with strict interfaces or `unknown`.
- [ ] **Localization Violations**: Hardcoded English strings discovered in `Footer.tsx` ("EK"), `ProfileEditForm.tsx` ("Update your public profile information."), `GroupSectionEditor.tsx` ("Section Title", "Visibility"), `BasicInfoStep.tsx`, `EventCreationWizard.tsx`, `InfiniteScrollTrigger.tsx` ("Loading more groups..."), and `FilterBar.tsx` ("Filters", "All Group Types").
- [ ] **Native Formatters**: `PendingInboxCard.tsx` uses `item.submittedAt?.toLocaleDateString()` instead of `next-intl` formatters.
- [ ] **Constants Law**: Components like `EventCreationWizard.tsx` and `FilterBar.tsx` use hardcoded arrays (e.g., `['PUBLIC', 'PRIVATE']`) and explicit `<option>` maps instead of centralized lists from `@/lib/constants/index.ts`.

### Architectural Refactoring Opportunities (Standardization)
The audit identified multiple components/functions using varied approaches for similar results. The following should be unified:

1. **The `accentColor` Context Law & Inline Styles Violation**
   - **Issue**: Extensive prop-drilling of `accentColor` across `GroupHeader`, `GroupTabs`, `GroupSettingsForm`, `CategorizationSection`, `EventCard`, and inside `/app/[locale]/[l1Slug]/group/[groupSlug]/*` pages.
   - **Issue**: Dozens of components apply `style={{ backgroundColor: accentColor }}` inline, which breaks the Zero-Flicker Branding law (Taxonomy Law).
   - **Solution**: Refactor all components to rely exclusively on `bg-[color:var(--accent)]` classes. The `accentColor` prop should be completely removed from child components, as the layout already injects the `--accent` CSS variable server-side.

2. **Notification Creation Duplication**
   - **Issue**: `/actions/notification-actions.ts` contains an internal `createNotification` utility that does raw Prisma calls and Pusher triggers. Wait, `GroupService` actions currently rely on this exported action for notifications.
   - **Solution**: Move `createNotification` directly into a dedicated `NotificationService` layer to unify notification/Pusher logic outside of the actions layer.

3. **Massive Modals Mounting in Headers**
   - **Issue**: `GroupHeader.tsx` proactively renders five full modals (`ApplicationModal`, `ReportModal`, `AuthGateModal`, `InquiryModal`, `SupportMessageModal`) simultaneously, bloating the DOM and client bundle.
   - **Solution**: Implement a unified Modal Provider or use dynamic imports (`next/dynamic`) for heavy modals to streamline component rendering.

4. **Duplicate "Role/Permission" Checks**
   - **Issue**: The check `userRole === 'OWNER' || userRole === 'ADMIN'` is manually typed out repeatedly across actions and UI components.
   - **Solution**: Introduce a `hasAdminRights(role)` utility and unifying authorization checks behind it.

### Clean (confirmed compliant)
- ✅ `docs/execution_handoff.md` matches the current system state (Chunk 15 completed).
- ✅ Routing architecture adheres strictly to App Router standards (no orphaned old `pages/` routes).

---
### Previously Known Issues (from previous audit_report.md)
- ✅ **Lint Debt**: 45 remaining errors in unrelated/older modules (from Chunk 15).
- ✅ **Shell component hook patterns**: `react-hooks/set-state-in-effect` pending fix.
- ✅ **`UserMenu` sign-in link**: Hardcoded `<a>` pending replacement.
- ✅ **`RequestCard` / `TagPicker`**: Unescaped quotes warning pending fix.
