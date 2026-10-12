'use client';

import { createContext, useContext } from 'react';
import type { CityOption } from '@/lib/services/city.service';

const CitiesContext = createContext<CityOption[]>([]);

/** Wraps the few pages that show a city picker or filter (discovery, group create, group settings). */
export function CitiesProvider({ cities, children }: { cities: CityOption[]; children: React.ReactNode }) {
    return <CitiesContext.Provider value={cities}>{children}</CitiesContext.Provider>;
}

/** Approved cities (stored value + name in the current language); needs a `CitiesProvider` above it. */
export function useCities(): CityOption[] {
    return useContext(CitiesContext);
}
