'use client';

import { useId } from 'react';

type Props<V extends string> = {
    label: string;
    value: V | undefined;
    options: { value: V; title: string; description: string }[];
    onChange: (value: V) => void;
};

/**
 * One choice among a few: native radios in labelled rows (Tab enters the group, arrows move the choice).
 * The chosen row gets the site-colour ring and tint, never the category colour.
 */
export default function ChoiceGroup<V extends string>({ label, value, options, onChange }: Props<V>) {
    const id = useId();
    return (
        <div role="radiogroup" aria-labelledby={`${id}-label`} className="space-y-2">
            <p id={`${id}-label`} className="text-sm font-medium text-foreground">{label}</p>
            {options.map((o) => (
                <label
                    key={o.value}
                    className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl p-3 ring-[length:var(--line-width)] ring-inset ring-[color:var(--line-color)] hover:bg-tint has-[:checked]:bg-primary/10 has-[:checked]:ring-2 has-[:checked]:ring-[color:var(--line-active,var(--primary))] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary"
                >
                    <input
                        type="radio"
                        name={id}
                        checked={value === o.value}
                        onChange={() => onChange(o.value)}
                        className="mt-0.5 size-4 shrink-0 accent-primary"
                    />
                    <span className="min-w-0">
                        <span className="block text-[15px] font-medium text-foreground">{o.title}</span>
                        <span className="block text-xs text-foreground-muted">{o.description}</span>
                    </span>
                </label>
            ))}
        </div>
    );
}
