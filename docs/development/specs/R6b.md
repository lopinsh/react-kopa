# R6b spec · Centred overlay that grows from the card

Just-in-time spec for the follow-up release R6b of the [build plan](../build-plan.md) (section 6, owner decision **C1**, note `cmv9afy29`), written 15 Oct 2026 against `main` at `6f03068` (R1a–R8 live, the 15 Oct quick batch in), Next.js 16.4.0 (App Router on its bundled React canary), React 19.2.3, next-intl 4. Frozen once R6b is pushed.

**The owner's note (cmv9afy29, 1920 × 914):** the side panel at the right "moves the user's focus away from the card they clicked … Maybe a modal that grows the selected card". **Decision C1 as agreed:** on computers a centred overlay animated out of the clicked card (View Transitions API) that closes back into it; phones keep the sheet; the R6 routes are unchanged, only `Overlay`'s placement and the animation change.

**What does not change:** the routes, `wantsFullPage`, `FullPageInstead`, `FullPageLink`, the panel pages and services, the panel content (`GroupPanel`, `EventPanel`, `EventGatePanel`, `PanelGone`), the phone sheet (below 768 px), Back/Forward/reload behaviour of R6 (spec R6 §2), the R8 rule that a group you belong to or wait for opens its full page (plain `<a>`, no panel). No data, no migration, no service, no action, no i18n key.

**Size:** M, one Sonnet session, ~12 files (2 new). Three commits (section 7). **Stop point:** step 2's checks A1–A4 (section 6); if the grow cannot be made clean, stop and report rather than inventing another technique.

**Rules for the builder and the reviewer (owner, copied as given):** drawings and sizes here are intent, fluid; check at **360, 768, 1024, 1280, 1440, 1920** px; fix small issues found (≤ ~4 min) instead of listing them; dev server only through the browser preview tool (`preview_start` name "dev"), stopped at the end; prefer text/JS checks over screenshots, but the animation itself needs a real look (slow it down in DevTools → Animations, 10 %); use **real clicks** (`computer` click by `ref`) for anything that tests history; never push.

## 0. Motivation and design alignment

- **Handbook / principles.** The owner's complaint is lost orientation: the eye goes to a card, the content appears 1 000 px away. A centred overlay that visibly comes *out of* that card and goes back *into* it keeps the person's place, which the phone sheet already does by rising from the bottom over the list. Motion carries meaning here (where it came from, where it went), so it is kept short (≤ 260 ms) and dropped entirely under `prefers-reduced-motion`.
- **Routes unchanged (C1).** Interception, the panel's own address, Back closing it and a reload opening the full page all stay as R6 built them. The animation lives in two client pieces around the existing navigation; no page, layout or service learns about it.
- **Service, Context, Action Laws.** Nothing new on the server. The panel pages keep one service call each.
- **Taxonomy Law.** The panel's tone stays `--c` set from the service's category colour on the panel element; buttons and links stay site colour; nothing resolves a colour on the client. The view-transition snapshots are pictures of server-styled DOM; no colour is computed for them.
- **Defensive Coding.** The opener ignores a second click while a transition runs; every transition step has a time cap and a `finally` that clears the transition names, so a failed or skipped transition can never leave a name on the page or freeze it.
- **Zero-Any.** `document.startViewTransition` and `style.viewTransitionName` are typed in the DOM lib of TypeScript 5; if the installed lib lacks either, add a small local interface and an `in` guard (`'startViewTransition' in document`), never `any` or `@ts-ignore`.
- **Constants Law.** `PANEL_DIALOG_ID`, `PANEL_VT_NAME = 'panel-origin'`, `PANEL_GROW_MS = 260`, `PANEL_SHRINK_MS = 220`, `PANEL_VT_WAIT_MS = 300` in `lib/constants/index.ts`.

## 1. The technique (Default (spec): the View Transitions API driven by hand, not React's `<ViewTransition>`)

**Why by hand.** React's `<ViewTransition>` (Next guide `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`) morphs a shared element when one named boundary *unmounts* and another with the same name *mounts*. Here the card stays mounted under the overlay, so React's pairing never applies; its names are static props (every card would carry one, and a group shown twice on a page, Manas grupas or a list plus its search, would give a duplicate name, which aborts the whole transition); and the component is only typed in `@types/react/canary`. The browser API with one name moved at click time does exactly what C1 asks.

