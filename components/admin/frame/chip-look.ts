/** Status chip looks of the build plan sidebar: Jauns outlined, Procesā quiet tint, Apstiprināts tint (with a check), Atjaunots filled in the site colour. */
export const CHIP_LOOK = {
    new: 'line text-foreground',
    progress: 'bg-tint text-foreground-muted',
    approved: 'bg-tint text-foreground',
    updated: 'bg-primary text-primary-foreground'
} as const;
