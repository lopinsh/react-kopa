import { prisma } from '@/lib/prisma';
import type { MembershipRole, Prisma } from '@prisma/client';
import { ActionError } from '@/types/actions';
import { TaxonomyResolver } from './taxonomy-resolver.service';
import { GROUP_CARD_RELATIONS, toGroupCard } from './group-card';
import { getMyGroupsOverview } from './my-groups';
import { getOwnCounts, markMyGroupsSeen } from './own-counts';
import bcrypt from 'bcryptjs';
import type { RegisterValues } from '@/lib/validations/auth';
import { USERNAME_MAX_LENGTH, RESERVED_USERNAMES } from '@/lib/username';
import { MessageService } from './message.service';
import type { MyRole } from '@/lib/types/own-area';
import { contactFor } from './contact';
import type { PrivacySettings, ProfileViewContext } from '@/lib/types/profile';

/** The fields a profile page shows. Never the email, password hash or role. */
const PROFILE_USER_SELECT = {
    id: true, name: true, image: true, avatarSeed: true, username: true, bio: true,
    contact: true, contactVisibleToAll: true, cities: true, createdAt: true, isProfilePublic: true, showGroupsOnProfile: true,
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
    bio: string | null;
    firstCity: string | null;
    groupCount: number;
};

export const UserService = {
    async getUserProfile(userId: string) {
        return await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true, name: true, image: true, email: true, username: true, bio: true, contact: true, isProfilePublic: true, cities: true, avatarSeed: true,
            }
        });
    },

    async getPrivacySettings(userId: string): Promise<PrivacySettings | null> {
        return await prisma.user.findUnique({
            where: { id: userId },
            select: { isProfilePublic: true, allowDirectMessages: true, showGroupsOnProfile: true, contactVisibleToAll: true },
        });
    },

    /** Saves only the switches given (Prisma ignores `undefined`); never touches name, bio, places or picture. */
    async updatePrivacy(userId: string, data: Partial<PrivacySettings>): Promise<void> {
        try {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    isProfilePublic: data.isProfilePublic,
                    allowDirectMessages: data.allowDirectMessages,
                    showGroupsOnProfile: data.showGroupsOnProfile,
                    contactVisibleToAll: data.contactVisibleToAll,
                },
            });
            return;
        } catch (error) {
            if (error instanceof ActionError) throw error;
            console.error('[UserService.updatePrivacy] Error:', error);
            throw new ActionError('UPDATE_FAILED');
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
    async createCredentialsUser(data: RegisterValues): Promise<void> {
        try {
            const emailTaken = await prisma.user.findFirst({
                where: { email: { equals: data.email, mode: 'insensitive' } },
                select: { id: true },
            });
            if (emailTaken) throw new ActionError('EMAIL_TAKEN');

            if (!(await this.checkUsernameAvailability(data.username))) {
                throw new ActionError('USERNAME_TAKEN');
            }

            await prisma.user.create({
                data: {
                    name: data.name,
                    username: data.username,
                    email: data.email,
                    password: await bcrypt.hash(data.password, 10),
                },
            });
            return;
        } catch (error) {
            if (error instanceof ActionError) throw error;
            console.error('[UserService.createCredentialsUser] Error:', error);
            throw new ActionError('CREATE_FAILED');
        }
    },


    async updateProfile(userId: string, data: {
        name?: string;
        image?: string;
        username?: string;
        bio?: string | null;
        contact?: string | null;
        cities?: string[];
        avatarSeed?: string;
    }): Promise<void> {
        try {
            // Username uniqueness check — only when a username is being set
            if (data.username && !(await this.checkUsernameAvailability(data.username, userId))) {
                throw new ActionError('USERNAME_TAKEN');
            }

            await prisma.user.update({
                where: { id: userId },
                data
            });

            return;
        } catch (error) {
            if (error instanceof ActionError) throw error;
            console.error('[UserService.updateProfile] Error:', error);
            throw new ActionError('UPDATE_FAILED');
        }
    },

    /**
     * A person's profile as `viewerId` may see it; the one place that decides this (R9c). Rules:
     * pending applications never count, moderation-hidden groups never show, private groups only to fellow members,
     * all public groups only when the person opted in (`showGroupsOnProfile`), signed-out visitors share no group.
     * A private profile (`isProfilePublic = false`) gives any other viewer `isPrivate` with empty person fields and no groups.
     * `asStranger` (Mans profils) builds it as a signed-in person who shares no group would see it, person fields kept.
     * `withoutGroups` skips the group queries (groups empty, scope 'none'): for callers that only need the person.
     * Never returns the email, password hash or role.
     */
    async getProfileView(
        target: { username: string } | { userId: string },
        viewerId: string | undefined,
        locale: string,
        opts: { asStranger?: boolean; withoutGroups?: boolean } = {},
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
                person: { id: profile.id, name: null, username: null, image: null, avatarSeed: null, bio: null, contact: null, cities: [], createdAt: profile.createdAt },
                isOwn, isPrivate: true, groups: [], groupsScope: 'none', canMessage: false, ownContactScope: null,
            };
        }

        if (opts.withoutGroups) {
            return {
                person: { id: profile.id, name: profile.name, username: profile.username, image: profile.image, avatarSeed: profile.avatarSeed, bio: profile.bio, contact: null, cities: profile.cities, createdAt: profile.createdAt },
                isOwn, isPrivate: !profile.isProfilePublic, groups: [], groupsScope: 'none', canMessage: false, ownContactScope: null,
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

        const contact = await contactFor(profile, viewerId, { asStranger });

        return {
            person: {
                id: profile.id, name: profile.name, username: profile.username, image: profile.image, avatarSeed: profile.avatarSeed,
                bio: profile.bio, contact, cities: profile.cities, createdAt: profile.createdAt,
            },
            isOwn,
            isPrivate: !profile.isProfilePublic,
            groups: memberships.map((m) => ({ card: toGroupCard(m.group, lang), role: m.role as MyRole })),
            // No heading over an empty list: a stranger sees no section, and Mans profils shows the same.
            groupsScope: memberships.length === 0 ? 'none' : groupsScope,
            canMessage,
            ownContactScope: isOwn && profile.contact ? (profile.contactVisibleToAll ? 'all' : 'shared') : null,
        };
    },

    async getOwnAreaContext(userId: string): Promise<OwnAreaContext | null> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true, name: true, username: true, image: true, avatarSeed: true, bio: true, cities: true,
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

    /** Group id → the person's role in every group they are in or wait for (PENDING included), in one query: lists link those to the full page and tag them. */
    async getMyGroupRoles(userId: string): Promise<Record<string, MembershipRole>> {
        const rows = await prisma.membership.findMany({ where: { userId, group: { hiddenAt: null } }, select: { groupId: true, role: true } });
        return Object.fromEntries(rows.map((r) => [r.groupId, r.role]));
    }
};
