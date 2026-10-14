'use client';

import { clsx } from 'clsx';

type Props = {
    name: string;
    count: number;
    checked: boolean;
    onToggle: () => void;
    /** Zero-count rows that are not ticked fade (they would give an empty list). */
    faded?: boolean;
};

/**
 * One tick-box row of the Kur and Veids lists: a click anywhere on the row (name, count, box) ticks or unticks it at once.
 * The mouse-down is not allowed to move focus: a click on plain text makes the browser focus the page's <main>, and the
 * drop-down closes when focus leaves it, so the click would end up on nothing.
 */
export default function CheckRow({ name, count, checked, onToggle, faded = false }: Props) {
    return (
        <label
            onMouseDown={(e) => e.preventDefault()}
            className={clsx('flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl px-2.5 text-sm hover:bg-tint md:min-h-9', faded && !checked && 'opacity-45')}
        >
            <input type="checkbox" checked={checked} onChange={onToggle} className="size-4 shrink-0 accent-primary" />
            <span className="min-w-0 flex-1 truncate">{name}</span>
            <span className="text-xs text-foreground-muted">{count}</span>
        </label>
    );
}
