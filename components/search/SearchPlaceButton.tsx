'use client';

import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import FilterButton from '@/components/discovery/filter/FilterButton';
import FilterPopover, { usePopover } from '@/components/discovery/lists/FilterPopover';
import PlaceList from '@/components/discovery/lists/PlaceList';
import type { SearchModel } from '@/hooks/useSearch';

/**
 * "Kur" in the search (AR-32): the same place list as discovery's. The search is not a URL, so ticks and "Visur" apply to it at once
 * (drop-down and phone sheet alike); a name click picks only that city and closes the list. Removing a theme or the word never touches it.
 */
export default function SearchPlaceButton({ search }: { search: Pick<SearchModel, 'results' | 'cities' | 'setCities'> }) {
    const t = useTranslations('discovery');
    const { results, cities, setCities } = search;
    const { bindHost, ...pop } = usePopover();
    const list = results?.places.cities ?? [];
    const names = cities.map((slug) => list.find((c) => c.slug === slug)?.name ?? slug);
    const more = names.length - 1;
    const close = () => pop.setOpen(false);

    return (
        <div ref={bindHost} className="relative min-w-0 shrink">
            <FilterButton
                icon={<MapPin aria-hidden="true" className="size-3.5 shrink-0" />}
                label={names.length === 0 ? t('where') : <>{names[0]}{more > 0 && <em className="ml-1 shrink-0 text-xs font-bold not-italic">+{more}</em>}</>}
                ariaLabel={names.length === 0 ? t('where') : t('placeLabel', { places: names.join(', ') })}
                chosen={names.length > 0}
                open={pop.open}
                onToggle={pop.toggle}
                controls={pop.id}
                onClear={() => setCities([])}
                clearLabel={t('clearChoice', { what: names.join(', ') })}
                widthClass="max-w-[9.5rem]"
            />
            <FilterPopover pop={pop} title={t('where')} onClose={close}>
                <PlaceList
                    cities={list}
                    counts={results?.places ?? { byCity: {}, anyPlace: 0 }}
                    selected={cities}
                    onChange={setCities}
                    onPick={(slug) => { setCities([slug]); close(); pop.host?.querySelector('button')?.focus(); }}
                    autoFocus={pop.desktop}
                />
            </FilterPopover>
        </div>
    );
}
