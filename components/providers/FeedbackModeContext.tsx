'use client';

import { createContext, useContext } from 'react';

const FeedbackModeContext = createContext(false);

export const FeedbackModeProvider = FeedbackModeContext.Provider;

/** True while a site admin has feedback mode on (decided on the server, per request). */
export function useFeedbackMode(): boolean {
    return useContext(FeedbackModeContext);
}
