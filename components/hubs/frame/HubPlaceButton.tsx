'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { Check, MapPin } from 'lucide-react';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { foldText } from '@/lib/text-fold';
import { hubPageForPath, hubPages } from '@/lib/hub-pages';
import { useHubContext } from '@/components/providers/HubProvider';
import { buttonClass } from '@/components/ui/Button';
import FilterButton from '@/components/discovery/filter/FilterButton';
import FilterPopover, { usePopover } from '@/components/discovery/lists/FilterPopover';
import ListSearch from '@/components/discovery/lists/ListSearch';
import HubCityRequestSheet from './HubCityRequestSheet';

const ROW = 'flex min-h-11 w-full items-center justify-between gap-2 rounded-xl px-3 text-left text-body-sm md:min-h-9';

/**
 * "Kur" on a topic hub (K3-10, K-127): not a filter but a switcher. "Visas pilsētas" is the topic hub, an open city its topic x city hub (both keep the
 * current page), any other city offers "Pieprasīt" (the request sheet). Rows are links, so the page changes without client state.
 */
export default function HubPlaceButton() {
    const t = useTranslations('discovery');
    const th = useTranslations('hub.kur');
    const hub = useHubContext();
    const router = useRouter();
    const pathname = usePathname();
    const { bindHost, ...pop } = usePopover();
    const [typed, setTyped] = useState('');
    const [asking, setAsking] = useState<string | null>(null);

    const page = hubPageForPath(pathname, hub.href);
    const hrefOf = (base: string) => hubPages(base).find((p) => p.key === page)?.href ?? base;
    const rows = hub.kur.filter((c) => !typed || foldText(c.name).includes(foldText(typed.trim())));
    const close = () => { setTyped(''); pop.setOpen(false); };

    return (
        <div ref={bindHost} className="relative shrink-0">
            <FilterButton
                icon={<MapPin aria-hidden="true" className="size-3 shrink-0" />}
                label={hub.local ? hub.local.cityName : t('where')}
                ariaLabel={hub.local ? t('placeLabel', { places: hub.local.cityName }) : t('where')}
                chosen={!!hub.local}
                open={pop.open}
                onToggle={() => { setTyped(''); pop.toggle(); }}
                controls={pop.id}
                onClear={() => router.push(hrefOf(hub.topicHref), { scroll: false })}
                clearLabel={t('clearChoice', { what: hub.local?.cityName ?? '' })}
                widthClass="max-w-40"
            />
            <FilterPopover pop={pop} title={t('where')} onClose={close}>
                <ListSearch value={typed} onChange={setTyped} label={th('search')} autoFocus={pop.desktop} />
                {!typed && (
                    <Link href={hrefOf(hub.topicHref)} onClick={close} aria-current={hub.local ? undefined : 'true'} className={clsx(ROW, 'mt-1', hub.local ? 'hover:bg-tint' : 'bg-tint weight-strong')}>
                        {th('all')}
                        {!hub.local && <Check aria-hidden className="size-4 shrink-0" />}
                    </Link>
                )}
                {rows.map((c) => {
                    const current = hub.local?.segment === c.segment;
                    const meta = c.status === 'open' ? th('groups', { count: c.groupCount }) : c.viewerRequested ? th('mine') : c.requestCount > 0 ? th('interested', { count: c.requestCount }) : th('none');
                    const body = <span className="min-w-0"><span className="block truncate">{c.name}</span><span className="block truncate text-meta text-foreground-muted">{meta}</span></span>;
                    if (c.status === 'open') {
                        return <Link key={c.slug} href={hrefOf(`${hub.topicHref}/${c.segment}`)} onClick={close} aria-current={current ? 'true' : undefined} className={clsx(ROW, current ? 'bg-tint weight-strong' : 'hover:bg-tint')}>{body}{current && <Check aria-hidden className="size-4 shrink-0" />}</Link>;
                    }
                    return (
                        <div key={c.slug} className={ROW}>
                            {body}
                            {!c.viewerRequested && <button type="button" onClick={() => { close(); setAsking(c.segment); }} className={buttonClass('secondary', 'shrink-0', 'sm')}>{th('request')}</button>}
                        </div>
                    );
                })}
                {rows.length === 0 && <p className="px-3 py-3 text-body-sm italic text-foreground-muted">{t('nothingFound')}</p>}
            </FilterPopover>
            {asking && <HubCityRequestSheet segment={asking} onClose={() => setAsking(null)} />}
        </div>
    );
}
