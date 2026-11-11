'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { HubPathPart, HubSubTopic } from '@/lib/services/hub.service';
import type { KurOption } from '@/lib/services/hub-city.service';

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
    /** The hub's photo URL for the head sliver (L3 D10); the credit stays on the server side, on Pārskats (D11). */
    image: string | null;
    /** The topic hub's address (no city); `href` is the topic x city hub's on one. */
    topicHref: string;
    /** The topic x city hub the page is on (K3), else null. */
    local: { hubCityId: string; citySlug: string; segment: string; cityName: string; cityHref: string } | null;
    /** Kur (K3-10): every city with its state for this topic hub. */
    kur: KurOption[];
    signedIn: boolean;
    isAdmin: boolean;
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
