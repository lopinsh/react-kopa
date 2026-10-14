'use client';

import { createContext, useContext } from 'react';
import type { DiscoveryDates, DiscoveryState } from '@/lib/types/discovery';

const DiscoveryContext = createContext<DiscoveryState | null>(null);

/** Hydrates the discovery page's lists and drawer from the services' data (the choice itself lives in the URL). */
export function DiscoveryProvider({ state, children }: { state: DiscoveryState; children: React.ReactNode }) {
    return <DiscoveryContext.Provider value={state}>{children}</DiscoveryContext.Provider>;
}

export function useDiscovery(): DiscoveryState {
    const state = useContext(DiscoveryContext);
    if (!state) throw new Error('useDiscovery must be used inside DiscoveryProvider');
    return state;
}

/** Pasākumi's dates (today in the viewer's zone, the choice, the strip's and the calendar's counts). Only inside the Pasākumi page. */
export function useDiscoveryDates(): DiscoveryDates {
    const { dates } = useDiscovery();
    if (!dates) throw new Error('useDiscoveryDates is only available on Pasākumi');
    return dates;
}
