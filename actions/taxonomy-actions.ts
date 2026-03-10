'use server';

import { auth } from '@/lib/auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import { ActionResponse, ErrorCode } from '@/types/actions';
import { handleActionError } from '@/lib/action-utils';
import { GroupService } from '@/lib/services/group.service';
import { TaxonomyService } from '@/lib/services/taxonomy.service';
import type {
    ActiveL2WithAliases,
    L1Category,
    L2Category,
    L2SearchResult,
    L3Tag,
    PendingCategoryWithContext,
    TaxonomyTree,
} from '@/lib/services/taxonomy.service';
import { NotificationService } from '@/lib/services/notification.service';

type ApproveTagParams = {
    nameEn: string;
    nameLv: string;
    slugEn: string;
    slugLv: string;
};

function mapTaxonomyError(error: unknown, fallback: ErrorCode = 'ACTION_FAILED'): ActionResponse<never> {
    if (error instanceof Error) {
        const code = error.message as ErrorCode;
        const known: ErrorCode[] = [
            'UNAUTHORIZED',
            'UNAUTHORIZED_ADMIN',
            'FORBIDDEN',
            'NOT_FOUND',
            'TAG_NOT_FOUND',
            'TAG_ALREADY_EXISTS',
            'ALIAS_CONFLICT',
            'VALIDATION_FAILED',
            'INTERNAL_SERVER_ERROR',
            'DELETE_FAILED',
            'SAVE_FAILED',
            'CREATE_FAILED',
            'UPDATE_FAILED',
            'JOIN_FAILED',
            'LEAVE_FAILED',
            'CANCEL_FAILED',
            'INQUIRY_FAILED',
            'ACTION_FAILED',
            'CATEGORY_IN_USE',
            'MANAGE_FAILED',
            'CREATE_EVENT_FAILED',
            'EVENT_NOT_FOUND',
            'EVENT_FULL',
            'TOGGLE_FAILED',
            'USERNAME_TAKEN',
            'UNKNOWN_ERROR',
        ];

        if (known.includes(code)) {
            return { success: false, error: code };
        }
    }

    return handleActionError(error, fallback);
}

function getLang(locale: string): 'en' | 'lv' {
    return locale === 'en' ? 'en' : 'lv';
}

function revalidateTaxonomyAdminPages(): void {
    revalidatePath('/en/admin/taxonomy', 'page');
    revalidatePath('/lv/admin/taxonomy', 'page');
}

async function requireAdmin(): Promise<{ success: true; userId: string } | { success: false; error: 'UNAUTHORIZED' | 'UNAUTHORIZED_ADMIN' }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'UNAUTHORIZED' };
    }
    if (session.user.role !== 'ADMIN') {
        return { success: false, error: 'UNAUTHORIZED_ADMIN' };
    }

    return { success: true, userId: session.user.id };
}

export async function getTaxonomy(locale: string): Promise<ActionResponse<TaxonomyTree>> {
    try {
        const tree = await TaxonomyService.getTaxonomy(locale);
        return { success: true, data: tree };
    } catch (error) {
        return mapTaxonomyError(error, 'INTERNAL_SERVER_ERROR');
    }
}

export async function searchL2Tags(query: string, l1Id: string, locale: string): Promise<ActionResponse<L2SearchResult[]>> {
    try {
        const results = await TaxonomyService.searchL2(query, l1Id, locale);
        return { success: true, data: results };
    } catch (error) {
        return mapTaxonomyError(error, 'ACTION_FAILED');
    }
}

export async function submitPendingTag(label: string, parentId: string): Promise<ActionResponse<{ id: string; slug: string; title: string; status: 'PENDING_REVIEW' }>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'UNAUTHORIZED' };
    }

    try {
        const category = await TaxonomyService.createPendingL2({
            label,
            parentId,
            submittedById: session.user.id,
        });

        return {
            success: true,
            data: {
                id: category.id,
                slug: category.slug,
                title: label.trim(),
                status: 'PENDING_REVIEW',
            },
        };
    } catch (error) {
        return mapTaxonomyError(error, 'CREATE_FAILED');
    }
}

