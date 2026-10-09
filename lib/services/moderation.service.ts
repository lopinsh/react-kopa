import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { hideGroupSchema, deleteGroupSchema } from '@/lib/validations/moderation';
import { TaxonomyResolver } from './taxonomy-resolver.service';
import { NotificationService } from './notification.service';
import { GroupService } from './group.service';
import type { ErrorCode } from '@/types/actions';

export type AdminActionType = 'GROUP_HIDE' | 'GROUP_RESTORE' | 'GROUP_EDIT' | 'GROUP_DELETE';

export type ModerationResult<T = void> =
    | { success: true; data?: T }
    | { success: false; error: ErrorCode };

export interface AdminActionEntry {
    id: string;
    action: string;
    targetType: string;
    targetId: string;
    reason: string | null;
    createdAt: Date;
    adminName: string | null;
    /** Name kept in the log row; set for deleted targets whose row is gone. */
    targetName: string | null;
    target: { name: string; href: string } | null;
}

export interface HiddenGroupEntry {
    id: string;
    name: string;
    href: string;
    ownerName: string | null;
    reason: string | null;
    hiddenAt: Date;
    hiddenByName: string | null;
}

export async function isSiteAdmin(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    return user?.role === 'ADMIN';
}

export const ModerationService = {
    /**
     * Records an admin action. Called by services that perform admin-only overrides.
     */
    async logAction(adminId: string, action: AdminActionType, targetType: string, targetId: string, reason?: string, tx: Prisma.TransactionClient = prisma, targetName?: string) {
        return await tx.adminAction.create({
            data: { adminId, action, targetType, targetId, reason: reason ?? null, targetName: targetName ?? null }
        });
    },

    /**
     * Hides a group from everyone but site admins. Restorable; never deletes data.
     */
    async hideGroup(groupId: string, adminId: string, reason: string): Promise<ModerationResult<{ slug: string; l1Slug: string }>> {
        if (!(await isSiteAdmin(adminId))) return { success: false, error: 'UNAUTHORIZED_ADMIN' };

        const parsed = hideGroupSchema.safeParse({ reason });
        if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: {
                category: { include: TaxonomyResolver.getInclude('lv') },
                members: { where: { role: 'OWNER' }, select: { userId: true } }
            }
        });
        if (!group) return { success: false, error: 'NOT_FOUND' };

        await prisma.$transaction(async (tx) => {
            await tx.group.update({
                where: { id: groupId },
                data: { hiddenAt: new Date(), hiddenReason: parsed.data.reason, hiddenById: adminId }
            });
            await this.logAction(adminId, 'GROUP_HIDE', 'GROUP', groupId, parsed.data.reason, tx);
        });

        await Promise.all(group.members.map(m =>
            NotificationService.createNotification({
                userId: m.userId,
                type: 'GROUP_HIDDEN',
                translationKey: 'groupHidden',
                args: { groupName: group.name, reason: parsed.data.reason }
            })
        ));

        const resolved = TaxonomyResolver.resolve(group.category);
        return { success: true, data: { slug: group.slug, l1Slug: resolved.l1Slug } };
    },

    async restoreGroup(groupId: string, adminId: string): Promise<ModerationResult<{ slug: string; l1Slug: string }>> {
        if (!(await isSiteAdmin(adminId))) return { success: false, error: 'UNAUTHORIZED_ADMIN' };

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { category: { include: TaxonomyResolver.getInclude('lv') } }
        });
        if (!group) return { success: false, error: 'NOT_FOUND' };

        await prisma.$transaction(async (tx) => {
            await tx.group.update({
                where: { id: groupId },
                data: { hiddenAt: null, hiddenReason: null, hiddenById: null }
            });
            await this.logAction(adminId, 'GROUP_RESTORE', 'GROUP', groupId, undefined, tx);
        });

        const resolved = TaxonomyResolver.resolve(group.category);
        return { success: true, data: { slug: group.slug, l1Slug: resolved.l1Slug } };
    },

    /**
     * Permanently deletes a group that is already hidden (hide first = the safeguard).
     * Uses the same deletion as the owner's delete. The log row and the owner's notification
     * have no relation to the group, so they outlive it; the name is kept on the log row.
     */
    async deleteHiddenGroup(groupId: string, adminId: string, reason: string): Promise<ModerationResult<{ slug: string; l1Slug: string }>> {
        if (!(await isSiteAdmin(adminId))) return { success: false, error: 'UNAUTHORIZED_ADMIN' };

        const parsed = deleteGroupSchema.safeParse({ reason });
        if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: {
                category: { include: TaxonomyResolver.getInclude('lv') },
                members: { where: { role: 'OWNER' }, select: { userId: true } }
            }
        });
        if (!group) return { success: false, error: 'NOT_FOUND' };
        if (!group.hiddenAt) return { success: false, error: 'GROUP_NOT_HIDDEN' };

        await prisma.$transaction(async (tx) => {
            await this.logAction(adminId, 'GROUP_DELETE', 'GROUP', groupId, parsed.data.reason, tx, group.name);
            await GroupService.deleteGroupRecord(groupId, tx);
        });

        await Promise.all(group.members.map(m =>
            NotificationService.createNotification({
                userId: m.userId,
                type: 'GROUP_DELETED',
                translationKey: 'groupDeleted',
                args: { groupName: group.name, excerpt: parsed.data.reason }
            })
        ));

        const resolved = TaxonomyResolver.resolve(group.category);
        return { success: true, data: { slug: group.slug, l1Slug: resolved.l1Slug } };
    },

    /** Groups currently hidden by moderation, newest first. */
    async listHiddenGroups(): Promise<HiddenGroupEntry[]> {
        const groups = await prisma.group.findMany({
            where: { hiddenAt: { not: null } },
            orderBy: { hiddenAt: 'desc' },
            select: {
                id: true, name: true, slug: true, hiddenAt: true, hiddenReason: true,
                category: { include: TaxonomyResolver.getInclude('lv') },
                hiddenBy: { select: { name: true, username: true } },
                members: { where: { role: 'OWNER' }, take: 1, select: { user: { select: { name: true, username: true } } } }
            }
        });
        return groups.map(g => {
            const owner = g.members[0]?.user;
            return {
                id: g.id,
                name: g.name,
                href: `/${TaxonomyResolver.resolve(g.category).l1Slug}/group/${g.slug}`,
                ownerName: owner ? owner.name || owner.username : null,
                reason: g.hiddenReason,
                hiddenAt: g.hiddenAt as Date,
                hiddenByName: g.hiddenBy ? g.hiddenBy.name || g.hiddenBy.username : null
            };
        });
    },

    /** Latest admin actions; pass `targetId` to see only the actions on one group. */
    async listActions(limit: number = 50, targetId?: string): Promise<AdminActionEntry[]> {
        const actions = await prisma.adminAction.findMany({
            where: targetId ? { targetId } : undefined,
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: { admin: { select: { name: true, username: true } } }
        });

        const groupIds = actions.filter(a => a.targetType === 'GROUP').map(a => a.targetId);
        const groups = groupIds.length
            ? await prisma.group.findMany({
                where: { id: { in: groupIds } },
                select: { id: true, name: true, slug: true, category: { include: TaxonomyResolver.getInclude('lv') } }
            })
            : [];
        const groupById = new Map(groups.map(g => [g.id, g]));

        // Earlier rows (hide, restore) of a group that was later deleted carry no name themselves: borrow it from the delete row.
        const goneIds = groupIds.filter(id => !groupById.has(id));
        const keptNames = goneIds.length
            ? await prisma.adminAction.findMany({
                where: { targetId: { in: goneIds }, targetName: { not: null } },
                select: { targetId: true, targetName: true }
            })
            : [];
        const nameOfGone = new Map(keptNames.map(k => [k.targetId, k.targetName]));

        return actions.map(a => {
            const g = a.targetType === 'GROUP' ? groupById.get(a.targetId) : undefined;
            return {
                id: a.id,
                action: a.action,
                targetType: a.targetType,
                targetId: a.targetId,
                reason: a.reason,
                createdAt: a.createdAt,
                adminName: a.admin ? a.admin.name || a.admin.username : null,
                targetName: a.targetName ?? nameOfGone.get(a.targetId) ?? null,
                target: g
                    ? { name: g.name, href: `/${TaxonomyResolver.resolve(g.category).l1Slug}/group/${g.slug}` }
                    : null
            };
        });
    },
};
