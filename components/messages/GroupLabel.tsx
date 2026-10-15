import { clsx } from 'clsx';
import type { InboxRow } from '@/lib/services/message.service';

type CssVars = React.CSSProperties & Record<`--${string}`, string>;

/**
 * A group conversation's category line: the group's category in its colour, its sub-categories smaller and lighter after it.
 * The name is left out where the row's title already is the group. Titles and colour are resolved on the server (Taxonomy Law).
 */
export default function GroupLabel({ group, showName = true, className }: { group: NonNullable<InboxRow['group']>; showName?: boolean; className?: string }) {
    const vars: CssVars = { '--group-color': group.accentColor };
    return (
        <span style={vars} className={clsx('flex items-center gap-1.5 truncate', className)}>
            <span className="h-2 w-2 shrink-0 rounded-full bg-[color:var(--group-color)]" aria-hidden="true" />
            <span className="truncate">
                {showName && <span className="font-bold text-foreground-muted">{group.name} · </span>}
                <span className="font-bold text-[color:color-mix(in_srgb,var(--group-color)_65%,var(--foreground))]">{group.categoryTitle}</span>
                {group.subCategories.length > 0 && <span className="font-normal text-foreground-muted"> {group.subCategories.join(', ')}</span>}
            </span>
        </span>
    );
}