export async function approveTag(id: string, params: ApproveTagParams): Promise<ActionResponse<{ id: string }>> {
    const admin = await requireAdmin();
    if (!admin.success) {
        return admin;
    }

    try {
        const category = await TaxonomyService.approveL2(id, params);
        revalidateTag('categories', 'max');
        revalidateTaxonomyAdminPages();
        return { success: true, data: { id: category.id } };
    } catch (error) {
        return mapTaxonomyError(error, 'UPDATE_FAILED');
    }
}

export async function createL2(parentId: string, params: { nameEn: string; nameLv: string }): Promise<ActionResponse<{ id: string }>> {
    const admin = await requireAdmin();
    if (!admin.success) {
        return admin;
    }

    try {
        const category = await TaxonomyService.createActiveL2({
            parentId,
            nameEn: params.nameEn,
            nameLv: params.nameLv,
        });
        revalidateTag('categories', 'max');
        revalidateTaxonomyAdminPages();
        return { success: true, data: { id: category.id } };
    } catch (error) {
        return mapTaxonomyError(error, 'CREATE_FAILED');
    }
}

export async function updateL1(id: string, color: string): Promise<ActionResponse> {
    const admin = await requireAdmin();
    if (!admin.success) {
        return admin;
    }

    try {
        await TaxonomyService.updateL1Category(id, color);
        revalidateTag('categories', 'max');
        revalidateTaxonomyAdminPages();
        return { success: true };
    } catch (error) {
        return mapTaxonomyError(error, 'UPDATE_FAILED');
    }
}

export async function mergeTag(pendingId: string, canonicalId: string, locale: string): Promise<ActionResponse<{ affectedGroups: number }>> {
    const admin = await requireAdmin();
    if (!admin.success) {
        return admin;
    }

    try {
        const pendingCategories = await TaxonomyService.getPendingCategories();
        const pending = pendingCategories.find((category) => category.id === pendingId);
        if (!pending) {
            return { success: false, error: 'TAG_NOT_FOUND' };
        }

        const canonicalName = await TaxonomyService.getL2DisplayName(canonicalId, getLang(locale));
        if (!canonicalName) {
            return { success: false, error: 'TAG_NOT_FOUND' };
        }

        const ownerByGroup = await TaxonomyService.getOwnerUserIdsForGroups(pending.groups.map((group) => group.id));

        await TaxonomyService.mergeL2(pendingId, canonicalId);

        for (const group of pending.groups) {
            const ownerUserId = ownerByGroup[group.id];
            if (!ownerUserId) {
                continue;
            }

            await NotificationService.createNotification({
                userId: ownerUserId,
                type: 'TAG_MERGED',
                translationKey: 'tagMerged.message',
                args: {
                    originalTag: pending.submittedLabel,
                    canonicalTag: canonicalName,
                },
                link: `/${group.l1Slug}/group/${group.slug}/settings?tab=categorization`,
            });
        }

        revalidateTag('categories', 'max');
        revalidateTaxonomyAdminPages();

        return { success: true, data: { affectedGroups: pending.groups.length } };
    } catch (error) {
        return mapTaxonomyError(error, 'ACTION_FAILED');
    }
}

export async function addAlias(value: string, categoryId: string, locale?: string): Promise<ActionResponse<{ id: string }>> {
    const admin = await requireAdmin();
    if (!admin.success) {
        return admin;
    }

    try {
        const alias = await TaxonomyService.createAlias({ value, categoryId, locale });
        revalidateTaxonomyAdminPages();
        return { success: true, data: { id: alias.id } };
    } catch (error) {
        return mapTaxonomyError(error, 'CREATE_FAILED');
    }
}

export async function deleteAlias(id: string): Promise<ActionResponse> {
    const admin = await requireAdmin();
    if (!admin.success) {
        return admin;
    }

    try {
        await TaxonomyService.deleteAlias(id);
        revalidateTaxonomyAdminPages();
        return { success: true };
    } catch (error) {
        return mapTaxonomyError(error, 'DELETE_FAILED');
    }
}

