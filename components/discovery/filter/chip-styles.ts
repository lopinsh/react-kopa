/** One look for every choice chip (the Veids line, the search's theme chips, "Atbilst arī"): 28 px pill, the hit area grows by the `after:` trick. */
export const CHIP = 'relative inline-flex h-7 items-center gap-1 whitespace-nowrap rounded-pill line shadow-control press px-2.5 text-xs after:absolute after:-inset-y-2 after:inset-x-0';
/** A chosen chip: the tone at 15 % as tint with a 45 % edge (`--c` is the tone, set by the chip or its row); the text stays foreground. */
export const CHOSEN = 'bg-[color-mix(in_srgb,var(--c)_15%,var(--surface))] font-semibold text-foreground [--line-color:var(--line-active,color-mix(in_srgb,var(--c)_45%,transparent))]';
/** An open chip (its popover is showing): the site-colour edge, the ink in bold. */
export const OPEN = '[--line-color:var(--line-active,var(--primary))]';
