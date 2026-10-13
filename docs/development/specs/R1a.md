# R1a spec · Identity

Just-in-time spec for release R1a of the [build plan](../build-plan.md#r1a--identity-ml), written 13 Oct 2026 against `main` at `02d080f` and the redesign tag `redesign-v9.8.3`. Frozen once R1a is pushed. The redesign page (`docs/development/redesign.html`, generated from `scripts/redesign/`; tokens in `scripts/redesign/css.mjs` lines 3–7, the tone table in `scripts/redesign/gen.mjs` const `KC`) wins over this spec where they disagree; the ledger line wins over a drawing.

**Owned rules:** AR-01, AR-03 Logo, AR-04 Site colour, AR-05 Category colours, AR-06 Colour means category, AR-07 Fonts, AR-08 Shapes and labels, AR-09 Small tags, AR-10 Words and numbers, AR-11 Dates. **Owner decision applied:** OD-01 (tag word "Mod").

**Size:** L (one long Sonnet session; ~110 files touched, most of them one-line class swaps). If the session runs short, stop after step 7, commit, and finish steps 8–10 in a second session before the push; R1a is pushed once, whole.

## 0. Motivation and design alignment

- One change of values, not of layouts: every screen keeps its structure; colours, fonts, shapes, tags and words change. Layout work belongs to R2a–R12 (AR-01: released in parts).
- **Taxonomy Law.** Category tones live in the site theme (already server-injected as `<style id="site-theme">` in `app/layout.tsx`). The theme emits `--cat-<l1Slug>` for `html:root` (light) and `html.dark:root` (dark). The group layout sets `--accent: var(--cat-<l1Slug>)` in its server `<style>`. The browser's cascade picks the light or dark tone from the `.dark` class next-themes sets before first paint: no client code resolves a colour, no flash.
- **Service Law.** The tone is chosen in `TaxonomyResolver.resolve` (the one place every service already gets `accentColor` from); components keep reading `accentColor` / `category.color` as today.
- **Constants Law.** The 15 L1 slugs and their default tones go to `lib/constants/theme.ts`.
- **Zero-Any, Defensive.** Theme JSON is validated by Zod (hex only); only a known slug or a validated hex reaches a `<style>` block.
- **No migration.** Tones are stored inside the existing `SiteTheme.light` / `SiteTheme.dark` JSON columns (one `categories` map per mode). This replaces the card's `categories: Record<l1Slug, {light, dark}>` shape with the same data split by mode, because each mode's JSON is already validated and emitted separately. `Category.color` stays as the fallback. `add_category_color_dark` is not built.

## 1. Tokens

### 1.1 Colour tokens (site theme and `app/globals.css`)

The site theme (`lib/theme/css.ts` → `themeModeVars`) writes these variables; `app/globals.css` keeps the same values as the no-theme fallback (`:root` = light, `.dark` = dark). Values from `scripts/redesign/css.mjs` lines 3 (`.rd`) and 6 (`html.dark .rd`).

| Variable (Tailwind name) | Redesign name | Today light → **new light** | Today dark → **new dark** | Theme token |
|---|---|---|---|---|
| `--background` (`bg-background`) | `--bg` | `#f1f5f9` → **`#f4f4ef`** | `#0d0d12` → **`#161814`** | `background` |
| `--surface` (`bg-surface`) | `--surface` | `#ffffff` → **`#fdfdfb`** | `#16161f` → **`#1e211c`** | `surface` |
| `--surface-elevated` (`bg-surface-elevated`) | none | `#ffffff` → **`#fdfdfb`** (= surface) | `#1e1e2a` → **`#282c25`** (= tint) | `surfaceElevated` |
| `--tint` (`bg-tint`) **new** | `--tint` | — → **`#e8eae1`** | — → **`#282c25`** | `tint` (new, optional; fallback `color-mix(in srgb, foreground 8%, background)`) |
| `--border` (`border-border`) | `--line` | `#e2e8f0` → **`#dcdfd4`** | `#1e293b` → **`#353a31`** | `border` |
| `--foreground` (`text-foreground`) | `--fg` | `#0f172a` → **`#1f221c`** | `#f8fafc` → **`#eceee7`** | `foreground` |
| `--foreground-muted` (`text-foreground-muted`) | `--muted` | `#64748b` → **`#5f6558`** | `#94a3b8` → **`#a8ae9f`** | `muted` |
| `--primary` (`bg-primary`, `text-primary`) — keeps its name | `--brand` (Sūna) | `#6366f1` → **`#4B5E3B`** | `#6366f1` → **`#b5c79e`** | `primary` |
| `--primary-foreground` (`text-primary-foreground`) | `--on-brand` | `#ffffff` → **`#ffffff`** | `#ffffff` → **`#111111`** (computed by `onPrimary()`; drawing `#1a2213`, both ≥ 9:1) | derived |
| `--cat-<slug>` ×15 **new** | `--k-*` | see 1.2 | see 1.2 | `categories` (new, optional) |
| `--on-cat` **new** | `.kch.d` text | **`#ffffff`** | **= dark `background`** (`#161814`) | derived |
| `--danger` / `--danger-foreground` **new** (globals only) | none (chosen here) | **`#A63A2E`** / `#ffffff` | **`#EE9A8E`** / `#161814` | — |
| `--success` **new** (globals only) | none | **`#3D6B34`** | **`#9CCB8C`** | — |
| `--warning` **new** (globals only) | none | **`#8A5B0B`** | **`#E2B65A`** | — |
| `--owner` | none | `#f59e0b` → **removed** (see 4.6) | | — |
| `--color-cat-skill` … `--color-cat-practical` (6) | none | **removed** (0 uses; check with grep G9) | | — |

Status colours are not theme-editable (R1b may add them). Add to `@theme` in `app/globals.css`: `--color-tint: var(--tint)`, `--color-danger: var(--danger)`, `--color-danger-foreground: var(--danger-foreground)`, `--color-success: var(--success)`, `--color-warning: var(--warning)`; remove the six `--color-cat-*` lines and `--color-owner`.

**Contrast (WCAG 2.x, computed with the luminance formula in `lib/color-utils.ts`; AA = 4.5:1 text, 3:1 large/UI):**

| Text | on background | on surface | on tint |
|---|---|---|---|
| light `--foreground` #1f221c | 14.60 | 15.81 | 13.26 |
| light `--foreground-muted` #5f6558 | 5.46 | 5.91 | 4.95 |
| light `--primary` #4B5E3B (links) | 6.42 | 6.96 | 5.83 |
| light `--danger` #A63A2E | 5.83 | 6.31 | 5.29 |
| light `--success` #3D6B34 | 5.68 | 6.15 | 5.16 |
| light `--warning` #8A5B0B | 5.31 | 5.76 | 4.83 |
| dark `--foreground` #eceee7 | 15.28 | 13.92 | 12.15 |
| dark `--foreground-muted` #a8ae9f | 7.85 | 7.15 | 6.24 |
| dark `--primary` #b5c79e | 9.90 | 9.02 | 7.87 |
| dark `--danger` #EE9A8E | 8.21 | 7.48 | 6.53 |
| dark `--success` #9CCB8C | 9.65 | 8.79 | 7.67 |
| dark `--warning` #E2B65A | 9.42 | 8.59 | 7.50 |

Filled: white on light primary 7.09; `#111111` on dark primary 10.46; white on light danger 6.43; `#161814` on dark danger 8.21. All pass AA. `--border` against surface is 1.33 (light) / 1.40 (dark): it is a dividing line, never the only sign of a control (inputs keep a label; chips get a 1 px ring plus text).

### 1.2 Category tones (AR-05)

Real L1 slugs (from `prisma/seed.ts`, matched to the redesign keys by today's colour in `KC`). Contrast numbers are the redesign's and were re-checked: white on light tone min 5.16:1 (AA), `#161814` on dark tone min 7.69:1 (AAA), the tone as text on its own surface min 5.06 (light) / 7.01 (dark).

| L1 slug | Redesign key | Tone name | Today (`Category.color`) | Light | Dark |
|---|---|---|---|---|---|
| `travel` | trav | Paparde | #10B981 | `#4F7330` | `#7BBF40` |
| `dancing` | dance | Pīlādzis | #F43F5E | `#A9452C` | `#E09B8A` |
| `hobbies` | hobby | Smiltsērkšķis | #F97316 | `#A55A12` | `#DB9F66` |
| `community` | comm | Egle | #22C55E | `#2F6A45` | `#44C172` |
| `politics` | pol | Kūdra | #EF4444 | `#57493D` | `#B8AA9D` |
| `pets` | pets | Lazda | #84CC16 | `#7A5E40` | `#C1A78B` |
| `art` | art | Virsis | #D946EF | `#7A4790` | `#CA9CDE` |
| `music` | music | Mellene | #6366F1 | `#57479A` | `#AFA3E0` |
| `religion` | rel | Akmens | #64748B | `#586474` | `#A0ACBA` |
| `social` | social | Brūklene | #EC4899 | `#A53A50` | `#DD98A6` |
| `games` | games | Plūme | #8B5CF6 | `#8C3F72` | `#DB94C3` |
| `sports` | sport | Rudzupuķe | #3B82F6 | `#3B55A0` | `#98A9DD` |
| `family` | family | Ezers | #0EA5E9 | `#2B6489` | `#7BB2D6` |
| `wellbeing` | well | Kadiķis | #14B8A6 | `#2E6B6F` | `#47BAC2` |
| `education` | sci | Medus | #F59E0B | `#86650E` | `#D0A535` |

The tone names are not stored in R1a (R1b shows them in Dizains, as `admin.design.*` messages).

**Slug check (risk, do it first):** dev DB:
```bash
npx tsx -e "import {PrismaClient} from '@prisma/client'; new PrismaClient().category.findMany({where:{level:1},select:{slug:true,status:true}}).then(r=>console.log(r))"
```
All 15 slugs above must be present. On production the reviewer opens `/lv/admin/categories` and compares the L1 list. A slug not in the table (a new L1 added by an admin) gets its `Category.color` hex in both modes — nothing breaks, the dark tone is just not tuned.

**Tone check (acceptance):**
```bash
npx tsx -e "import {CATEGORY_TONES} from './lib/constants/theme'; import {hexToRgb,getLuminance} from './lib/color-utils'; const L=(h:string)=>{const c=hexToRgb(h)!;return getLuminance(c.r,c.g,c.b)}; const r=(a:string,b:string)=>(Math.max(L(a),L(b))+.05)/(Math.min(L(a),L(b))+.05); for (const [s,t] of Object.entries(CATEGORY_TONES)) console.log(s, r('#ffffff',t.light).toFixed(2), r('#161814',t.dark).toFixed(2))"
```
Every first number ≥ 4.5, every second ≥ 7.

### 1.3 Fonts (AR-07)

Verified against `node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md` and the font data in `node_modules/next/dist/compiled/@next/font/dist/google/font-data.json` (Literata: styles normal + italic, axes opsz + wght; Commissioner: style normal only, axes FLAR/VOLM/slnt/wght).

`lib/theme-fonts.ts`:
- `Literata({ variable: '--font-literata', subsets: ['latin', 'latin-ext'], style: ['normal', 'italic'], display: 'swap' })` — preloaded (drop `preload: false`); the italic is for "kopā" in the logo.
- `Commissioner({ variable: '--font-commissioner', subsets: ['latin', 'latin-ext'], display: 'swap' })` — preloaded. No `slnt` axis: the human note's italic is the browser's oblique, exactly as the redesign page loads it (`gen.mjs` line 902 loads Commissioner without italic).
- `Geist(...)` gets `preload: false` (it stays an option in Dizains). Update the doc comment ("Only Literata and Commissioner are preloaded").

`app/layout.tsx`: remove `Geist_Mono` and `geistMono.variable`.

`app/globals.css` `@theme`:
```css
--font-sans: var(--theme-font-body, var(--font-commissioner));
--font-heading: var(--theme-font-heading, var(--font-literata));
--font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
```
`@layer base` headings: keep `font-family: var(--font-heading)`, add `font-weight: 600; text-wrap: balance; line-height: 1.15;`.

New utility in `app/globals.css` (AR-07 human notes; first used by R3a/R4, shown on UI elements now):
```css
@utility human-note {
  font-style: italic;
  font-size: 0.875rem;
  color: var(--primary);
}
```

Type scale (from `css.mjs`; the Handbook gets this table):

| Role | Font | Size / weight | Tailwind |
|---|---|---|---|
| Page title | Literata | 28 / 600 | `text-[28px] font-semibold leading-tight` (heading base) |
| Section | Literata | 21 / 600 | `text-[21px] font-semibold` |
| Item title (card, row, menu head) | Literata | 15–17 / 600 | `text-base font-semibold` |
| Body | Commissioner | 15–16 / 400, line 1.6 | `text-[15px]` / `text-base` |
| Button | Commissioner | 15 / 500 (small 14) | in `Button` |
| Small, meta | Commissioner | 13 / 400–500 | `text-[13px]` |
| Tag | Commissioner | 11 / 600 | in `Badge` |
| Human note | Commissioner italic | 14 / 400, site colour | `human-note` |

Weights used: 400, 500, 600, 700 (700 only for counts in chips). No 800/900.

### 1.4 Shapes, space, depth (AR-08)

- **Radii** (Tailwind v4 defaults kept, no `--radius-*` override): `rounded-full` buttons, chips, tags, avatars, search field; `rounded-2xl` (16 px) cards, panels, pop-ups, boxes; `rounded-xl` (12 px) menus' inner items, inputs, toasts; `rounded-lg` (8 px) event-row hover. In R1a the sweep covers buttons only (step 4); card radii are already 16–24 px and are set per screen in later releases.
- **Shadows:** `--shadow-card: none` in both modes (cards are flat: surface on background, no border, AR-08). `--shadow-premium` becomes the float shadow `0 10px 28px rgba(0,0,0,.12)` in both modes (redesign `.rd-menu`, `.rd-list`); new `--shadow-dialog: 0 14px 34px rgba(0,0,0,.25)` (redesign `.rd-dlg`) in `:root`, exposed in `@theme` the same way as `--shadow-card` (Tailwind `shadow-dialog`), for R2b's Modal. `shadow-premium` stays only on things above the page: menus, drop-downs, pop-overs, toasts, the feedback/translate overlays, the theme preview bar (step 8).
- **`soft-press`** stays as is (a press effect, not a look). **`skeleton`** stays (R2b restyles). **`scrollbar-none`** stays.
- **Space:** unchanged in R1a (4 px grid, 16 px phone gutter). Header height token `--header-height`/`--spacing-header` stays (R2a).

### 1.5 The theme pipeline after R1a

Files and exact changes:

1. `lib/constants/theme.ts`
   - `ThemeModeTokens` gains `tint?: string` and `categories?: Partial<Record<CategoryToneSlug, string>>`.
   - New `CATEGORY_TONE_SLUGS` (the 15 slugs of 1.2, in that order) `as const`, `type CategoryToneSlug`, and `CATEGORY_TONES: Record<CategoryToneSlug, { light: string; dark: string }>` with the values of 1.2.
   - `THEME_PRESET_KEYS = ['moss', 'sea', 'rye']`; delete the `current` preset (indigo/Geist). `DEFAULT_THEME_KEY = 'moss'`.
   - `moss` = the values of 1.1: light `{ primary '#4B5E3B', background '#f4f4ef', surface '#fdfdfb', foreground '#1f221c', surfaceElevated '#fdfdfb', tint '#e8eae1', muted '#5f6558', border '#dcdfd4' }`, dark `{ primary '#b5c79e', background '#161814', surface '#1e211c', foreground '#eceee7', surfaceElevated '#282c25', tint '#282c25', muted '#a8ae9f', border '#353a31' }`, fonts `literata` / `commissioner`. Presets carry no `categories` (defaults apply). `sea` and `rye` keep their values.
   - Update the file's header comment ("Category colours (`--cat-*`) are part of a theme, per mode; missing ones come from `CATEGORY_TONES`").
2. `lib/validations/theme.ts`: `themeModeTokensSchema` gains `tint: hexColorSchema.optional()` and `categories: z.partialRecord(z.enum(CATEGORY_TONE_SLUGS), hexColorSchema).optional()` (zod 4.3; `partialRecord` exists in `node_modules/zod/v4/classic/schemas.d.ts`). Old rows without these keys still parse.
3. `lib/theme/css.ts`
   - `themeModeVars(t, mode: 'light' | 'dark')` adds `'--tint': t.tint ?? color-mix(in srgb, fg 8%, bg)`, `'--on-cat': mode === 'light' ? '#ffffff' : t.background`, and for every slug in `CATEGORY_TONE_SLUGS`: `` `--cat-${slug}` ``: `t.categories?.[slug] ?? CATEGORY_TONES[slug][mode]`.
   - `themeCss` passes `'light'` / `'dark'`. `themeSampleVars` takes the mode too (caller `components/admin/design/ThemeSample.tsx` has `dark`) and also sets `'--color-tint'`.
   - Only `CATEGORY_TONE_SLUGS` keys and validated hex reach the CSS (unchanged guarantee).
4. `lib/services/theme.service.ts` `toContext`: after parsing, if `presetKey` is one of `THEME_PRESET_KEYS`, take `light`, `dark`, `headingFont`, `bodyFont` from `THEME_PRESETS[presetKey]` (code is the source for presets, so a stored copy of an older preset follows the new values); `custom` keeps the stored values. A stored `presetKey: 'current'` no longer parses → `defaultTheme()` = Sūna. `reset()` still publishes `DEFAULT_THEME_KEY` (now `moss`). Keep the doc comments in step ("falls back to the default look").
5. `components/admin/design/DesignEditor.tsx`: the reset dialog calls `choosePreset(DEFAULT_THEME_KEY)` instead of `'current'`. `ThemePresetCard` needs no change (it maps `THEME_PRESET_KEYS`).
6. Admin preview (`ThemePreviewBar`, cookie `theme_preview`) needs nothing: a draft is a `ThemeContext`, so it carries its `categories` into `themeCss`.

**Production effect:** whatever row is published today (`current`, a preset, or none), the site shows Sūna after deploy unless an admin had published a `custom` theme; in that case the reviewer resets it once in `/lv/admin/design` (Atiestatīt) after the deploy and notes it in the row of section 8.

### 1.6 Category colour in code

New `lib/theme/category.ts` (pure, no server imports, usable in client components):

```ts
import { CATEGORY_TONE_SLUGS, type CategoryToneSlug } from '@/lib/constants';
import { hexColorSchema } from '@/lib/validations/theme';

export function isCategoryToneSlug(slug: string): slug is CategoryToneSlug {
    return (CATEGORY_TONE_SLUGS as readonly string[]).includes(slug);
}

/**
 * The CSS colour of a main category: its theme tone (`var(--cat-<slug>)`, light and dark set by the site theme
 * on the server), else the stored `Category.color`, else the quiet text colour. Safe inside a `<style>` block.
 */
export function categoryColor(l1Slug: string | null | undefined, fallback?: string | null): string {
    if (l1Slug && isCategoryToneSlug(l1Slug)) return `var(--cat-${l1Slug})`;
    if (fallback && hexColorSchema.safeParse(fallback).success) return fallback;
    return 'var(--foreground-muted)';
}
```

Use it (and nothing else) wherever a category colour is produced:

| File | Change |
|---|---|
| `lib/services/taxonomy-resolver.service.ts` | `accentColor = categoryColor(l1Slug, category.color \|\| category.parent?.color \|\| category.parent?.parent?.color)`; drop the `'#6366f1'` default param (callers that pass one: grep `TaxonomyResolver.resolve(`). |
| `lib/services/discovery.service.ts` lines ~391 and ~487 | `color: categoryColor(c.slug, c.color)` / `categoryColor(l1Tree.slug, l1Tree.color)` |
| `lib/constants/index.ts` | `NEUTRAL_ACCENT = 'var(--foreground-muted)'` (no category chosen = quiet, as the redesign's `--c:var(--muted)`; the site colour is for buttons only, AR-06). Update its comment. |
| `app/[locale]/[l1Slug]/group/[groupSlug]/layout.tsx` | see below |
| `components/groups/GroupHeader.tsx` ~171–175 | the L1 chip text: `'var(--on-cat)'` instead of `getContrastForeground(...)`; drop the import |
| `components/discovery/DiscoverySidebar.tsx` 187, 203 | `` `${cat.color}18` `` → `tint(cat.color, 10)` (`lib/color-utils.ts`); active: `{ backgroundColor: cat.color, color: 'var(--on-cat)' }`, no `boxShadow` |
| `components/discovery/DiscoveryFilterBar.tsx` 444 | `color: 'var(--on-cat)'` |
| `components/groups/create-wizard/GroupCreationWizard.tsx` (`l1Color: l1.color`), `components/groups/settings/CategorizationSection.tsx` 58, `app/[locale]/admin/groups/[l1Slug]/[groupSlug]/categorization/AdminGroupCategorizationForm.tsx` 79 | `categoryColor(l1.slug, l1.color)` |
| `lib/handbook/ui-samples.ts` | `SAMPLE_L1_SLUG = 'sports'`, `SAMPLE_ACCENT = categoryColor('sports')` (today `'movement'` / `'#4ADE80'`, a slug that no longer exists) |
| `components/shell/Header.tsx` | logo: see 3.5; `var(--group-accent, …)` goes |
| `components/shell/GroupSidebarContent.tsx` | `var(--group-accent, var(--primary))` → `var(--primary)` (navigation is site colour; the file is deleted in R3a) |

Group layout (`app/[locale]/[l1Slug]/group/[groupSlug]/layout.tsx`), replacing lines 25–31 and the `<style>`:

```tsx
// var(--cat-<l1Slug>) or a validated hex from TaxonomyResolver: safe inside <style>. Light/dark come from the site theme.
const accentColor = group.theme.accentColor;
...
<div className="min-h-full bg-background">
    <style dangerouslySetInnerHTML={{ __html: `:root{--accent:${accentColor};--accent-foreground:var(--on-cat)}` }} />
```
Remove `ensureContrast`, `getContrastForeground`, the inline `accentStyle`, `suppressHydrationWarning` on that div, and `--group-accent` (grep G10 = 0). `lib/color-utils.ts` keeps `ensureContrast`/`isLight` only if still used (`grep -rn "ensureContrast\|isLight\|getContrastForeground" app components lib`); delete unused ones.

Not changed in R1a: the admin taxonomy pages (`app/[locale]/admin/categories/*`) show and edit the stored `Category.color` (`${color}20` there stays valid hex). R1b decides how they relate to the tones.

## 2. Logo, icon (AR-03)

- New `components/ui/Logo.tsx` (Server-safe, uses `useTranslations('common')`): `<span data-ui={UI.logo} className="inline-flex items-center whitespace-nowrap font-heading font-semibold text-primary">` + wordmark from `t.rich('logo.wordmark', { em: (c) => <em className="font-medium">{c}</em> })` + the two circles: a 12 px `rounded-full bg-primary` and, behind it, a second 12 px circle offset 8 px right at `bg-primary/45` (draw both as spans, the 45 % one first with `-ml` overlap, or one span with `shadow-[8px_0_0_0_color-mix(in_srgb,var(--primary)_45%,transparent)]`; the result must match `.rd-logo::after` in `css.mjs` line 103). Sizes: `md` 21 px text / 12 px circles (desktop), `sm` 18 px / 10 px circles with 7 px offset (phones, `.rd-hdr.ph`). Prop `iconOnly` renders just the circles. `aria-hidden` on the circles.
- `app/icon.svg` (new, file convention in `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/app-icons.md`): `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="20" cy="16" r="8" fill="#4B5E3B" fill-opacity=".45"/><circle cx="12" cy="16" r="8" fill="#4B5E3B"/></svg>`. Delete `app/favicon.ico`. (The one hex outside the theme; a favicon can't read CSS variables.)
- Header (`components/shell/Header.tsx` lines ~27–49): the link keeps `href="/"` and `aria-label={t('logoText')}`; its content becomes `<Logo size="sm" className="md:hidden" />` + `<Logo className="hidden md:inline-flex" />` (or one responsive Logo). The "EK" square, the subtitle and their hover effects go. Nothing else in the header changes (R2a). Remove `shadow-premium` from the header (step 8; it keeps its `border-b border-border`).
- i18n: `common.logo.wordmark` = `"Ejam <em>kopā</em>"` in both files. `shell.header.logoText` → `"Ejam kopā"` (both; the brand is sentence case, AR-03). Remove `common.brandShort` and `shell.header.logoSubtitle` (both occurrences, lines ~979 and ~985) only if grep shows no other use.

## 3. Atoms

All in `components/ui/`, each with its `data-ui` name in `UI` (`lib/constants/index.ts`). New names: `logo: 'logo'`, `buttonQuiet: 'button-quiet'`, `categoryLine: 'category-line'`, `categoryDisc: 'category-disc'`, `roleTag: 'role-tag'`.

### 3.1 Button (`Button.tsx`)

Redesign `.rd-btn` (`css.mjs` 136–143). Pill, no border.

```ts
const BASE = 'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium transition-opacity disabled:opacity-50 [&_svg]:h-4 [&_svg]:w-4';
const SIZES = { md: 'h-11 px-[18px] text-[15px] md:h-10', sm: 'h-8 px-3.5 text-sm' };
const VARIANTS = {
    primary: 'bg-primary text-primary-foreground hover:opacity-90',
    secondary: 'bg-tint text-foreground hover:opacity-80',            // .rd-btn.s
    quiet: 'bg-transparent text-foreground ring-1 ring-inset ring-border hover:bg-tint', // .rd-btn.q
    danger: 'bg-danger text-danger-foreground hover:opacity-90',
};
```
`buttonClass(variant, className, size = 'md')` keeps its first two parameters (existing callers unchanged). `Button` gets `size?: 'md' | 'sm'`. Height: 44 px on phones (touch target, plan §6), 40 px from `md` (drawing 38 px).

### 3.2 Badge → small tags (`Badge.tsx`, AR-09)

Redesign `.rd-pill` (`css.mjs` 152–154). Never clickable, sentence case.

- Tones: `tag` (default; `bg-primary/15 text-foreground`), `outline` (`bg-transparent text-foreground-muted ring-1 ring-inset ring-foreground-muted`), `muted` (`bg-tint text-foreground-muted`, for quiet facts such as "Tikai biedriem", "Pieteikšanās").
- Class: `inline-flex h-5 shrink-0 items-center gap-[3px] whitespace-nowrap rounded-full px-2 text-[11px] font-semibold leading-none [&_svg]:h-[11px] [&_svg]:w-[11px] [&_svg]:stroke-[2.8]`.
- Remove the `accent` tone and the `color` prop (category colour never on a tag, AR-06). Callers: `EventCard.tsx` 69–75, `groups/EventRow.tsx` 74–86, UI elements page 74–76: "Tikai biedriem" and "Pieteikšanās" → `muted`; "Pilns" → `outline`.
- Note: `components/admin/AdminNav.tsx` has its own local `Badge` (counts); leave it (R11).

New `components/ui/RoleTag.tsx`: `({ role }: { role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'PENDING' })` → `OWNER` `<Badge>{t('tag.owner')}</Badge>`, `ADMIN` `<Badge>{t('tag.mod')}</Badge>`, `PENDING` `<Badge tone="outline">{t('tag.pending')}</Badge>`, `MEMBER` → `null` (a plain member gets none). Messages `common.tag.*` (section 6). Use it in:
- `components/profile/MyGroupsListRow.tsx` 99–109 (replaces the icon + word block; MEMBER shows nothing),
- `components/groups/CompactGroupBar.tsx` ~44 (role word → `RoleTag`).
"Eju" with a tick: `<Badge><Check aria-hidden />{t('tag.going')}</Badge>` in `components/events/EventParticipation.tsx` ~81 where `goingDone` is shown as a state label; if that text is the button's own label, leave the button and do not add a tag (R6 rebuilds it).

### 3.3 FilterChip (`FilterChip.tsx`)

Redesign `.rd-oc` / `.rd-oc.on` (`css.mjs` 186–190):
- base `inline-flex h-8 shrink-0 items-center gap-[5px] whitespace-nowrap rounded-full px-2.5 text-xs font-medium transition-colors`
- off `bg-surface text-foreground ring-1 ring-inset ring-border hover:bg-tint`
- on `bg-primary/15 text-foreground font-semibold ring-1 ring-inset ring-primary/45`
(`aria-pressed` stays.)

### 3.4 Category atoms (`CategoryIcon.tsx`, new `CategoryLine.tsx`)

- `CategoryIcon` keeps its API. Add in the same file `CategoryDisc({ slug, color, size = 26 })`: round disc, `style={{ backgroundColor: tint(color, 18), color }}` (redesign `.rd-cats .ic`: `color-mix(--c 18%, surface)`), icon at 15/26 of the size. `color` comes from the service (`accentColor`), never computed in the component.
- New `CategoryLine({ color, category, subCategories })` (redesign `.rd-cat`, `.rd-sub`, `.rd-catl`): a flex-wrap line; first the category: 8 px dot `rounded-full` with `style={{ backgroundColor: color }}` + name `text-[13px] font-medium text-foreground`; then `subCategories.join(', ')` in `text-[13px] text-foreground-muted`. Used on UI elements in R1a; R3a (banner), R5a (cards), R8 (rows) adopt it.
- Icons stay `lib/icons.ts` (lucide). No icon changes in R1a.

## 4. Sweeps

Every sweep has a grep that proves it. Run from the repo root (Git Bash). "0" means no output.

### 4.1 AR-06 · category colour off site controls (step 4)

Rule for every hit of G1: if the element is a **button, link, active tab/nav item, toggle, checkbox/radio, focus ring or focused input border, selected chip/option, progress/step indicator** → site colour: `bg-[var(--accent)]` → `bg-primary`, `text-[var(--accent)]` → `text-primary`, `border-[var(--accent)]…` / `ring-[var(--accent)]…` → `border-primary…` / `ring-primary…` (keep the `/NN` opacity), `text-[var(--accent-foreground)]` → `text-primary-foreground`, `prose-a:text-[var(--accent)]` → `prose-a:text-primary`. If it is a **dot, category icon, category name, soft tint behind category content (`/5`–`/15`), the group banner or picture fallback** → keep `--accent`.

```bash
# G1: every accent use; after the sweep each remaining line must be a dot/icon/tint/banner/category label
grep -rnE "\[var\(--(accent|accent-foreground)\)\]" app components --include=*.tsx
# G2: no filled accent background left on a <button>/<Link> (expect 0)
grep -rnE "<(button|Link|a)\b[^>]*bg-\[var\(--accent\)\][^/]" app components --include=*.tsx
```
Today: 185 uses in 51 files (`text-` 52, `bg-` 46, `border-` 36, `bg-/10` 13, …). Files with a filled accent background: `app/[locale]/page.tsx`, `[groupSlug]/page.tsx`, `events/[eventSlug]/page.tsx`, `EventCard`, `ListViewEventCard`, `EventOrganiserPanel`, `DateField`, `EventCreationWizard`, `AnnouncementBoard`, `CityField`, `CompactGroupBar`, `AccessStep`, `GroupCreationWizard`, `EventRow`, `GroupHeader`, `GroupSectionEditor`, `GroupSettingsForm`, `GroupSocialLinks`, `GroupTabs`, `MemberAvatarList`, `MemberCard`, `SectionEditForm`, `AcceptingMembersSection`, `PrivacySection`, `TransferOwnershipSection`, `TagPicker`, `ContactGroupModal`, `MemberMoreModal`, `Badge`, `LangSwitch`, admin `SlideoverL1View`. The group's join / contact / "Izveidot pasākumu" buttons become Sūna: that is the rule (AR-06), not a regression.

### 4.2 Text on filled colours (step 4, required for dark mode)

Dark `--primary` is light sage (#b5c79e): white text on it is 1.7:1. Every `text-white` on `bg-primary`, `bg-[var(--accent)]` (now primary) or a red/danger fill → `text-primary-foreground` / `text-danger-foreground`. White text on a photo or a dark scrim stays.

```bash
# G3 (expect 0)
grep -rnE "bg-primary\b[^/]|bg-danger\b[^/]" app components --include=*.tsx | grep "text-white"
# G4: every remaining text-white must sit on an image, a scrim (bg-black/NN) or a category tone (then text-[var(--on-cat)] is preferred)
grep -rn "text-white" app components --include=*.tsx
```
Today 38 lines combine `bg-primary` with `text-white`, 26 combine `bg-[var(--accent)]` with it. `bg-white` (12 hits, files: `EventCard`, `AccessStep`, `GroupHeader`, `GroupInfoDrawer`, `GroupSocialLinks`, `HiddenGroupBanner`, `MemberAvatarList`, `AcceptingMembersSection`, `ContactGroupModal`, `ProfileEditForm`) → `bg-surface`, except a toggle knob (stays white, as `.rd-tgl .k::after`).

### 4.3 Pill buttons (step 4)

Every hand-made filled button (`bg-primary`, former `bg-[var(--accent)]`, `bg-red-*`/`bg-danger`) with `rounded-md|lg|xl|2xl|3xl` → `rounded-full`; prefer `buttonClass(...)` when the classes are a plain button. ~35 places (e.g. `TagPicker` 3, `EventCreationWizard` 3, `GroupCreationWizard` 2, `DesignEditor` 2, `profile/my-groups/page.tsx` 2, `UserMenu`, `Footer`, `ProfileEditForm`, `UsernameForm`, `ContactGroupModal`, `MessageUserButton`, `ChatPanel`, `SignInForm`, `RegisterForm`, `not-found.tsx`, `about/page.tsx`, …).
```bash
# G5 (expect 0)
grep -rnE "className=.*bg-(primary|danger|\[var\(--accent\)\])( |\")" app components --include=*.tsx | grep -E "rounded-(md|lg|xl|2xl|3xl)\b"
```
Outlined/secondary hand-made buttons are converted when their screen is rebuilt (R2a–R12), not here.

### 4.4 Palette colours → status tokens (step 5)

264 hits in 75 files (red 179, amber 41, green 11, blue 11, emerald 10, slate 8, rose 3, orange 1). Mapping (drop any `dark:` variant of the same property; the token carries both modes):

| Today | New |
|---|---|
| `text-red-400…700`, `text-rose-*` | `text-danger` |
| `bg-red-500/600/700` (fills) | `bg-danger` (+ `text-danger-foreground`) |
| `bg-red-50/100`, `bg-red-500/5…/20` | `bg-danger/10` |
| `border-red-*`, `ring-red-*` | `border-danger/40`, `ring-danger/40` |
| `text-green-*`, `text-emerald-*` | `text-success` |
| `bg-green-*`/`bg-emerald-*` tints | `bg-success/10`; borders `border-success/40` |
| `text-amber-*`, `text-yellow-*`, `text-orange-*` | `text-warning` |
| `bg-amber-*` tints / borders | `bg-warning/10` / `border-warning/40` |
| `text-blue-*`, `text-indigo-*` (links, info) | `text-primary` |
| `bg-blue-*` tints | `bg-tint` |
| `text-slate-*` / `bg-slate-*` | `text-foreground-muted` / `bg-tint` |
| `GroupHeader.tsx` 339, 341 `text-emerald-400`, `text-blue-400` on the role shield | `text-foreground-muted` |

```bash
# G6 (expect 0)
grep -rnE "\b(text|bg|border|ring|from|to|via|fill|stroke|outline|shadow|decoration|divide|placeholder)-(red|rose|pink|green|emerald|lime|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|amber|yellow|orange|slate|gray|zinc|neutral|stone)-[0-9]{2,3}" app components --include=*.tsx --include=*.ts
# G7: hex colours in app code; allowed after R1a: OAuthButtons.tsx (provider logo), admin/categories SlideoverL1View.tsx 27 (stored-colour editor default)
grep -rnE "#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b" app components --include=*.tsx --include=*.ts
```

### 4.5 AR-10 · sentence case, weights (step 6)

- Remove `uppercase` everywhere (99 hits in 57 files), and with it any `tracking-wide|wider|widest|[0.1em]…` on the same element. Keep `tracking-tight` on headings only if it was there.
- `font-black` / `font-extrabold` (99 hits in 62 files) → `font-semibold` on headings and titles, `font-bold` on numbers/counts.
- `text-[8px]`, `text-[9px]`, `text-[10px]` (73 hits) → `text-[11px]` (tags, counters) or `text-xs` (labels); the smallest text in the redesign is 11 px.
- Message values in capitals (both files): `common.groupMenu`, `common.reportLabel`, `discovery.groupsEventsSection`, `discovery.topicsSection`, `shell.sidebar.events`, `shell.sidebar.groups`, and `event.tba` (en "TBA" → "To be announced"). New values in section 6.

```bash
grep -rnw "uppercase" app components --include=*.tsx                 # G8a expect 0
grep -rnE "font-(black|extrabold)" app components --include=*.tsx     # G8b expect 0
grep -rnE "text-\[(7|8|9|10)px\]" app components --include=*.tsx      # G8c expect 0
grep -rnE "tracking-(wide|wider|widest|\[)" app components --include=*.tsx  # G8d expect 0
node -e "const f=(o,p='')=>Object.entries(o).flatMap(([k,v])=>typeof v==='object'?f(v,p+k+'.'):[[p+k,v]]);for(const L of ['lv','en'])for(const [k,v] of f(require('./messages/'+L+'.json')))if(/\b[A-ZĀČĒĢĪĶĻŅŠŪŽ]{3,}\b/.test(v.replace(/\{[^}]*\}/g,''))&&!/\b(BUJ|URL|ID|OK|PDF|ICS|FAQ|GDPR|API|SMS|LV|EN)\b/.test(v))console.log(L,k,v)"  # G8e expect 0
```
Texts an admin overrode in the database (`/admin/translations`) are not swept; the reviewer looks through that page for capitals and tells the owner.

### 4.6 Remaining tokens (steps 1, 8)

- `--owner`: `MemberAvatarList.tsx` 78, 96 and `MemberMoreModal.tsx` 77 → `bg-foreground` / `text-foreground` (the owner's mark is not a colour of its own; the word comes from `RoleTag` in R9b).
- `shadow-premium` (25 files) stays only on floating layers. Remove it from: `Header.tsx`, `GroupHeader.tsx`, `GroupTabs.tsx`, `GroupInfoDrawer.tsx` (it is a drawer: keep), `AnnouncementBoard.tsx`, `AnnouncementCard.tsx`, `GroupSettingsForm.tsx`, `SectionEditForm.tsx`, `MemberCard.tsx`, `TagPicker.tsx` (keep on its drop-down only), `DiscoveryFilterBar.tsx` (keep on its drop-downs only), `DiscoverySidebar.tsx`, `onboarding/username/page.tsx`, `admin/categories/TaxonomyTree.tsx`. Keep it on: `AdminToolsMenu`, `GroupMoreMenu`, `ConfirmPopover`, `Toast`, `DateField` (calendar pop-over), `TaxonomySlideover`, `ThemePreviewBar`, `FeedbackMode`, `FeedbackNamedElements`, `FeedbackPins`, `TranslateMode`, `GroupInfoDrawer`.
- `shadow-card` users (`[groupSlug]/page.tsx`, `GroupInfoDrawer`, `GroupTabs`, `MemberCard`, `RequestCard`, `TagPicker`) need no edit: the token is `none`.
- Tailwind `shadow-sm…2xl` (107 hits in 67 files) and card borders are left to each screen's release; R1a only removes them where it already edits the element.

```bash
grep -rnE "var\(--owner\)|\b(bg|text|ring|border)-owner\b" app components --include=*.tsx  # G9a expect 0
grep -rn "color-cat-" app components lib                                                 # G9b expect 0 (and app/globals.css)
grep -rn "group-accent" app components lib                                                # G10 expect 0
grep -rniE "6366f1|geist_mono|font-geist-mono" app components lib                          # G11 expect 0
grep -rn "Geist\b" lib app --include=*.ts --include=*.tsx                                 # G12: only lib/theme-fonts.ts and THEME_FONTS
```

## 5. Dates (AR-11, step 7)

`lib/date-format.ts` gains:

```ts
/** "Svētd., 18. okt." / "Sun, 18 Oct": the date of an event, with the weekday (AR-11). */
export const EVENT_DAY = { weekday: 'short', day: 'numeric', month: 'short' } as const;
/** "Svētd., 18. okt. 17:00" / "Sun, 18 Oct, 17:00": 24-hour time in the viewer's zone. */
export const EVENT_DAY_TIME = { ...EVENT_DAY, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' } as const;
/** "Svētd., 17:00": weekday and time, next to a date tile. */
export const EVENT_WEEKDAY_TIME = { weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' } as const;

/** Sentence case for a formatted date: Latvian writes weekdays in lower case inside a date ("svētd., …"). */
export function capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
```
Checked with Node's ICU (lv): `EVENT_DAY_TIME` → "svētd., 18. okt. 17:00", capitalised "Svētd., 18. okt. 17:00" (the drawing); en-GB → "Sun, 18 Oct, 17:00". Use them:

| Place | Today | New |
|---|---|---|
| `events/[eventSlug]/page.tsx` 154 | `{ weekday: 'long', month: 'short', day: 'numeric' }` | `capitalizeFirst(formatter.dateTime(startDate, EVENT_DAY))` |
| same file 246 | long full date | keep the options, wrap in `capitalizeFirst` |
| `groups/EventRow.tsx` 93, `discovery/EventCard.tsx` 96, `discovery/ListViewEventCard.tsx` 66 | time only | `capitalizeFirst(formatter.dateTime(start, EVENT_WEEKDAY_TIME))` (+ the end time as today in EventRow); the date tile beside them keeps day + month, month in sentence case (no `uppercase`) |
| `forms/DateField.tsx` calendar | weekday heads, days | Monday first in both locales (check `en`), and Saturday/Sunday columns on `bg-tint` (redesign `.rd-cal .we`), their letters `text-foreground` |

The full day strip and calendar are R5b.

## 6. i18n (both files, same keys; `npm run i18n:check`)

| Key | lv | en |
|---|---|---|
| `common.tag.going` (new) | Eju | Going |
| `common.tag.owner` (new) | Īpašnieks | Owner |
| `common.tag.mod` (new, OD-01) | Mod | Mod |
| `common.tag.pending` (new) | Gaida | Pending |
| `common.logo.wordmark` (new) | `Ejam <em>kopā</em>` | `Ejam <em>kopā</em>` |
| `shell.header.logoText` | Ejam kopā | Ejam kopā |
| `common.groupMenu` | Grupas izvēlne | Group menu |
| `common.reportLabel` | Ziņojums | Report |
| `discovery.groupsEventsSection` | Grupas un pasākumi | Groups and events |
| `discovery.topicsSection` | Tēmas | Topics |
| `shell.sidebar.events` | Pasākumi | Events |
| `shell.sidebar.groups` | Grupas | Groups |
| `event.tba` | (unchanged: Tiks precizēta) | To be announced |
| `admin.design.presets.current` | removed | removed |
| `admin.design.resetDone` | Atgriezts noklusētais izskats (Sūna). | Back to the default look (Sūna). |
| `admin.design.resetConfirmMessage` | Visiem tiks atjaunots noskaņojums "Sūna". | Everyone gets the "Sūna" look again. |
| `admin.handbook.ui.sections.{logo,type,colours,tags,categoryLine}` (new) | Logo · Burti · Krāsas · Mazās birkas · Kategorijas rinda | Logo · Type · Colours · Small tags · Category line |
| `admin.handbook.ui.sample.{noteText,subCategories}` (new) | Nākamā tikšanās: sestd., 17. okt. · Nūjošana, Pastaigas | Next meeting: Sat, 17 Oct · Nordic walking, Walks |

OD-01 in R1a is only the tag word "Mod"; "Moderators" in lists and menus and "grupas komanda" are applied by R3a (`voice.md`) and R9b. `common.role_admin` / `group.role_admin` stay. Remove `common.brandShort` and `shell.header.logoSubtitle` if unused (section 2).

## 7. UI elements page (`app/[locale]/admin/handbook/ui-elements/page.tsx`)

- Title `h1`: `font-semibold` (sweep). `components/handbook/UiSpecimen.tsx` h2 likewise; its frame keeps `rounded-2xl border border-border` (a specimen frame, not a card).
- New specimens, in this order before "buttons": **logo** (`Logo` md, `Logo` sm, `Logo iconOnly`; files `components/ui/Logo.tsx`, `app/icon.svg`), **type** (Literata page title, section, item title; Commissioner body and small; a `human-note` line with `sample.noteText`), **colours** (swatches for background, surface, tint, border, foreground, muted, primary, danger, success, warning as small labelled boxes using the classes, plus the 15 `CategoryDisc`s with their slug — they follow the light/dark toggle already on the page).
- **buttons**: add `quiet` and `size="sm"`; names `[UI.buttonPrimary, UI.buttonSecondary, UI.buttonQuiet, UI.buttonDanger]`.
- **badges** → shows the tags: `Badge` tag "Eju" with `Check`, `RoleTag` OWNER, ADMIN ("Mod"), PENDING ("Gaida", outlined), and muted "Tikai biedriem"; names `[UI.badge, UI.roleTag]`, files `Badge.tsx`, `RoleTag.tsx`.
- **categoryLine**: `CategoryLine` with `samples.accent` (= `categoryColor('sports')`), `sample.category`, `sample.subCategories`.
- `components/handbook/AccentScope.tsx` unchanged. Existing specimens (cards, rows, header, slim bar …) stay and simply show the new tokens.

## 8. Handbook (`docs/handbook/design.md`)

Rewrite in R1a, in the Handbook's plain voice:
- Remove the "Draft" banner and the whole "Undecided" section (1: settled by AR-06, site colour on buttons; 2: settled by AR-10, no capitals at all, table headers included; 3: settled, `/admin/handbook/ui-elements`).
- **Page layouts:** keep the letters A, B, D, E, F; remove C (owner's plan). B becomes "Group page: banner (96 px, the group's image or its tone) and the group's pages down the left (☰ drawer on phones); every group page, from R3a (AR-47, AR-48)". A notes the filter line and category drawer (R5a). Keep the screen table, set "Today" to the release that changes each screen (R2a–R12 per the build plan's section 3), and drop the 2.xx session numbers.
- **Foundations · Colour:** the table of 1.1 (role → token, light and dark value), "Colour means category" (AR-06 wording: tones only on dots, icons, tints, the banner and the picture fallback; Sūna only on site buttons and links), the 15 tones (link to the redesign `#h-id` table rather than copying hex), status colours, contrast floor (AA text, tones ≥ 4.5:1 with white / ≥ 7:1 with near-black).
- **Type:** the table of 1.3 (Literata / Commissioner; no Geist).
- **Shape:** pill buttons, chips, tags; 16 px cards and pop-ups; 12 px inputs and menu items; no borders on cards, thin lines between rows.
- **Space and depth:** as today, but cards flat; the float shadow only on menus, pop-overs, toasts; dialogs `shadow-dialog`; the same in dark mode.
- **Identity** (new subsection): logo (AR-03), small tags (AR-09: Eju, Īpašnieks, Mod, Gaida outlined; never clickable; none for a plain member), category line, words and numbers (AR-10), dates (AR-11 with the examples of section 5).
- **Components:** Button (primary / secondary / quiet / danger, sizes md/sm, always the site colour, never the group's), Badge and RoleTag, FilterChip, CategoryIcon / CategoryDisc / CategoryLine, Logo; keep form field, pop-up, empty state lines (R2b updates them).
Link rules by id (`AR-06`) where useful; no hex values except in the colour table.

## 9. Out of R1a

Header layout, menus, language switch, bottom bar, footer (R2a); Modal, toasts, empty states, skeletons, counters (R2b); group banner and frame (R3a); cards, filter bar, drawer (R5a); event rows, day strip, calendar (R5b); Dizains editing of tones and status colours (R1b); admin taxonomy colour editor; per-screen borders, Tailwind shadows and card radii (each screen's release); icon redraws; the `/admin/translations` overrides.

## 10. Builder steps and commits

Small commits, each one passing `npm run typecheck`. Messages in the repo's style (`feat(R1a): …`), ending with the co-author line.

1. **Tokens and fonts.** `app/globals.css`, `lib/constants/theme.ts`, `lib/validations/theme.ts`, `lib/theme/css.ts`, `lib/services/theme.service.ts`, `lib/theme-fonts.ts`, `app/layout.tsx`, `components/admin/design/{DesignEditor,ThemeSample}.tsx`, `admin.design` messages. Run the slug check (1.2) and the tone check. Commit "feat(R1a): Sūna tokens, category tones in the site theme, Literata and Commissioner".
2. **Category colour plumbing.** `lib/theme/category.ts` and the table of 1.6, group layout. Check a group page in dark mode with the cache cold (reload with DevTools "Disable cache"): no indigo or bright flash. Commit.
3. **Atoms.** `Logo`, `app/icon.svg` (delete `app/favicon.ico`), Header logo, `Button`, `Badge`, `RoleTag`, `FilterChip`, `CategoryIcon`/`CategoryDisc`, `CategoryLine`, `UI` names, `common.tag.*`, `common.logo.*`; update Badge callers. Commit.
4. **AR-06 and filled buttons** (4.1–4.3). Commit per folder: `components/groups` + group routes; `components/forms` + `components/events`; the rest. G1–G5.
5. **Palette colours** (4.4). G6, G7. Commit.
6. **Sentence case and weights** (4.5) + caps messages. G8a–e. Commit.
7. **Dates** (section 5). Commit.
8. **Shadows and leftovers** (4.6). G9–G12. Commit.
9. **UI elements page and `docs/handbook/design.md`** (sections 7, 8). Commit.
10. **Close-out:** Definition of done (below); in `docs/development/build-plan.md` section 8 set R1a to "built, in review" with the commit range; in `docs/execution_handoff.md` tick the R1a line. Commit. Do not push (the reviewer pushes).

Migration: **none** (stated in 0; `prisma/schema.prisma` unchanged).

## 11. Acceptance

**Definition of done:**
```bash
npm run typecheck
npx eslint $(git diff --name-only --diff-filter=d origin/main...HEAD -- '*.ts' '*.tsx')   # commits sit on local main until the reviewer pushes
npm run i18n:check
npm run plan:check
npm run build   # needs AUTH_SECRET + DATABASE_URL; catches next/font option errors
```
plus G1–G12 above with the expected results.

**Screens** (dev server, seeded DB; each in lv and en, at 375 px and 1280 px, light and dark = 8 views per route; no horizontal page scroll):

| Route | Look for |
|---|---|
| `/` (groups and `?tab=events`) | Sūna buttons; category dots/tints in tones; drawer active item `--on-cat` text; dates "Svētd., 17:00" on event cards |
| `/<l1>/group/<slug>` as visitor, member, owner | `--accent` = tone in both modes; join/contact/"…" buttons Sūna and pill; role tags |
| `…/events`, `…/events/<event>`, `…/create-event`, `…/events/<event>/edit` | date with weekday; DateField weekend tint, Monday first |
| `…/members`, `…/announcements`, `…/settings` (all tabs) | buttons, toggles and tabs in Sūna; no capitals |
| `/profile`, `/profile/edit`, `/profile/my-groups`, `/profile/<username>` | RoleTag on My groups rows; no tag for a plain member |
| `/messages` (+ the messages drawer) | conversation category colours in tones |
| `/create` (all steps), `/onboarding/username`, `/auth/signin`, `/auth/register`, `/about`, `/privacy`, a 404 | pill buttons, no capitals |
| Header menus: profile, shield, bell, language; cookie banner; a toast; ConfirmDialog; feedback and translate modes | float shadow only on these |
| `/admin`, `/admin/reports`, `/admin/categories`, `/admin/locations`, `/admin/translations`, `/admin/feedback`, `/admin/team`, `/admin/design`, `/admin/handbook`, `/admin/handbook/ui-elements` | Dizains shows three presets, Sūna selected; preview of "Jūra" swaps colours and keeps the tones |

The redesign's [Every live screen](../redesign.html#live-screens) table lists all 61 screens; the reviewer ticks each one against the routes above (rows with no route of their own are opened through their parent: drawers, menus, pop-ups).

**Side by side with the drawings:** open `/lv/admin/development/redesign#h-id` next to the live page at the same width and theme (the redesign page follows the site's dark class). Compare only Identity: logo, colour swatches, the 15-tone table vs `/admin/handbook/ui-elements` colours, small tags, category line, buttons, type. Layout differences against other drawings are expected until their release.

**Extra (from the card):**
- Tone contrast: the tone check of 1.2.
- No flash: group page, dark mode, cold cache, throttled to "Slow 4G": the first paint already has the dark tone.
- AR-06: G2 = 0 and the G1 leftovers are all non-controls.

**Known risky spots:**
- Dark mode `text-white` on Sūna (4.2) — the single most likely regression; G3/G4.
- Production may have a published `custom` theme (1.5) — the reviewer checks `/admin/design` after deploy.
- An L1 slug in production not in the table falls back to its old bright hex (1.2) — check `/admin/categories`.
- `toContext` now ignores stored preset values: an admin who saved a preset and edited nothing loses nothing; one who edited is `custom` already.
- `GroupHeader.tsx` (398 lines) and `DiscoveryFilterBar.tsx` (570) carry many of the accent and capital hits; edit classes only, do not restructure (R3a, R5a replace them).
- Literata at weight 900 no longer exists in the sweep; any `font-black` missed by G8b renders synthetic-bold.
- `bg-primary/15` relies on Tailwind v4's `color-mix` for a `var()` colour (supported); check chips in both modes.
