'use client';

import { createContext, useContext } from 'react';

/** Opens the name card of a person (K5-19), anchored to the tapped name from 768 px. Absent (null) when signed out: names are plain text there (K-142). */
export type OpenNameCard = (userId: string, anchor: HTMLElement) => void;
const NameCardContext = createContext<OpenNameCard | null>(null);

export const NameCardProvider = NameCardContext.Provider;
export const useNameCard = () => useContext(NameCardContext);
