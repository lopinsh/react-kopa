'use client';

import { clsx } from 'clsx';

export interface SegmentOption<V extends string | number> { value: V; label: string; ariaLabel?: string; className?: string }
type Props<V extends string | number> = { label: string; options: SegmentOption<V>[]; value: V; disabled?: boolean; onChange: (value: V) => void };

/** A small group of toggle buttons (one pressed). Used for the sample's light/dark and the Burti choices. */
export default function SegmentedField<V extends string | number>({ label, options, value, disabled, onChange }: Props<V>) {
    return (
        <div role="group" aria-label={label} className="flex flex-wrap rounded-pill bg-tint p-0.5">
            {options.map((o) => (
                <button /* ui-allow: segmented option */
                    key={o.value}
                    type="button"
                    aria-pressed={value === o.value}
                    aria-label={o.ariaLabel}
                    disabled={disabled}
                    onClick={() => onChange(o.value)}
                    className={clsx('min-h-8 rounded-pill px-3 text-tag disabled:opacity-60', value === o.value ? 'bg-primary text-primary-foreground' : 'text-foreground-muted', o.className)}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}
