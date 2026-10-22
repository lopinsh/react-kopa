# Execution handoff: archive (20 to 22 Oct 2026)

> Finished work moved out of `docs/execution_handoff.md` on 2026-10-22, kept verbatim for reference. Not required reading; search it when you need the history of a decision. The live list is `docs/execution_handoff.md`. With this move the redesign agenda (R1–R17, `docs/development/build-plan.md`) is closed.

---

## Current state

- Redesign signed off 13 Oct 2026 (tag `redesign-v9.8.2`), built release by release.
- **Live:** R1a–R9c, R6b, C2, C4, R11 (a + b), R13 Templates, quick batches 1–3, accent-insensitive search, space release 2 (spacing scale, measure, fewer boxes; pushed, live), colour release 3 (card photo on top, banner tone area, tab rows at content width; pushed, live), header links Atklāt and Manas grupas from lg, role tags on discovery cards, role colours as theme tokens with tag top-right and member faces bottom-right on the card picture, My groups section headings (pushed, live). New tokens: `--banner-mix`, utilities `banner-tone`, `tile-ink`, `tile-ink-muted`, `mark-surface`.
- **Cancelled:** R10 Citur and "Kur tu esi?" (owner, 19 Oct). Its rule AR-38 stays unbuilt; discovery keeps starting on "Visur".

- [x] **Theme sweep (R14, 21 Oct, pushed, live):** `ui:check` now fails on colour literals, palette colours, `dark:`, bare `rounded`, raw shadows and non-circle `rounded-full`; danger/success/warning (+ink), scrim and photo chip are look tokens; `globals.css` holds no look values (Sūna + calm are the single defaults); all ~110 leaks swept.

## What's next

- [x] **Profile strip below lg only (21 Oct, owner):** PersonHeader `md:block lg:hidden`; from 1024 px the side card is the profile across the own area; AR-60 updated.
- [x] **Short card picture (21 Oct, owner note cmvi602j8):** GroupCard picture 5:2 band, slim category strip without an image (icon, L1 name, role tag), grid minmax 16rem (3 across), no hover growth; AR-34 and design.md updated.
- [x] **Side column returns (R17, 21 Oct, pushed, live):** `FrameColumns` `aside` slot (`AsideSlot`, `w-aside`) with the group picture, members faces, next meeting and links on group pages, and on Manas grupas, Paziņojumi, Iestatījumi the own profile info as others see it (ProfileParts, no "Skatīt profilu" button); Mans profils left ME_PAGES (/profile stays); HeaderLinks icon-only at 768-1023 px; ui:check now bans arbitrary `size-[Npx]`, `ring-[Npx]`, `stroke-[..]`.
- [x] **One service error style (R16b, 21 Oct, pushed, live):** every service method in group, event, message-override, feedback, moderation, team, theme, user, admin returns its value and throws `ActionError` (~190 `{ success }` returns converted; loaders `loadForOrganiser/Participant` throw); actions keep `ActionResponse<T>` and catch with `handleActionError`; `user.service` catches re-throw `ActionError` so `USERNAME_TAKEN`/`EMAIL_TAKEN` still reach the client. `npm run services:check` (in `check`) fails on `success: true|false` in `lib/services`.
- [x] **One button, one motion, one icon style (R16a, 21 Oct, pushed, live):** pill buttons/links onto `Button`/`buttonClass` and the new `IconButton`/`iconButtonClass` (~35 converted, toggles and parts of controls marked `ui-allow`); motion tokens `duration-quick|base|slow` + `ease-standard`, no `transition-all` (37 replaced by named properties), `animate-in` → `motion-safe:animate-*`; lucide sized by `size-N` only (134 h-N w-N pairs, size props), stroke from `--icon-stroke` (style token `iconStroke`). `ui:check` fails on each. See design.md Motion and icons.
- [x] **Rules that check themselves (R15, 21 Oct, pushed, live):** eslint guards Service Law (`@/lib/prisma`, `PrismaClient`), zod-as-value outside `lib/validations`, `no-explicit-any`/`ts-ignore`; CI builds and runs a Playwright smoke test (`npm run test:smoke`) against a seeded Postgres; `components/ui/Input` (Input, Select, Textarea) replaces ~80 hand-rolled controls and `ui:check` fails on raw ones; AGENTS.md Laws 3/7 reworded, `ActionError` named the one service error style, migration naming dropped, 150 lines a hint, "guarded by" per Law. Deferred: buttons onto `Button`, converting Group/Event/Moderation services to `ActionError`.

Nothing planned (cleared 20 Oct for a fresh start; the earlier list, including R14 and R12, is in `docs/archive/execution_handoff_2026-10-20.md`). The owner sets the next work.

