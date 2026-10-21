'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSyncExternalStore } from 'react';

export default function SampleThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const t = useTranslations('theme');
    const mounted = useSyncExternalStore(
        () => () => { },
        () => true,
        () => false
    );

    if (!mounted) {
        return (
            <div className="h-9 w-9 rounded-lg" aria-hidden="true" />
        );
    }

    const isDark = resolvedTheme === 'dark';

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={isDark ? t('toggleLight') : t('toggleDark')}
            title={isDark ? t('toggleLight') : t('toggleDark')}
        >
            {isDark ? (
                <Sun className="size-4.5" />
            ) : (
                <Moon className="size-4.5" />
            )}
        </button>
    );
}
