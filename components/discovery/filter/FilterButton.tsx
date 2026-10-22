'use client';

import type { ReactNode } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { clsx } from 'clsx';
import { UI, type UiName } from '@/lib/constants';
import { IconButton } from '@/components/ui/Button';
import { CHIP_FRAME, MOSS, OPEN } from './chip-styles';

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
    /** Max width of the chip (it shrinks below that, cutting its label). */
    widthClass: string;
    /** The `data-ui` name (the filter button by default). */
    dataUi?: UiName;
    /** A Tēma's colour for the chosen tint; without it the chip is moss. */
    tone?: string;
};

/** The shared look of the filter row's chips (R20): a 28 px pill; chosen = the tone's tint and a small ×; open = the site-colour edge. */
export default function FilterButton({ icon, label, ariaLabel, chosen, open = false, onToggle, controls, onClear, clearLabel, widthClass, dataUi = UI.filterButton, tone }: Props) {
    const body = (
        <>
            {icon}
            <span className="min-w-0 truncate">{label}</span>
            {!chosen && onToggle && <ChevronDown aria-hidden="true" className="size-3 shrink-0 text-foreground-muted" />}
        </>
    );
    const bodyClass = clsx('relative flex h-full min-w-0 items-center gap-1 rounded-pill', chosen ? 'pl-3 pr-1' : 'px-3');

    return (
        <div
            data-ui={dataUi}
            style={tone ? { ['--c' as string]: tone } : undefined}
            className={clsx(
                CHIP_FRAME, 'min-w-0 shrink-0 text-foreground',
                widthClass,
                !tone && MOSS,
                chosen ? 'tab-tint weight-strong [--line-color:var(--line-active,color-mix(in_srgb,var(--c)_45%,transparent))]' : 'bg-surface weight-medium hover:bg-tint',
                open && OPEN
            )}
        >
            {onToggle ? (
                <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={controls} aria-haspopup="true" aria-label={ariaLabel} className={clsx(bodyClass, 'after:absolute after:-inset-y-2 after:inset-x-0')}>
                    {body}
                </button>
            ) : (
                <span className={bodyClass} aria-label={ariaLabel} role="group">{body}</span>
            )}
            {chosen && (
                <IconButton size="xs" onClick={onClear} aria-label={clearLabel} className="mr-1">
                    <X aria-hidden="true" className="size-3" />
                </IconButton>
            )}
        </div>
    );
}