export async function adminUpdateGroupTags(groupId: string, tagIds: string[], locale: string): Promise<ActionResponse> {
    const admin = await requireAdmin();
    if (!admin.success) {
        return admin;
    }

    try {
        await TaxonomyService.adminUpdateGroupTags(groupId, tagIds);

        const slugs = await GroupService.getGroupSlugs(groupId);
        if (slugs) {
            revalidatePath(`/${locale}/${slugs.l1Slug}/group/${slugs.slug}`, 'page');
            revalidatePath(`/${locale}/${slugs.l1Slug}/group/${slugs.slug}/settings`, 'page');
        }

        return { success: true };
    } catch (error) {
        return mapTaxonomyError(error, 'UPDATE_FAILED');
    }
}

export async function getPendingTags(): Promise<ActionResponse<PendingCategoryWithContext[]>> {
    const admin = await requireAdmin();
    if (!admin.success) {
        return admin;
    }

    try {
        const categories = await TaxonomyService.getPendingCategories();
        return { success: true, data: categories };
    } catch (error) {
        return mapTaxonomyError(error, 'ACTION_FAILED');
    }
}

export async function getAllTags(): Promise<ActionResponse<ActiveL2WithAliases[]>> {
    const admin = await requireAdmin();
    if (!admin.success) {
        return admin;
    }

    try {
        const categories = await TaxonomyService.getAllL2Categories();
        return { success: true, data: categories };
    } catch (error) {
        return mapTaxonomyError(error, 'ACTION_FAILED');
    }
}

export async function bulkApprovePendingAction(ids: string[]): Promise<ActionResponse<{ count: number }>> {
    const admin = await requireAdmin();
    if (!admin.success) {
        return admin;
    }

    try {
        const count = await TaxonomyService.bulkApprovePending(ids);
        revalidateTag('categories', 'max');
        revalidateTaxonomyAdminPages();
        return { success: true, data: { count } };
    } catch (error) {
        return mapTaxonomyError(error, 'ACTION_FAILED');
    }
}

export async function bulkDeleteAction(ids: string[]): Promise<ActionResponse> {
    const admin = await requireAdmin();
    if (!admin.success) {
        return admin;
    }

    try {
        await TaxonomyService.bulkDelete(ids);
        revalidateTag('categories', 'max');
        revalidateTaxonomyAdminPages();
        return { success: true };
    } catch (error) {
        return mapTaxonomyError(error, 'DELETE_FAILED');
    }
}

export async function bulkMergeAction(
    canonicalId: string,
    mergedIds: string[],
    canonicalUpdates: { nameEn: string; nameLv: string; slugEn: string; slugLv: string }
): Promise<ActionResponse> {
    const admin = await requireAdmin();
    if (!admin.success) {
        return admin;
    }

    try {
        // Find affected groups to send notifications
        const pendingCategories = await TaxonomyService.getPendingCategories();
        const pendingMerged = pendingCategories.filter(p => mergedIds.includes(p.id));

        const canonicalName = canonicalUpdates.nameEn; // Simplified for notification

        await TaxonomyService.bulkMerge(canonicalId, mergedIds, canonicalUpdates);

        // Send notifications to owners of groups that had pending tags merged
        for (const pending of pendingMerged) {
            const ownerByGroup = await TaxonomyService.getOwnerUserIdsForGroups(pending.groups.map(g => g.id));

            for (const group of pending.groups) {
                const ownerUserId = ownerByGroup[group.id];
                if (!ownerUserId) continue;

                await NotificationService.createNotification({
                    userId: ownerUserId,
                    type: 'TAG_MERGED',
                    translationKey: 'tagMerged.message',
                    args: {
                        originalTag: pending.submittedLabel,
                        canonicalTag: canonicalName,
                    },
                    link: `/${group.l1Slug}/group/${group.slug}/settings?tab=categorization`,
                });
            }
        }

        revalidateTag('categories', 'max');
        revalidateTaxonomyAdminPages();
        return { success: true };
    } catch (error) {
        return mapTaxonomyError(error, 'ACTION_FAILED');
    }
}

