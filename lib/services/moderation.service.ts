import { prisma } from '@/lib/prisma';
import { hideGroupSchema } from '@/lib/validations/moderation';
import { TaxonomyResolver } from './taxonomy-resolver.service';
import { NotificationService } from './notification.service';
import type { ErrorCode } from '@/types/actions';

export type AdminActionType = 'GROUP_HIDE' | 'GROUP_RESTORE' | 'GROUP_EDIT';

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
    target: { name: string; href: string } | null;
}

async function isSiteAdmin(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    return user?.role === 'ADMIN';
}

export const ModerationService = {
    /**
     * Records an admin action. Called by services that perform admin-only overrides.
     */
    async logAction(adminId: string, action: AdminActionType, targetType: string, targetId: string, reason?: string) {
        return await prisma.adminAction.create({
            data: { adminId, action, targetType, targetId, reason: reason ?? null }
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

        await prisma.group.update({
            where: { id: groupId },
            data: { hiddenAt: new Date(), hiddenReason: parsed.data.reason, hiddenById: adminId }
        });
        await this.logAction(adminId, 'GROUP_HIDE', 'GROUP', groupId, parsed.data.reason);

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

        await prisma.group.update({
            where: { id: groupId },
            data: { hiddenAt: null, hiddenReason: null, hiddenById: null }
        });
        await this.logAction(adminId, 'GROUP_RESTORE', 'GROUP', groupId);

        const resolved = TaxonomyResolver.resolve(group.category);
        return { success: true, data: { slug: group.slug, l1Slug: resolved.l1Slug } };
    },

    async listActions(limit: number = 50): Promise<AdminActionEntry[]> {
        const actions = await prisma.adminAction.findMany({
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

        return actions.map(a => {
            const g = a.targetType === 'GROUP' ? groupById.get(a.targetId) : undefined;
            return {
                id: a.id,
                action: a.action,
                targetType: a.targetType,
                targetId: a.targetId,
                reason: a.reason,
                createdAt: a.createdAt,
                adminName: a.admin.name || a.admin.username,
                target: g
                    ? { name: g.name, href: `/${TaxonomyResolver.resolve(g.category).l1Slug}/group/${g.slug}` }
                    : null
            };
        });
    },
};
