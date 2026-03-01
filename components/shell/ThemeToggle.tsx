'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const t = useTranslations('theme');
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => setMounted(true), []);

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
                <Sun className="h-4.5 w-4.5" strokeWidth={1.75} />
            ) : (
                <Moon className="h-4.5 w-4.5" strokeWidth={1.75} />
            )}
        </button>
    );
}
