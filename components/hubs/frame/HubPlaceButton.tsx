'use client';

import { useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/routing';
import { parseCities } from '@/lib/discovery-params';
import { useHubContext } from '@/components/providers/HubProvider';
import FilterButton from '@/components/discovery/filter/FilterButton';
import FilterPopover, { usePopover } from '@/components/discovery/lists/FilterPopover';
import PlaceList from '@/components/discovery/lists/PlaceList';

/**
 * "Kur" on a hub (K1-07, K-98): one place filter for the whole hub, kept in `?city=` on the current page. Same behaviour as the board's:
 * desktop ticks apply at once (replace); the phone sheet applies its ticks together when it closes.
 */
export default function HubPlaceButton() {
    const t = useTranslations('discovery');
    const { cities, cityCounts } = useHubContext();
    const router = useRouter();
    const pathname = usePathname();
    const search = useSearchParams();
    const { bindHost, ...pop } = usePopover();
    const chosen = parseCities(search.get('city'));
    const [draft, setDraft] = useState<string[]>([]);
    const picked = useRef<string[] | null>(null);

    const go = (next: string[], replace: boolean) => {
        const qs = new URLSearchParams(search.toString());
        if (next.length > 0) qs.set('city', next.join(','));
        else qs.delete('city');
        const s = qs.toString().replace(/%2C/g, ',');
        router[replace ? 'replace' : 'push'](s ? `${pathname}?${s}` : pathname, { scroll: false });
    };

    const names = chosen.map((slug) => cities.find((c) => c.slug === slug)?.name ?? slug);
    const more = names.length - 1;
    const close = () => {
        const next = picked.current ?? draft;
        picked.current = null;
        if (!pop.desktop && next.join() !== chosen.join()) go(next, false);
        pop.setOpen(false);
    };
    // A name click: only that city and the list closes; the phone sheet closes as by Back first, then `close` applies it.
    const pick = (slug: string) => {
        setDraft([slug]);
        if (!pop.desktop) {
            picked.current = [slug];
            window.history.back();
            return;
        }
        go([slug], true);
        pop.setOpen(false);
        pop.host?.querySelector('button')?.focus();
    };

    return (
        <div ref={bindHost} className="relative shrink-0">
            <FilterButton
                icon={<MapPin aria-hidden="true" className="size-3 shrink-0" />}
                label={names.length === 0 ? t('where') : <>{names[0]}{more > 0 && <em className="ml-1 shrink-0 text-tag not-italic">+{more}</em>}</>}
                ariaLabel={names.length === 0 ? t('where') : t('placeLabel', { places: names.join(', ') })}
                chosen={names.length > 0}
                open={pop.open}
                onToggle={() => { setDraft(chosen); pop.toggle(); }}
                controls={pop.id}
                onClear={() => go([], false)}
                clearLabel={t('clearChoice', { what: names.join(', ') })}
                widthClass="max-w-40"
            />
            <FilterPopover pop={pop} title={t('where')} onClose={close}>
                <PlaceList
                    cities={cities}
                    counts={cityCounts}
                    selected={draft}
                    onChange={(next) => { setDraft(next); if (pop.desktop) go(next, true); }}
                    onPick={pick}
                    autoFocus={pop.desktop}
                />
            </FilterPopover>
        </div>
    );
}
