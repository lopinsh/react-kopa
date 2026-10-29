import type { GroupCardData } from '@/lib/services/group-card';
import type { MyRole } from '@/lib/types/own-area';

/** One group on a profile: the card and the person's role there. */
export type ProfileGroupRow = { card: GroupCardData; role: MyRole };

/**
 * A profile as one viewer may see it (R9c). Built only by `UserService.getProfileView`, which alone decides what is shown;
 * pages render it and hold no visibility logic.
 */
export type ProfileViewContext = {
    person: {
        id: string;
        name: string | null;
        username: string | null;
        image: string | null;
        avatarSeed: string | null;
        bio: string | null;
        /** Set only when this viewer may see it (lib/services/contact.ts). */
        contact: string | null;
        cities: string[];
        createdAt: Date;
    };
    isOwn: boolean;
    /** True: the page renders the private-profile empty state; for another viewer the person fields are empty. */
    isPrivate: boolean;
    groups: ProfileGroupRow[];
    /** Heading: Grupas (all), Kopīgās grupas (only shared); never over an empty list, or no groups section. */
    groupsScope: 'all' | 'shared' | 'none';
    canMessage: boolean;
    /** Own profile only: who sees the contact; null when there is none or this is not the own profile. */
    ownContactScope: 'all' | 'shared' | null;
};

export type PrivacySettings = { isProfilePublic: boolean; allowDirectMessages: boolean; showGroupsOnProfile: boolean; contactVisibleToAll: boolean };
