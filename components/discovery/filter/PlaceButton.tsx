'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import FilterButton from './FilterButton';
import FilterPopover, { usePopover } from '@/components/discovery/lists/FilterPopover';
import PlaceList from '@/components/discovery/lists/PlaceList';
import { useCities } from '@/components/providers/CitiesContext';
import { useDiscovery } from '@/components/providers/DiscoveryProvider';
import { useDiscoveryNav } from '@/hooks/useDiscoveryNav';

/**
 * "Kur": the place list. Desktop ticks apply at once (replace); the phone sheet applies its ticks together when it closes (push).
 * The ticks live in `draft` while the list is open, so a second quick tick never builds on a URL that has not caught up.
 */
export default function PlaceButton() {
    const t = useTranslations('discovery');
    const cities = useCities();
    const { params, go } = useDiscoveryNav();
    const { counts } = useDiscovery();
    const { bindHost, ...pop } = usePopover();
    const [draft, setDraft] = useState<string[]>([]);
    // The phone sheet's name click: applied by `close` once Back has taken the sheet's history entry off (AR-67).
    const picked = useRef<string[] | null>(null);

    const names = params.cities.map((slug) => cities.find((c) => c.slug === slug)?.name ?? slug);
    const more = names.length - 1;
    const close = () => {
        const next = picked.current ?? draft;
        picked.current = null;
        if (!pop.desktop && next.join() !== params.cities.join()) go({ cities: next });
        pop.setOpen(false);
    };

    // A name click: only that city, and the list closes. The phone sheet closes as by Back first (a push before that would
    // be undone when the sheet takes its history entry off), then `close` pushes the pick.
    const pick = (slug: string) => {
        setDraft([slug]);
        if (!pop.desktop) {
            picked.current = [slug];
            window.history.back();
            return;
        }
        go({ cities: [slug] }, { replace: true });
        pop.setOpen(false);
        pop.host?.querySelector('button')?.focus();
    };

    return (
        <div ref={bindHost} className="relative min-w-0 shrink">
            <FilterButton
                icon={<MapPin aria-hidden="true" className="size-3.5 shrink-0" />}
                label={names.length === 0 ? t('where') : <>{names[0]}{more > 0 && <em className="ml-1 shrink-0 text-tag not-italic">+{more}</em>}</>}
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
                    cities={cities}
                    counts={counts}
                    selected={draft}
                    onChange={(next) => { setDraft(next); if (pop.desktop) go({ cities: next }, { replace: true }); }}
                    onPick={pick}
                    autoFocus={pop.desktop}
                />
            </FilterPopover>
        </div>
    );
}
