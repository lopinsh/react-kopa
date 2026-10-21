'use client';

import { useId, type FocusEvent, type KeyboardEvent, type RefObject } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import { clsx } from 'clsx';
import { SEARCH_WORD_MAX, UI } from '@/lib/constants';

type Props = {
    value: string;
    onChange: (value: string) => void;
    /** Enter with JavaScript: "Rādīt visus rezultātus" (without it the form goes to discovery with `?q=`). */
    onEnter: () => void;
    inputRef: RefObject<HTMLInputElement | null>;
    open: boolean;
    /** id of the panel the field controls. */
    controls?: string;
    onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
    onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
    onMouseDown?: () => void;
    /** The phone bar: 36 px, focused at once. */
    compact?: boolean;
    autoFocus?: boolean;
    className?: string;
};

/** The field of the header and of the phone bar (AR-41): a quiet tint pill while idle, a surface with a site-colour outline while open. */
export default function SearchInput({ value, onChange, onEnter, inputRef, open, controls, onKeyDown, onFocus, onMouseDown, compact = false, autoFocus = false, className }: Props) {
    const t = useTranslations('shell.header');
    const tSearch = useTranslations('discovery.search');
    const locale = useLocale();
    const id = useId();
    const pill = clsx('flex items-center gap-2 rounded-pill px-3 text-body-sm focus-within:bg-surface focus-within:outline-2 focus-within:outline-primary', compact ? 'h-9' : 'h-[38px]', open ? 'bg-surface outline-2 outline-primary' : 'bg-tint', className);

    return (
        <form action={`/${locale}`} role="search" data-ui={UI.searchBar} onSubmit={(e) => { e.preventDefault(); onEnter(); }} className={pill}>
            <Search aria-hidden className="size-4 shrink-0 text-foreground-muted" />
            <label htmlFor={id} className="sr-only">{t('search')}</label>
            <input /* ui-allow: sits inside the wrapper that carries the edge and ring */
                ref={inputRef} id={id} type="search" name="q" value={value} maxLength={SEARCH_WORD_MAX} placeholder={t('searchPlaceholder')}
                onChange={(e) => onChange(e.target.value)} onKeyDown={onKeyDown} onFocus={onFocus} onMouseDown={onMouseDown}
                enterKeyHint="search" autoComplete="off" autoFocus={autoFocus} data-autofocus={autoFocus ? true : undefined}
                role="combobox" aria-expanded={open} aria-controls={controls} aria-autocomplete="list" aria-haspopup="dialog"
                className="min-w-0 flex-1 truncate bg-transparent text-foreground placeholder:text-foreground-muted focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {value && (
                <button
                    type="button"
                    aria-label={tSearch('clear')}
                    onClick={() => { onChange(''); inputRef.current?.focus(); }}
                    className="relative -mr-1 grid size-6 shrink-0 place-items-center rounded-pill text-foreground-muted hover:bg-border hover:text-foreground after:absolute after:-inset-3"
                >
                    <X aria-hidden="true" className="size-4" />
                </button>
            )}
        </form>
    );
}
