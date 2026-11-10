'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { HubPathPart, HubSubTopic } from '@/lib/services/hub.service';
import type { CityOption } from '@/lib/services/city.service';

/** Everything a hub's frame (head, menu, drawer, Kur) shows; hydrated from the service in the layout (Context Law). */
export interface HubState {
    slug: string;
    /** "Kopiena Šahs": the hub's public name (K-115). */
    name: string;
    /** The hub's own title ("Šahs"). */
    title: string;
    /** The hub's address without locale. */
    href: string;
    l1Slug: string;
    path: HubPathPart[];
    stats: { memberCount: number; groupCount: number };
    subTopics: HubSubTopic[];
    cities: CityOption[];
    cityCounts: { byCity: Record<string, number>; anyPlace: number };
    signedIn: boolean;
}

const HubContext = createContext<HubState | undefined>(undefined);

export function HubProvider({ children, value }: { children: ReactNode; value: HubState }) {
    return <HubContext.Provider value={value}>{children}</HubContext.Provider>;
}

export function useHubContext(): HubState {
    const context = useContext(HubContext);
    if (context === undefined) throw new Error('useHubContext must be used within a HubProvider');
    return context;
}
