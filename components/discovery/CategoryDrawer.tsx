'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import CategoryList from './lists/CategoryList';
import CategorySuggest from './CategorySuggest';
import { DISCOVERY_RAIL_COOKIE, UI } from '@/lib/constants';

/** The category drawer (AR-30): a side column from `lg`, sticky flush under the header (the scroll container already starts below it), its head on the filter line's row, foldable to a rail of icons (remembered per device in a cookie). */
export default function CategoryDrawer({ folded: initiallyFolded }: { folded: boolean }) {
    const t = useTranslations('discovery');
    const tSidebar = useTranslations('shell.sidebar');
    const [folded, setFolded] = useState(initiallyFolded);
    const [suggest, setSuggest] = useState<string | null>(null);

    const fold = () => {
        document.cookie = `${DISCOVERY_RAIL_COOKIE}=${folded ? 0 : 1}; path=/; max-age=31536000; samesite=lax`;
        setFolded(!folded);
    };

    return (
        <aside
            data-ui={UI.categoryDrawer}
            aria-label={tSidebar('categoriesNav')}
            className={clsx('sticky top-0 hidden h-[calc(100dvh-var(--spacing-header))] shrink-0 flex-col overflow-y-auto border-r border-border bg-surface lg:flex', folded ? 'w-14' : 'w-[232px]')}
        >
            <div className={clsx('mt-4 flex h-8 shrink-0 items-center px-3', folded ? 'justify-center' : 'justify-end')}>
                <h2 className="sr-only">{t('categories')}</h2>
                <button
                    type="button"
                    onClick={fold}
                    aria-expanded={!folded}
                    aria-label={folded ? tSidebar('expand') : tSidebar('collapse')}
                    className="grid size-7 place-items-center rounded-full ring-1 ring-inset ring-border text-foreground-muted hover:bg-tint hover:text-foreground"
                >
                    {folded ? <ChevronRight aria-hidden="true" className="size-4" /> : <ChevronLeft aria-hidden="true" className="size-4" />}
                </button>
            </div>
            <div className="px-1.5 pb-4"><CategoryList folded={folded} onSuggest={setSuggest} /></div>
            {suggest !== null && <CategorySuggest word={suggest} onClose={() => setSuggest(null)} />}
        </aside>
    );
}