**Browser support (checked 15 Oct 2026).** Same-document view transitions (`document.startViewTransition`): Chrome and Edge 111+ (2023), Safari 18.0+ (Sep 2024), Firefox 144+ (Oct 2025); Baseline "newly available" since Oct 2025. Missing in older Safari (≤ 17), Firefox ESR 140 and older Android webviews. **Fallback (Default (spec)):** where `startViewTransition` is missing, the overlay opens with the existing CSS `motion-safe:animate-pop` (150 ms fade and scale from 0.97, centred) and closes at once, as R6 does today. Nothing depends on the animation: every path ends in the same DOM.

**Open (a click on a card or row that opens a panel, ≥ 768 px, motion allowed, API present):**
1. A capture-phase `click` listener on `document` (`PanelOriginListener`, section 3.2) finds `a[data-opens-panel]` inside `[data-panel-origin]`, not inside an open dialog (`[aria-modal="true"]`), plain left click (no Ctrl/Meta/Shift/Alt, `button === 0`), no transition already running. Otherwise it does nothing and Next's `Link` navigates as today.
2. It calls `e.preventDefault()` (Next's `Link` skips its own navigation when `defaultPrevented`), remembers the origin (the element and its `data-panel-origin` key, plus the link), sets `card.style.viewTransitionName = 'panel-origin'`, then `document.startViewTransition(update)`. The old state is captured with the card named.
3. `update`: `router.push(pathname + search, { scroll: false })` (the anchor's own href, so locale prefix and query stay as rendered), then waits for `PanelShell` to report it has mounted (a promise resolved from its layout effect) or `PANEL_VT_WAIT_MS` (300 ms), whichever is first. Then: `card.style.viewTransitionName = ''`; if the panel is there, `panel.style.viewTransitionName = 'panel-origin'`. The new state is captured: the card is no longer named, the overlay is.
4. The browser morphs the card's rectangle into the overlay's (section 2.3 CSS) while the page crossfades to the dimmed page (the root's default crossfade, which is how the dim fades in). `transition.finished` → `finally`: clear the panel's and the card's names, mark "not running".
5. The panel's content usually arrives after the skeleton (`@panel/(.)[l1Slug]/loading.tsx` is prefetched with the link): the morph grows into the skeleton, the content then replaces it in place, as R6 does. If 300 ms pass without a panel (not prefetched, slow network), the transition ends without a target (the card's snapshot fades) and the panel appears later with the CSS fallback; no freeze longer than 300 ms.

**Close by ×, Esc or a click on the dim** (`PanelShell`'s `onClose`, ≥ 768 px, motion allowed, API present, an origin that is still in the page and on screen, section 4):
1. `panel.style.viewTransitionName = 'panel-origin'`; `document.startViewTransition(update)`.
2. `update`: `router.back()`, then wait for the shell's unmount (layout-effect cleanup) or 300 ms; then `card.style.viewTransitionName = 'panel-origin'`.
3. The overlay shrinks into the card, the dim fades out. `finally`: clear both names, forget the origin.
4. **No origin on screen** (gone, scrolled away, a panel opened without one): the same transition with no names: the page crossfades from dimmed overlay to the page (150 ms fade-out). **No API or reduced motion:** `router.back()` at once (R6 today).

**Close by the browser's Back (or a mouse back button, a swipe):** instant, as R6 today (**Default (spec)**). Next restores the previous tree inside the `popstate` event and React commits a transition started in `popstate` synchronously (to keep scroll restoration), so the DOM has already changed before any view transition could capture the old state. Forward re-opens the panel without a grow (no click, no origin): the CSS fallback. Not worth a second technique; listed under "Later".

**Panel to panel** (the group panel's next meeting, the event panel's way back to its group panel by Back): the shell stays mounted (R6 §2.6), the content changes in place with no grow; the origin is kept for the shell's lifetime, so closing the last panel by × still shrinks into the card first clicked.

## 2. Placement and size: `components/ui/overlay-layouts.ts` and `Overlay.tsx` (edit)

### 2.1 Breakpoint

**768 px (`md`)**, the same switch as R6: below it the sheet from the bottom exactly as now (90 dvh, grab handle, `animate-rise`); from 768 px the centred overlay. No animation from the card on phones (the sheet's rise already keeps the list in view); the origin listener does nothing below 768 px (`matchMedia('(min-width: 768px)')`).

### 2.2 The centred overlay (from 768 px)

| | Value | Note |
|---|---|---|
| Wrapper (`Overlay`, `layout === 'panel'`) | `items-end justify-center md:items-center md:p-6` | replaces `md:items-stretch md:justify-end` |
| Width | `md:max-w-[560px]` (`w-full` below it) | Default (spec). A dialog size, allowed fixed by the Fluid rule; at 768 px it leaves 104 px each side, at 1920 px it sits in the middle |
| Height | content height, `md:max-h-[min(calc(100dvh-3rem),800px)]` | short panels stay short; long ones scroll **inside** (`overflow-y-auto` on the panel, as now) |
| Shape | `md:rounded-2xl`, `shadow-dialog`, no border | design.md: panels and pop-ups 16 px corners, no border |
| Enter (fallback / no origin) | `motion-safe:md:animate-pop` | replaces `motion-safe:md:animate-from-right`; under reduced motion no animation |
| Picture (`PanelPicture`) | `h-24 md:h-[180px]`, `sizes="(min-width: 768px) 560px, 100vw"` | Default (spec): the wider overlay gets a taller picture (≈ 3.1 : 1); the skeleton in `@panel/(.)[l1Slug]/loading.tsx` changes to `md:h-[180px]` so nothing jumps |
| Grab handle | unchanged (`md:hidden`) | |

The overlay keeps `role="dialog"`, `aria-modal`, the title label, `flush`, and the × in the picture's corner. `PanelShell` passes `id={PANEL_DIALOG_ID}` so `lib/panel-origin.ts` can find the element (no ref threading through `Overlay`). `Overlay.tsx` stays ≤ 150 lines.

### 2.3 Backdrop, dimming, layering, no page shift

- **Backdrop: dim only, no blur** (Default (spec)): the same `bg-scrim`, closing on a click on it. The overlay is still the panel family of AR-67 (dim only), and the person should still recognise the card under the dim that the overlay came from. `behaviour.md`'s Pop-ups line gets the words (section 5).
- **z-index:** unchanged. The overlay is portalled to `body` with `z-50`, after the sticky header (`z-50`, earlier in the DOM), so it and its dim sit over the header; toasts (`z-[100]`) stay above it; pop-ups opened from the panel (contact form, sign-in, pop-overs) stack above it as today. During a view transition every snapshot sits in the top layer, the named overlay group above the root crossfade; nothing else is named.
- **No layout shift:** the scroll lock (`useOverlayLayer`) adds `overflow-hidden` to `#main-content`, which removes its scrollbar and moves the page sideways on Windows and Linux. Add `[scrollbar-gutter:stable]` to `#main-content` in `app/[locale]/layout.tsx` (the gutter is kept whether the scrollbar shows or not). Check A6 measures it.

### 2.4 The transition CSS (`app/globals.css`, one block, Default (spec) values; the builder may tune easing by eye, not the durations' order)

```css
@media (prefers-reduced-motion: no-preference) {
  ::view-transition { pointer-events: none; }                       /* clicks during the animation reach the page (Next guide) */
  ::view-transition-old(root), ::view-transition-new(root) { animation-duration: 180ms; }
  ::view-transition-group(panel-origin) {
    animation-duration: 260ms;                                       /* PANEL_GROW_MS; the close sets 220ms via a class on <html>, below */
    animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
    border-radius: 16px; overflow: clip;                             /* the card's and the overlay's corners while it grows */
  }
  ::view-transition-old(panel-origin), ::view-transition-new(panel-origin) {
    height: 100%; object-fit: cover; object-position: top;           /* no stretching: the top (picture, name) leads */
  }
  ::view-transition-old(panel-origin) { animation: ek-fade 120ms ease-in reverse both; }   /* the card fades out early */
  ::view-transition-new(panel-origin) { animation: ek-fade 180ms ease-out 60ms both; }     /* the overlay fades in as it grows */
  html.vt-shrink::view-transition-group(panel-origin) { animation-duration: 220ms; }
  html.vt-shrink::view-transition-old(panel-origin) { animation: ek-fade 160ms ease-in reverse both; }
  html.vt-shrink::view-transition-new(panel-origin) { animation: ek-fade 120ms ease-out 80ms both; }
}
```
`lib/panel-origin.ts` adds `vt-shrink` to `<html>` for a close and removes it in `finally`. While the grow runs, the overlay's own CSS enter animation is off (`PanelShell` passes `panelClassName="md:animate-none"` when it mounted inside a grow) so it does not pop inside the transition.

## 3. The origin

### 3.1 How a card is identified (Default (spec))

- Every element that can be the origin carries **`data-panel-origin={id}`** (the group's or the event's id): the root of `GroupCard`, `GroupRow` and `EventRow` (`components/discovery/GroupCard.tsx`, `components/discovery/GroupRow.tsx`, `components/events/EventRow.tsx`). These are server-safe data attributes; no client wrapper.
- Every soft link inside them that opens a panel carries **`data-opens-panel`**: `GroupCard`'s name `Link`, `GroupRow`'s name `Link`, `EventRow`'s title `Link` and its group `Link`. The plain `<a>` of `fullPage` cards and rows (R8), the request-count links and the category links do not, so they are never taken over.
- The transition name **`panel-origin` is set only at click time**, on exactly one element, and cleared in a `finally` on every path. Nothing on the page is named at rest. Check A3.
- If the remembered element is gone at close time (the list re-rendered after "Eju" or a realtime update), it is looked up again by key: `document.querySelector('[data-panel-origin="' + CSS.escape(key) + '"]')`, outside any `[aria-modal="true"]`.

### 3.2 Files

```
lib/panel-origin.ts                       new, client-only module, ≤ 110 lines: the one origin, canGrow(), growFrom(anchor, card, navigate), shrinkOrClose(back), panelMounted(), panelUnmounted(), originLink()
components/panels/PanelOriginListener.tsx new, client, ≤ 50 lines: the capture-phase click listener (section 1, open step 1–2); useRouter() for the push
app/[locale]/layout.tsx                   edit: <PanelOriginListener /> next to {panel}; [scrollbar-gutter:stable] on #main-content
components/panels/PanelShell.tsx          edit: id={PANEL_DIALOG_ID}; useLayoutEffect → panelMounted() / cleanup panelUnmounted(); onClose → shrinkOrClose(() => router.back()); returnFocusRef = originLink(); panelClassName while growing
components/ui/Overlay.tsx                 edit: the panel wrapper's alignment (2.2)
components/ui/overlay-layouts.ts          edit: PANEL classes (2.2)
components/panels/PanelPicture.tsx        edit: height and sizes (2.2)
app/[locale]/@panel/(.)[l1Slug]/loading.tsx  edit: skeleton picture height
components/discovery/GroupCard.tsx, components/discovery/GroupRow.tsx, components/events/EventRow.tsx   edit: data-panel-origin, data-opens-panel
app/globals.css                           edit: 2.4
lib/constants/index.ts                    edit: the constants of section 0
```
`canGrow()` = `'startViewTransition' in document` && `matchMedia('(min-width: 768px)').matches` && `!matchMedia('(prefers-reduced-motion: reduce)').matches`. A running transition is kept in the module; a close requested while the grow still runs calls `skipTransition()` on it and closes at once.

### 3.3 Where a panel opens without an origin (plain centred appear)

| Opened from | Result |
|---|---|
| A card or row on discovery (Grupas, Pasākumi, day lists), a group's Pasākumi, Manas grupas' upcoming rows, profiles | **grows from the card / row** |
| Search results (inside the search overlay, `aria-modal`) | plain centred appear (the search closes; its row is gone) |
| A notification, a message, the group panel's next meeting, `router.push` from code | plain centred appear (CSS pop) or, panel to panel, in place |
| Forward after Back | plain centred appear |
| A reload, a shared link, a new tab, a deep link | **the full page** (R6), no overlay at all |
| Ctrl/Meta/middle click | a new tab with the full page (the listener leaves it alone) |

## 4. Focus, keys, history

- **Focus in:** unchanged from R6: focus moves into the dialog (the title, `PANEL_TITLE_ID`), Tab is trapped, the title takes focus again when the content changes in the same shell.
- **Focus back:** to the origin's link (`originLink()`, passed as `returnFocusRef`, which `restoreFocus` prefers over the remembered opener). This fixes Safari, which does not focus a link on click, so the "opener" there is `body`. Without an origin: the opener as today, else `main`. Keyboard users see the card's focus ring (`has-[a[data-card-link]:focus-visible]`) on the card they came from.
- **Keyboard open:** Enter on a focused card link fires `click` and takes the same path (grows). Esc closes (shrinks back). Check A7.
- **History:** unchanged. One entry per opened panel (the panel's address); ×, Esc, the dim and Back all go back one entry; R6's checks R1–R14 must still pass.
- **A card that scrolled away:** while the overlay is open the page cannot scroll (scroll lock), so this only happens after a window resize, a card that was half under the header when clicked, or a re-render. Rule (Default (spec)): shrink into the card only when it is connected and at least part of it is inside the visible area of `#main-content` below the header (`rect.bottom > header.bottom && rect.top < innerHeight`); otherwise the no-origin fade. Focus still returns to its link (that may scroll it into view, which is right for keyboard users).

## 5. Handbook and UI elements

- `docs/handbook/design.md`, the **Panel** entry: "from 768 px a centred overlay that grows out of the card or row you clicked and closes back into it (only a short movement, none with reduced motion); a sheet from the bottom below 768 px"; the screen table row "Group and event panels" → "centred overlay (sheet on phones) | R6b done".
- `docs/handbook/behaviour.md`, Pop-ups: "The opened card and the event panel sit in the middle over the dimmed page (dim only, no blur) and grow out of the card you clicked; Back, Esc, × and a click outside close them." Under motion (or the closest section): "Movement that shows where something came from is kept short and left out under reduced motion."
- UI elements (`components/handbook/UiElementsDemos.tsx`): the "Panels" specimen frames the bodies at 560 px (the computer overlay) next to 360 px (the sheet); no live animation demo.

## 6. Acceptance

**Definition of done:** `npm run typecheck`; `npx eslint` on the changed files; `npm run i18n:check` (no change expected); `npm run plan:check`; `npm run build` passes.

**Grep proofs:**
```bash
git diff --name-only origin/main -- prisma/ "app/[locale]/@panel/(.)[l1Slug]/group" lib/services lib/panel-routes.ts   # P1: empty (routes and services unchanged)
grep -rn "viewTransitionName\|view-transition-name" components app lib | grep -v "lib/panel-origin.ts\|globals.css"     # P2: 0 (names only from one module)
grep -rn "ViewTransition" components app lib | grep -v "startViewTransition"                                             # P3: 0 (no React <ViewTransition>)
grep -rn "as any\|@ts-ignore" lib/panel-origin.ts components/panels                                                      # P4: 0
wc -l components/ui/Overlay.tsx lib/panel-origin.ts components/panels/PanelOriginListener.tsx components/panels/PanelShell.tsx   # P5: ≤ 150, 110, 50, 80
```

**Checks (dev server, freshly seeded DB; real clicks):**

| # | Do | Expect |
|---|---|---|
| A1 | discovery Grupas at 1280: click a card (light, then dark) | the card grows into a 560 px overlay in the middle, the page dims behind it; the panel's content replaces the skeleton in place; the address is the group's |
| A2 | ×, then again Esc, then again a click on the dim | the overlay shrinks back into the same card, the dim fades; focus on the card's link; Back after that leaves the page (one history entry per open) |
| A3 | after A1 and A2, in the console: `[...document.querySelectorAll('*')].filter(e => e.style.viewTransitionName).length` | 0 at rest; never more than 1 during a transition (log it from `transition.ready`) |
| A4 | Pasākumi (day list): click an event's title, then its group link; a group's Pasākumi: an event row | the row grows into the event panel / group panel; × shrinks back into the row |
| A5 | the group panel's next meeting → event panel → × | the content changes in place (no second grow); × shrinks into the first card |
| A6 | before and after opening: `document.querySelector('[data-ui="group-card"]').getBoundingClientRect().x` and `#main-content`'s `clientWidth` | identical (no sideways shift); `scrollWidth === innerWidth` at every width |
| A7 | keyboard only: Tab to a card, Enter, Tab through the panel (trapped), Esc | grows, focus on the title, trapped, shrinks, focus ring on the same card |
| A8 | reduced motion (DevTools → Rendering → prefers-reduced-motion: reduce) | the overlay appears and goes at once in the middle, no grow, no fade |
| A9 | Firefox ESR or the API removed (`delete Document.prototype.startViewTransition` before the click) | centred overlay with the 150 ms pop, instant close; everything else as A1–A7 |
| A10 | browser Back with the overlay open; Forward | closes at once; Forward re-opens it centred with the pop (no grow) |
| A11 | a reload of a panel address; a shared link; Ctrl+click a card | the full group / event page (R6); a new tab with the full page |
| A12 | search: type, click a result | the search closes, the panel appears centred (no grow); Back returns as R7 |
| A13 | Manas grupas: a group you belong to; an upcoming event row | full page (R8, no overlay); the event row grows into the event panel |
| A14 | open a panel, resize from 1280 to 600 and back | sheet below 768, centred above; nothing breaks; × still closes (fade, no grow if the card is off screen) |
| A15 | at 360 and 375 (phones) | the sheet exactly as R6 (90 %, handle, rises from the bottom), no grow |
| A16 | sign-in pop-up or "Sazināties" from the overlay; a toast after sending | they open above the overlay; the toast is above everything; Back closes the form first, then the overlay |
| A17 | R6's routing checks R1–R14 (spec R6 §2.7) | all pass unchanged |

Each of A1–A16 in **lv and en**, at **768, 1024, 1280, 1440, 1920** (the overlay) and **360** (the sheet), **light and dark**. At 768 the overlay leaves visible page at both sides; at 1920 it is 560 px in the middle with the card visible under the dim.

## 7. Builder steps and commits

Every commit typechecks on its own; messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Read first: `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md` (the reduced-motion and `pointer-events` notes), the `Link` reference (`onClick` and `defaultPrevented`), and spec R6 §2.

1. **Placement.** 2.1–2.3 and the constants: centred overlay from 768 px, picture and skeleton height, `scrollbar-gutter`, `PANEL_DIALOG_ID`. The CSS pop is the only animation. Check A6, A11, A15, A16, A17. Commit `feat(R6b): the opened card and the event panel sit in the middle from 768 px`.
2. **The grow.** 1, 2.4, 3, 4: `lib/panel-origin.ts`, `PanelOriginListener`, `PanelShell` wiring, the origin attributes, the CSS. Checks A1–A5, A7–A10, A12–A14. **Stop point:** if the old snapshot already shows the overlay (the navigation committed before capture) or the page freezes, stop and report. Commit `feat(R6b): the overlay grows out of the clicked card and closes back into it`.
3. **Docs and close-out.** Section 5; the whole matrix of 6; `docs/development/build-plan.md` section 8: R6b "built, in review" with the commits; tick the R6b line in `docs/execution_handoff.md`. Commit `docs(R6b): handbook panel and pop-ups, UI elements specimen, status`. Do not push (the reviewer pushes and marks `cmv9afy29` done with `npm run feedback -- done cmv9afy29000lmk01432v7fmu "…"`).

## 8. Risks

- **Taking over the link's click.** The listener prevents Next's own navigation and pushes the same address; prefetch, `scroll={false}` and the interception are unchanged (same `router.push`). Only plain left clicks on marked links in marked cards at ≥ 768 px with the API are touched; everything else is Next's `Link` as before.
- **Rendering is frozen** between the old snapshot and the update's end; capped at 300 ms, so a slow panel appears late with the pop instead of freezing the page.
- **Snapshot of a lazy image:** the picture may not be decoded within the grow; the tone colour shows first and the image fades in. Acceptable.
- **Safari renders `object-fit` on view-transition images slightly differently** (Next guide note); A1 is checked in Safari if available, else accepted on Chrome and Firefox.

## 9. Out of scope / later

The grow on the browser's Back and on Forward (would need the Navigation API's `navigate` event); a grow on phones; animating panel-to-panel changes; a live animation on the UI elements page; C2 (the card's bottom line, a separate change).
