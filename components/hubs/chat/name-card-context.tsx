'use client';

import { createContext, useContext } from 'react';

/** Opens the name card of a person (K5-19). Absent (null) when signed out: names are plain text there (K-142). */
const NameCardContext = createContext<((userId: string) => void) | null>(null);

export const NameCardProvider = NameCardContext.Provider;
export const useNameCard = () => useContext(NameCardContext);
