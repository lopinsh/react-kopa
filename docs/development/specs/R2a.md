# R2a spec · Header, menus, bottom bar, footer, own area

Just-in-time spec for release R2a of the [build plan](../build-plan.md#r2a--header-menus-bottom-bar-footer-own-area-l), written 13 Oct 2026 against `main` at `3a58997` (R1a live; R1b built and reviewed) and the redesign tag `redesign-v9.8.2`. Frozen once R2a is pushed. The redesign page (`docs/development/redesign.html`, generated from `scripts/redesign/`) wins over this spec where they disagree; the ledger line wins over a drawing.

**Owned rules:** AR-12 Desktop header, AR-13 Phone header, AR-14 Profile menu, AR-15 Language switch, AR-16 Footer, AR-17 Light and dark, AR-18 Admin shield menu, AR-19 Bottom bar, AR-20 Where Grupas and Es lead, AR-21 Navigation rule, AR-60 Own area. **Also applied:** AR-41 (the header field is a plain field; here a GET form to `/?q=`, R7 makes it open the search), AR-61/AR-65 (pages sit in the frame; their content is R8), AR-10 (sentence case in every string touched). **Owner decisions:** OD-02 (Grupas → Manas grupas, Es → Mans profils, the tab you came from stays marked on group pages), OD-03 (Iestatījumi is the last page of your own area), both applied as written.

**Size:** L, one Sonnet session (~32 files, no schema change). The card's R2c split is not needed: the own area is ~8 small files and is built last (step 5), so the shell steps stand on their own if the session runs out.

## Drawings to match

Anchors on the redesign page; source in `scripts/redesign/` (parts `parts.mjs` 83–106, 313–318; CSS `css.mjs` 96–134, 417–432, 456–459, 473–477 and `gen.mjs` 790–809).

| Drawing | Anchor | Who | What to see |
|---|---|---|---|
| "Desktop · signed in" | [#h-shell](../redesign.html#h-shell) | Ilze, not an admin | logo · search field (flex) · "LV ▾" · messages (dot) · bell (dot) · picture |
| "Desktop · site admin: the shield, left of messages" | #h-shell | admin | as above, shield between "LV ▾" and messages |
| "Desktop · signed out" | #h-shell | signed out | logo · search field · "LV ▾" · "Ienākt" (primary, small) |
| "Phone · signed in" | #h-shell | Ilze | logo (wordmark + circles) · gap · "LV ▾" · search icon · bell · picture |
| "Phone · site admin" | #h-shell | admin | shield between search icon and bell |
| "Phone · bottom bar" | #h-shell | any | Atklāt · Grupas · + (outlined circle) · Ziņas (count) · Es; the marked tab has a tinted pill behind its icon and a bolder label |
| "“LV ▾” opens a short list" | #h-shell | any | 200 px list: ✓ Latviešu LV, English EN |
| "Desktop · end of discovery", "Phone · end of discovery" | #h-shell | any | slim footer: logo · "Atrodi savējos, augam kopā." · Par mums · Privātums; on phones above the bottom bar |
| "Your picture opens the profile menu" | #h-shell | signed in | Mans profils · Manas grupas (count slot) · Izveidot grupu · line · Iestatījumi · Iziet |
| "The shield opens the admin menu (admins only)" | #h-shell | admin | Atsauksmju režīms (Izslēgts) · Tulkošanas režīms (Izslēgts) · line · Administrēšanas panelis → |
| "Desktop · Iestatījumi" | [#h-me](../redesign.html#h-me) | Ilze | person header (picture, name, "Jelgava · 3 grupas"); own menu down the left with Iestatījumi marked; "Izskats" with Gaišs / Tumšs / Kā ierīcē |
| "Phone · the drawer, opened" | #h-me | Ilze | own phone bar (☰, picture, name, line); drawer from the left (80 %) with the person head and the own menu; dimmed page |
| "Desktop · Mans profils", "Desktop · Manas grupas", "Desktop · Ziņas in your own area" | #h-me | Ilze | **frame only** (person header + own menu + the page beside it); the page content stays today's (R8, R9b) |
| "Phone · Mans profils (“Es” …)", "Phone · Manas grupas (“Grupas” …)" | #h-me | Ilze | own phone bar on top, bottom bar marks Es / Grupas |
| "Phone · Dizains → Kategoriju krāsas" | [#h-admin](../redesign.html#h-admin) | admin | bottom bar on an admin page with **no** tab marked (`navb(null)`) |

The rule texts (AR-12 … AR-21, AR-60) are on the redesign page under [Agreed rules](../redesign.html#h-rules); the phone paragraph under "Header and navigation" adds: on own-area pages the bar marks Manas grupas → Grupas, Ziņas → Ziņas, the rest → Es.

**Not drawn, decided here (builder defaults):** the phone search icon opens a one-line search row under the header until R7 (full-screen search); the own menu has four items until R8 adds Paziņojumi with its page; "Manas grupas" shows no count until R8 (`add_user_my_groups_seen_at`); the bell keeps today's list and look (R8).

## 0. Motivation and design alignment

- **Service Law.** The only new data read is the own-area head (name, picture, first city, group count): a new `UserService.getOwnAreaContext(userId)` in `lib/services/user.service.ts`. Nothing in `components/shell`, `components/me` or `app/[locale]/(me)` touches Prisma.
- **Context Law.** The own-area layout fetches its context through the service, `MeProvider` hydrates it, and the client pieces (`MeMenu`, `MePhoneBar`, `MeDrawer`) read `useMeContext()`; nothing is prop-drilled below the provider. The header stays a Server Component reading `auth()` once and passing only the `user` object to the profile menu (as today; no role or membership props). The bottom bar's one server value (the tab a group page marks on a hard load) is a cookie read in the locale layout and passed once as `initialTab`.
- **Taxonomy Law.** Untouched: no category colour in the shell (AR-06); the shell uses site tokens only.
- **Defensive Coding.** The only mutation is sign-out (`signOut()`), guarded by a pending flag; the search form is a GET navigation; the theme radios call `setTheme` (no server write).
- **Action Consistency.** No new actions, no new error codes.
- **Constants Law.** The bottom-bar tabs, own-area pages, footer routes and language names live in `lib/navigation.ts` and `@/lib/constants`.
- **Zero-Any.** Tabs are a string-literal union with a type guard for the cookie value.
- **150-line rule.** `MobileNav.tsx` (130) and `UserMenu.tsx` (137) are rewritten below 150; the shared menu behaviour moves into one `components/ui/Menu.tsx`, so the three header menus stay small.

## 1. Data

**Migration: none.** `prisma/schema.prisma` is unchanged. The language choice is kept on the device (the next-intl cookie, made persistent in 4.6); keeping it on the account (the note under the "LV ▾" drawing) needs a `User.locale` column and is out of scope (see 11). The theme stays in next-themes (`localStorage`, its inline script prevents a flash; the card's builder default; no server need found).

New service method (`lib/services/user.service.ts`, next to `getOwnProfile`):

```ts
export type OwnAreaContext = {
    id: string; name: string | null; username: string | null;
    image: string | null; avatarSeed: string | null;
    firstCity: string | null;   // user.cities[0] ?? null (a city slug)
    groupCount: number;         // memberships with role != PENDING in groups with hiddenAt null
};
async getOwnAreaContext(userId: string): Promise<OwnAreaContext | null>
// one prisma.user.findUnique with select {id,name,username,image,avatarSeed,cities} and
// _count: { select: { memberships: { where: { role: { not: 'PENDING' }, group: { hiddenAt: null } } } } }
```

## 2. Shell structure (`app/[locale]/layout.tsx`, `app/layout.tsx`)

```
<a href="#content" class="sr-only focus:not-sr-only …">{shell.skipToContent}</a>
<div class="flex h-screen flex-col">
  <Header />                                   ← <header>, banner landmark
  <div class="flex flex-1 overflow-hidden">
    <Sidebar />                                ← group sidebar, unchanged until R3a deletes it
    <div id="main-content" class="flex-1 overflow-y-auto pb-[calc(5rem+var(--cookie-banner-h,0px))] md:pb-0">
      <main id="content" tabIndex={-1} class="focus:outline-none">{children}</main>
      <Footer />                               ← client; renders only on FOOTER_PATHS; outside <main> = contentinfo
    </div>
  </div>
</div>
<MobileNav initialTab={…cookie…} />            ← <nav aria-label={nav.mobileLabel}>
```

- The scroll container keeps the id `main-content` (`GroupTabs.tsx` lines 99, 159 use it as the scroll-spy root; R3a deletes GroupTabs). `<main>` gets `id="content"`, the skip link's target.
- One `<main>` per page: change the inner `<main>` to `<div>` in `app/[locale]/page.tsx` (148), `app/[locale]/[l1Slug]/group/[groupSlug]/layout.tsx` (54) and `…/events/[eventSlug]/page.tsx` (128). `Modal.tsx` line 63 (`querySelector('main')`) keeps working.
- `app/layout.tsx`: `<html lang={await getLocale()}>` (`getLocale` from `next-intl/server`; today it is hard-coded `"en"`). The request config falls back to `lv` for the root `app/page.tsx`.
- `MobileNav initialTab`: `const c = (await cookies()).get(NAV_TAB_COOKIE)?.value; initialTab = isBottomTab(c) ? c : 'discover'` (`cookies` from `next/headers` is async: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md`). The locale layout is already dynamic (`auth()`, theme cookie), so this adds no render cost.
- `--header-height` and `--spacing-header` in `app/globals.css` become `56px` (both modes). `MessagesLayout` and `DiscoverySidebar` read the variable; `DiscoverySidebar`'s phone `64px` is the bottom bar and stays.

## 3. `lib/navigation.ts` (rewrite) and constants

```ts
export const BOTTOM_TABS = ['discover', 'groups', 'messages', 'me'] as const;
export type BottomTab = (typeof BOTTOM_TABS)[number];
export const isBottomTab = (v: unknown): v is BottomTab => typeof v === 'string' && (BOTTOM_TABS as readonly string[]).includes(v);
export const NAV_TAB_COOKIE = 'ek_nav_tab';
export const NAV_FROM_STORAGE = 'ek_nav_from';            // sessionStorage: Record<groupBasePath, BottomTab>

/** '/sports/group/slug' for any page of a group (pathname without locale), else null. */
export function groupBasePath(pathname: string): string | null   // segments[1] === 'group' && segments.length >= 3
/** The tab a path marks: its own tab, 'keep' on group pages (the tab you came from), or null (none marked). */
export function tabForPath(pathname: string): BottomTab | 'keep' | null
//   '/' → discover · '/profile/my-groups…' → groups · '/messages…' → messages
//   '/profile', '/profile/edit', '/settings' → me · group pages → 'keep'
//   everything else (admin, create, about, privacy, /profile/[username], onboarding) → null

export const BOTTOM_LINKS: { tab: BottomTab; href: string; labelKey: 'discover' | 'groups' | 'messages' | 'me'; icon: LucideIcon }[]
//   discover '/' Compass · groups '/profile/my-groups' Users · messages '/messages' MessageSquare · me '/profile' User
export const ME_PAGES: { href: string; labelKey: 'myProfile' | 'myGroups' | 'messages' | 'settings'; icon: LucideIcon; match: (p: string) => boolean; badge?: 'messages' }[]
//   '/profile' (match /profile, /profile/edit) · '/profile/my-groups' · '/messages' (badge) · '/settings'
export const FOOTER_PATHS = ['/', '/about', '/privacy'] as const;   // AR-16: discovery and reading pages
```

`@/lib/constants/index.ts`: add `LOCALE_NAMES: Record<Locale, string> = { lv: 'Latviešu', en: 'English' }` (each language in its own words, the same in every locale, so a constant, not a message) and the `UI` names `searchBar: 'search-bar'`, `languageSwitch: 'language-switch'`, `languageList: 'language-list'`, `profileMenu: 'profile-menu'`, `shieldMenu: 'shield-menu'`, `personHeader: 'person-header'`, `ownMenu: 'own-menu'`, `ownBarPhone: 'own-bar-phone'` (the redesign's `el()` names; `header`, `mobileNav`, `footer` keep theirs).

`i18n/routing.ts`: `defineRouting({ …, localeCookie: { maxAge: 60 * 60 * 24 * 365 } })`. next-intl 4.13 sets `NEXT_LOCALE` as a session cookie by default (`node_modules/next-intl/dist/esm/development/routing/config.js`, `receiveLocaleCookie`) and writes it on a locale switch through `Link`/`router` (`navigation/shared/syncLocaleCookie.js`); the max-age keeps "signed out, on the device" across browser restarts.

## 4. Components

### 4.1 `components/ui/Menu.tsx` (new, client, ≤ 120 lines)

One menu-button pattern for the profile, shield and language menus (WAI-ARIA menu button).

```ts
export function useMenu(): { open: boolean; setOpen(v: boolean): void; triggerProps: …; menuProps: …; close(): void }
export function MenuPanel(props: { label: string; align?: 'end'; className?: string; children }): JSX.Element  // role="menu", data-ui={UI.dropdownMenu}
export function MenuItemLink(props: { href: string; icon?; children; trailing?; locale?; current? })            // next-intl Link, role="menuitem" (menuitemradio + aria-checked when `current` is boolean)
export function MenuItemButton(props: { onSelect(): void; icon?; children; trailing?; disabled? })              // role="menuitem"
export function MenuSeparator()                                                                                // role="separator"
```

- Trigger: `<button type="button" aria-haspopup="menu" aria-expanded aria-controls={id}>`, 40 × 40 px hit area.
- Keys: Enter, Space or ↓ open and focus the first item; ↑ opens on the last; inside: ↓/↑ move (wrap), Home/End, Esc closes and returns focus to the trigger, Tab closes and lets focus move on; choosing an item closes. Click outside closes (`hooks/useClickOutside.ts`).
- Look (`css.mjs` 128–134): 240 px (`w-60`, language list `w-[200px]`), `bg-surface border border-border rounded-[14px] p-1.5 shadow-premium`; items `rounded-[10px] px-2.5 py-[7px] text-sm min-h-10`, icon 17 px in `text-foreground-muted`, trailing count/state `ml-auto text-xs text-foreground-muted` (count: `rounded-full bg-tint px-[7px] font-bold text-foreground`); separator `h-px bg-border mx-2 my-1`. Hover/focus `bg-tint`. Phones: the panel is `fixed inset-x-4 top-[calc(var(--header-height)+4px)]`, from `sm` `absolute right-0 mt-2`.

### 4.2 `components/shell/Header.tsx` (rewrite, Server Component, ≤ 100 lines)

`<header data-ui={UI.header} class="sticky top-0 z-50 flex h-header items-center gap-2 border-b border-border bg-surface px-3 md:px-4">`

| Order | Desktop (md+) | Phone | Signed out |
|---|---|---|---|
| 1 | `<Link href="/" aria-label={logoText}><Logo /></Link>` | `<Logo size="sm" />` (wordmark + circles; the R1a `iconOnly` phone variant goes) | same |
| 2 | `<HeaderSearchField className="hidden md:flex flex-1 max-w-[560px]" />` | `<span class="flex-1" />` | desktop field / phone gap |
| 3 | `<LanguageMenu />` | `<LanguageMenu />` | yes |
| 4 | — | `<PhoneSearchToggle />` (md:hidden) | yes |
| 5 | `<AdminMenu />` (site admins, `isSiteAdmin(session.user.role)`) | same | — |
| 6 | messages: `MessagesDrawerButton` with `MessageSquare`, a 8 px dot when unread (`hidden md:flex`: phones use "Ziņas" in the bottom bar) | — | — |
| 7 | `<NotificationCenter isAdmin />` (trigger restyled to 40 px; list unchanged, R8) | same | — |
| 8 | `<UserMenu user={session.user} />` | same | `Ienākt` |

- Icon buttons: `size-10 rounded-full grid place-items-center text-foreground hover:bg-tint`, icon 20 px; "open" state (`aria-expanded=true`) and the messages icon on `/messages` get `bg-tint`. The dot: `absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-surface`.
- Accessible names: messages `nav.messagesUnread` with the count (or `nav.messages` at 0); the dot is `aria-hidden`. `UnreadBadge.tsx` stays for the bottom bar only.
- Remove the inner pill group, the vertical dividers, `bg-background/60 backdrop-blur-xl` and the comment "until R2a". Rename nothing else.
- At 375 px the admin's phone header is: logo ~118 + "LV ▾" 32 + four 40 px targets + gutters 24 + gaps ≈ 340 px: fits without horizontal scroll (the card's 11 px overflow came from 44 px icons and the +, both gone). Check it at 360 px too.

### 4.3 `components/shell/HeaderSearchField.tsx` (new, client, ≤ 60 lines)

```tsx
<Form action={`/${locale}`} role="search" data-ui={UI.searchBar} className="…h-[38px] rounded-full bg-tint px-3 gap-2 text-sm">
  <Search aria-hidden className="size-4 text-foreground-muted" />
  <label htmlFor={id} className="sr-only">{t('search')}</label>
  <input id={id} type="search" name="q" defaultValue={pathname === '/' ? searchParams.get('q') ?? '' : ''} key={…same…}
         placeholder={t('searchPlaceholder')} enterKeyHint="search" autoFocus={autoFocus}
         className="min-w-0 flex-1 bg-transparent placeholder:text-foreground-muted focus:outline-none" />
</Form>
```

- `Form` from `next/form`: with a string `action` it submits as GET and navigates on the client (`node_modules/next/dist/docs/01-app/03-api-reference/02-components/form.md`, "action (string) Props"). The action carries the locale prefix (routing uses `localePrefix: 'always'`). Focus ring: `focus-within:outline-2 outline-primary bg-surface` (`.rd-search.open`).
- Only `q` is sent (AR-41: no place or tags in the field); discovery already reads `q`. R5a shows the word as a chip; R7 replaces the submit with the search overlay.

### 4.4 `components/shell/PhoneSearchToggle.tsx` (new, client, ≤ 60 lines)

Search icon button (`aria-label={t('search')}`, `aria-expanded`, `aria-controls`). Open: a row `fixed inset-x-0 top-[var(--header-height)] z-40 border-b border-border bg-surface p-2 md:hidden` with `<HeaderSearchField autoFocus />` and a × button (`shell.header.closeSearch`). Esc, ×, submit and a pathname change close it; focus returns to the icon. Interim until R7 (full-screen search, OD-20).

### 4.5 `components/shell/LanguageMenu.tsx` (replaces `LanguageSwitcher.tsx`; `git mv` then rewrite, ≤ 70 lines)

- Trigger (`data-ui={UI.languageSwitch}`): `LV` + `ChevronDown` 14 px, `h-8 rounded-full px-2 font-semibold text-[13px]` (phones `text-xs`, chevron 12 px), hit area 40 px tall via padding; `aria-label={t('languageCurrent', { language: LOCALE_NAMES[locale] })}`.
- List (`data-ui={UI.languageList}`, `MenuPanel` label `nav.languageLabel`): one `MenuItemLink` per `LOCALES` entry: `href={pathname + (qs ? `?${qs}` : '')}` (`usePathname` from `@/i18n/routing`, `useSearchParams` from `next/navigation`), `locale={code}`, `hrefLang={code}`, the name in `<span lang={code}>{LOCALE_NAMES[code]}</span>`, trailing `code.toUpperCase()`; the current one is `menuitemradio aria-checked=true` with a `Check` icon in `text-primary` and `font-semibold`, the others a 17 px spacer.
- Why `Link` with `locale` (not `router.replace`): next-intl's `Link` accepts `locale` (`node_modules/next-intl/dist/types/navigation/shared/createSharedNavigationFns.d.ts`, `locale?: Locale`), keeps the path and query, syncs the cookie, works as a real link (middle click, no JS). With no `pathnames` in the routing config, dynamic paths pass through unchanged (`/lv/sports/group/x/events?tab=past` → `/en/sports/group/x/events?tab=past`).
- More languages later = one entry in `LOCALES` + `LOCALE_NAMES` + a messages file; the header does not change (AR-15).

### 4.6 `components/shell/UserMenu.tsx` (rewrite, client, ≤ 90 lines)

- Signed out: on `/auth/*` nothing (as today); otherwise `<Link href={signInUrl(locale, pathname + search)} className={buttonClass('primary', undefined, 'sm')}>{nav.signIn}</Link>` (`lib/auth-redirect.ts`, `components/ui/Button.tsx` `buttonClass`). Drop the `useSyncExternalStore` mount guard: the button is in the server HTML, no jump.
- Signed in: trigger is the picture (32 px desktop, 30 px phone, inside a 40 px button; `aria-label={nav.profileMenu}`); a 2 px `ring-primary` with a surface gap while the menu is open or on an own-area page except `/messages` (`hdr({ on: 'av' })`). Keep the broken-image fallback (`avatarUrl`).
- Menu (`data-ui={UI.profileMenu}`, label `nav.profileMenu`): `User` Mans profils `/profile` · `Users` Manas grupas `/profile/my-groups` (trailing count slot renders nothing until R8) · `Plus` Izveidot grupu `/create` · separator · `Settings` Iestatījumi `/settings` · `LogOut` Iziet (`MenuItemButton`, `signOut()`, disabled while pending). The name/email block and "Skatīt publisko profilu" go (AR-14: five lines). The same on phones (AR-14, OD-04 dropped).
- Fix the `c_common` naming (card: known debt) by using `useTranslations('common')` as `tCommon` where still needed.

### 4.7 `components/shell/AdminMenu.tsx` (restyle, ≤ 60 lines)

`ShieldCheck` trigger (40 px, `aria-label={nav.adminMenu}`); panel `data-ui={UI.shieldMenu}` on `components/ui/Menu.tsx`: `FeedbackModeToggle`, `TranslateModeToggle` (both stay `menuitemcheckbox`; each shows its state word on the right: `nav.modeOn` / `nav.modeOff`, with icons `StickyNote` and `Globe` per the drawing), separator, `MenuItemLink` `/admin` "Administrēšanas panelis" with a trailing `ArrowRight` (AR-18). The toggles keep their actions and toasts; only their row markup follows the menu item look (pass `className` as today, plus the state word).

### 4.8 `components/shell/MobileNav.tsx` (rewrite, client, ≤ 120 lines) and `hooks/useBottomTab.ts` (new, ≤ 90 lines)

Bar (`css.mjs` 121–127): `<nav data-ui={UI.mobileNav} aria-label={nav.mobileLabel} class="fixed inset-x-0 bottom-0 z-40 flex h-16 border-t border-border bg-surface md:hidden">`, hidden on `/auth/*` (as today), kept on admin pages (AR-19).

- Five cells, each `flex-1` full height (≥ 64 × 64 px targets): `Link`s for Atklāt, Grupas, Ziņas, Es (`BOTTOM_LINKS`) and, in the middle, the + button: `Plus` 20 px in a 34 px outlined circle (`ring-[1.5px] ring-border`, not filled), `aria-label={common.createGroup}`, `gateAction(() => router.push('/create'))` with `AuthGateModal` (as today).
- Cell: icon 20 px over an 11 px label, `text-foreground-muted`; marked: `aria-current="page"`, label `text-foreground font-semibold`, icon in a pill `rounded-full bg-primary/16 px-3.5 py-[3px]`.
- Ziņas is a plain link to `/messages` on phones ("On phones Ziņas in the bottom bar opens the same page"; the drawer stays the desktop header's). Its count: `<UnreadBadge />` restyled to the drawing (`absolute -top-[3px] left-[calc(50%+6px)] h-4 min-w-4 rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground`, `9+` cap); the link's accessible name is `nav.messagesUnread` when the count is above 0.
- Signed out: links behave as today (Grupas shows the sign-in prompt page, Ziņas and Es redirect to sign-in); + opens the sign-in pop-up.

**Which tab is marked** (`const tab = useBottomTab(initialTab)`):

1. `own = tabForPath(pathname)` (`usePathname` from `@/i18n/routing`: path without locale). A path with its own tab marks it; `null` marks none (admin, create, about, privacy, someone's profile).
2. Group pages (`'keep'`) mark **the tab you came from** (OD-02, AR-20), held in state `keep: BottomTab` (initial `initialTab`).
3. On every pathname change (`useEffect` on `pathname`): if `own` is a tab, `keep = own`. If `own === 'keep'`: if this change is a back/forward step to this path and `sessionStorage[NAV_FROM_STORAGE][groupBasePath]` exists, `keep = that`; otherwise `keep` stays (the tab of the page you left) and is stored for this group's base path. `null` pages leave `keep` as it is. After each change write `document.cookie = ek_nav_tab=<keep>; path=/; SameSite=Lax` (session cookie) and the map (capped at 50 entries; every storage access in try/catch).
4. Back/forward detection: a `popstate` listener (added in the hook's mount effect) records `location.pathname` without the locale; the pathname effect treats the change as a history step only when the new pathname equals that record, then clears it. Next.js syncs `usePathname` with history traversal and its own `pushState` (`node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md`, "Native History API"), so no Next internals are touched and `history.state` is never written.
5. Hard load and reload: layouts do not re-render on client navigation (`…/03-file-conventions/layout.md`, lines 180 and 240), so the cookie read in the locale layout only shapes the first HTML: a reload of a group page reached from Manas grupas renders Grupas marked on the server: **no flash**. The first client render uses the same `initialTab`, so hydration matches. In the mount effect, when `performance.getEntriesByType('navigation')[0]?.type` is `reload` or `back_forward` and the map has this group, use the map (corrects the rare case where another browser tab changed the cookie). A first visit with no cookie marks Atklāt (a group is found through discovery).
6. Rejected alternatives: a `?from=` query (every group link would have to carry it), `history.state` (shared with the Next router), sessionStorage alone (server cannot read it: flash on reload).

Examples the reviewer runs (section 9): discovery → group → event: Atklāt throughout; Manas grupas → group: Grupas, also after reload; Manas grupas → group A → Atklāt → group B → Back → Back: A shows Grupas; Forward, Forward: B shows Atklāt; Es → Mans profils → a group of yours: Es stays marked (the same rule: the tab you came from); `/admin/*`: none marked; a private window opening a group link: Atklāt.

### 4.9 `components/shell/Footer.tsx` (rewrite, client, ≤ 40 lines)

Renders only when `FOOTER_PATHS.includes(pathname)` (AR-16: discovery, Par mums, Privātums; none on group, own-area, admin pages); it sits after `<main>` inside the scroll container, so it is the page's `contentinfo` and ends the page above the bottom bar.
`<footer data-ui={UI.footer} class="flex flex-wrap items-center gap-x-[18px] gap-y-1.5 border-t border-border bg-surface px-3 py-3 text-[13px] text-foreground-muted md:px-5 md:py-3.5">`: `<Link href="/"><Logo size="sm" /></Link>` (16 px wordmark: add `size="xs"` to `Logo` only if `sm` is visibly larger than the drawing) · `<span class="min-w-0 flex-[1_1_200px]">{shell.footer.logoSubtitle}</span>` · links Par mums (`common.about`, `/about`), Privātums (`shell.footer.privacy`, `/privacy`) in `text-primary font-semibold underline decoration-border underline-offset-[3px]`. The heart, the year line and the three-column grid go.

### 4.10 Own area (new)

Route group `app/[locale]/(me)/` (URLs unchanged; route groups only organise files: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route-groups.md`; "Full page load" applies only to multiple root layouts, which this is not):

```
git mv app/[locale]/profile/page.tsx        app/[locale]/(me)/profile/page.tsx
git mv app/[locale]/profile/edit            app/[locale]/(me)/profile/edit
git mv app/[locale]/profile/my-groups       app/[locale]/(me)/profile/my-groups
git mv app/[locale]/messages                app/[locale]/(me)/messages
new    app/[locale]/(me)/settings/page.tsx
stays  app/[locale]/profile/[username]/page.tsx   (public profiles: no frame)
```

`/profile` and `/profile/[username]` then live in two folders; they resolve to different URLs, so the "Conflicting paths" caveat does not apply (the build's route list proves it, P9).

- **`app/[locale]/(me)/layout.tsx`** (Server, ≤ 60 lines): `auth()`; signed out → `return children` (the pages keep their own sign-in redirect and the Manas grupas guest view). Signed in → `UserService.getOwnAreaContext(id)` (null → `children`); builds `MeContextValue = { name, avatarSrc: avatarUrl(ctx), line }` where `line` = `cityLabel(tCities, firstCity)` and `profile.area.groupCount` joined by " · " (either part may be missing; name falls back to `profile.anonymousUser`). Renders `<MeProvider value>` → `<PersonHeader />` (md+) · `<MePhoneBar />` (phones) · `<div class="md:grid md:grid-cols-[190px_minmax(0,1fr)] md:gap-[22px] md:px-[22px] md:pt-[18px] [--me-head:64px] md:[--me-head:72px]">` with `<MeMenu variant="side" />` (md+) and `<div class="min-w-0">{children}</div>`.
- **`components/providers/MeProvider.tsx`** (client, ≤ 30): context + `useMeContext()` (throws outside the provider, like `useGroupContext`).
- **`components/me/PersonHeader.tsx`** (client or server reading the context through a client wrapper; ≤ 40): `data-ui={UI.personHeader}`, `hidden md:flex items-center gap-3 border-b border-border bg-surface px-[22px] py-3.5`; picture 48 px round; name `font-heading text-[19px] font-semibold`; line `text-[13px] text-foreground-muted`.
- **`components/me/MeMenu.tsx`** (client, ≤ 60): `<nav data-ui={UI.ownMenu} aria-label={profile.area.label}>` with one `Link` per `ME_PAGES` (icon 16 px muted, `rounded-xl px-2.5 py-[7px] min-h-10 text-sm`); the current page `aria-current="page" bg-tint font-semibold`; Ziņas carries the unread count (`ml-auto rounded-full bg-tint px-2 text-[11px] font-semibold text-foreground-muted`, `bg-surface` on the marked row). `variant="side"` is `sticky top-[18px] self-start`; `variant="drawer"` fills the drawer.
- **`components/me/MePhoneBar.tsx`** (client, ≤ 50): `data-ui={UI.ownBarPhone}`, `md:hidden flex h-16 items-center gap-2.5 border-b border-border bg-surface px-3`: ☰ button (`Menu` icon, `size-10`, `aria-label={profile.area.openMenu}`, `aria-expanded`, `aria-controls`) · picture 32 px · name (15 px `font-heading`, truncate) over the line (12 px muted). Opens `MeDrawer`.
- **`components/me/MeDrawer.tsx`** (client, ≤ 80): scrim `fixed inset-0 z-50 bg-black/40` (dim only, no blur: the pop-up rule for drawers); panel `fixed inset-y-0 left-0 z-50 w-4/5 max-w-[320px] bg-surface px-2.5 py-3.5 shadow-premium`, `role="dialog" aria-modal="true" aria-label={profile.area.label}`; head (picture, name, line, `border-b border-border pb-3`) then `<MeMenu variant="drawer" />`. Focus trap (`hooks/useFocusTrap.ts`, first link focused), Esc, scrim click and a pathname change close it; focus returns to ☰; `motion-safe:` slide-in only. Back closing it is R2b's rule for all panels.
- **Pages in the frame:** keep their content (R8 rebuilds Manas grupas and Ziņas, R9b Mans profils and the form). Changes: `profile/page.tsx` metadata title `nav.myProfile`; rename `c_common_get` to `tCommon` in `profile/page.tsx` and `my-groups/page.tsx`; `MessagesLayout.tsx` line 24 subtracts the frame head: `h-[calc(100dvh-var(--header-height)-var(--me-head,0px)-4rem)]` (and the `sm:`/`md:` variants), so the two panes still fit above the bottom bar.
- **`app/[locale]/(me)/settings/page.tsx`** (Server, ≤ 40): signed out → `redirect(signInUrl(locale, '/settings'))`; metadata `profile.settings.title`; `<h1 class="md:sr-only …">` (AR-21 rule 5: on desktop the marked menu item already names the page; on phones the name stands over the content) and `<AppearanceSetting />`. Nothing else ("The other settings stay as they are today": they are on Labot profilu until R9b, OD-26).
- **`components/me/AppearanceSetting.tsx`** (client, ≤ 60): `<fieldset class="grid gap-1.5 rounded-2xl bg-surface px-4 py-3.5 text-sm">`, `<legend>` "Izskats" (15 px `font-heading`); three native radios `name="appearance"` with values `light | dark | system` (Gaišs, Tumšs, Kā ierīcē), each label `min-h-10 flex items-center gap-2.5`, the radio drawn as a 16 px ring that fills to a 5 px inset ring in `--primary` when checked (`appearance-none` + `checked:` classes, a visible `focus-visible` ring); `useTheme()` from `next-themes` (0.4.6: `theme` is `'light' | 'dark' | 'system'` with `enableSystem` in `Providers.tsx`); `checked` only after mount (`useSyncExternalStore` guard, as `ThemeToggle` does), so the server HTML has none checked and hydration matches.

### 4.11 Deleted and moved

- `components/shell/ThemeToggle.tsx` → `git mv` to `components/handbook/SampleThemeToggle.tsx` (the UI-elements page keeps its light/dark switch for checking samples; it is an admin tool, not site navigation, so AR-17 holds). Header import removed.
- `components/shell/LanguageSwitcher.tsx` → becomes `LanguageMenu.tsx` (4.5).
- In `messages/*.json`: see 6.

## 5. Accessibility

- **Landmarks:** one `banner` (`<header>`), one `main` (`#content`), `navigation` × 2–3 with distinct names (bottom bar "Galvenā navigācija", own menu "Tava vieta", plus today's page-level navs), `search` (the header form), one `contentinfo` on footer pages. A skip link "Pāriet uz saturu" is the first focusable element (visible on focus).
- **Current page:** `aria-current="page"` on the marked bottom-bar tab and own-menu item; the language list uses `menuitemradio` + `aria-checked`.
- **Targets:** header and bar controls ≥ 40 × 40 px (drawn 30–36 px; a 44 px header does not fit the admin phone header at 360 px, so 40 px, above WCAG 2.5.8's 24 px); bottom-bar cells 64 px tall; menu rows and radio rows ≥ 40 px.
- **Keyboard:** menus as 4.1; drawer and phone search as 4.4/4.10; every control has a visible `focus-visible` ring (`outline-2 outline-primary outline-offset-2`).
- **Names:** icon-only controls carry the word (`aria-label`): Meklēt, Administrēšana, Ziņas (with count), Paziņojumi (today's), Profila izvēlne, Izveidot grupu, Tavas vietas lapas. Decorative icons `aria-hidden`.
- **Language:** `<html lang>` follows the locale; each language name in the list carries its own `lang`.
- **Motion:** slide/fade only under `motion-safe:`.

## 6. i18n (both files, same keys; `npm run i18n:check`)

| Key | lv | en |
|---|---|---|
| `nav.myProfile` (new) | Mans profils | My profile |
| `nav.groups` (new) | Grupas | Groups |
| `nav.me` (new) | Es | Me |
| `nav.settings` (value changes; only UserMenu used it) | Iestatījumi | Settings |
| `nav.adminPanel` | Administrēšanas panelis | Admin panel |
| `nav.profileMenu` (new) | Profila izvēlne | Profile menu |
| `nav.languageCurrent` (new) | Valoda: {language} | Language: {language} |
| `nav.messagesUnread` (new) | Ziņas, {count, plural, zero {# nelasītu sarunu} one {# nelasīta saruna} other {# nelasītas sarunas}} | Messages, {count, plural, one {# unread conversation} other {# unread conversations}} |
| `nav.modeOn` / `nav.modeOff` (new) | Ieslēgts / Izslēgts | On / Off |
| `nav.signIn`, `nav.signOut`, `nav.myGroups` (en case fix) | Ienākt, Iziet, Manas grupas | Sign in, Sign out, My groups |
| `common.myGroups`, `common.createGroup` (en case fix, AR-10) | Manas grupas, Izveidot grupu | My groups, Create group |
| `shell.skipToContent` (new) | Pāriet uz saturu | Skip to content |
| `shell.header.search` (new) | Meklēt | Search |
| `shell.header.searchPlaceholder` (new) | Meklē grupu vai nodarbi… | Search for a group or an activity… |
| `shell.header.closeSearch` (new) | Aizvērt meklēšanu | Close search |
| `profile.area.label` (new) | Tava vieta | Your space |
| `profile.area.openMenu` (new) | Tavas vietas lapas | Your space's pages |
| `profile.area.groupCount` (new) | {count, plural, zero {# grupu} one {# grupa} other {# grupas}} | {count, plural, one {# group} other {# groups}} |
| `profile.settings.title` (new) | Iestatījumi | Settings |
| `profile.settings.appearance` (new) | Izskats | Appearance |
| `profile.settings.light` / `.dark` / `.system` (new) | Gaišs / Tumšs / Kā ierīcē | Light / Dark / Same as device |

**Remove** (after a grep shows no other use): `nav.viewPublicProfile`, `nav.create`, `nav.profile`; `shell.footer.information`, `.forCommunity`, `.madeWith`, `.mission`; `shell.search.title` if unused. Keep `shell.footer.logoSubtitle` (the footer line, same words as the drawing) and `shell.footer.privacy`; keep `theme.*` (used by `SampleThemeToggle`) and `shell.sidebar.*` (R3a).

## 7. UI elements and Handbook

- `/admin/handbook/ui-elements` (`app/[locale]/admin/handbook/ui-elements/page.tsx`, demos in a new `components/handbook/ShellDemos.tsx` to keep `UiElementsDemos.tsx` under 150): specimens for the header (signed in, signed out), the three menus opened statically, the bottom bar with each tab marked, the footer, the own menu, `AppearanceSetting`; each with its `data-ui` names and file paths. Import `SampleThemeToggle` instead of `ThemeToggle`.
- `docs/handbook/design.md`: Page layouts: B becomes "Group page or your own area: a head (banner for a group, your picture and name for you) and the pages down the left (a ☰ drawer on phones); group pages from R3a, your own area from R2a (AR-21, AR-60)". Screen table: "Me · Own profile, Manas grupas, Ziņas, Iestatījumi · B (frame) · R2a frame; content R8, R9b"; add a "Shell" paragraph under Components: header (AR-12/13), menus (one `Menu` component), "LV ▾", bottom bar with the "tab you came from" rule, slim footer on discovery and reading pages only, 40 px targets. Remove "R2a" from any "Today" cell it no longer describes.

## 8. Builder steps and commits

Small commits, each passing `npm run typecheck`; messages `feat(R2a): …` ending with the co-author line.

1. **Foundations.** `lib/navigation.ts`, `lib/constants/index.ts` (`LOCALE_NAMES`, `UI`), `i18n/routing.ts` (cookie max-age), `components/ui/Menu.tsx`, `app/layout.tsx` (`lang`), `app/[locale]/layout.tsx` (scroll container, `<main id="content">`, skip link), the three inner `<main>` → `<div>`, `--header-height` 56 px, `shell.skipToContent`. Commit "feat(R2a): shell landmarks, navigation constants, one menu component".
2. **Header.** `Header.tsx`, `HeaderSearchField.tsx`, `PhoneSearchToggle.tsx`, `LanguageMenu.tsx` (from `LanguageSwitcher.tsx`), `UserMenu.tsx`, `AdminMenu.tsx`, the two mode toggles' state word, `NotificationCenter` trigger size, `ThemeToggle` → `components/handbook/SampleThemeToggle.tsx`; `nav.*`, `shell.header.*`, `common.*` keys. Side by side with the six header drawings, "LV ▾" and both menus. Commit.
3. **Bottom bar.** `MobileNav.tsx`, `hooks/useBottomTab.ts`, `UnreadBadge.tsx`, cookie read in the locale layout. Run the AR-20 walk (4.8). Commit.
4. **Footer.** `Footer.tsx`, `FOOTER_PATHS`, footer keys removed. Commit.
5. **Own area.** `UserService.getOwnAreaContext`, `MeProvider`, `(me)/layout.tsx`, the four `git mv`s, `PersonHeader`, `MeMenu`, `MePhoneBar`, `MeDrawer`, `MessagesLayout` height, `settings/page.tsx`, `AppearanceSetting`, `profile.area.*`, `profile.settings.*`. Side by side with "Desktop · Iestatījumi" and "Phone · the drawer, opened". Commit.
6. **Close-out.** UI elements (7), Handbook (7), Definition of done (9); in `docs/development/build-plan.md` section 8 set R2a to "built, in review" with the commit range; tick the R2a line in `docs/execution_handoff.md`. Commit. Do not push (the reviewer pushes).

## 9. Acceptance

**Definition of done:**
```bash
npm run typecheck
npx eslint $(git diff --name-only --diff-filter=d origin/main...HEAD -- '*.ts' '*.tsx')
npm run i18n:check
npm run plan:check
npm run build   # needs AUTH_SECRET + DATABASE_URL; read the route list (P9)
```

**Grep proofs** (Git Bash, repo root; "0" = no output):
```bash
wc -l components/shell/*.tsx components/me/*.tsx components/ui/Menu.tsx hooks/useBottomTab.ts lib/navigation.ts  # P1: each < 150 (NotificationCenter 238 is R8's)
test -e components/shell/ThemeToggle.tsx -o -e components/shell/LanguageSwitcher.tsx && echo FAIL               # P2: 0
grep -rn "ThemeToggle\|LanguageSwitcher\|iconOnly" components/shell "app/[locale]/layout.tsx"                     # P3: 0
grep -rn "<main" app components | wc -l                                                                          # P4: 1
grep -rnE "prisma\.|@/lib/prisma" components/shell components/me "app/[locale]/(me)"                             # P5: 0
grep -rnE "style=|#[0-9a-fA-F]{3,6}\b|dark:|uppercase" components/shell components/me components/ui/Menu.tsx      # P6: 0
grep -rn "c_common" components/shell "app/[locale]/(me)"                                                         # P7: 0
grep -rnE "viewPublicProfile|madeWith|forCommunity|Admina panelis|Admin Panel|My Groups|Create Group" messages components app  # P8: 0
ls "app/[locale]/(me)/profile/page.tsx" "app/[locale]/(me)/profile/edit/page.tsx" "app/[locale]/(me)/profile/my-groups/page.tsx" \
   "app/[locale]/(me)/messages/page.tsx" "app/[locale]/(me)/settings/page.tsx" "app/[locale]/profile/[username]/page.tsx"  # P9: all exist; build lists /[locale]/profile, /profile/edit, /profile/my-groups, /profile/[username], /messages, /settings
git diff --stat origin/main -- prisma/                                                                          # P10: empty
grep -c "aria-current" components/shell/MobileNav.tsx components/me/MeMenu.tsx                                   # P11: ≥ 1 each
grep -rn "history.state\|replaceState" hooks/useBottomTab.ts components/shell                                    # P12: 0
```

**Screens** (dev server, seeded DB; lv and en, 375 px and 1280 px, light and dark; no horizontal page scroll; signed out, signed in as a plain user, signed in as a site admin):

| Where | Look for |
|---|---|
| `/` signed in, signed out, admin (1280) | the three desktop header drawings; field placeholder; "Ienākt" signed out; shield only for the admin, left of messages; footer at the end |
| `/` at 375 and 360 px, admin | phone header drawing with wordmark; nothing cut; no horizontal scroll; bottom bar marks Atklāt; footer above the bar |
| type "sp" + Enter in the header field | `/lv?q=sp` (client navigation, no full reload); field keeps "sp"; on another page the field is empty |
| phone search icon | the search row opens with focus in the field; Esc closes, focus back on the icon |
| "LV ▾" on `/lv/<l1>/group/<slug>/events?tab=past` | list as drawn; English → same path and query in `/en/…`; keyboard: Enter opens, ↓ moves, Esc closes; close the browser, open `/` → `/en` |
| profile menu | five lines as drawn, same at 375 px; Manas grupas without a number; Iziet signs out |
| shield menu (admin) | Atsauksmju režīms / Tulkošanas režīms with Izslēgts/Ieslēgts; toggling works as today; "Administrēšanas panelis →" opens `/admin` |
| bottom bar, every route | `/` Atklāt; `/profile/my-groups` Grupas; `/messages` Ziņas (page, not the drawer; count shown); `/profile`, `/profile/edit`, `/settings` Es; `/admin/*`, `/create`, `/about`, `/privacy`, `/profile/<someone>` none; hidden on `/auth/*` |
| AR-20 walk (4.8) | all six examples; reload on a group page reached from Manas grupas: the server HTML already has `aria-current="page"` on Grupas (view source), no flash with CPU ×6 throttling |
| footer | only on `/`, `/about`, `/privacy`; absent on group, own-area, admin, create, auth, 404 pages |
| `/settings` (1280) | side by side with "Desktop · Iestatījumi": person header, own menu with Iestatījumi marked, Izskats radios; Tumšs switches at once, persists on reload without a flash; Kā ierīcē follows the OS |
| own area at 375 | "Phone · the drawer, opened": ☰ opens the drawer, focus inside, Esc/scrim/link closes; Mans profils, Manas grupas, Ziņas, Iestatījumi each mark their row and the bottom-bar tab |
| `/messages` in the frame | both panes fit above the bottom bar at 375 and beside the own menu at 1280 |
| signed out: `/profile`, `/profile/edit`, `/messages`, `/settings` | redirect to sign-in and back; `/profile/my-groups` shows today's sign-in prompt without the frame |
| `/profile/<username>` | no frame; unchanged |
| group pages (Informācija, Pasākumi, an event, Biedri, Iestatījumi) | header as everywhere; group sidebar and tabs unchanged (R3a); no footer |
| keyboard only, one full pass | skip link first; every header control reachable and named (screen reader or the accessibility tree) |

**Blue/green:** no schema change (P10); the old app ignores the `ek_nav_tab` cookie; URLs are unchanged, so links from the old app keep working.

## 10. Risks

- **Two `profile` folders** (`(me)/profile/*` and `profile/[username]`): expected to work (different URLs), but if the build refuses, fall back to a shared frame component rendered by each own-area page instead of a route-group layout (same look, same Context Law via a page-level provider); note it in the commit.
- **Scroll container change:** `GroupTabs` scroll-spy keeps `#main-content` as its root; check the Informācija scroll-spy and "back to top" on a group page, and `DiscoverySidebar`'s sticky height, after the 56 px header.
- **Cookie across browser tabs:** `ek_nav_tab` is shared by tabs; a reload can briefly show another tab's choice until the mount effect reads this tab's map (4.8 step 5). Rare; accepted.
- **Header width:** long English placeholder on narrow desktop (768–900 px) truncates with an ellipsis, never wraps; the admin phone header at 360 px is the tightest case.
- **Messages drawer vs page:** on phones Ziņas becomes a page link; `MessagesDrawerButton` is then used only by the desktop header. Notifications that open `/messages?c=…` keep working (unchanged page).
- **`next/form` and the onboarding proxy:** a signed-in user without a username is redirected to onboarding by `proxy.ts` on any page, search included (as today).
- **Theme radios before mount** show none checked for one frame; acceptable (no wrong value is ever shown).

## 11. Out of scope

The search overlay, theme chips and full-screen phone search (R7); the search-word chip on the filter line (R5a); Paziņojumi page, its own-menu item, the bell's look and full-screen phone list, the Manas grupas "new" count (R8); Mans profils content and Labot profilu in place (R9b); Manas grupas and Ziņas content (R8); the group frame, deleting `Sidebar`/`GroupSidebarContent` (R3a); admin frame and section tabs (R11); toasts above the bottom bar, Back closing panels, skeletons (R2b); delete account in Iestatījumi (R12); keeping the language on the account (needs a `User.locale` migration; not in AR-15's ledger line; listed for the owner).
