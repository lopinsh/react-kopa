'use client';

import { createContext, useContext } from 'react';
import type { DiscoveryState } from '@/lib/types/discovery';

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
