'use client';

import { useTranslations } from 'next-intl';
import { LayoutGrid, MapPin } from 'lucide-react';
import FilterButton from '@/components/discovery/filter/FilterButton';
import { DiscoveryProvider } from '@/components/providers/DiscoveryProvider';
import { parseDiscoveryParams } from '@/lib/discovery-params';
import ViewSwitch from '@/components/discovery/filter/ViewSwitch';
import { Chip } from '@/components/discovery/filter/VeidsChips';

const NOOP = () => undefined;

/** The filter line's parts as static samples (nothing opens): buttons unchosen, chosen and open, a Veids chip pair, the Grupas | Pasākumi switch. */
export function FilterLineDemo({ accent }: { accent: string }) {
    const t = useTranslations('discovery');
    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
                <FilterButton icon={<MapPin aria-hidden="true" className="size-3.5" />} label={t('where')} ariaLabel={t('where')} chosen={false} onToggle={NOOP} onClear={NOOP} clearLabel="" widthClass="max-w-[9.5rem]" />
                <FilterButton icon={<MapPin aria-hidden="true" className="size-3.5" />} label="Jelgava" ariaLabel="Jelgava" chosen onToggle={NOOP} onClear={NOOP} clearLabel={t('clearChoice', { what: 'Jelgava' })} widthClass="max-w-[9.5rem]" />
                <FilterButton icon={<LayoutGrid aria-hidden="true" className="size-3.5" />} label={t('topic')} ariaLabel={t('topic')} chosen={false} open onToggle={NOOP} onClear={NOOP} clearLabel="" widthClass="max-w-[11rem]" />
            </div>
            <div className="flex flex-wrap items-center gap-1.5" style={{ ['--c' as string]: accent }}>
                <Chip label={t('veids')} chosen onClick={NOOP} />
                <Chip label={t('veids')} chosen={false} onClick={NOOP} />
            </div>
            <DiscoveryProvider state={{ kind: 'groups', params: parseDiscoveryParams({}), categories: [], veidi: [], counts: { total: 0, anyTopic: 0, anyPlace: 0, byCity: {}, online: 0 } }}>
                <ViewSwitch className="self-start" />
            </DiscoveryProvider>
        </div>
    );
}
