'use client';

import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { CHIP, CHOSEN } from '@/components/discovery/filter/chip-styles';
import { UI } from '@/lib/constants';
import type { SearchModel } from '@/hooks/useSearch';

/** The themes that match the word (the busiest with an empty field) as choice chips. One at a time (AP-06): the chosen one is tinted with ×, the others step aside until it is cleared. */
export default function ThemeChips({ search }: { search: Pick<SearchModel, 'results' | 'theme' | 'toggleTheme'> }) {
    const t = useTranslations('discovery');
    const { results, theme, toggleTheme } = search;
    const shown = (results?.themes ?? []).filter((c) => !theme || c.slug === theme);

    return (
        <>
            {shown.map((c) => {
                const chosen = c.slug === theme;
                return (
                    <button
                        key={c.slug}
                        type="button"
                        data-ui={UI.themeChip}
                        aria-pressed={chosen}
                        aria-label={chosen ? t('clearChoice', { what: c.title }) : undefined}
                        onClick={() => toggleTheme(c.slug)}
                        style={{ ['--c' as string]: c.color }}
                        className={clsx(CHIP, chosen ? CHOSEN : 'bg-surface font-medium text-foreground ring-border hover:bg-tint')}
                    >
                        <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-[var(--c)]" />
                        <span className="truncate">{c.title}</span>
                        {chosen && <X aria-hidden="true" className="size-3 shrink-0" />}
                    </button>
                );
            })}
        </>
    );
}
