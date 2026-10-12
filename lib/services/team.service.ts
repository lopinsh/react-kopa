import { prisma } from '@/lib/prisma';
import { isSiteOwner } from '@/lib/site-role';
import { isSiteOwnerUser } from './site-role.service';
import { teamSearchSchema, teamTargetSchema } from '@/lib/validations/team';
import { ModerationService } from './moderation.service';
import { NotificationService } from './notification.service';
import type { ErrorCode } from '@/types/actions';

export type TeamMember = {
    id: string;
    name: string | null;
    username: string | null;
    email: string | null;
    role: 'ADMIN' | 'OWNER';
};

export type TeamCandidate = {
    id: string;
    name: string | null;
    username: string | null;
    email: string | null;
};

export type TeamResult<T = void> =
    | { success: true; data?: T }
    | { success: false; error: ErrorCode };

const SEARCH_LIMIT = 8;

async function changeRole(ownerId: string, targetUserId: string, from: 'USER' | 'ADMIN', to: 'USER' | 'ADMIN'): Promise<TeamResult> {
    if (!(await isSiteOwnerUser(ownerId))) return { success: false, error: 'FORBIDDEN' };
    const parsed = teamTargetSchema.safeParse({ userId: targetUserId });
    if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };

    const target = await prisma.user.findUnique({ where: { id: parsed.data.userId }, select: { id: true, name: true, username: true, role: true } });
    if (!target) return { success: false, error: 'NOT_FOUND' };
    // The owner cannot be demoted or removed here, and nobody becomes owner here.
    if (isSiteOwner(target.role)) return { success: false, error: 'FORBIDDEN' };
    if (target.role !== from) return { success: false, error: 'VALIDATION_FAILED' };

    const changed = await prisma.$transaction(async (tx) => {
        // Re-checked in the write: another change may have landed since the read above.
        const { count } = await tx.user.updateMany({ where: { id: target.id, role: from }, data: { role: to } });
        if (count === 0) return false;
        await ModerationService.logAction(ownerId, to === 'ADMIN' ? 'ADMIN_GRANT' : 'ADMIN_REVOKE', 'USER', target.id, undefined, tx, target.name || target.username || undefined);
        return true;
    });
    if (!changed) return { success: false, error: 'VALIDATION_FAILED' };

    await NotificationService.notify({
        userId: target.id,
        type: to === 'ADMIN' ? 'ADMIN_GRANTED' : 'ADMIN_REVOKED',
        translationKey: to === 'ADMIN' ? 'adminGranted' : 'adminRevoked',
    });
    return { success: true };
}

/** Owner-only: who the site admins are, and who is made or removed. The owner themself is never changed here. */
export const TeamService = {
    async listTeam(ownerId: string): Promise<TeamResult<TeamMember[]>> {
        if (!(await isSiteOwnerUser(ownerId))) return { success: false, error: 'FORBIDDEN' };
        const users = await prisma.user.findMany({
            where: { role: { in: ['ADMIN', 'OWNER'] } },
            select: { id: true, name: true, username: true, email: true, role: true },
        });
        const team = users
            .filter((u): u is typeof u & { role: 'ADMIN' | 'OWNER' } => u.role === 'ADMIN' || u.role === 'OWNER')
            .sort((a, b) => (a.role === b.role ? (a.name ?? '').localeCompare(b.name ?? '') : a.role === 'OWNER' ? -1 : 1));
        return { success: true, data: team };
    },

    /** Ordinary users matching name, username or email. People who are already admins are not offered. */
    async searchUsers(ownerId: string, query: string): Promise<TeamResult<TeamCandidate[]>> {
        if (!(await isSiteOwnerUser(ownerId))) return { success: false, error: 'FORBIDDEN' };
        const parsed = teamSearchSchema.safeParse({ query });
        if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };
        const q = parsed.data.query;
        const users = await prisma.user.findMany({
            where: {
                role: 'USER',
                OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { username: { contains: q, mode: 'insensitive' } },
                    { email: { contains: q, mode: 'insensitive' } },
                ],
            },
            orderBy: { name: 'asc' },
            take: SEARCH_LIMIT,
            select: { id: true, name: true, username: true, email: true },
        });
        return { success: true, data: users };
    },

    async makeAdmin(ownerId: string, targetUserId: string): Promise<TeamResult> {
        return changeRole(ownerId, targetUserId, 'USER', 'ADMIN');
    },

    async removeAdmin(ownerId: string, targetUserId: string): Promise<TeamResult> {
        return changeRole(ownerId, targetUserId, 'ADMIN', 'USER');
    },
};
