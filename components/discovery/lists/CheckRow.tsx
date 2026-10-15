'use client';

import { clsx } from 'clsx';

type Props = {
    name: string;
    count: number;
    checked: boolean;
    /** The box: ticks or unticks this one and keeps the list open (several can be picked). */
    onToggle: () => void;
    /** The name (or the count): picks only this one, replacing the choice, and closes the list. */
    onPick: () => void;
    /** Zero-count rows that are not ticked fade (they would give an empty list). */
    faded?: boolean;
};

/**
 * One row of the Kur and Veids lists: a click on the box ticks or unticks it and the list stays open; a click on the name picks
 * only this one and closes the list. The box has its own padded hit area; Space ticks it, Enter on the name picks.
 */
export default function CheckRow({ name, count, checked, onToggle, onPick, faded = false }: Props) {
    return (
        <div className={clsx('flex min-h-11 items-center rounded-xl text-sm hover:bg-tint md:min-h-9', faded && !checked && 'opacity-45')}>
            <label className="grid min-h-11 cursor-pointer place-items-center pl-2.5 pr-2 md:min-h-9">
                <input type="checkbox" checked={checked} onChange={onToggle} aria-label={name} className="size-4 shrink-0 accent-primary" />
            </label>
            <button type="button" onClick={onPick} className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-r-xl pl-0.5 pr-2.5 text-left md:min-h-9">
                <span className="min-w-0 flex-1 truncate">{name}</span>
                <span className="text-xs text-foreground-muted">{count}</span>
            </button>
        </div>
    );
}
