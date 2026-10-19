/** The 40 px round chip button of the group banner ("…", tools, pending): a surface chip on the tint. A status (no hover) passes `hover: false`. */
export function groupChip(hover = true): string {
    return hover
        ? 'border border-border bg-surface text-foreground-muted hover:bg-tint'
        : 'border border-border bg-surface text-foreground-muted';
}
