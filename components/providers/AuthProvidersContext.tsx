'use client';

import { createContext, useContext } from 'react';
import type { OAuthProviderId } from '@/lib/auth-providers';

const AuthProvidersContext = createContext<OAuthProviderId[]>([]);

export const AuthProvidersProvider = AuthProvidersContext.Provider;

/** OAuth providers configured on the server (computed once in the locale layout). */
export function useOAuthProviders(): OAuthProviderId[] {
    return useContext(AuthProvidersContext);
}
