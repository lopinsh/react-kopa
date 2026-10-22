'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import CategoryList from './lists/CategoryList';
import CategorySuggest from './CategorySuggest';
import { DISCOVERY_RAIL_COOKIE, UI } from '@/lib/constants';

/** The category drawer (AR-30): a side column from `lg`, sticky flush under the header (the scroll container already starts below it), its head on the filter line's row, foldable to a rail of icons (remembered per device in a cookie). */
export default function CategoryDrawer({ folded: initiallyFolded }: { folded: boolean }) {
    const tIndex = useTranslations('discovery.topicIndex');
    const headingId = useId();
    const [folded, setFolded] = useState(initiallyFolded);
    const [suggest, setSuggest] = useState<string | null>(null);

    const fold = () => {
        document.cookie = `${DISCOVERY_RAIL_COOKIE}=${folded ? 0 : 1}; path=/; max-age=31536000; samesite=lax`;
        setFolded(!folded);
    };

    return (
        <aside
            data-ui={UI.categoryDrawer}
            aria-labelledby={headingId}
            data-board-col={folded ? 'folded' : 'open'}
            className={clsx(
                'sticky top-0 hidden h-[calc(100dvh-var(--spacing-header))] shrink-0 flex-col overflow-y-auto overflow-x-hidden border-r-[length:var(--line-width)] border-[color:var(--line-color)] bg-surface motion-safe:transition-[width] motion-safe:duration-slow lg:flex',
                folded ? 'w-14 px-2' : 'w-board-col pl-board-pad pr-[var(--list-pad)] pb-4',
            )}
        >
            <div className={clsx('mt-4 flex h-10 shrink-0 items-baseline gap-2', folded ? 'justify-center' : 'justify-between pl-2')}>
                <span aria-hidden="true" className="w-0 overflow-hidden text-title">&#8203;</span>
                <h2 id={headingId} className={clsx('text-section', folded && 'sr-only')}>{tIndex('heading')}</h2>
                <button /* ui-allow: fold control inside the sidebar edge, ring like the filter chips */
                    type="button"
                    onClick={fold}
                    aria-expanded={!folded}
                    aria-label={folded ? tIndex('unfold') : tIndex('fold')}
                    className="grid size-7 shrink-0 self-center place-items-center rounded-pill ring-[length:var(--line-width)] ring-inset ring-[color:var(--line-color)] text-foreground-muted transition-colors duration-quick hover:bg-tint hover:text-foreground"
                >
                    {folded ? <ChevronRight aria-hidden="true" className="size-4" /> : <ChevronLeft aria-hidden="true" className="size-4" />}
                </button>
            </div>
            <CategoryList place="drawer" folded={folded} onSuggest={setSuggest} />
            {suggest !== null && <CategorySuggest word={suggest} onClose={() => setSuggest(null)} />}
        </aside>
    );
}
