import { clsx } from 'clsx';

/** Count pill of the admin frame (sections bar, pages list, drawer); red for reports. */
export default function AdminBadge({ count, danger }: { count: number; danger?: boolean }) {
    if (count <= 0) return null;
    return (
        <span className={clsx('ml-auto rounded-pill px-2 text-tag', danger ? 'bg-danger/10 text-danger' : 'bg-tint text-foreground-muted')}>
            {count > 99 ? '99+' : count}
        </span>
    );
}
