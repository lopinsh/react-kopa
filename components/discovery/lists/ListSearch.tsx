'use client';

import { useId } from 'react';
import { Search } from 'lucide-react';

type Props = {
    value: string;
    onChange: (value: string) => void;
    label: string;
    autoFocus?: boolean;
};

/** The search row on top of every filter list: icon, field, a thin line under it. */
export default function ListSearch({ value, onChange, label, autoFocus = false }: Props) {
    const id = useId();
    return (
        <div className="flex items-center gap-2 border-b border-border px-2.5 pb-2 pt-1.5">
            <Search aria-hidden="true" className="size-[15px] shrink-0 text-foreground-muted" />
            <label htmlFor={id} className="sr-only">{label}</label>
            <input
                id={id}
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={label}
                autoFocus={autoFocus}
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-muted"
            />
        </div>
    );
}
