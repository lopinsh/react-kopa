/** The 40 px round chip button of the group banner ("…", tools, pending): white on a photo, a surface chip otherwise. A status (no hover) passes `hover: false`. */
export function groupChip(onImage: boolean, hover = true): string {
    return onImage
        ? 'bg-image-chip text-image-chip-foreground'
        : hover
            ? 'border border-border bg-surface text-foreground-muted hover:bg-tint'
            : 'border border-border bg-surface text-foreground-muted';
}
