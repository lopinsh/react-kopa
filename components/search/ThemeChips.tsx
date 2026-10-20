'use client';

import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { CHIP, CHOSEN } from '@/components/discovery/filter/chip-styles';
import { SEARCH_MIN_CHARS, UI } from '@/lib/constants';
import type { SearchModel } from '@/hooks/useSearch';

/** The themes that match the word as choice chips, once letters are typed (none before; only a chosen theme shows). One at a time (AP-06): the chosen one is tinted with ×, the others step aside until it is cleared. */
export default function ThemeChips({ search }: { search: Pick<SearchModel, 'word' | 'results' | 'theme' | 'tag' | 'toggleTheme' | 'toggleVeids'> }) {
    const t = useTranslations('discovery');
    const { word, results, theme, tag, toggleTheme, toggleVeids } = search;
    // Nothing is suggested before letters are typed; a theme already chosen (carried over from the page) stays, so it can be cleared.
    const typed = word.trim().length >= SEARCH_MIN_CHARS;
    const shown = (results?.themes ?? []).filter((c) => (theme ? c.slug === theme : typed));
    // Veidi the word matches (within the chosen Tēma, if any); a chosen Veids stays alone, so it can be cleared.
    const veidi = (results?.veidi ?? []).filter((v) => (tag ? v.slug === tag : typed));

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
                        className={clsx(CHIP, chosen ? CHOSEN : 'bg-surface weight-medium text-foreground hover:bg-tint')}
                    >
                        <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-[var(--c)]" />
                        <span className="truncate">{c.title}</span>
                        {chosen && <X aria-hidden="true" className="size-3 shrink-0" />}
                    </button>
                );
            })}
            {veidi.map((v) => {
                const chosen = v.slug === tag;
                return (
                    <button
                        key={v.slug}
                        type="button"
                        data-ui={UI.themeChip}
                        aria-pressed={chosen}
                        aria-label={chosen ? t('clearChoice', { what: v.title }) : undefined}
                        onClick={() => toggleVeids(v.slug, v.l1Slug)}
                        style={{ ['--c' as string]: v.color }}
                        className={clsx(CHIP, chosen ? CHOSEN : 'bg-surface weight-medium text-foreground hover:bg-tint')}
                    >
                        <span className="truncate">{v.title}</span>
                        {chosen && <X aria-hidden="true" className="size-3 shrink-0" />}
                    </button>
                );
            })}
        </>
    );
}
