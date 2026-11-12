/** The unread mark on a room tab or switcher row (K-145): a small dot, no number, no sound. */
export default function UnreadDot({ label }: { label: string }) {
    return <span role="img" aria-label={label} className="size-2 shrink-0 rounded-pill bg-primary" />;
}
