'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { clsx } from 'clsx';

const LOCALES = [
    { code: 'lv', label: 'LV' },
    { code: 'en', label: 'EN' },
] as const;

export default function LanguageSwitcher() {
    const locale = useLocale();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    function switchLocale(nextLocale: 'lv' | 'en') {
        startTransition(() => {
            const currentParams = searchParams.toString();
            const target = currentParams ? `${pathname}?${currentParams}` : pathname;
            router.replace(target, { locale: nextLocale });
        });
    }

    return (
        <div
            className="flex items-center gap-0.5 p-0.5"
            aria-label="Language switcher"
        >
            {LOCALES.map(({ code, label }) => (
                <button
                    key={code}
                    onClick={() => switchLocale(code)}
                    disabled={isPending}
                    className={clsx(
                        'rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors',
                        locale === code
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-foreground-muted hover:text-foreground'
                    )}
                    aria-pressed={locale === code}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}
