/** One look for every choice chip (the Veids line, the search's theme chips, "Atbilst arī"): 28 px pill, the hit area grows by the `after:` trick. */
export const CHIP = 'relative inline-flex h-7 items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-xs ring-1 ring-inset after:absolute after:-inset-y-2 after:inset-x-0';
/** A chosen chip: the tone at 15 % as tint with a 45 % ring (`--c` is the tone, set by the chip or its row); the text stays foreground. */
export const CHOSEN = 'bg-[color-mix(in_srgb,var(--c)_15%,var(--surface))] font-semibold text-foreground ring-[color-mix(in_srgb,var(--c)_45%,transparent)]';
