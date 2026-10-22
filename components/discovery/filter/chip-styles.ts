/** The frame of every filter chip (R20): 28 px pill, `line` edge, control shadow. A wrapper chip (a button plus its ×) uses the frame alone. */
export const CHIP_FRAME = 'relative inline-flex h-7 items-center gap-1 whitespace-nowrap rounded-pill line shadow-control press text-meta';
/** A single-element chip: the frame with 10 px sides; the hit area grows by the `after:` trick (44 on touch). */
export const CHIP = `${CHIP_FRAME} px-3 after:absolute after:-inset-y-2 after:inset-x-0`;
/** A chosen chip: the tone's tint (12 % light, 16 % dark) with a 45 % edge; `--c` is the tone (a Tēma / Veids tone, or `MOSS`). The × follows with 4 px on the right. */
export const CHOSEN = 'tab-tint weight-strong text-foreground pr-1 [--line-color:var(--line-active,color-mix(in_srgb,var(--c)_45%,transparent))]';
/** The tone of every chip that is not a theme: the site's moss. */
export const MOSS = '[--c:var(--primary)]';
/** An open chip (its popover is showing): the site-colour edge. */
export const OPEN = '[--line-color:var(--line-active,var(--primary))]';
