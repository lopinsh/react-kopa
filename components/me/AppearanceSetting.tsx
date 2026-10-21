'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';

const CHOICES = ['light', 'dark', 'system'] as const;

/** Izskats: light, dark or the device's setting. Kept on the device by next-themes; no server write (AR-17). */
export default function AppearanceSetting() {
    const t = useTranslations('profile.settings');
    const { theme, setTheme } = useTheme();
    // Nothing is checked in the server HTML; the stored choice shows once mounted, so hydration matches.
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );

    return (
        <fieldset className="grid gap-1.5 border-t border-border pt-6 text-body-sm">
            <legend className="float-left mb-1.5 text-item">{t('appearance')}</legend>
            {CHOICES.map((choice) => (
                <label key={choice} className="clear-both flex min-h-10 cursor-pointer items-center gap-3">
                    <input
                        type="radio"
                        name="appearance"
                        value={choice}
                        checked={mounted && theme === choice}
                        onChange={() => setTheme(choice)}
                        className="size-4 shrink-0 cursor-pointer appearance-none rounded-pill border border-foreground-muted bg-surface checked:border-[5px] checked:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    />
                    {t(choice)}
                </label>
            ))}
        </fieldset>
    );
}
