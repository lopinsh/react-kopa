import { avatarUrl } from '@/lib/avatar';
import { GroupService, type GroupContext } from '@/lib/services/group.service';
import { MessageService } from '@/lib/services/message.service';
import { contactForMemberRow } from '@/lib/services/contact';
import { allowedMemberActions, type MemberManageAction } from '@/lib/utils/permissions';

export type MemberAction = MemberManageAction | 'message' | 'profile';

export interface MemberRowData {
    userId: string;
    name: string | null;
    username: string | null;
    avatar: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    since: Date;
    /** Only when this viewer may see it (R32); the switch itself is never sent. */
    contact: string | null;
    /** The public profile address, or null when the person keeps theirs private. */
    profileHref: string | null;
    canMessage: boolean;
    actions: MemberAction[];
}

export interface RequestRowData {
    membershipId: string;
    userId: string;
    name: string | null;
    avatar: string;
    askedAt: Date | null;
    /** The applicant's newest message in the request chat. */
    message: string | null;
    chatId: string | null;
}

const ORDER = { OWNER: 0, ADMIN: 1, MEMBER: 2 } as const;

/** What the Biedri page shows: the member rows (sorted, with the menu items this viewer may use) and, for the team only, the open requests. */
export const GroupMembersService = {
    async getMembersPage(
        group: Pick<GroupContext, 'id' | 'user' | 'moderation'>,
        viewerId: string | undefined
    ): Promise<{ members: MemberRowData[]; requests: RequestRowData[] | null }> {
        const all = await GroupService.getMembers(group, viewerId);
        const accepted = all.flatMap((m) => (m.role === 'PENDING' ? [] : [{ ...m, role: m.role }]));
        const messageable = await MessageService.messageableUserIds(viewerId, accepted.map((m) => m.user.id));

        const members = accepted
            .sort((a, b) => ORDER[a.role] - ORDER[b.role] || a.joinedAt.getTime() - b.joinedAt.getTime())
            .map((m): MemberRowData => {
                const username = m.user.username ?? null;
                const profileHref = m.user.isProfilePublic && username ? `/profile/${username}` : null;
                const canMessage = messageable.has(m.user.id);
                const manage = allowedMemberActions(group.user.role, m.role, m.user.id === viewerId);
                return {
                    userId: m.user.id,
                    name: m.user.name,
                    username,
                    avatar: avatarUrl(m.user),
                    role: m.role,
                    since: m.joinedAt,
                    contact: contactForMemberRow(m.user, viewerId, { hidden: !!group.moderation.hidden, isSiteAdmin: group.moderation.isSiteAdmin }),
                    profileHref,
                    canMessage,
                    actions: [...(canMessage ? (['message'] as const) : []), ...(profileHref ? (['profile'] as const) : []), ...manage],
                };
            });

        if (!group.user.isAdmin) return { members, requests: null };
        const requests = all
            .filter((m) => m.role === 'PENDING')
            .map((m): RequestRowData => {
                const latest = m.applicationMessages.at(-1) ?? null;
                return {
                    membershipId: m.id,
                    userId: m.user.id,
                    name: m.user.name,
                    avatar: avatarUrl(m.user),
                    askedAt: latest?.createdAt ?? m.joinedAt,
                    message: latest?.content ?? null,
                    chatId: m.chatId,
                };
            });
        return { members, requests };
    },
};
