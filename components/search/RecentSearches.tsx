'use client';

import { useId, useState, type RefObject } from 'react';
import { useTranslations } from 'next-intl';
import { History, X } from 'lucide-react';
import { readRecent, removeRecent } from '@/lib/recent-searches';
import { UI } from '@/lib/constants';

type Props = {
    /** A word was picked: it goes into the field and searches at once. */
    onPick: (word: string) => void;
    inputRef: RefObject<HTMLInputElement | null>;
    /** Sample words instead of this device's (the UI elements page). */
    sample?: string[];
};

/** Your last search words on this device (D16), newest first, each with a × to remove it. Without any: one quiet hint. Read on mount: the panel never renders on the server. */
export default function RecentSearches({ onPick, inputRef, sample }: Props) {
    const t = useTranslations('discovery.search');
    const [words, setWords] = useState(() => sample ?? readRecent());
    const titleId = useId();

    if (words.length === 0) return <p className="px-0.5 py-4 text-body-sm text-foreground-muted">{t('hint')}</p>;

    const remove = (word: string, index: number, list: HTMLElement) => {
        if (!sample) removeRecent(word);
        setWords(words.filter((w) => w !== word));
        // Focus goes to the next row (it moves up into this place), else the one before, else the field.
        const rows = Array.from(list.querySelectorAll<HTMLElement>('[data-search-item]'));
        (rows[index + 1] ?? rows[index - 1] ?? inputRef.current)?.focus();
    };

    return (
        <section data-ui={UI.recentSearches} aria-labelledby={titleId}>
            <h3 id={titleId} className="px-0.5 pb-1 pt-3 text-item text-foreground">{t('recent')}</h3>
            <ul>
                {words.map((word, index) => (
                    <li key={word} className="flex items-center gap-1 rounded-lg hover:bg-tint">
                        <History aria-hidden="true" className="ml-2 size-4 shrink-0 text-foreground-muted" />
                        <button type="button" data-search-item onClick={() => onPick(word)} className="min-h-11 min-w-0 flex-1 truncate rounded-lg px-1.5 text-left text-body-sm text-foreground md:min-h-9">{word}</button>
                        <button type="button" aria-label={t('removeRecent', { word })} onClick={(e) => remove(word, index, e.currentTarget.closest('ul') ?? e.currentTarget)}
                            className="relative mr-1 grid size-7 shrink-0 place-items-center rounded-pill text-foreground-muted hover:bg-border hover:text-foreground after:absolute after:-inset-2">
                            <X aria-hidden="true" className="size-4" />
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    );
}
