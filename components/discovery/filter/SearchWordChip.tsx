'use client';

import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import FilterButton from './FilterButton';
import { UI } from '@/lib/constants';
import { useDiscoveryNav } from '@/hooks/useDiscoveryNav';

/** The search word as the first part of the filter line: “sp” ×. It filters by text only; no list opens. */
export default function SearchWordChip() {
    const t = useTranslations('discovery');
    const { params, go } = useDiscoveryNav();
    if (!params.q) return null;
    return (
        <FilterButton
            icon={<Search aria-hidden="true" className="size-3 shrink-0" />}
            label={t('searchWord', { word: params.q })}
            ariaLabel={t('searchWordLabel', { word: params.q })}
            chosen
            onClear={() => go({ q: '' })}
            clearLabel={t('clearChoice', { what: params.q })}
            widthClass="max-w-32"
            dataUi={UI.searchWordChip}
        />
    );
}
