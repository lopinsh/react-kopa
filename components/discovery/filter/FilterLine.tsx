'use client';

import SearchWordChip from './SearchWordChip';
import PlaceButton from './PlaceButton';
import TopicButton from './TopicButton';
import VeidsChips from './VeidsChips';
import ViewSwitch from './ViewSwitch';
import ClearAll from './ClearAll';
import { useDiscoveryNav } from '@/hooks/useDiscoveryNav';
import { UI } from '@/lib/constants';

/**
 * The filter line (AR-23, AR-27). One tree, ordered by breakpoint. From `md`: line 1 holds the word, Kur, Tēma, "Notīrīt visu" and the
 * switch at the right end; line 2 the Veids chips. Phones: the switch on its own full-width line, Kur and Tēma under it, then the
 * Veids line with "Notīrīt visu" at its end.
 */
export default function FilterLine() {
    const { params, pending } = useDiscoveryNav();
    return (
        <div data-ui={UI.filterLine} aria-busy={pending} className="mb-3 flex flex-wrap items-center gap-x-1.5 gap-y-2 md:mb-4">
            <ViewSwitch className="order-1 w-full md:order-3 md:w-auto" />
            <div className="order-2 flex w-full min-w-0 items-center gap-1.5 md:order-1 md:w-auto md:flex-1">
                <SearchWordChip />
                <PlaceButton />
                <TopicButton />
            </div>
            {params.category && <div className="order-3 min-w-0 flex-1 md:order-4 md:w-full md:flex-none"><VeidsChips /></div>}
            <ClearAll className="order-4 ml-auto md:order-2 md:ml-0" />
        </div>
    );
}
