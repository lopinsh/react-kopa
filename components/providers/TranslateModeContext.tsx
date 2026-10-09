'use client';

import { createContext, useContext } from 'react';

const TranslateModeContext = createContext(false);

export const TranslateModeProvider = TranslateModeContext.Provider;

/** True while a site admin has translation mode on (decided on the server, per request). */
export function useTranslateMode(): boolean {
    return useContext(TranslateModeContext);
}
