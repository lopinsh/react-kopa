'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { MembershipRole } from '@prisma/client';

export interface GroupState {
    id: string;
    slug: string;
    userRole: MembershipRole | 'PENDING' | null;
    isMember: boolean;
    accentColor: string;
    pendingCount?: number;
    sections: Array<{
        id: string;
        title: string;
        order: number;
        visibility: 'PUBLIC' | 'MEMBERS_ONLY';
    }>;
}

const GroupContext = createContext<GroupState | undefined>(undefined);

export function GroupProvider({ children, value }: { children: ReactNode; value: GroupState }) {
    return (
        <GroupContext.Provider value={value}>
            {children}
        </GroupContext.Provider>
    );
}

export function useGroupContext() {
    const context = useContext(GroupContext);
    if (context === undefined) {
        throw new Error('useGroupContext must be used within a GroupProvider');
    }
    return context;
}
