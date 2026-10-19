import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type { ActionResponse } from '@/types/actions';
import { TaxonomyResolver } from './taxonomy-resolver.service';
import { GROUP_CARD_RELATIONS, toGroupCard } from './group-card';
import { getMyGroupsOverview } from './my-groups';
import { getOwnCounts, markMyGroupsSeen } from './own-counts';
import bcrypt from 'bcryptjs';
import type { RegisterValues } from '@/lib/validations/auth';
import { USERNAME_MAX_LENGTH, RESERVED_USERNAMES } from '@/lib/username';
import { MessageService } from './message.service';
import type { MyRole } from '@/lib/types/own-area';
import type { PrivacySettings, ProfileViewContext } from '@/lib/types/profile';

/** The fields a profile page shows. Never the email, password hash or role. */
const PROFILE_USER_SELECT = {
    id: true, name: true, image: true, avatarSeed: true, username: true, bio: true,
    cities: true, createdAt: true, isProfilePublic: true, showGroupsOnProfile: true,
} as const;

/** The group columns a profile's cards need, with the category titles in the viewer's language. */
function profileGroupInclude(lang: string) {
    return { category: { include: TaxonomyResolver.getInclude(lang) }, ...GROUP_CARD_RELATIONS };
}

/** What the own area's head shows (R2a): the person, their first city (a city slug) and how many groups they belong to. */
export type OwnAreaContext = {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
    avatarSeed: string | null;
    firstCity: string | null;
    groupCount: number;
};

