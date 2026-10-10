'use client';

import { useId, useState } from 'react';
import { hexColorSchema } from '@/lib/validations/theme';

type Props = { label: string; value: string; disabled?: boolean; onChange: (hex: string) => void };

/** A colour picker plus a hex field; the hex field accepts typing and only reports valid 6-digit values. */
export default function ColorField({ label, value, disabled, onChange }: Props) {
    const id = useId();
    const [draft, setDraft] = useState<string | null>(null);
    const text = draft ?? value;
    const invalid = draft !== null && !hexColorSchema.safeParse(draft).success;

    return (
        <div className="flex items-center gap-3">
            <input
                type="color"
                aria-label={label}
                value={value}
                disabled={disabled}
                onChange={(e) => { setDraft(null); onChange(e.target.value); }}
                className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-border bg-surface p-1"
            />
            <label htmlFor={id} className="min-w-0 flex-1 text-sm font-semibold text-foreground">
                {label}
                <input
                    id={id}
                    type="text"
                    value={text}
                    maxLength={7}
                    disabled={disabled}
                    aria-invalid={invalid}
                    onChange={(e) => {
                        const next = e.target.value.trim();
                        setDraft(next);
                        if (hexColorSchema.safeParse(next).success) onChange(next.toLowerCase());
                    }}
                    onBlur={() => setDraft(null)}
                    className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-1.5 font-mono text-sm text-foreground aria-[invalid=true]:border-red-500"
                />
            </label>
        </div>
    );
}
