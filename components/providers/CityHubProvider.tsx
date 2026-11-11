'use client';

import { createContext, useContext, type ReactNode } from 'react';

/** What a city hub's frame (head, menu, drawer) shows; hydrated from `CityHubService` in the layout (Context Law). */
export interface CityHubState {
    /** "Kopiena Jelgava": the hub's public name (K3-17). */
    name: string;
    /** The city's own name. */
    cityName: string;
    /** Without locale: `/jelgava`. */
    href: string;
    stats: { memberCount: number; groupCount: number };
}

const CityHubContext = createContext<CityHubState | undefined>(undefined);

export function CityHubProvider({ children, value }: { children: ReactNode; value: CityHubState }) {
    return <CityHubContext.Provider value={value}>{children}</CityHubContext.Provider>;
}

export function useCityHubContext(): CityHubState {
    const context = useContext(CityHubContext);
    if (context === undefined) throw new Error('useCityHubContext must be used within a CityHubProvider');
    return context;
}
