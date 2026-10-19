'use client';

import { clsx } from 'clsx';

type Props<V extends string> = {
    label: string;
    value: V | undefined;
    options: { value: V; title: string; description: string }[];
    onChange: (value: V) => void;
};

/** One choice among a few, as buttons with a title and a line of explanation. */
export default function ChoiceGroup<V extends string>({ label, value, options, onChange }: Props<V>) {
    return (
        <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">{label}</p>
            {options.map((o) => {
                const isSelected = value === o.value;
                return (
                    <button
                        key={o.value}
                        type="button"
                        onClick={() => onChange(o.value)}
                        aria-pressed={isSelected}
                        className={clsx(
                            'flex w-full flex-col rounded-xl border-2 p-4 text-left transition-all',
                            isSelected ? 'border-primary bg-primary/10 shadow-sm' : 'border-border hover:border-foreground-muted/40'
                        )}
                    >
                        <span className="font-semibold">{o.title}</span>
                        <span className="text-xs text-foreground-muted">{o.description}</span>
                    </button>
                );
            })}
        </div>
    );
}
