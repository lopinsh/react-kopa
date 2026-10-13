/** The 40 px round chip button of the group banner ("…", tools, pending): white on a photo, a surface chip otherwise. */
export function groupChip(onImage: boolean): string {
    return onImage
        ? 'bg-image-chip text-image-chip-foreground'
        : 'border border-border bg-surface text-foreground-muted hover:bg-tint';
}
