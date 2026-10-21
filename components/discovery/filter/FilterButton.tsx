'use client';

import type { ReactNode } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { clsx } from 'clsx';
import { UI, type UiName } from '@/lib/constants';

type Props = {
    icon: ReactNode;
    /** What the button shows; cut with "…" when it does not fit. */
    label: ReactNode;
    /** The full choice for screen readers ("Vieta: Jelgava, Ozolnieki"), so a cut name is still read in full. */
    ariaLabel: string;
    chosen: boolean;
    open?: boolean;
    /** Opens the list. Without it the part is a plain chip (the search word). */
    onToggle?: () => void;
    controls?: string;
    onClear: () => void;
    clearLabel: string;
    /** Max width of the pill (it shrinks below that, cutting its label). */
    widthClass: string;
    /** The `data-ui` name (the filter button by default). */
    dataUi?: UiName;
};

/** The shared look of the filter line's buttons: a 32 px pill; chosen = dark ring and a small ×; open = site-colour ring and tint. */
export default function FilterButton({ icon, label, ariaLabel, chosen, open = false, onToggle, controls, onClear, clearLabel, widthClass, dataUi = UI.filterButton }: Props) {
    const body = (
        <>
            {icon}
            <span className="min-w-0 truncate">{label}</span>
            {!chosen && onToggle && <ChevronDown aria-hidden="true" className="size-3.5 shrink-0 text-foreground-muted" />}
        </>
    );
    const bodyClass = clsx('relative flex h-full min-w-0 items-center gap-1.5 rounded-pill text-meta text-foreground', chosen ? 'pl-3' : 'px-3');

    return (
        <div
            data-ui={dataUi}
            className={clsx(
                'flex h-8 min-w-0 shrink items-center rounded-pill ring-inset',
                widthClass,
                open ? 'bg-tint ring-[length:var(--line-width)] ring-[color:var(--line-active,var(--primary))]' : chosen ? 'bg-surface ring-[length:max(1.5px,var(--line-width))] ring-[color:var(--line-active,var(--foreground))]' : 'bg-surface ring-[length:var(--line-width)] ring-[color:var(--line-color)]'
            )}
        >
            {onToggle ? (
                <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={controls} aria-haspopup="true" aria-label={ariaLabel} className={clsx(bodyClass, 'after:absolute after:-inset-y-1.5 after:inset-x-0')}>
                    {body}
                </button>
            ) : (
                <span className={bodyClass} aria-label={ariaLabel} role="group">{body}</span>
            )}
            {chosen && (
                <button /* ui-allow: clear mark inside a chip */ type="button" onClick={onClear} aria-label={clearLabel} className="relative mr-1 grid size-5 shrink-0 place-items-center rounded-pill text-foreground-muted hover:bg-tint hover:text-foreground after:absolute after:-inset-y-3 after:-inset-x-1">
                    <X aria-hidden="true" className="size-3.5" />
                </button>
            )}
        </div>
    );
}
