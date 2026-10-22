'use client';

import { useId, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import { clsx } from 'clsx';

type Props = {
    value: string;
    onChange: (value: string) => void;
    label: string;
    autoFocus?: boolean;
    /** `line`: the thin line under it (Kur, Veids). `quiet`: the drawer column's borderless field. `field`: the Tēma drop-down's edged field. */
    variant?: 'line' | 'quiet' | 'field';
};

const BOX: Record<NonNullable<Props['variant']>, string> = {
    line: 'flex items-center gap-2 border-b border-border px-3 pb-2 pt-1.5',
    quiet: 'flex h-8 w-full items-center gap-2 rounded-item px-2 text-foreground-muted shadow-[inset_0_0_0_var(--search-edge)_var(--border)] transition-colors duration-quick hover:bg-tint/60 focus-within:bg-surface focus-within:ring-2 focus-within:ring-primary',
    field: 'mb-1 flex h-10 items-center gap-2 rounded-item px-2 line focus-within:ring-2 focus-within:ring-primary',
};

/** The search row on top of every filter list: icon, field; `line` keeps a thin line under it, `quiet` and `field` (R19) add a clear button. */
export default function ListSearch({ value, onChange, label, autoFocus = false, variant = 'line' }: Props) {
    const id = useId();
    const t = useTranslations('discovery.topicIndex');
    const input = useRef<HTMLInputElement>(null);
    return (
        <div className={BOX[variant]}>
            <Search aria-hidden="true" className={clsx('shrink-0 text-foreground-muted', variant === 'quiet' ? 'size-3.5' : 'size-4')} />
            <label htmlFor={id} className="sr-only">{label}</label>
            <input /* ui-allow: sits inside the wrapper that carries the edge and ring */
                ref={input}
                id={id}
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={label}
                autoFocus={autoFocus}
                autoComplete="off"
                className={clsx('min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-foreground-muted', variant === 'quiet' ? 'text-body-sm' : 'text-body md:text-body-sm')}
            />
            {variant !== 'line' && value && (
                <button /* ui-allow: clear inside the search field */
                    type="button"
                    aria-label={t('clear')}
                    onClick={() => { onChange(''); input.current?.focus(); }}
                    className="grid size-5 shrink-0 place-items-center rounded-pill text-foreground-muted hover:bg-tint hover:text-foreground"
                >
                    <X aria-hidden="true" className="size-3" />
                </button>
            )}
        </div>
    );
}