export const UserService = {
    async getUserProfile(userId: string) {
        return await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true, name: true, image: true, email: true, username: true, bio: true, cities: true, avatarSeed: true,
            }
        });
    },

    async getPrivacySettings(userId: string): Promise<PrivacySettings | null> {
        return await prisma.user.findUnique({
            where: { id: userId },
            select: { isProfilePublic: true, allowDirectMessages: true, showGroupsOnProfile: true },
        });
    },

    /** Saves only the switches given (Prisma ignores `undefined`); never touches name, bio, places or picture. */
    async updatePrivacy(userId: string, data: Partial<PrivacySettings>): Promise<ActionResponse> {
        try {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    isProfilePublic: data.isProfilePublic,
                    allowDirectMessages: data.allowDirectMessages,
                    showGroupsOnProfile: data.showGroupsOnProfile,
                },
            });
            return { success: true };
        } catch (error) {
            console.error('[UserService.updatePrivacy] Error:', error);
            return { success: false, error: 'UPDATE_FAILED' };
        }
    },

    /**
     * Checks if a username is available, ignoring case so `Oskars` and `oskars`
     * can't belong to different people. `exceptUserId` lets a user keep their own.
     */
    async checkUsernameAvailability(username: string, exceptUserId?: string): Promise<boolean> {
        const existing = await prisma.user.findFirst({
            where: { username: { equals: username, mode: 'insensitive' } },
            select: { id: true },
        });
        return existing === null || existing.id === exceptUserId;
    },

    /**
     * Returns `base` if it is free, otherwise the first free `base2`, `base3`, …
     * (trimming `base` so the result stays within the length limit).
     */
    async suggestAvailableUsername(base: string): Promise<string> {
        const taken = await prisma.user.findMany({
            where: { username: { startsWith: base.slice(0, USERNAME_MAX_LENGTH - 3), mode: 'insensitive' } },
            select: { username: true },
        });
        const takenSet = new Set([...RESERVED_USERNAMES, ...taken.map((u) => u.username?.toLowerCase())]);
        if (!takenSet.has(base)) return base;

        for (let n = 2; ; n++) {
            const suffix = String(n);
            const candidate = base.slice(0, USERNAME_MAX_LENGTH - suffix.length) + suffix;
            if (!takenSet.has(candidate)) return candidate;
        }
    },

    /** Creates an email + password account. Email and username are unique regardless of case. */
    async createCredentialsUser(data: RegisterValues): Promise<ActionResponse> {
        try {
            const emailTaken = await prisma.user.findFirst({
                where: { email: { equals: data.email, mode: 'insensitive' } },
                select: { id: true },
            });
            if (emailTaken) return { success: false, error: 'EMAIL_TAKEN' };

            if (!(await this.checkUsernameAvailability(data.username))) {
                return { success: false, error: 'USERNAME_TAKEN' };
            }

            await prisma.user.create({
                data: {
                    name: data.name,
                    username: data.username,
                    email: data.email,
                    password: await bcrypt.hash(data.password, 10),
                },
            });
            return { success: true };
        } catch (error) {
            console.error('[UserService.createCredentialsUser] Error:', error);
            return { success: false, error: 'CREATE_FAILED' };
        }
    },


    async updateProfile(userId: string, data: {
        name?: string;
        image?: string;
        username?: string;
        bio?: string;
        cities?: string[];
        avatarSeed?: string;
    }): Promise<ActionResponse> {
        try {
            // Username uniqueness check — only when a username is being set
            if (data.username && !(await this.checkUsernameAvailability(data.username, userId))) {
                return { success: false, error: 'USERNAME_TAKEN' };
            }

            await prisma.user.update({
                where: { id: userId },
                data
            });

            return { success: true };
        } catch (error) {
            console.error('[UserService.updateProfile] Error:', error);
            return { success: false, error: 'UPDATE_FAILED' };
        }
    },

    /**
     * A person's profile as `viewerId` may see it; the one place that decides this (R9c). Rules:
     * pending applications never count, moderation-hidden groups never show, private groups only to fellow members,
     * all public groups only when the person opted in (`showGroupsOnProfile`), signed-out visitors share no group.
     * A private profile (`isProfilePublic = false`) gives any other viewer `isPrivate` with empty person fields and no groups.
     * `asStranger` (Mans profils) builds it as a signed-in person who shares no group would see it, person fields kept.
     * Never returns the email, password hash or role.
     */
    async getProfileView(
        target: { username: string } | { userId: string },
        viewerId: string | undefined,
        locale: string,
        opts: { asStranger?: boolean } = {},
    ): Promise<ProfileViewContext | null> {
        const lang = locale === 'en' ? 'en' : 'lv';
        const profile = await prisma.user.findUnique({
            where: 'userId' in target ? { id: target.userId } : { username: target.username },
            select: PROFILE_USER_SELECT,
        });
        if (!profile) return null;

        const isOwn = viewerId === profile.id;
        const asStranger = !!opts.asStranger && isOwn;

        if (!profile.isProfilePublic && !isOwn) {
            return {
                person: { id: profile.id, name: null, username: null, image: null, avatarSeed: null, bio: null, cities: [], createdAt: profile.createdAt },
                isOwn, isPrivate: true, groups: [], groupsScope: 'none', canMessage: false,
            };
        }

        let groupFilter: Prisma.GroupWhereInput;
        let groupsScope: ProfileViewContext['groupsScope'];
        if (isOwn && !asStranger) {
            groupFilter = {};
            groupsScope = 'all';
        } else {
            const shared: Prisma.GroupWhereInput | null = viewerId && !asStranger
                ? { members: { some: { userId: viewerId, role: { not: 'PENDING' } } } }
                : null;
            if (profile.showGroupsOnProfile) {
                groupFilter = { OR: shared ? [{ type: 'PUBLIC' }, shared] : [{ type: 'PUBLIC' }] };
                groupsScope = 'all';
            } else {
                groupFilter = shared ?? { id: { in: [] } };
                // "Kopīgās grupas" only when there are some (set below). Signed-out visitors and the own-page stranger view get none,
                // so Mans profils matches what a signed-in stranger sees.
                groupsScope = shared ? 'shared' : 'none';
            }
        }

        const memberships = await prisma.membership.findMany({
            where: {
                userId: profile.id,
                role: { not: 'PENDING' },
                group: { hiddenAt: null, ...groupFilter },
            },
            orderBy: { joinedAt: 'desc' },
            include: { group: { include: profileGroupInclude(lang) } },
        });

        const canMessage = isOwn ? false : (await MessageService.messageableUserIds(viewerId, [profile.id])).has(profile.id);

        return {
            person: {
                id: profile.id, name: profile.name, username: profile.username, image: profile.image, avatarSeed: profile.avatarSeed,
                bio: profile.bio, cities: profile.cities, createdAt: profile.createdAt,
            },
            isOwn,
            isPrivate: !profile.isProfilePublic,
            groups: memberships.map((m) => ({ card: toGroupCard(m.group, lang), role: m.role as MyRole })),
            // No heading over an empty list: a stranger sees no section, and Mans profils shows the same.
            groupsScope: memberships.length === 0 ? 'none' : groupsScope,
            canMessage,
        };
    },

    async getOwnAreaContext(userId: string): Promise<OwnAreaContext | null> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true, name: true, username: true, image: true, avatarSeed: true, cities: true,
                _count: { select: { memberships: { where: { role: { not: 'PENDING' }, group: { hiddenAt: null } } } } },
            },
        });
        if (!user) return null;
        const { cities, _count, ...person } = user;
        return { ...person, firstCity: cities[0] ?? null, groupCount: _count.memberships };
    },

    /** Manas grupas in one call (see `my-groups.ts`). */
    getMyGroupsOverview(userId: string, locale: string, zone?: string) {
        return getMyGroupsOverview(userId, locale, zone);
    },

    /** The numbers in the menus: unread notifications and what is new in Manas grupas. */
    getOwnCounts(userId: string) {
        return getOwnCounts(userId);
    },

    /** Manas grupas was opened: its "new" count restarts from now. */
    markMyGroupsSeen(userId: string) {
        return markMyGroupsSeen(userId);
    },

    /** Ids of every group the person is in or waits for (PENDING included): lists link those straight to the full page. */
    async getMyGroupIds(userId: string): Promise<string[]> {
        const rows = await prisma.membership.findMany({ where: { userId, group: { hiddenAt: null } }, select: { groupId: true } });
        return rows.map((r) => r.groupId);
    }
};
