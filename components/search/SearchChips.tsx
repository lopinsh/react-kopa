'use client';

import { useTranslations } from 'next-intl';
import SearchPlaceButton from './SearchPlaceButton';
import ThemeChips from './ThemeChips';
import { UI } from '@/lib/constants';
import type { SearchModel } from '@/hooks/useSearch';

/** The top of the search (AR-41, AR-42): Kur first, then the themes as choice chips. The row wraps onto a second line when they do not fit. */
export default function SearchChips({ search }: { search: SearchModel }) {
    const t = useTranslations('discovery.search');
    return (
        <div data-ui={UI.searchChips} role="group" aria-label={t('chipsLabel')} className="flex flex-wrap items-center gap-1.5 pb-0.5 pt-3">
            <SearchPlaceButton search={search} />
            <ThemeChips search={search} />
        </div>
    );
}
