# R1b spec · Admin → Dizains

Just-in-time spec for release R1b of the [build plan](../build-plan.md#r1b--admin--dizains-m), written 13 Oct 2026 against `main` at `557b6bc` (R1a live on ejam.lumm.eu, accepted by the owner, status colours included) and the redesign tag `redesign-v9.8.2`. Frozen once R1b is pushed. The redesign page (`docs/development/redesign.html`, generated from `scripts/redesign/`) wins over this spec where they disagree; the ledger line wins over a drawing.

**Owned rule:** AR-69 Admin → Dizains ("Vietne → Dizains with Krāsas, Kategoriju krāsas and Fonti; preview for yourself, then publish"). **Also applied:** AR-04 (more themes later in Krāsas), AR-05 (tones editable in Kategoriju krāsas), AR-07 (fonts), the Handbook's contrast floor (`docs/handbook/design.md`, "Contrast floor"). **Owner decisions:** none apply (section 2 of the plan has none for R1b).

**Drawings** ([redesign#h-admin](../redesign.html#h-admin), source `scripts/redesign/gen.mjs` lines 608–611, CSS `scripts/redesign/css.mjs` 445–448, 561–567):
- "Desktop · Vietne → Dizains → Kategoriju krāsas": part title, one-sentence lead, a rows box with 15 rows (category disc · name · light swatch "Gaišā" · dark swatch "Tumšā" · "AA ✓"), then "Priekšskatīt man" (secondary) and "Publicēt visiem" (primary).
- "Phone · Dizains → Kategoriju krāsas": the same rows, same columns, at phone width.
- The note under the drawing (gen.mjs 609) defines the three parts: **Krāsas** = site colour and the neutral background, lines and quiet text, light and dark, more themes later; **Kategoriju krāsas** = one row per category, light and dark tone, "AA ✓" or a short warning when a tone fails; **Fonti** = Literata and Commissioner, each with a Latvian sample, from a short checked list with all Latvian letters. Preview yourself first, then publish.
- The admin frame around it (section tabs, left menu with Dizains' parts indented, phone ☰ bar "Dizains / Kategoriju krāsas") is **R11**. Until then the three parts are underline sub-tabs at the top of `/admin/design` (AR-21: a page's parts; Handbook "sub-tabs (underline)").

**Size:** M (one Sonnet session; ~16 files, no schema change).

## 0. Motivation and design alignment

- **No migration, no stored-shape change.** R1a already stores everything R1b edits in `SiteTheme.light` / `SiteTheme.dark` (JSON): `primary, background, surface, foreground` (required), `surfaceElevated, muted, border, tint` (optional), `categories` (optional partial map L1 slug → hex). R1b only exposes more of it in the editor. `lib/validations/theme.ts` is **not** changed, so the R1a app still serving during blue/green reads every row R1b saves, and R1b reads every row R1a (or older) saved.
- **Contrast guard in the service, not in the schema.** `toContext` reads stored rows through `themeInputSchema`; a contrast `refine` there would turn a published custom theme that fails today's guard into the default look. The guard is a pure function (`lib/theme/contrast.ts`) used live by the editor and enforced by `ThemeService.saveDraft` / `publish` (Service Law: permission and business rules in services; actions keep auth + revalidate).
- **Action Consistency.** Actions keep `requireSiteAdmin()` and return `ActionResponse`; the new failure is the code `CONTRAST_TOO_LOW` (registry + `errors.*` in both locales).
- **Taxonomy Law unchanged.** Tones still reach pages only through the server `<style id="site-theme">` (`app/layout.tsx` → `getActiveTheme()` → `themeCss`). A preview is a draft `ThemeContext`, so its `categories` already become `--cat-<slug>` for that admin on every page, group pages included (the group layout sets `--accent: var(--cat-<l1Slug>)`). The card's risk "preview must also swap the tones" is therefore already met by R1a's pipeline; R1b verifies it (acceptance).
- **Context Law / Defensive.** The page fetches theme and category names on the server and passes them once to the editor; one client hook owns the draft; every button has a pending guard (existing `busy`). Hex values only enter through `hexColorSchema`-validated inputs or the native colour input (always `#rrggbb`).
- **150-line rule.** `DesignEditor.tsx` (169) is split into one component per part plus a hook (card).

## 1. Data: the site theme JSON

Unchanged from R1a. For reference (`lib/constants/theme.ts` `ThemeModeTokens`, `lib/validations/theme.ts`):

```ts
// SiteTheme row: presetKey 'moss' | 'sea' | 'rye' | 'custom'; headingFont/bodyFont ∈ THEME_FONT_IDS
light | dark: {
  primary: '#rrggbb', background: '#rrggbb', surface: '#rrggbb', foreground: '#rrggbb',
  surfaceElevated?: hex, muted?: hex, border?: hex, tint?: hex,
  categories?: Partial<Record<CategoryToneSlug, hex>>,   // missing slug → CATEGORY_TONES[slug][mode]
}
```

What R1b writes:
- Choosing a preset writes the preset's values (presets carry no `categories`: tones go back to the defaults; say so in the hint, section 6).
- Any edit (colour, tone, font) sets `presetKey: 'custom'` (as today). For presets, `toContext` takes values from code (R1a), so tone edits must make the theme custom: they do, through `setTone` (section 3.2).
- On entering the editor, missing optional tokens are filled with the hex the CSS would mix (`completeModeTokens`, section 2), so every `ColorField` has a value. A custom row saved by R1b therefore carries all eight tokens explicitly; the R1a schema accepts them.
- Status colours (`--danger`, `--success`, `--warning`) stay in `app/globals.css`, not in the theme (accepted in R1a; out of scope).

**Compatibility checks (step 1, paste and run; every line must print `true`):**
```bash
npx tsx -e "import {themeInputSchema as s} from './lib/validations/theme'; const m={primary:'#4B5E3B',background:'#f4f4ef',surface:'#fdfdfb',foreground:'#1f221c'}; console.log(s.safeParse({presetKey:'moss',light:m,dark:m,headingFont:'literata',bodyFont:'commissioner'}).success, s.safeParse({presetKey:'custom',light:{...m,tint:'#e8eae1',categories:{sports:'#2f4a8f'}},dark:m,headingFont:'geist',bodyFont:'geist'}).success, s.safeParse({presetKey:'custom',light:{...m,extra:'x'},dark:m,headingFont:'lora',bodyFont:'lora'}).success, !s.safeParse({presetKey:'current',light:m,dark:m,headingFont:'geist',bodyFont:'geist'}).success)"
```
(old preset row, custom row with tones, a row with an unknown key — zod strips it — and the removed `current` preset, which falls back to Sūna in `toContext`).

## 2. Contrast guard (pure, client + server)

### 2.1 `lib/color-utils.ts` (add)

```ts
/** CSS `color-mix(in srgb, a <percent>%, b)` as a hex, so the editor can show and check a derived token. */
export function mixHex(a: string, b: string, percent: number): string   // channel = round(a*p + b*(1-p)); unparsable a → a
/** WCAG 2.x contrast ratio of two hex colours (1–21). An unparsable colour gives 1 (fails every check). */
export function contrastRatio(a: string, b: string): number            // (Lmax + .05) / (Lmin + .05) with getLuminance
```

### 2.2 `lib/constants/theme.ts` (add / change)

```ts
export type ThemeMode = 'light' | 'dark';
/** The three parts of Admin → Dizains (AR-69), in order. */
export const DESIGN_PARTS = ['colours', 'categories', 'fonts'] as const;
export type DesignPart = (typeof DESIGN_PARTS)[number];
/** Contrast floor (Handbook, design.md): text AA everywhere; a dark-mode tone 7:1 with the dark background. */
export const THEME_CONTRAST_MIN = 4.5;
export const THEME_DARK_TONE_MIN = 7;
// was ['primary', 'background', 'surface', 'foreground']
export const THEME_EDITABLE_TOKENS = ['primary', 'background', 'surface', 'foreground', 'muted', 'border', 'tint'] as const;
```
`surfaceElevated` stays out of the editor (kept as stored / = surface; R1a values). Export `onPrimary` from `lib/theme/css.ts` (today a private function; no other change there).

### 2.3 New `lib/theme/contrast.ts`

```ts
import { CATEGORY_TONES, CATEGORY_TONE_SLUGS, THEME_CONTRAST_MIN, THEME_DARK_TONE_MIN,
    type CategoryToneSlug, type ThemeDefinition, type ThemeMode, type ThemeModeTokens } from '@/lib/constants';
import { contrastRatio, mixHex } from '@/lib/color-utils';
import { onPrimary } from '@/lib/theme/css';

export type CompleteModeTokens = ThemeModeTokens & Required<Pick<ThemeModeTokens, 'surfaceElevated' | 'muted' | 'border' | 'tint'>>;

/** Fills the optional tokens with what `themeModeVars` would mix (same weights: muted 60, border 12, tint 8; surfaceElevated = surface). */
export function completeModeTokens(t: ThemeModeTokens): CompleteModeTokens;

export const SITE_CONTRAST_PAIRS = ['textOnBackground', 'textOnSurface', 'textOnTint', 'mutedOnBackground',
    'mutedOnSurface', 'linkOnBackground', 'linkOnSurface', 'textOnButton'] as const;
export type SiteContrastPair = (typeof SITE_CONTRAST_PAIRS)[number];
// pairs: fg/background, fg/surface, fg/tint, muted/background, muted/surface, primary/background, primary/surface, onPrimary(primary)/primary

/** The tone the theme uses for a slug and mode (stored, else the default). */
export function toneHex(t: ThemeModeTokens, slug: CategoryToneSlug, mode: ThemeMode): string;

/** Light: white on the light tone (≥ 4.5). Dark: the dark background (= --on-cat) on the dark tone (≥ 7). */
export function toneContrast(def: ThemeDefinition, slug: CategoryToneSlug): { light: number; dark: number; lightOk: boolean; darkOk: boolean };

export type ContrastIssue =
    | { part: 'colours'; mode: ThemeMode; pair: SiteContrastPair; ratio: number; min: number }
    | { part: 'categories'; mode: ThemeMode; slug: CategoryToneSlug; ratio: number; min: number };

/** Every pair below the floor, site colours (both modes, all 8 pairs at 4.5) then tones (15 × 2). Empty = can be saved. */
export function themeContrastIssues(def: ThemeDefinition): ContrastIssue[];
```
`--foreground-muted` on `--tint` is not checked: it is not a text pairing the site uses for reading text, and the Jūra preset sits at 4.41 there. All three presets pass every check (computed 13 Oct: lowest light tone 5.16, dark tone 7.69; lowest site pair: Jūra light muted on background 5.12). Display rule for ratios: `Math.floor(ratio * 10) / 10`, one decimal (a 4.46 shows "4,4", never a passing-looking "4,5").

**Check (step 1):**
```bash
npx tsx -e "import {THEME_PRESETS} from './lib/constants'; import {themeContrastIssues} from './lib/theme/contrast'; for (const [k,p] of Object.entries(THEME_PRESETS)) console.log(k, themeContrastIssues(p).length); const m=THEME_PRESETS.moss; console.log('fail', themeContrastIssues({...m, light:{...m.light, categories:{sports:'#8fa3e0'}}, dark:{...m.dark, categories:{sports:'#3B55A0'}}}).map(i=>i.mode+':'+i.ratio.toFixed(2)).join(' '))"
```
Expect `moss 0`, `sea 0`, `rye 0`, then `fail light:2.48 dark:2.55`.

## 3. Services and actions

### 3.1 `lib/services/theme.service.ts`
- `saveDraft` and `publish`: after the `themeInputSchema.safeParse` success, `if (themeContrastIssues(parsed.data).length > 0) return { success: false, error: 'CONTRAST_TOO_LOW' };`. `publishDraft` and `reset` go through `publish` (Sūna passes). Reading (`toContext`, `getPublished`, `getDraft`) does **not** check contrast: stored rows always render.
- `types/actions.ts`: add `'CONTRAST_TOO_LOW'` to `ERROR_CODES` (after `'DB_MIGRATION_REQUIRED'`). `ThemeResult` already uses `ErrorCode`.

### 3.2 `actions/theme-actions.ts`
No new actions. All five keep `requireSiteAdmin()` first (Dizains is a site-admin page, `requireAdminPage` in the page; not owner-only). Fix the stale comment on `resetTheme` ("Back to the default preset (Sūna) for everyone."). The actions already return the service's code, so `CONTRAST_TOO_LOW` reaches the toast through `errors.CONTRAST_TOO_LOW`.

## 4. Components

All client components under `components/admin/design/` unless noted; each under 150 lines (grep P1). No `dark:` utilities (Tailwind's `dark:` follows the OS here, not the site's `.dark` class; P6). Colours only from tokens or the draft's own hex through CSS variables.

### 4.1 Page `app/[locale]/admin/design/page.tsx`
- Signature gains `searchParams: Promise<Record<string, string | string[] | undefined>>` (as `app/[locale]/admin/feedback/page.tsx`; `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`, "searchParams").
- Order: `await requireAdminPage(locale, '/admin/design')` first, then `const part = (await searchParams).part`, `initialPart = typeof part === 'string' && (DESIGN_PARTS as readonly string[]).includes(part) ? part as DesignPart : 'colours'`.
- `const [theme, taxonomy] = await Promise.all([getActiveTheme(), TaxonomyService.getTaxonomy(locale)])`; `toneRows = CATEGORY_TONE_SLUGS.map((slug) => ({ slug, title: taxonomy.find((c) => c.slug === slug)?.title ?? null }))` (service-provided localized title; `null` → the tone's name from messages, never the slug).
- Keep the heading block and the `previewActive` notice. `<DesignEditor key={…as today} initial={…} initialPart={initialPart} toneRows={toneRows} />`.

### 4.2 `hooks/use-theme-draft.ts` (new, client)
```ts
export type DraftTheme = Omit<ThemeInput, 'light' | 'dark'> & { light: CompleteModeTokens; dark: CompleteModeTokens };
export function useThemeDraft(initial: ThemeInput): {
    theme: DraftTheme;
    issues: ContrastIssue[];                                  // useMemo(() => themeContrastIssues(theme), [theme])
    choosePreset(key: ThemePresetKey): void;                  // preset values, completed, no categories
    setColor(mode: ThemeMode, token: ThemeEditableToken, hex: string): void;   // presetKey 'custom'
    setTone(mode: ThemeMode, slug: CategoryToneSlug, hex: string): void;       // custom; [mode].categories[slug] = hex
    setFont(which: 'headingFont' | 'bodyFont', id: ThemeFontId): void;          // custom
};
```
Initial state: `{ ...initial, light: completeModeTokens(initial.light), dark: completeModeTokens(initial.dark) }`. `DraftTheme` is assignable to `ThemeInput` (pass it to the actions unchanged).

### 4.3 `DesignEditor.tsx` (rewrite as the shell, ~110 lines)
Props `{ initial: ThemeInput; initialPart: DesignPart; toneRows: ToneRow[] }`. Holds `useThemeDraft`, `part` state, `pending`/`busy`, `run()` (as today), the reset `ConfirmDialog` (as today, `choosePreset(DEFAULT_THEME_KEY)`). Renders `DesignPartTabs`, then the active part, then `DesignActions`. `blockedParts = DESIGN_PARTS.filter((p) => issues.some((i) => i.part === p))`.

### 4.4 `DesignPartTabs.tsx` (new)
Underline sub-tabs as redesign `.rd-tabs` (css.mjs 435–438): `<nav aria-label={t('parts.label')} data-ui={UI.tabs} className="mb-6 flex gap-[18px] overflow-x-auto border-b border-border text-sm text-foreground-muted scrollbar-none">`; each item an `<a href={`?part=${p}`}>` with `aria-current={on ? 'page' : undefined}`, classes `-mb-px whitespace-nowrap border-b-2 border-transparent pb-2 pt-1 hover:text-foreground` + on `border-primary font-semibold text-foreground`; min tap height 44 px on phones (`min-h-11 inline-flex items-end`). `onClick`: `e.preventDefault(); onSelect(p); window.history.replaceState(null, '', `?part=${p}`)` (native History API integrates with the Next router: `node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md`, "Native History API"). Without JS the link reloads the page on that part. Draft state survives part switches (one component tree). A part with a failing check gets a 6 px `bg-warning` dot after its label plus `<span className="sr-only">{t('contrast.partHasIssues')}</span>`.

### 4.5 `ColoursPart.tsx` (new) — Krāsas
1. `h2` `t('parts.colours')` (`text-[21px] font-semibold`, Section style), lead `p` `t('colours.lead')` (`text-sm text-foreground-muted`).
2. Presets: `h3` `t('presetsTitle')` (`text-base font-semibold`), grid `grid gap-3 sm:grid-cols-3` of `ThemePresetCard` (unchanged), hint `t('presetResetsTones')` in `text-[13px] text-foreground-muted`; `t('customActive')` when custom (as today).
3. Two fieldsets (light, dark) side by side from `lg`, each `rounded-2xl bg-surface p-4` (no border: flat cards, AR-08), legend `t('mode.<mode>')`, the 7 `THEME_EDITABLE_TOKENS` as `ColorField` (unchanged component). Under each fieldset, the failing site pairs of that mode: `<ul className="mt-3 space-y-1 text-[13px] text-warning">` items `t('contrast.low', { pair: t('contrast.pair.<pair>'), ratio, min })`.
4. The sample: existing `ThemeSample` with the existing light/dark toggle (moved here from DesignEditor). In `ThemeSample.tsx` switch its two hand-made buttons to `buttonClass('primary', …, 'sm')` / `buttonClass('secondary', …, 'sm')` so the sample shows the real buttons, and the badge to `<Badge>`; keep `tabIndex={-1}` on the buttons.

### 4.6 `CategoryColorsEditor.tsx` (new, card) — Kategoriju krāsas
```ts
export type ToneRow = { slug: CategoryToneSlug; title: string | null };
type Props = { rows: ToneRow[]; theme: DraftTheme; disabled: boolean; onTone: (mode: ThemeMode, slug: CategoryToneSlug, hex: string) => void };
```
`h2` `t('parts.categories')`, lead `t('categories.lead')` (the drawing's sentence), then `<div className="rounded-2xl bg-surface px-4 py-0.5">` with one `CategoryColorRow` per row, in `CATEGORY_TONE_SLUGS` order. Values: `toneHex(theme[mode], slug, mode)`; ratios `toneContrast(theme, slug)`.

### 4.7 `CategoryColorRow.tsx` (new) — matches `.rd-krow` (css.mjs 561–567)
- Row: `grid grid-cols-[28px_minmax(0,1fr)_auto_auto_auto] items-center gap-2.5 border-t border-border py-[7px] text-sm first:border-t-0`, plus `style={{ '--tone-l': light, '--tone-d': dark } as React.CSSProperties}` and classes `[--row-tone:var(--tone-l)] [.dark_&]:[--row-tone:var(--tone-d)]` (a CSS-variable-only style, the pattern `ThemePresetCard` uses for `--sw`; the disc follows the page's mode from the server `.dark` class).
- Cell 1: `<CategoryDisc slug={slug} color="var(--row-tone)" size={28} />` (existing, `components/ui/CategoryIcon.tsx`).
- Cell 2: the name, `text-foreground`, wraps (no truncate; at 375 px it may take two lines, as the phone drawing's grid allows).
- Cells 3–4: `SwatchInput` light ("Gaišā") and dark ("Tumšā").
- Cell 5: `ContrastPill`.

### 4.8 `SwatchInput.tsx` (new) — `.kbox`
`<label className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-xs text-foreground-muted md:min-h-0">` wrapping `<input type="color" value={hex} disabled={disabled} aria-label={t('tones.swatchLabel', { category, tone, mode })} onChange={(e) => onChange(e.target.value)} className="h-[22px] w-[22px] shrink-0 cursor-pointer appearance-none rounded-md border-0 bg-transparent p-0 ring-1 ring-inset ring-border [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0 [&::-moz-color-swatch]:rounded-md [&::-moz-color-swatch]:border-0" />` and the word (`t('tones.swatchLight')` / `t('tones.swatchDark')`). The native picker always reports `#rrggbb`; the schema validates again on the server. The whole label is the 44 px tap target on phones.

### 4.9 `ContrastPill.tsx` (new) — `.aa`
Props `{ light: number; dark: number; lightOk: boolean; darkOk: boolean }`. Ratios formatted with `useFormatter().number(Math.floor(r * 10) / 10, { minimumFractionDigits: 1, maximumFractionDigits: 1 })`.
- Both ok: `<span className="whitespace-nowrap rounded-full bg-tint px-2 py-0.5 text-[11px] font-semibold text-primary">` "AA ✓" (`t('tones.ok')`).
- A failure: same shape with `bg-warning/10 text-warning`, text `t('tones.low', { mode: t('tones.swatchLight'|'swatchDark'), ratio })` for the first failing mode (light before dark).
- Always add `<span className="sr-only">{t('tones.ratios', { light, dark })}</span>` and the same string as `title` (the live ratio the card asks for, without widening the row).

### 4.10 `FontsPart.tsx` (new) — Fonti
`h2` `t('parts.fonts')`, lead `t('fonts.lead')`. Two fieldsets, legends `t('headingFont')` / `t('bodyFont')` (existing keys), each a rows box (`rounded-2xl bg-surface px-4 py-0.5`) of `THEME_FONTS` as radio rows: `<label className="flex min-h-11 cursor-pointer items-center gap-3 border-t border-border py-2.5 first:border-t-0">`, `<input type="radio" name={which} className="h-4 w-4 accent-primary" checked=… onChange=… disabled={disabled} />`, then a `<span style={{ '--f': `var(${f.cssVar})` } as React.CSSProperties}>` holding the font's label (`text-[15px] font-semibold [font-family:var(--f)]`) and `t('sample.latvian')` (`text-[13px] text-foreground-muted [font-family:var(--f)]`). The list is `THEME_FONTS` unchanged (all eight load `latin-ext` in `lib/theme-fonts.ts`, so every option has ā č ē ģ ī ķ ļ ņ š ū ž). Literata and Commissioner stay first-loaded (preloaded); others load when shown.

### 4.11 `DesignActions.tsx` (new)
Props `{ busy: boolean; blockedParts: DesignPart[]; onPreview; onPublish; onReset; onShowPart: (p: DesignPart) => void }`.
- When `blockedParts.length`: `<p role="status" className="text-[13px] text-warning">` `t('contrast.blocked')` followed by one text button per failing part (label `t('parts.<p>')`, `underline underline-offset-4`, `onClick={() => onShowPart(p)}`), separated by ", ".
- `<div className="flex flex-wrap items-center gap-2">`: `<Button variant="secondary" disabled={busy || blocked}>` `t('savePreview')` ("Priekšskatīt man"), `<Button disabled={busy || blocked}>` `t('publish')` ("Publicēt visiem"), `<Button variant="quiet" className="sm:ml-auto" disabled={busy}>` `t('reset')`. Default size md (44 px on phones, 40 from `md`; the drawing's small buttons give way to the touch-target rule, plan §6).
- `t('previewHint')` under it (`text-xs text-foreground-muted`).

### 4.12 Changed elsewhere
- `components/admin/design/ThemePreviewBar.tsx`: buttons → `buttonClass('primary', '', 'sm')` and `buttonClass('quiet', '', 'sm')` (pills, AR-08); labels unchanged keys (values change, section 6).
- `app/[locale]/admin/categories/SlideoverL1View.tsx`: for `isCategoryToneSlug(l1.slug)` (from `@/lib/theme/category`) the "Edit Color" section shows, instead of the picker and Save, `<p className="text-sm text-foreground-muted">{tFields('colorInDesign')} <Link href="/admin/design?part=categories" className="font-semibold text-primary underline underline-offset-4">{tFields('colorInDesignLink')}</Link></p>` (`Link` from `@/i18n/routing`), and the header disc uses `l1.color` (the tone) instead of the stored hex. Other L1s (added by an admin, no designed tone) keep the stored-colour editor: their `Category.color` is still the fallback (R1a decision; the hooks stay unconditional).
- No change: `ColorField.tsx`, `ThemePresetCard.tsx`, `lib/validations/theme.ts`, `lib/theme/server.ts`, `app/layout.tsx`, the group layout.

UI elements page: no change (these components are admin-only, not shared atoms).

## 5. Preview and publish behaviour

- "Priekšskatīt man" → `savePreviewTheme(theme)` → draft row + httpOnly cookie `theme_preview` → `router.refresh()`: the root layout re-renders with the draft, so the admin sees the new site colours and tones on every page (group pages: `--accent` = the draft's `--cat-<slug>`, light and dark), plus `ThemePreviewBar`. `DesignEditor` remounts (its `key` holds the draft id) on the part in the URL (kept by `replaceState`).
- "Publicēt visiem" / the bar's publish → `publishTheme` / `publishPreviewTheme` → `updateTag(THEME_CACHE_TAG)` + `revalidatePath('/', 'layout')` (unchanged): everyone gets it on the next request.
- A failing check disables both save buttons in the editor; the service refuses with `CONTRAST_TOO_LOW` anyway (bar publish of an older failing draft, a crafted call).
- Anyone who is not a signed-in site admin gets the published theme even with the cookie (`getActiveTheme`, unchanged).

## 6. i18n (both files, same keys; `npm run i18n:check`)

Under `admin.design` unless the key says otherwise.

| Key | lv | en |
|---|---|---|
| `subtitle` (changed) | Vietnes krāsas, kategoriju krāsas un burti. Vispirms priekšskati pats, tad publicē visiem. | The site's colours, category colours and fonts. Preview them yourself first, then publish for everyone. |
| `parts.label` | Dizaina daļas | Design parts |
| `parts.colours` | Krāsas | Colours |
| `parts.categories` | Kategoriju krāsas | Category colours |
| `parts.fonts` | Fonti | Fonts |
| `colours.lead` | Vietnes krāsa un tai piederīgais fons, līnijas un klusais teksts, gaišajai un tumšajai tēmai. | The site colour and the background, lines and quiet text that go with it, for the light and the dark theme. |
| `categories.lead` | Katrai kategorijai ir divi toņi: gaišajai un tumšajai tēmai. Pārbaude parādās, tiklīdz izvēlies krāsu. | Each category has two tones, one for the light theme and one for the dark. The check shows as soon as you pick a colour. |
| `fonts.lead` | Burti virsrakstiem un tekstam. Sarakstā ir tikai burti ar visām latviešu zīmēm. | Fonts for headings and text. The list only has fonts with every Latvian letter. |
| `presetResetsTones` | Gatavs noskaņojums atjauno arī noklusētās kategoriju krāsas. | A ready-made theme also brings back the default category colours. |
| `token.muted` | Klusais teksts | Quiet text |
| `token.border` | Līnijas | Lines |
| `token.tint` | Klusais fons | Quiet fill |
| `tones.swatchLight` | Gaišā | Light |
| `tones.swatchDark` | Tumšā | Dark |
| `tones.modeLight` | gaišā tēma | light theme |
| `tones.modeDark` | tumšā tēma | dark theme |
| `tones.swatchLabel` | {category} ({tone}), {mode} | {category} ({tone}), {mode} |
| `tones.ok` | AA ✓ | AA ✓ |
| `tones.low` | {mode} {ratio}:1 | {mode} {ratio}:1 |
| `tones.ratios` | Kontrasts: gaišā {light}:1, tumšā {dark}:1 | Contrast: light {light}:1, dark {dark}:1 |
| `tones.names.{travel,dancing,hobbies,community,politics,pets,art,music,religion,social,games,sports,family,wellbeing,education}` | Paparde, Pīlādzis, Smiltsērkšķis, Egle, Kūdra, Lazda, Virsis, Mellene, Akmens, Brūklene, Plūme, Rudzupuķe, Ezers, Kadiķis, Medus | the same Latvian names (they are names) |
| `contrast.low` | {pair}: {ratio}:1, vajag vismaz {min}:1 | {pair}: {ratio}:1, needs at least {min}:1 |
| `contrast.pair.textOnBackground` | Teksts uz fona | Text on background |
| `contrast.pair.textOnSurface` | Teksts uz virsmas | Text on surface |
| `contrast.pair.textOnTint` | Teksts uz klusā fona | Text on quiet fill |
| `contrast.pair.mutedOnBackground` | Klusais teksts uz fona | Quiet text on background |
| `contrast.pair.mutedOnSurface` | Klusais teksts uz virsmas | Quiet text on surface |
| `contrast.pair.linkOnBackground` | Saite uz fona | Link on background |
| `contrast.pair.linkOnSurface` | Saite uz virsmas | Link on surface |
| `contrast.pair.textOnButton` | Teksts uz pogas | Text on a button |
| `contrast.blocked` | Dažas krāsas neiztur kontrasta pārbaudi, tāpēc vēl nevar saglabāt. Skaties: | Some colours fail the contrast check, so this can't be saved yet. See: |
| `contrast.partHasIssues` | (kontrasts par zemu) | (contrast too low) |
| `savePreview` (changed) | Priekšskatīt man | Preview for me |
| `publish` (changed) | Publicēt visiem | Publish for everyone |
| `bar.publish` (changed) | Publicēt visiem | Publish for everyone |
| `customTitle`, `customHint` | removed (grep P8) | removed |
| `errors.CONTRAST_TOO_LOW` | Dažām krāsām ir par zemu kontrasts, tās būtu grūti salasīt. Pārbaudi Dizainā. | Some colours are too low in contrast to read. Check them in Design. |
| `admin.taxonomy.fields.colorInDesign` | Galvenās kategorijas krāsu gaišajai un tumšajai tēmai maina Dizains. | A main category's colour for the light and dark theme is set in Design. |
| `admin.taxonomy.fields.colorInDesignLink` | Atvērt kategoriju krāsas | Open category colours |

Sentence case (AR-10); "AA" is an accepted abbreviation (R1a G8e allows two letters).

## 7. Handbook (`docs/handbook/design.md`)

In Foundations → Colour, after "Category tones are part of the site theme, per mode.", add: "Site admins change the site colours, the tones and the fonts in Admin → Dizains (Krāsas, Kategoriju krāsas, Fonti): a preview for yourself first, then publish. The editor checks the contrast floor below as you pick and will not save a colour under it." No other chapter changes.

## 8. Builder steps and commits

Small commits, each passing `npm run typecheck`; messages `feat(R1b): …` ending with the co-author line.

1. **Guard.** `lib/color-utils.ts`, `lib/constants/theme.ts`, `lib/theme/css.ts` (export `onPrimary`), `lib/theme/contrast.ts`, `types/actions.ts`, `lib/services/theme.service.ts`, `actions/theme-actions.ts` (comment), `errors.CONTRAST_TOO_LOW` in both message files. Run the checks of 1 and 2.3. Commit "feat(R1b): contrast guard for the site theme, checked in the service".
2. **Editor shell and Krāsas.** `hooks/use-theme-draft.ts`, `DesignEditor.tsx`, `DesignPartTabs.tsx`, `ColoursPart.tsx`, `DesignActions.tsx`, `ThemeSample.tsx`, page `searchParams`; `admin.design` keys for parts, colours, tokens, contrast, buttons; remove `customTitle`/`customHint`. Commit.
3. **Kategoriju krāsas.** `CategoryColorsEditor.tsx`, `CategoryColorRow.tsx`, `SwatchInput.tsx`, `ContrastPill.tsx`, `toneRows` in the page, `tones.*`. Check side by side with both drawings. Commit.
4. **Fonti.** `FontsPart.tsx`, `fonts.lead`. Commit.
5. **Bar and categories.** `ThemePreviewBar.tsx`, `SlideoverL1View.tsx`, `admin.taxonomy.fields.*`. Commit.
6. **Close-out.** Handbook (7); Definition of done (9); in `docs/development/build-plan.md` section 8 set R1b to "built, in review" with the commit range; tick the R1b line in `docs/execution_handoff.md`. Commit. Do not push (the reviewer pushes).

Migration: **none** (`prisma/schema.prisma` unchanged; stored JSON shape unchanged).

## 9. Acceptance

**Definition of done:**
```bash
npm run typecheck
npx eslint $(git diff --name-only --diff-filter=d origin/main...HEAD -- '*.ts' '*.tsx')
npm run i18n:check
npm run plan:check
npm run build   # needs AUTH_SECRET + DATABASE_URL
```

**Grep proofs** (Git Bash, repo root; "0" = no output):
```bash
wc -l components/admin/design/*.tsx hooks/use-theme-draft.ts lib/theme/contrast.ts      # P1: every file < 150
grep -rnE "#[0-9a-fA-F]{6}\b" components/admin/design hooks/use-theme-draft.ts            # P2: 0
grep -c "themeContrastIssues" lib/services/theme.service.ts                               # P3: 2 (saveDraft, publish)
grep -nE "refine|superRefine" lib/validations/theme.ts                                    # P4: 0 (stored rows must keep parsing)
grep -c "requireSiteAdmin()" actions/theme-actions.ts                                      # P5: 5
grep -rn "dark:" components/admin/design                                                   # P6: 0
grep -rnE "prisma\.|@/lib/prisma" components/admin/design hooks "app/[locale]/admin/design" # P7: 0
grep -rnE "customTitle|customHint|Pašreizējais" components actions lib messages            # P8: 0
grep -rnw "uppercase" components/admin/design                                              # P9: 0
git diff --stat origin/main -- prisma/                                                     # P10: empty
```

**Screens** (dev server, seeded DB, signed in as a site admin; lv and en, 375 px and 1280 px, light and dark; no horizontal page scroll):

| Where | Look for |
|---|---|
| `/admin/design` (Krāsas) | three presets, Sūna selected; 7 colours per mode; sample follows edits; no contrast lines |
| `/admin/design?part=categories` | side by side with "Desktop · Vietne → Dizains → Kategoriju krāsas" (1280) and "Phone · Dizains → Kategoriju krāsas" (375): 15 rows, disc in the page mode's tone, real category names, "Gaišā"/"Tumšā" swatches, "AA ✓" on every row; buttons under the rows |
| same, set Sports light to `#8fa3e0` | pill "Gaišā 2,4:1" in warning colour; tab dot; blocked note with a "Kategoriju krāsas" link; both save buttons disabled; set it back → "AA ✓" |
| same, set Sports dark to `#3B55A0` | pill "Tumšā 2,5:1" |
| Krāsas, light text `#9a9a9a` | "Teksts uz fona: 2,5:1, vajag vismaz 4,5:1" under the light fieldset; saving blocked |
| `/admin/design?part=fonts` | 8 fonts per role, each name and the Latvian sample in its own font; choosing one updates the Krāsas sample |
| Part switching | draft edits survive Krāsas → Kategoriju krāsas → Fonti → back; URL `?part=` follows; reload opens that part |
| Preview | Sports light `#2f4a8f` → "Priekšskatīt man" → toast, bar; open a sports group page: banner/dots in `#2f4a8f`; switch to dark: the dark tone; a second browser signed out sees the published tone |
| Publish | from the bar: signed-out browser sees `#2f4a8f` after reload; then "Atiestatīt" → Sūna for everyone |
| `/admin/categories` → Sports | note + link to Kategoriju krāsas instead of the colour picker; an admin-added L1 (create one on dev, then delete) still shows the picker |

**Leak and guard checks:**
- Signed out, open `/lv/admin/design`: redirected to sign-in. Signed in as a plain user: 404 (`requireAdminPage`).
- Copy the admin's `theme_preview` cookie value into a signed-out browser: pages show the published theme, no preview bar.
- Service guard: with the save buttons disabled the UI cannot send a failing theme; P3 proves the service check; the check in 2.3 proves `themeContrastIssues` catches it.

**Blue/green:** no schema or shape change (P4, P10, the compatibility check in 1). The R1a app reading an R1b custom row gets the same colours (it emits the same tokens).

## 10. Risks

- **A failing published custom theme** (saved before the guard): it keeps rendering; the editor opens it with warnings and blocks saving until fixed or reset. Production has none today (R1a reviewer reset to Sūna); the reviewer checks `/admin/design` after deploy.
- **Editing a tone turns the theme custom**: later code changes to the Sūna preset no longer reach it. That is the existing preset/custom rule (R1a); "Atiestatīt" returns to the preset.
- **Choosing a preset drops edited tones** (hint `presetResetsTones`); there is no undo besides not saving.
- **Native colour input** looks different per browser (Firefox opens the OS picker); the 22 px swatch styling uses the `::-webkit-color-swatch` / `::-moz-color-swatch` pseudo-elements; check Chrome and Firefox at 375 px.
- **Phone row width**: at 375 px the name column is ~80 px and wraps to two lines (as the drawing's grid); a failing pill ("Tumšā 2,5:1") is wider than "AA ✓": check no horizontal scroll.
- **`[.dark_&]:` arbitrary variant**: Tailwind v4 compiles it to `.dark .x`; verify the disc changes tone with the site's light/dark switch, not with the OS setting.
- **`mixHex` vs CSS `color-mix`** may differ by one channel step after rounding; only the editor's starting values use it.

## 11. Out of scope

The admin frame (section tabs, left menu with Dizains' parts, phone ☰ drawer: R11); status colours in the theme; editable `surfaceElevated`; new presets; per-category tones for L1s outside the 15 designed slugs (they keep `Category.color` in both modes); undo/unsaved-changes warnings; new fonts; any change to how pages read the theme.
