'use client';

import { createContext, useContext, type ReactNode } from 'react';

/** What the own area's head shows: ready to render, resolved on the server (Context Law). */
export interface MeContextValue {
    name: string;
    avatarSrc: string;
    /** "Jelgava · 3 grupas"; either part may be missing. */
    line: string;
    /** The public handle, if the person has one (the link to the public profile). */
    username: string | null;
}

const MeContext = createContext<MeContextValue | undefined>(undefined);

export function MeProvider({ children, value }: { children: ReactNode; value: MeContextValue }) {
    return <MeContext.Provider value={value}>{children}</MeContext.Provider>;
}

export function useMeContext(): MeContextValue {
    const context = useContext(MeContext);
    if (context === undefined) {
        throw new Error('useMeContext must be used within a MeProvider');
    }
    return context;
}
