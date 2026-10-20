'use client';

import { clsx } from 'clsx';
import { UI } from '@/lib/constants';

type Props = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    /** id of the element holding the row's text; it is the switch's name. */
    labelledBy: string;
    /** id of a hint under the row. */
    describedBy?: string;
    disabled?: boolean;
    className?: string;
};

/** An on/off switch: a pill track in the site colour, the row's text is its label. */
export default function Switch({ checked, onChange, labelledBy, describedBy, disabled = false, className }: Props) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-labelledby={labelledBy}
            aria-describedby={describedBy}
            disabled={disabled}
            data-ui={UI.switch}
            onClick={() => onChange(!checked)}
            className={clsx(
                'frame relative h-6 w-11 shrink-0 rounded-pill outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-50',
                checked ? 'bg-primary' : 'bg-border',
                className,
            )}
        >
            <span
                aria-hidden
                className={clsx('absolute left-[calc(2px-var(--frame-width))] top-[calc(2px-var(--frame-width))] size-5 rounded-full bg-surface shadow-sm motion-safe:transition-transform', checked && 'translate-x-5')}
            />
        </button>
    );
}
