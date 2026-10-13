'use client';

import { useId } from 'react';
import Form from 'next/form';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { clsx } from 'clsx';
import { usePathname } from '@/i18n/routing';
import { UI } from '@/lib/constants';

type Props = { className?: string; autoFocus?: boolean; onSubmit?: () => void };

/** The header's plain search field (AR-41): a GET form to the discovery page with `?q=`. R7 turns it into the search overlay. */
export default function HeaderSearchField({ className, autoFocus, onSubmit }: Props) {
    const t = useTranslations('shell.header');
    const locale = useLocale();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const id = useId();
    // The word stays in the field on the discovery page only; everywhere else the field starts empty.
    const word = pathname === '/' ? (searchParams.get('q') ?? '') : '';

    return (
        <Form
            action={`/${locale}`}
            role="search"
            data-ui={UI.searchBar}
            onSubmit={onSubmit}
            className={clsx(
                'h-[38px] items-center gap-2 rounded-full bg-tint px-3 text-sm focus-within:bg-surface focus-within:outline-2 focus-within:outline-primary',
                className ?? 'flex'
            )}
        >
            <Search aria-hidden className="size-4 shrink-0 text-foreground-muted" />
            <label htmlFor={id} className="sr-only">{t('search')}</label>
            <input
                id={id}
                key={`${pathname}|${word}`}
                type="search"
                name="q"
                defaultValue={word}
                placeholder={t('searchPlaceholder')}
                enterKeyHint="search"
                autoFocus={autoFocus}
                className="min-w-0 flex-1 truncate bg-transparent text-foreground placeholder:text-foreground-muted focus:outline-none"
            />
        </Form>
    );
}
