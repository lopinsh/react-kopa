'use client';

import SearchWordChip from './SearchWordChip';
import PlaceButton from './PlaceButton';
import TopicButton from './TopicButton';
import VeidsChips from './VeidsChips';
import ClearAll from './ClearAll';
import DateButton from '@/components/discovery/dates/DateButton';
import DateChoices from '@/components/discovery/dates/DateChoices';
import { useDiscoveryNav } from '@/hooks/useDiscoveryNav';
import { UI } from '@/lib/constants';

/**
 * The filter row (AR-23, AR-27, R20): one row of 28 px chips under the title switch, sticky 8 px under the header on a `board-veil`.
 * Order: word, Kur, Tēma (below 1024 only, the column shows it from there), dates (Pasākumi: four segments where the row is wide,
 * container query 56 rem, else one date chip), the Veids rule and Veidi ("+N" from `md`), then "Notīrīt visu" at the end.
 * Phones: the same row scrolls sideways, every chip in full.
 */
export default function FilterLine() {
    const { params, pending } = useDiscoveryNav();
    return (
        <div data-ui={UI.filterLine} aria-busy={pending} className="@container/filter board-veil sticky top-2 z-20 mb-4 mt-3 h-9">
            <div className="flex h-full items-center gap-1.5 max-md:-mx-gutter max-md:overflow-x-auto max-md:px-gutter max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden">
                <SearchWordChip />
                <PlaceButton />
                <TopicButton />
                {params.kind === 'events' && (
                    <>
                        <div className="hidden shrink-0 @4xl/filter:flex"><DateChoices /></div>
                        <DateButton className="@4xl/filter:hidden" />
                    </>
                )}
                {params.category && (
                    <>
                        <span aria-hidden="true" className="mx-0.5 h-4 w-px shrink-0 bg-border" />
                        <div className="max-md:shrink-0 md:min-w-0 md:flex-1"><VeidsChips /></div>
                    </>
                )}
                <ClearAll className="ml-auto" />
                <span aria-hidden="true" className="w-0.5 shrink-0 md:hidden" />
            </div>
        </div>
    );
}
