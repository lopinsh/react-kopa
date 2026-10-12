'use client';

import { createContext, useContext } from 'react';
import type { CityOption } from '@/lib/services/city.service';

const CitiesContext = createContext<CityOption[]>([]);

export const CitiesProvider = CitiesContext.Provider;

/** Approved cities (stored value + name in the current language), loaded once in the locale layout. */
export function useCities(): CityOption[] {
    return useContext(CitiesContext);
}
