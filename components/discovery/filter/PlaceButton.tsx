'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import FilterButton from './FilterButton';
import FilterPopover, { usePopover } from '@/components/discovery/lists/FilterPopover';
import PlaceList from '@/components/discovery/lists/PlaceList';
import { useCities } from '@/components/providers/CitiesContext';
import { useDiscoveryNav } from '@/hooks/useDiscoveryNav';

/** "Kur": the place list. Desktop ticks apply at once (replace); the phone sheet applies its ticks together when it closes (push). */
export default function PlaceButton() {
    const t = useTranslations('discovery');
    const cities = useCities();
    const { params, go } = useDiscoveryNav();
    const { bindHost, ...pop } = usePopover();
    const [draft, setDraft] = useState<string[]>([]);

    const names = params.cities.map((slug) => cities.find((c) => c.slug === slug)?.name ?? slug);
    const more = names.length - 1;
    const close = () => {
        if (!pop.desktop && draft.join() !== params.cities.join()) go({ cities: draft });
        pop.setOpen(false);
    };

    return (
        <div ref={bindHost} className="relative min-w-0 shrink">
            <FilterButton
                icon={<MapPin aria-hidden="true" className="size-3.5 shrink-0" />}
                label={names.length === 0 ? t('where') : <>{names[0]}{more > 0 && <em className="ml-1 shrink-0 text-xs font-bold not-italic">+{more}</em>}</>}
                ariaLabel={names.length === 0 ? t('where') : t('placeLabel', { places: names.join(', ') })}
                chosen={names.length > 0}
                open={pop.open}
                onToggle={() => { setDraft(params.cities); pop.toggle(); }}
                controls={pop.id}
                onClear={() => go({ cities: [] })}
                clearLabel={t('clearChoice', { what: names.join(', ') })}
                widthClass="max-w-[9.5rem]"
            />
            <FilterPopover pop={pop} title={t('where')} onClose={close}>
                <PlaceList
                    selected={pop.desktop ? params.cities : draft}
                    onChange={(next) => (pop.desktop ? go({ cities: next }, { replace: true }) : setDraft(next))}
                    autoFocus={pop.desktop}
                />
            </FilterPopover>
        </div>
    );
}
