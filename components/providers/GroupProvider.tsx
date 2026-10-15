'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { MembershipRole } from '@prisma/client';
import type { GroupPageLink } from '@/lib/group-pages';

/** Everything the group's frame (banner, pages, drawer, actions) shows; hydrated from the service in the layout. */
export interface GroupState {
    id: string;
    slug: string;
    name: string;
    /** The group's base path without locale: `/${l1Slug}/group/${slug}`. */
    href: string;
    /** The group's picture (ready to render), or null: the banner then shows the category tint and mark. */
    image: string | null;
    /** "Tikai biedriem": out of discovery, a quiet note on the banner. */
    isPrivate: boolean;
    category: { l1Slug: string; l1Title: string; subCategories: string[]; subCategorySlugs: string[] };
    /** City slug; the client labels it with `cityLabel`. */
    city: string;
    memberCount: number;
    /** The tagline ("Ko meklējam?"): the banner (from md) and Informācija (phones) always show it when set. */
    lookingFor: string | null;
    isAcceptingMembers: boolean;
    /** The pages this viewer sees, in order. */
    pages: GroupPageLink[];
    moderation: { isSiteAdmin: boolean; hidden: boolean };
    user: {
        role: MembershipRole | 'PENDING' | null;
        isMember: boolean;
        isAdmin: boolean;
        /** The viewer's own chat with the team while their request waits (never anyone else's), or null. */
        chatId: string | null;
    };
    pendingCount?: number;
    sections: Array<{
        id: string;
        title: string;
        /** Language the title is written in (may differ from the page language when not translated). */
        titleLang: 'lv' | 'en';
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
