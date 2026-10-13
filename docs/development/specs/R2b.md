# R2b spec · Behaviour pieces

Just-in-time spec for release R2b of the [build plan](../build-plan.md#r2b--behaviour-pieces-m), written 13 Oct 2026 against `main` at `c9c2830` (R1a, R1b, R2a live) and the redesign tag `redesign-v9.8.2`. Frozen once R2b is pushed. The redesign page (`docs/development/redesign.html`, generated from `scripts/redesign/`) wins over this spec where they disagree; the ledger line wins over a drawing.

**Owned rules:** AR-66 Empty states, AR-67 Pop-up rule, AR-71 Text limits. **Also applied:** AR-45 (the counter sits in today's Sazināties form; the form itself is R3b), AR-10 (sentence case in every string touched), the Handbook's Behaviour chapter (toasts, loading, errors, destroying) and Design → Components ("Pop-up … on phones it opens as a sheet from the bottom"). **Owner decisions:** OD-05 (counter warns in the last tenth; past the limit it says by how much in red and "Nosūtīt" waits; "Yes, as drawn": the drawing's words "2013 / 2000 · 13 par daudz"), OD-06 (a small pop-over at the button for undoable steps such as leaving a group or removing a member; permanent deletes keep their dialog), both applied as written.

**Size:** M/L, one Sonnet session (~50 files, most of them a few lines: prop clean-ups, one hook call, a counter under a field; no schema change). Built in six commits; steps 1–4 stand on their own if the session runs out, the counter sweep (5) is last.

## Drawings to match

Anchors on the redesign page; source in `scripts/redesign/` (`gen.mjs` 419–431 Sazināties, toast and counter; 578 empty; 587–591 pop-ups; CSS `css.mjs` 376–390, 505–508 and `gen.mjs` 878–885; parts `parts.mjs` 259–274).

| Drawing | Anchor | What to see |
|---|---|---|
| "Dialog in the middle · dim and 1.5 px blur: the "Sazināties" form over the list" | [#h-pop](../redesign.html#h-pop) | page dimmed (30 % black) and lightly blurred; dialog 420 px, radius 16, padding 18, gap 10; title 18 px Literata; text 14 px muted; buttons at the right: Atcelt (secondary), Nosūtīt (primary); dialog shadow |
| "The form · …" (three) | [#g-contact](../redesign.html#g-contact) | the counter "71 / 2000" quiet, 12 px, under the field's right end |
| "The counter · in the last tenth" | #g-contact | "1874 / 2000" in the warning colour, semibold |
| "The counter · past the limit: "Nosūtīt" waits" | #g-contact | "2013 / 2000 · 13 par daudz" in red, semibold; Nosūtīt disabled |
| "After "Nosūtīt": the form closes, a short toast" | #g-contact | one line: check icon + "Ziņa nosūtīta", inverted (foreground background, background text), radius 12, padding 10/16, 14 px; on phones 72 px from the bottom (above the bottom bar) |
| "Empty" (Paziņojumi) | [#h-me](../redesign.html#h-me) | outline bell 28 px muted; "Pagaidām kluss" 16 px Literata semibold; one sentence 13 px italic in the site colour, max 30 ch; centred |
| Panels and sheets drawn elsewhere ("Phone · the place list as a sheet", "Phone · the same panel as a sheet", the ☰ drawers) | [#h-disc](../redesign.html#h-disc), [#h-group](../redesign.html#h-group), #h-me | scrim without blur; sheet radius 24 on top with a 40 × 4 grab line; side panels full height, no radius |

The rule texts are on the redesign page: [AR-66](../redesign.html#AR-66), [AR-67](../redesign.html#AR-67), [AR-71](../redesign.html#AR-71).

**Not drawn, decided here (builder defaults):** one toast at a time (a new one replaces the old); toasts go by themselves (4 s, errors 6 s) and have no ×; dialogs become bottom sheets below `sm` (640 px, the Handbook rule), so the blur only shows from `sm`; skeletons pulse only under `motion-safe`; the empty field's counter reads "0 / 2000"; the error state is the empty-state shape with a cloud icon and "Mēģināt vēlreiz".

## 0. Motivation and design alignment

- **Service Law.** No data is read or written by anything new; nothing in `components/ui`, `hooks` or the new `loading.tsx`/`error.tsx` files touches Prisma (P13).
- **Context Law.** The toast state stays in `ToastProvider` (`hooks/use-toast.tsx`, mounted once in `components/providers/Providers.tsx`); components call `useToast()`. Overlays read their close function from an `OverlayContext` (`useOverlayClose()`), not from props threaded through the body. No role, accent or membership props are added anywhere.
- **Taxonomy Law.** Pop-ups, toasts, empty states and skeletons use site tokens only. Modal's `accentLine` (a `var(--accent)` gradient) is deleted: a category colour never decorates a site control (AR-06). Skeletons are neutral `bg-tint`, so no wrong colour flashes before a group page arrives.
- **Defensive Coding.** Every confirm button keeps its `isPending` guard; `locked` overlays ignore Esc, scrim, × and Back while saving. The counter adds a second guard: a field over its limit disables its submit (`disabled={isPending || over}`) and Enter-to-send. The limits stay the shared Zod constants (`@/lib/validations`), so client counter and server check can never differ.
- **Action Consistency.** No new actions, no new error codes. Error toasts keep mapping codes through `errors.*`.
- **Zero-Any.** `OverlayLayout` and `LimitState` are string-literal unions; `ConfirmPopover`'s two anchor modes are a discriminated union; `error.tsx` props are typed as the Next docs show.
- **Constants Law.** Every limit a counter shows is an exported constant next to its schema (six new ones, 6.3); the magic numbers in `maxLength={500}`/`{2000}` go.
- **150-line rule.** `Modal.tsx` (172) splits into `Overlay.tsx` (shell) and `Modal.tsx` (header + body), both under 150. Touched files already over 150 (`ChatPanel` 197, `ProfileEditForm` 191, `EventCreationWizard` 517, `GroupMoreMenu` 159, `TeamManager` 164, `ReportList` 190, `GroupHeader` 398, `MemberCard` 270, discovery `page.tsx` 279) get only the few lines below; their splits belong to the releases that replace them (R8, R9a, R9b, R3a/R3b, R11, R5a).

## 1. Data

**Migration: none.** `prisma/schema.prisma` is unchanged; no service or action changes. Blue/green: the old R2a app is untouched by anything here (URLs are unchanged, including the discovery move in 5.1).

## 2. Pop-ups (AR-67)

### 2.1 Tokens and motion (`app/globals.css`)

- `--scrim: rgb(0 0 0 / 0.3)` in `:root`, `rgb(0 0 0 / 0.5)` in the dark block; `--color-scrim: var(--scrim)` in `@theme` (so `bg-scrim`). The drawing's `color-mix(#000 30%)`.
- Tailwind v4 core has no `animate-in`/`fade-in`/`zoom-in-95`/`slide-in-from-*` (the project has no animation plugin; those classes in today's `Modal`, `ConfirmPopover`, `Toast`, `MeDrawer` do nothing). Add to `@theme`: `--animate-fade: ek-fade 150ms ease-out`, `--animate-pop: ek-pop 150ms ease-out` (opacity + scale .97), `--animate-rise: ek-rise 200ms ease-out` (translateY 100 % → 0), `--animate-from-right` and `--animate-from-left` (translateX ±100 % → 0), with their `@keyframes` inside `@theme`. Use them only as `motion-safe:animate-*`. Remove the dead classes from every file this release touches (P6).

### 2.2 `hooks/useBackClose.ts` (new, client, ≤ 60 lines)

```ts
/** AR-67: Back closes the top pop-up. While `open`, one extra history entry (same URL) sits on top; Back pops it. */
export function useBackClose(open: boolean, onClose: () => void, locked?: boolean): () => void   // returns requestClose
```

- On open (effect): `const key = useId()`; `window.history.pushState({ ekOverlay: key }, '')`. No URL argument, so `usePathname`/`useSearchParams` do not change. Next.js patches `pushState` and copies its own `__NA` and `__PRIVATE_NEXTJS_INTERNALS_TREE` into the new entry (`node_modules/next/dist/client/components/app-router.js` 286–297 and `copyNextJsInternalHistoryState` 128–139; documented as "Native History API" in `node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md`), so Back is a router `traverse` to the same URL and tree: nothing re-renders.
- `popstate` listener: `if (window.history.state?.ekOverlay !== key)` → if `locked`, push the entry again (Back cannot be cancelled; the pop-up stays while saving), else `onClose()`. Nested pop-ups each push their own entry; Back closes the top one only, because the one below still finds its key in `history.state`.
- `requestClose()` (×, Esc, scrim): if `history.state?.ekOverlay === key` → `history.back()` (the listener then calls `onClose`), else `onClose()` directly.
- Unmount (closed by the code, e.g. after a successful save): if `history.state?.ekOverlay === key` → `history.back()` with the listener already removed, so no step is left behind. If the top entry is someone else's (a link inside the pop-up navigated), do nothing.
- Links that leave the page from inside such a pop-up use `replace` (next-intl `Link` passes Next's `replace` prop): the pop-up's entry becomes the new page, so Back from there returns to the page under the pop-up in one step. Applies to `MeMenu` in the drawer (`variant="drawer"`), `MessagesDrawer`'s link to `/messages` (line 103), `GroupInfoDrawer` and the phone `DiscoverySidebar` links. Other dialogs' occasional links (sign-in pop-up → Reģistrēties) accept one extra Back step (Risks).
- Development `StrictMode` mounts, cleans up and mounts again: the key is the same `useId`, so the queued `back()` lands on the first pushed entry, which still carries the key; the pop-up stays open. Check it once in `npm run dev`.
- `hooks/useBottomTab.ts` (R2a): its `popstate` listener records the path as a history step; a pop-up's Back changes no path, so the record would linger. Record only when `stripLocale(location.pathname)` differs from the current `pathname` (keep it in a ref). One-line change; R2a's P12 (`history.state`/`replaceState` absent from `useBottomTab.ts` and `components/shell`) still holds.

### 2.3 `components/ui/Overlay.tsx` (new, client, ≤ 130 lines)

The one pop-up shell (what `Modal` is today, minus the header): portal to `document.body`, scrim, stack, scroll lock, Esc, Back, focus trap and focus return.

```ts
export type OverlayLayout = 'dialog' | 'sheet' | 'right' | 'left';
type Props = {
  layout: OverlayLayout;
  onClose(): void;
  locked?: boolean;                       // while saving: Esc, scrim, × and Back do nothing
  role?: 'dialog' | 'alertdialog';
  labelledBy?: string; label?: string; describedBy?: string;
  dataUi: UiName;                         // UI.modal, UI.confirmDialog, UI.sheet, …
  size?: 'sm' | 'md' | 'lg' | '2xl' | '4xl';   // dialog width from `sm`: 384 / 420 (default) / 512 / 672 / 896 px
  flush?: boolean;                        // no panel padding (lists that scroll inside)
  panelClassName?: string; zIndexClassName?: string;   // default z-50 (TranslationEditor keeps z-[70])
  translateIgnore?: boolean;
  returnFocusRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
};
export function useOverlayClose(): () => void;   // requestClose for × buttons inside
```

- Keep from today's `Modal`: the module-level stack (Esc closes only the top one), `restoreFocus` (trigger → opener → `main`), the opener read while rendering, `useFocusTrap` (`data-autofocus` wins), `translateIgnore`.
- Scroll lock: R2a made `#main-content` the scroll container, so `body { overflow: hidden }` alone locks nothing. Add `overflow-hidden` to `document.getElementById('main-content')?.classList` and `document.body.style.overflow = 'hidden'`; remove both when the stack empties.
- **Every** pop-up closes on a scrim click (AR-67: "Click outside, Esc, × and Back close them"), unless `locked`. Today's `closeOnBackdrop` prop (off by default) is deleted (P9). Close on `mousedown` + `mouseup` both on the scrim (a drag that starts in a field and ends outside must not close it).
- Layouts (scrim `fixed inset-0 bg-scrim motion-safe:animate-fade` behind the panel in every case):

| layout | Phone (< `sm`) | From `sm` | Blur |
|---|---|---|---|
| `dialog` | bottom sheet: `w-full max-h-[90dvh] overflow-y-auto rounded-t-3xl bg-surface p-[18px] pb-[calc(18px+env(safe-area-inset-bottom))] shadow-dialog motion-safe:animate-rise`, grab line `mx-auto mb-2 h-1 w-10 rounded-full bg-border sm:hidden` (`aria-hidden`) | centred, `sm:rounded-2xl sm:max-w-[size] sm:max-h-[calc(100dvh-2rem)] motion-safe:sm:animate-pop` | `sm:backdrop-blur-[1.5px]` on the scrim |
| `sheet` | bottom sheet as above | the same sheet, `max-w-[560px]` centred at the bottom | none |
| `right` | full width, full height | `max-w-md`, full height, `border-l border-border`, `shadow-premium`, `motion-safe:animate-from-right` | none |
| `left` | `w-4/5 max-w-[320px]`, full height, `shadow-premium`, `motion-safe:animate-from-left` | same | none |

- Panel: `role`, `aria-modal="true"`, `aria-labelledby`/`aria-label`, `aria-describedby`, `tabIndex={-1}`, `data-ui`.

### 2.4 `components/ui/Modal.tsx` (rewrite on `Overlay`, ≤ 90 lines)

Same default export and the props callers use, fewer of them:

- Keep: `onClose`, `title` (labels the dialog), `subtitle`, `placement: 'center' | 'right'` (→ `layout` `dialog` | `right`), `size`, `flush`, `role`, `describedBy`, `locked`, `hideClose`, `translateIgnore`, `zIndexClassName`, `panelClassName`, `returnFocusRef`, `children`.
- Delete: `variant` (`plain`/`card` → one look), `accentLine`, `icon`, `titleClassName`, `headerClassName`, `closeOnBackdrop` (always on). Every instance looks the same (note cmv5oqmfz under the pop-up rule).
- Header: `flex items-start justify-between gap-3` (`mb-2.5`; with `flush`: `border-b border-border px-[18px] py-3`); title `<h2 class="font-heading text-lg font-semibold text-foreground">`; × `size-10 -mr-2 -mt-2 grid place-items-center rounded-full text-foreground-muted hover:bg-tint` with `aria-label={common.close}`, calling `useOverlayClose()`, `disabled` while `locked`.
- Call sites (remove the deleted props; a title that carried an icon keeps it inline in `title` as a node, in the text colour, no red titles): `components/groups/AnnouncementModal.tsx`, `components/messages/MessagesDrawer.tsx`, `components/modals/{AuthGateModal,ContactGroupModal,MemberMoreModal,ReasonModal,ReportModal}.tsx`, `components/translate/TranslationEditor.tsx`, `components/ui/ConfirmDialog.tsx`. `AuthGateModal` loses its icon tile; `ReasonModal`/`ReportModal` titles lose `text-danger` (the red is for the destructive button only).

### 2.5 `components/ui/Sheet.tsx` (new, client, ≤ 60 lines)

`Sheet({ title, onClose, children, locked?, returnFocusRef? })` = `Overlay layout="sheet" dataUi={UI.sheet}` with the grab line and a header like Modal's. For phone-only choosers (R5a's place, Tēma and date sheets, R6's panels as sheets). No caller in R2b except the UI-elements demo; drag-to-dismiss is not part of it (the grab line is decorative).

### 2.6 `components/ui/ConfirmDialog.tsx` (restyle) and `components/ui/ConfirmPopover.tsx` (restyle + anchor mode)

- **ConfirmDialog** (permanent deletes, OD-06): `Modal role="alertdialog" size="sm" hideClose`; message `text-sm text-foreground-muted`; buttons `mt-4 flex justify-end gap-2` with `components/ui/Button.tsx`: `<Button variant="secondary" size="sm" data-autofocus>` Atcelt, `<Button variant={destructive ? 'danger' : 'primary'} size="sm">` with the spinner while pending. API unchanged.
- **ConfirmPopover** (undoable steps, OD-06): panel `rounded-xl border border-border bg-surface p-3 shadow-premium motion-safe:animate-fade`, message `text-sm font-semibold`, the same two `Button`s. The one `style={{ top, left, width }}` stays (runtime position, the only inline style in `components/ui`, P14). New second mode for menu items, whose trigger closes with the menu:

```ts
type Anchor =
  | { renderTrigger: (p: TriggerProps) => ReactNode; anchorRef?: never }       // today's mode: the pop-over's own button
  | { anchorRef: RefObject<HTMLElement | null>; renderTrigger?: never };      // a menu's trigger: position from it, focus returns to it
type Props = Anchor & { isOpen; onOpenChange; message; confirmLabel; destructive?; isPending?; onConfirm };
```

- **Which confirmations become pop-overs** (undoable; the browser's `confirm()` goes, behaviour.md "Never the browser's confirm()"):

| Where | Step | Anchor |
|---|---|---|
| `components/groups/GroupMoreMenu.tsx` | leave the group (today a ConfirmDialog) | `anchorRef={triggerRef}` (the "…" button) |
| `components/groups/MemberCard.tsx` | promote, demote, remove a member (today `window.confirm`) | `anchorRef` = the card's menu trigger |
| `components/groups/GroupHeader.tsx` | withdraw a join request (today `confirm()`) | `renderTrigger` = the "Pieprasīts ×" button |
| `components/messages/ChatPanel.tsx` | block / unblock (today a ConfirmDialog) | `renderTrigger` = the block button |
| `components/admin/TeamManager.tsx` | make / remove a site admin (today a ConfirmDialog) | `renderTrigger` = the row's button |
| `components/feedback/FeedbackDeleteButton.tsx` | already a pop-over | restyle only |

- **Stay dialogs** (permanent): delete event (`EventManageActions`), announcement (`AnnouncementBoard`), section (`GroupSectionEditor`), group (`GroupSettingsForm`), feedback purge (`FeedbackPurgeButton`), the two Dizains resets (`DesignEditor`: unpublished edits are lost). The `confirm()` calls in `app/[locale]/admin/**` (five) are R11's listed debt and stay.

### 2.7 The other overlays

| File | Change |
|---|---|
| `components/me/MeDrawer.tsx` (R2a) | onto `Overlay layout="left" dataUi={UI.drawer}` (new UI name `drawer: 'drawer'`; keep its `aria-label={profile.area.label}`), drop its own scrim, Esc and focus code; links `replace` (2.2); Back now closes it (R2a left that to R2b) |
| `components/messages/MessagesDrawer.tsx` | via `Modal placement="right"` (gets Back, scrim click already on) |
| `components/groups/GroupInfoDrawer.tsx` (deleted by R3a) | scrim `bg-scrim` without blur, `useBackClose(open, onClose)`, links `replace` |
| `components/discovery/DiscoverySidebar.tsx` phone drawer (replaced by R5a) | the same three changes |
| `app/[locale]/admin/categories/TaxonomySlideover.tsx` (R11) | `bg-scrim` without blur, `useBackClose` |
| `components/feedback/{FeedbackDialog,FeedbackNoteCard}.tsx` | dialogs: `bg-scrim sm:backdrop-blur-[1.5px]`, `useBackClose`; keep `data-feedback-ignore` and their z-index |

## 3. Toasts (Handbook Behaviour; AR-45's "Ziņa nosūtīta" shape)

- **`hooks/use-toast.tsx`:** state is one `toast: ToastMessage | null`; `addToast` replaces the current one and resets its timer (`clearTimeout`); durations: success and info 4000 ms, warning and error 6000 ms; `id` from a counter, not `Math.random`. Keep `useToast()` with `addToast`, `success`, `error`, `removeToast` and `ToastType` (4 types), so the 28 callers do not change. The provider stays where it is.
- **`components/ui/Toast.tsx`** (≤ 40 lines): `<div data-ui={UI.toast} class="pointer-events-auto inline-flex max-w-full items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background shadow-premium motion-safe:animate-rise">`; icon 16 px `aria-hidden` (`Check` success, `CircleAlert` error, `TriangleAlert` warning, `Info` info) in `currentColor`; no ×, no hover-only control, no blur. Text may wrap on a narrow phone; it is never cut.
- **`components/ui/ToastContainer.tsx`** (≤ 40 lines): two persistent live regions rendered after mount (so screen readers hear a change): `role="status"` for success/info/warning and `role="alert"` for errors, both `pointer-events-none fixed inset-x-0 z-[100] flex justify-center px-4 bottom-[calc(4rem+12px+var(--cookie-banner-h,0px))] md:bottom-6` (above the 64 px bottom bar on phones, AR-19).
- Light and dark: the inversion follows the tokens (`--foreground` / `--background`), as the drawing's `var(--fg)` on `var(--bg)`.

## 4. Empty states (AR-66) and the error state

### 4.1 `components/ui/EmptyState.tsx` (rewrite, ≤ 45 lines)

```ts
type Props = { icon: LucideIcon; title: string; description?: string; action?: ReactNode; headingLevel?: 'h2' | 'h3'; className?: string };
```

`<div data-ui={UI.emptyState} class="grid justify-items-center gap-1.5 px-4 pb-7 pt-6 text-center">`; `<Icon aria-hidden strokeWidth={1.6} className="size-7 text-foreground-muted" />` (outline); title `font-heading text-base font-semibold text-foreground` (h2 by default); description, one sentence, `max-w-[30ch] text-[13px] italic text-primary`; `action` at most one, `mt-2`. The dashed box, the 96 px icon disc and the 30 px title go. `icon` takes the component (`icon={Search}`), so size and stroke are the same everywhere.

### 4.2 Every empty list uses it

Replace the copies that inline `data-ui={UI.emptyState}` with `<EmptyState>` (same strings; where a copy has two sentences or two buttons, keep the first sentence and the main action):

- `app/[locale]/(me)/profile/my-groups/page.tsx` (lines 37, 142), `app/[locale]/profile/[username]/page.tsx` (45), `app/[locale]/[l1Slug]/group/[groupSlug]/events/page.tsx` (94), `app/[locale]/admin/reports/ReportList.tsx` (67);
- discovery (`(discovery)/page.tsx`, 5.1): `icon={Search}`; UI elements page: `icon={Calendar}`.

P3 proves no copy is left. Paziņojumi's "Pagaidām kluss" is R8's page; the bell list keeps today's empty text until R8.

### 4.3 `components/ui/ErrorState.tsx` (new, client, ≤ 30 lines)

`ErrorState({ onRetry })`: `EmptyState` with `icon={CloudOff}`, title `common.errorState.title`, description `common.errorState.text`, action `<Button variant="secondary" onClick={onRetry}>{common.errorState.retry}</Button>` (`data-ui={UI.errorState}` on the wrapper). Plain words; never `error.message` or `error.digest` on screen (production messages from Server Components are generic anyway; `error.md`, "error.message").

## 5. Loading shapes and error boundaries

Next 16.4 behaviour this section relies on (verified in `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/`):
- `loading.md`: `loading.tsx` wraps the segment's `page`, nested layouts and `not-found` in `<Suspense>`, not the layout of its own segment; "The Fallback UI is prefetched, making navigation immediate". `layout.md` 316–328: without Cache Components (this app has none, `next.config.ts`), runtime data in a layout *above* a `loading.tsx` blocks the navigation until that layout renders.
- `loading.md` "Status codes": once a fallback streams, the status is fixed at 200; a later `notFound()` streams the not-found UI with `<meta name="robots" content="noindex">`, a later `redirect()` still redirects (Risks).
- `error.md`: `error.tsx` is a Client Component with props `{ error: Error & { digest?: string }; retry: () => void }` (`retry` stable since 16.3; `reset` is the rarer re-render without refetch). It wraps the segment's `page`, `loading`, `not-found` and nested layouts, not the layout of its own segment.
- A search-param change does not re-show a loading fallback: since Next 16 the page segment key is `__PAGE__` without the query (`node_modules/next/dist/shared/lib/segment.js` 86, `createSegmentKey` in `client/components/router-reducer/create-segment-key.js`), so the boundary stays and the router's transition keeps the old list on screen while the new one loads. Acceptance checks it (filters and "load more" must not flash the skeleton).

### 5.1 Discovery: move into a route group

`git mv "app/[locale]/page.tsx" "app/[locale]/(discovery)/page.tsx"` (URL `/[locale]` unchanged; route groups only organise files, `route-groups.md`; the page has no relative imports). A `loading.tsx` at `app/[locale]/` itself would wrap every page below the locale layout: its discovery shape would show on the way to a group, `/about` or `/admin`, and the group layout's `notFound()` would lose its 404 status. Update the comment in `app/page.tsx` (line 4) and the path in the R5a card of `docs/development/build-plan.md` (done with this spec).

### 5.2 `components/ui/Skeleton.tsx` (new, server-safe, ≤ 80 lines)

```ts
export function SkeletonBlock({ className }: { className?: string })   // span: bg-tint rounded-lg motion-safe:animate-pulse, aria-hidden
export function SkeletonCard()    // today's discovery card: image area + title + two text lines (the card's own radius and aspect ratio)
export function SkeletonRow()     // 40 px circle + two lines (member, event, conversation rows)
export function SkeletonPanel()   // a box: heading line + three lines
export function LoadingRegion({ label, children }: { label: string; children: ReactNode })
//   <div role="status" aria-busy="true" data-ui={UI.skeleton}><span class="sr-only">{label}</span>{children}</div>
```

### 5.3 The six files

| File | Shape (copy the page's own outer wrapper, widths and grid classes so nothing jumps when content arrives) |
|---|---|
| `app/[locale]/(discovery)/loading.tsx` | the filter bar's height as one `SkeletonBlock` line, then the card grid of `(discovery)/page.tsx` with 6 `SkeletonCard`s |
| `app/[locale]/[l1Slug]/group/[groupSlug]/loading.tsx` | inside the group frame (the layout's banner and tabs stay): a title line and 4 `SkeletonRow`s in the page column |
| `app/[locale]/(me)/loading.tsx` | inside the own-area frame (person header and menu stay): a title line and 4 `SkeletonRow`s |
| `app/[locale]/error.tsx` | `<div class="mx-auto max-w-[560px] px-4 py-12"><ErrorState onRetry={retry} /></div>` (catches every page under the locale layout, the header and bottom bar stay) |
| `app/[locale]/[l1Slug]/group/[groupSlug]/error.tsx` | the same inside the group frame |
| `app/[locale]/(me)/error.tsx` | the same inside the own-area frame |

- `loading.tsx` files are Server Components: `const t = await getTranslations('common')` (next-intl reads the request locale from the `X-NEXT-INTL-LOCALE` header that `proxy.ts`'s intl middleware sets; `next-intl/dist/esm/development/server/react-server/RequestLocale.js`), `<LoadingRegion label={t('loading')}>`.
- `error.tsx` files: `'use client'`; `export default function SegmentError({ error, retry }: { error: Error & { digest?: string }; retry: () => void })` (not named `Error`: it would shadow the global); `useEffect(() => { console.error(error); }, [error])`.
- Not added: `app/global-error.tsx` (a failing root or locale layout; it must render its own `<html>` without the providers, so without next-intl; Next's default stays), a `loading.tsx` above the group layout (Risks).

## 6. Text counter (AR-71, OD-05)

### 6.1 `lib/text-limit.ts` (new, ≤ 25 lines)

```ts
export type LimitState = 'ok' | 'near' | 'over';
/** near from the last tenth (1800 of 2000: the drawing's 1874 is near, 2013 is over). Length = what the field holds (`value.length`, the unit Zod's .max counts). */
export function limitState(length: number, max: number): LimitState   // length > max → over; length >= Math.ceil(max * 0.9) → near; else ok
export const isOverLimit = (value: string | null | undefined, max: number): boolean => (value ?? '').length > max;
```

### 6.2 `components/ui/TextCounter.tsx` (new, client, ≤ 50 lines)

```ts
export default function TextCounter(props: { id: string; length: number; max: number; className?: string }): JSX.Element
```

- Visible: `<span id={id} data-ui={UI.fieldCounter} class="ml-auto shrink-0 text-xs tabular-nums">`: `ok` `text-foreground-muted`; `near` `font-semibold text-warning`; `over` `font-semibold text-danger` and the over text. Strings `common.counter` / `common.counterOver` (numbers through ICU `{count, number}`, so lv groups like the drawing: "2000", "10 000").
- Screen readers: the field gets `aria-describedby={counterId}` (joined with its error id when it has one), so the count is read on focus; the visible counter is **not** a live region (it would speak on every key). A sibling `<span class="sr-only" aria-live="polite">` speaks only when the state changes: entering `near` (`common.counterNearSr`, characters left), entering or changing `over` (`common.counterOverSr`), and empties when back to `ok`.
- Placement: under the field, right end, in a `mt-1 flex items-start gap-2` row whose left side is the field's error or help text (Handbook "Form field": an error replaces the help text under the field).
- The field loses its `maxLength` attribute (the browser would stop typing and cut a paste, so "past the limit" could never show). The server still refuses: the Zod schemas are unchanged.
- Submit waits: the form's submit button `disabled={isPending || over}` (several limited fields: any of them over); Enter-to-send (`ChatPanel`) checks the same. React Hook Form fields read the value with `useWatch({ control, name })` (react-hook-form 7.71).

### 6.3 Fields that get a counter (constants next to their schema)

| Field | File | Limit |
|---|---|---|
| message (chat input) | `components/messages/ChatPanel.tsx` | `MESSAGE_MAX_LENGTH` (`lib/validations/message.ts`) |
| Sazināties / join message | `components/modals/ContactGroupModal.tsx` | `MESSAGE_MAX_LENGTH` |
| feedback note, reply | `components/feedback/FeedbackDialog.tsx`, `FeedbackThread.tsx` | `FEEDBACK_TEXT_MAX` (`@/lib/constants`) |
| announcement title, text | `components/groups/AnnouncementModal.tsx` | `ANNOUNCEMENT_TITLE_MAX`, `ANNOUNCEMENT_MAX_LENGTH` |
| reason (hide, remove) | `components/modals/ReasonModal.tsx` | new `MODERATION_REASON_MAX = 500` in `lib/validations/moderation.ts` (used by its schema) |
| name, bio | `components/profile/ProfileEditForm.tsx` | new `USER_NAME_MAX = 50`, `USER_BIO_MAX = 500` in `lib/validations/user.ts` |
| group name | `components/groups/settings/BasicsSection.tsx`, `components/groups/create-wizard/BasicInfoStep.tsx` | new `GROUP_NAME_MAX = 80` in `lib/validations/group.ts` |
| event title (per language) | `components/forms/EventCreationWizard.tsx` | new `EVENT_TITLE_MAX = 120` in `lib/validations/event.ts` |
| section title (per language) | `components/groups/SectionEditForm.tsx` | new `SECTION_TITLE_MAX = 120` in `lib/validations/section.ts` |
| text override | `components/translate/TranslationEditor.tsx` | new `MESSAGE_OVERRIDE_MAX = 2000` in `lib/validations/message-override.ts` |

**No counter, by kind (not text a person writes):** passwords, e-mail, URLs (image, social links), the hex colour field, slugs, search and lookup fields (`HeaderSearchField`, `TeamManager` query, `CityField` city search, `TranslateSearch`, the discovery search). **Later, with their owner:** usernames (`components/auth/UsernameField.tsx` and the username field in `ProfileEditForm`; R12 and R9b), register name (R12), the rich-text descriptions (group description, section text, event description and instructions: `RichTextEditor` stores HTML, so a plain length would mislead; needs a character-count extension, R9a/R9b), the admin forms under `app/[locale]/admin/**` (cities, taxonomy names; R11). The coverage table's "Also in" for AR-71 gains R9a, R9b and R11 (done with this spec).

## 7. Accessibility

- **Dialogs:** `role="dialog"` (`alertdialog` for confirmations), `aria-modal`, labelled by the title, described by the message; focus moves in (`data-autofocus`: the safe choice in confirmations), is trapped, and returns to the opener (or the menu trigger, or `main`). Esc, ×, scrim and Back close the top one only.
- **Pop-overs:** `role="alertdialog"` with the message as label; focus to Atcelt; Esc and a click outside cancel; focus back to the button or the menu trigger.
- **Sheets:** the grab line is `aria-hidden`; the panel scrolls inside, never the page behind; bottom padding keeps clear of the phone's home bar (`env(safe-area-inset-bottom)`).
- **Toasts:** `role="status"` / `role="alert"` regions that exist before the message arrives; never the only place an error is shown for a form (the form keeps its own message near the button, behaviour.md "Errors").
- **Counter:** described-by on focus; one polite announcement per state change; colour is never the only signal (the over text says "par daudz").
- **Loading:** `role="status"`, `aria-busy`, one sr-only "Ielādē…"; skeleton blocks `aria-hidden`.
- **Targets and motion:** × and pop-up buttons ≥ 40 px tall where they stand alone (Button `sm` is 32 px: inside a dialog row the pair is the target area, as today; the × is 40 px); every animation `motion-safe:` only.
- **Contrast:** the warning and danger tokens on `--surface` at 12 px semibold (light `#8A5B0B`, `#A63A2E`; dark `#E2B65A`, `#EE9A8E`) and the empty-state sentence in `--primary` at 13 px must reach 4.5:1; measure in both modes (acceptance).

## 8. i18n (both files, same keys; `npm run i18n:check`)

| Key | lv | en |
|---|---|---|
| `common.counter` (new) | {count, number} / {max, number} | {count, number} / {max, number} |
| `common.counterOver` (new) | {count, number} / {max, number} · {over, number} par daudz | {count, number} / {max, number} · {over, number} too many |
| `common.counterNearSr` (new) | {left, plural, one {Atlikusi # rakstzīme} other {Atlikušas # rakstzīmes}} | {left, plural, one {# character left} other {# characters left}} |
| `common.counterOverSr` (new) | {over, plural, one {# rakstzīme par daudz} other {# rakstzīmes par daudz}} | {over, plural, one {# character too many} other {# characters too many}} |
| `common.errorState.title` (new) | Kaut kas nogāja greizi | Something went wrong |
| `common.errorState.text` (new) | Šo lapu neizdevās ielādēt. Pamēģini vēlreiz. | This page didn't load. Please try again. |
| `common.errorState.retry` (new) | Mēģināt vēlreiz | Try again |
| `common.loading` (value: the ellipsis character) | Ielādē… | Loading… |
| `admin.handbook.ui.sections.{sheet,skeleton,counter,errorState,confirmPopover}` (new) | Apakšas panelis, Ielādes formas, Rakstzīmju skaitītājs, Kļūdas stāvoklis, Apstiprinājums pie pogas | Sheet, Loading shapes, Character counter, Error state, Confirmation at the button |
| `admin.handbook.ui.sample.{sheetTitle,sheetText,counterLabel,popoverMessage,popoverConfirm}` (new) | Izvēlies pilsētu · Šis panelis atveras no apakšas. · Ziņa · Pamest grupu? · Pamest | Choose a city · This panel opens from the bottom. · Message · Leave the group? · Leave |

No key is removed (Modal's deleted props carried no text). Sentence case in every value (AR-10).

## 9. UI elements and Handbook

- `/admin/handbook/ui-elements` (`app/[locale]/admin/handbook/ui-elements/page.tsx`, already 254 lines: the new demos go in a new `components/handbook/BehaviourDemos.tsx`, ≤ 150): the dialog (open button), the dialog as a sheet (at 375 px), `Sheet`, ConfirmDialog (both), ConfirmPopover (both anchor modes), the four toasts (one at a time), `EmptyState`, `ErrorState` (retry shows a toast), the three skeletons, and `TextCounter` under a sample textarea with buttons that fill it to 50 %, 95 % and 101 % of a 200 limit. Each `UiSpecimen` names its `data-ui` values and files. `UiElementsDemos.tsx` keeps the existing popup and toast demos, updated to the new APIs (drop `variant="card"`).
- `lib/constants/index.ts` `UI`: add `sheet: 'sheet'`, `confirmPopover: 'confirm-popover'`, `skeleton: 'skeleton'`, `fieldCounter: 'field-counter'` (the redesign's `el()` name), `errorState: 'error-state'`, `drawer: 'drawer'`; `ConfirmPopover` gets `data-ui={UI.confirmPopover}`.
- `docs/handbook/behaviour.md`: a new "## Pop-ups" section (dialogs in the middle dim the page and blur it lightly; side panels, sheets and drawers only dim; a click outside, Esc, × and Back close them; on phones a dialog opens as a sheet from the bottom; "are you sure" for a step you can undo is a small pop-over at the button, a permanent delete keeps its dialog); a new "## Text limits" section (the counter rule of AR-71 in two lines); "Success: a short toast, one line at the bottom (above the bottom bar on phones), one at a time, it goes by itself"; under "Errors": "A page that fails to load says so in plain words, with "Mēģināt vēlreiz"."
- `docs/handbook/design.md` Components: "Pop-up" line → "Overlay is the one shell; Modal (dialog: dim + 1.5 px blur, a sheet on phones), Sheet, side panels and drawers (dim only)"; add "Toast", "Skeleton" (neutral tint, the content's shape), "Text counter" (under the field's right end); delete the line "R2b updates form fields, pop-ups and empty states." and drop "toast, skeleton" from the "Also one each" line (now described above).

## 10. Builder steps and commits

Small commits, each passing `npm run typecheck`; messages `feat(R2b): …` ending with the co-author line.

1. **Foundations.** `app/globals.css` (scrim, keyframes), `UI` names, `hooks/useBackClose.ts`, `components/ui/Overlay.tsx`, the `useBottomTab` one-liner. Commit "feat(R2b): one overlay shell with Back to close".
2. **Pop-ups.** `Modal.tsx` on `Overlay`, `Sheet.tsx`, `ConfirmDialog`, `ConfirmPopover` (anchor mode), the nine Modal call sites, `MeDrawer`, the overlays of 2.7, the five pop-over conversions of 2.6. Open every overlay of 11 at 375 and 1280 px. Commit (split in two if large: shell + call sites, then confirmations).
3. **Toasts.** `use-toast.tsx`, `Toast.tsx`, `ToastContainer.tsx`. Commit.
4. **Empty, loading, error.** `EmptyState`, `ErrorState`, `Skeleton`, the discovery `git mv`, the six files of 5.3, the five empty-state replacements, `common.*` keys. Commit.
5. **Counter.** `lib/text-limit.ts`, `TextCounter.tsx`, the six new constants (and their schemas use them), the fields of 6.3. Commit.
6. **Close-out.** UI elements and Handbook (9); Definition of done (11); in `docs/development/build-plan.md` section 8 set R2b to "built, in review" with the commit range; tick the R2b line in `docs/execution_handoff.md`. Commit. Do not push (the reviewer pushes).

## 11. Acceptance

**Definition of done:**
```bash
npm run typecheck
npx eslint $(git diff --name-only --diff-filter=d origin/main...HEAD -- '*.ts' '*.tsx')
npm run i18n:check
npm run plan:check
npm run build   # needs AUTH_SECRET + DATABASE_URL; the route list still has /[locale] (discovery) and every R2a route
```

**Grep proofs** (Git Bash, repo root; "0" = no output):
```bash
wc -l components/ui/{Overlay,Modal,Sheet,ConfirmDialog,ConfirmPopover,Toast,ToastContainer,EmptyState,ErrorState,Skeleton,TextCounter}.tsx hooks/useBackClose.ts lib/text-limit.ts components/handbook/BehaviourDemos.tsx   # P1: each < 150
grep -rnE "window\.confirm|[^.A-Za-z]confirm\(" components                                                          # P2: 0 (admin app/ pages: R11)
grep -rn "data-ui={UI.emptyState}" app components | grep -v components/ui/EmptyState.tsx                            # P3: 0
grep -rn "backdrop-blur" components/ui components/me components/modals components/messages components/feedback components/groups/GroupInfoDrawer.tsx components/discovery/DiscoverySidebar.tsx "app/[locale]/admin/categories/TaxonomySlideover.tsx"   # P4: only backdrop-blur-[1.5px] in Overlay.tsx and the two feedback dialogs
grep -rn "bg-black/\|bg-background/[0-9]" components/ui components/me components/modals components/feedback/FeedbackDialog.tsx components/feedback/FeedbackNoteCard.tsx components/groups/GroupInfoDrawer.tsx   # P5: 0
grep -rnE "animate-in|zoom-in|slide-in-from|fade-in" components/ui components/me components/modals                  # P6: 0
grep -rn "maxLength=" components app                                                                                  # P7: only ColorField (7), TeamManager (search), UsernameField, CityField, admin CitiesSection/PendingCityCard
grep -rln "TextCounter" components | wc -l                                                                            # P8: ≥ 12 (11 field files + BehaviourDemos)
grep -rnE "variant=\"card\"|accentLine|closeOnBackdrop|titleClassName|headerClassName" components app                # P9: 0
test -e "app/[locale]/page.tsx" && echo FAIL; ls "app/[locale]/(discovery)/page.tsx" "app/[locale]/(discovery)/loading.tsx" "app/[locale]/error.tsx" \
   "app/[locale]/[l1Slug]/group/[groupSlug]/loading.tsx" "app/[locale]/[l1Slug]/group/[groupSlug]/error.tsx" "app/[locale]/(me)/loading.tsx" "app/[locale]/(me)/error.tsx"   # P10
git diff --stat origin/main -- prisma/                                                                               # P11: empty
grep -rnE "history\.(back|pushState)" hooks components | grep -v hooks/useBackClose.ts                               # P12: 0
grep -rnE "prisma\.|@/lib/prisma" components/ui hooks "app/[locale]/(discovery)/loading.tsx" "app/[locale]/(me)/loading.tsx"   # P13: 0
grep -rnE "#[0-9a-fA-F]{3,6}\b|dark:|uppercase|style=" components/ui/{Overlay,Modal,Sheet,ConfirmDialog,ConfirmPopover,Toast,ToastContainer,EmptyState,ErrorState,Skeleton,TextCounter}.tsx   # P14: only ConfirmPopover's position style
grep -rnE "error\.(message|digest)" app --include=error.tsx                                                          # P15: 0 (only console.error(error))
```

**Screens** (dev server, seeded DB; lv and en; 360, 375 and 1280 px; light and dark; signed out, plain user, site admin):

| Where | Look for |
|---|---|
| every overlay: sign-in pop-up (signed out: "+" in the bottom bar, "Pievienoties"), Sazināties (signed in, not a member), member list "more", report group ("…" → Ziņot), announcement (team: Jaunumi → new), reason (admin: hide group), translation editor (translate mode), messages drawer (desktop header), own-area drawer (375), group info drawer (375), category drawer on discovery (375), taxonomy slide-over (admin), feedback dialog and note card (feedback mode), every ConfirmDialog of 2.6 | 375/360: a sheet from the bottom (dialogs) or the drawer's side, dim only, scroll inside; 1280: dialog side by side with "Dialog in the middle", dim + blur; drawers and panels dim only; Esc, ×, scrim and **Back** each close it and Back does not leave the page; Forward does not reopen it; focus returns to the button; while saving (`locked`) none of them closes |
| nested: Sazināties opened from the sign-in flow, a ConfirmDialog over a Modal | Back closes only the top one |
| own-area drawer → Ziņas | lands on Ziņas; one Back returns to the page under the drawer |
| after a save that refreshes (send a join request; promote a member) | the pop-up closes, the page shows the new state (no revert from the history step), Back goes to the previous page |
| pop-overs: leave group ("…"), promote/remove member, withdraw request, block, make admin (admin team page), delete feedback note | a small box at the button or the "…" trigger, no scrim; Esc and outside click cancel; focus back to the trigger; no browser `confirm()` anywhere |
| toasts: copy a link, leave a group, a failing action (stop Soketi or the DB briefly) | one line, inverted, above the bottom bar at 375, bottom centre at 1280, above the cookie banner when it shows; a second toast replaces the first; screen reader hears it once |
| empty states: discovery with a filter that matches nothing, Manas grupas with none (new user), a profile without groups, group Pasākumi with none, admin reports empty | AR-66 look: outline icon, title, one italic sentence in the site colour, at most one action |
| loading: throttle "Slow 4G", go discovery → about → discovery, group Informācija → Pasākumi, Mans profils → Iestatījumi | the matching skeleton inside the frame; banner, person header and menus never disappear; nothing jumps when content arrives (compare positions in a screenshot pair) |
| discovery filters, category change, infinite scroll | **no** skeleton flash: the list stays until the new one replaces it |
| error: temporarily `throw new Error('test')` in a group page, an own-area page and the discovery page (not committed) | the error state inside the right frame, "Mēģināt vēlreiz" re-renders (remove the throw first: it recovers); no message text, no digest on screen |
| counter: Sazināties message, chat, feedback, announcement, reason, profile name/bio, group name (settings and wizard), event title, section title, translation editor | side by side with the three counter drawings: quiet count, warning from 90 %, red "· N par daudz" past the limit after a paste, submit disabled and Enter does nothing while over; under the limit again it all returns; screen reader: one announcement entering 90 % and one when over |
| contrast | DevTools contrast for the counter (near, over), the empty-state sentence and the toast text in light and dark: ≥ 4.5:1 |
| UI elements page | every new specimen renders in both modes; counter buttons show the three states |

**Signed-out leak checks** (browser console on the dev site while signed out, `fetch(url, { credentials: 'omit' }).then(r => r.status + ' ' + r.url).then(console.log)` and `.text()` to read the body):
- `/lv/profile`, `/lv/profile/edit`, `/lv/messages`, `/lv/settings`: the body holds no seeded user's name, e-mail or conversation text; it ends in the sign-in redirect (a 307, or with the (me) fallback streamed first a 200 whose body carries the redirect to `/lv/auth/signin`); in a real tab the page lands on sign-in.
- `/lv/profile/my-groups`: today's guest prompt, no group names of any user.
- A private group's `/members` and `/events/<slug>` and an unknown event slug `/lv/<l1>/group/<slug>/events/nope`: no member names or event text; the unknown slug returns the not-found UI with `<meta name="robots" content="noindex">` (status 200 is expected now, Risks); an unknown group slug still returns **404** (its check is in the group layout, above the group `loading.tsx`).
- Every `error.tsx` path above: the body never contains the thrown message.

**Blue/green:** no schema change (P11); URLs unchanged (the discovery move is a route group); history entries with `ekOverlay` in their state are harmless to the old app (Next copies and ignores unknown keys).

## 12. Risks

- **Status codes under the new `loading.tsx` files:** a page-level `notFound()` under the group or own-area boundary (unknown event, members-only gates, the settings guard) becomes a streamed not-found: status 200 with `noindex` (`loading.md`, "Status codes"); a page-level `redirect()` (signed-out own-area pages) streams too and still lands on sign-in. Unknown groups keep 404 (layout check). Accepted for the prototype (no indexing loss: `noindex`); if a real 404 is wanted later, the slug check moves into `proxy.ts` (the doc's advice). No `loading.tsx` above the group layout, for the same reason: entering a group from discovery therefore waits for the group layout as today (R6's panels make that click stay on discovery).
- **Back and history:** a pop-up that navigates through a link without `replace` leaves one dead Back step (same URL as the page under it); a reload while a pop-up is open leaves one too. The listed navigation overlays use `replace`; others are rare. If `history.back()` from a closing pop-up races a `router.refresh()`, check the page does not show the pre-refresh tree (acceptance row "after a save"); fallback: in that hook call, close without the history step and accept the dead entry.
- **Click outside now closes every dialog,** forms included (AR-67). A long Sazināties message is lost on a stray click; the mousedown-and-mouseup-on-scrim rule avoids the common drag case. R3b may add a "discard?" step if the owner asks; not in the rule.
- **Dialogs as phone sheets** change the look of ~15 pop-ups at once; the reviewer opens each (11).
- **Removing `maxLength`** lets a pasted text exceed the limit on purpose; the server's Zod check is unchanged, and the disabled submit stops the request. Fields not in 6.3 keep `maxLength` (P7).
- **Toast replacement:** two quick actions show only the last toast; a success followed by an error shows the error (intended: the newest state).
- **`useBottomTab` change:** re-run R2a's AR-20 walk once (spec R2a 4.8 examples) after step 1.

## 13. Out of scope

The Sazināties form's new content, its "Ziņa nosūtīta" toast and the pending state (R3b; R2b only adds the counter to today's form); Paziņojumi page and its "Pagaidām kluss" empty (R8); counters on usernames and the register name (R12, R9b), rich-text descriptions (R9a, R9b) and admin forms (R11); the five admin `confirm()` calls (R11); `app/global-error.tsx`; drag-to-dismiss on sheets; a "discard changes?" step for dialogs with typed text; splitting the long files named in 0 (their owners); the group frame skeleton on entering a group (needs a boundary above the group layout, see Risks).
