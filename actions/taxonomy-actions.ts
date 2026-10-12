'use server';

import { auth } from '@/lib/auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import { ActionResponse, ErrorCode } from '@/types/actions';
import { handleActionError, requireSiteAdmin } from '@/lib/action-utils';
import { TaxonomyService, type TagMergeNotice } from '@/lib/services/taxonomy.service';
import type {
    ActiveL2WithAliases,
    L2SearchResult,
    PendingTagOption,
    PendingCategoryWithContext,
    TaxonomyTree,
} from '@/lib/services/taxonomy.service';
import { NotificationService } from '@/lib/services/notification.service';
import {
    submitPendingTagSchema, createL2Schema, approveTagSchema, updateL1Schema, addAliasSchema, idListSchema, bulkMergeSchema,
} from '@/lib/validations/taxonomy';

type ApproveTagParams = {
    nameEn: string;
    nameLv: string;
    slugEn: string;
    slugLv: string;
};

const INVALID = { success: false, error: 'VALIDATION_FAILED' } as const;

function mapTaxonomyError(error: unknown, fallback: ErrorCode = 'ACTION_FAILED'): ActionResponse<never> {
    // Services throw `new ActionError('TAG_NOT_FOUND')` etc.; handleActionError turns them into codes.
    return handleActionError(error, fallback);
}

function revalidateTaxonomyAdminPages(): void {
    revalidatePath('/en/admin/taxonomy', 'page');
    revalidatePath('/lv/admin/taxonomy', 'page');
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

/** Pending sub-categories the picker may offer under an L1 (shared ones, plus the caller's own selected ones). */
export async function getPendingTagOptions(l1Id: string, selectedIds: string[], locale: string): Promise<ActionResponse<PendingTagOption[]>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'UNAUTHORIZED' };
    }

    try {
        const options = await TaxonomyService.getPendingTagOptions(l1Id, selectedIds, locale);
        return { success: true, data: options };
    } catch (error) {
        return mapTaxonomyError(error, 'ACTION_FAILED');
    }
}

export async function submitPendingTag(label: string, parentId: string, locale: string): Promise<ActionResponse<{ id: string; slug: string; title: string; status: 'PENDING_REVIEW' }>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'UNAUTHORIZED' };
    }

    const parsed = submitPendingTagSchema.safeParse({ label, parentId });
    if (!parsed.success) return INVALID;
    label = parsed.data.label;

    try {
        const { category, created } = await TaxonomyService.createPendingL2({
            label,
            parentId,
            submittedById: session.user.id,
            locale,
        });

        // A reused pending tag was already announced when it was first suggested.
        if (created) {
            await NotificationService.notifyAdmins({
                type: 'ADMIN_TAG_PENDING',
                args: { title: label.trim() },
                link: '/admin/taxonomy',
                exceptUserId: session.user.id,
            });
        }

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
    const admin = await requireSiteAdmin();
    if (!admin.success) {
        return admin;
    }

    const parsed = approveTagSchema.safeParse({ id, ...params });
    if (!parsed.success) return INVALID;

    try {
        const category = await TaxonomyService.approveL2(parsed.data.id, {
            nameEn: parsed.data.nameEn, nameLv: parsed.data.nameLv, slugEn: parsed.data.slugEn, slugLv: parsed.data.slugLv,
        });
        revalidateTag('categories', 'max');
        revalidateTaxonomyAdminPages();
        return { success: true, data: { id: category.id } };
    } catch (error) {
        return mapTaxonomyError(error, 'UPDATE_FAILED');
    }
}

export async function createL2(parentId: string, params: { nameEn: string; nameLv: string }): Promise<ActionResponse<{ id: string }>> {
    const admin = await requireSiteAdmin();
    if (!admin.success) {
        return admin;
    }

    const parsed = createL2Schema.safeParse({ parentId, ...params });
    if (!parsed.success) return INVALID;

    try {
        const category = await TaxonomyService.createActiveL2(parsed.data);
        revalidateTag('categories', 'max');
        revalidateTaxonomyAdminPages();
        return { success: true, data: { id: category.id } };
    } catch (error) {
        return mapTaxonomyError(error, 'CREATE_FAILED');
    }
}

export async function updateL1(id: string, color: string): Promise<ActionResponse> {
    const admin = await requireSiteAdmin();
    if (!admin.success) {
        return admin;
    }

    const parsed = updateL1Schema.safeParse({ id, color });
    if (!parsed.success) return INVALID;

    try {
        await TaxonomyService.updateL1Category(parsed.data.id, parsed.data.color);
        revalidateTag('categories', 'max');
        revalidateTaxonomyAdminPages();
        return { success: true };
    } catch (error) {
        return mapTaxonomyError(error, 'UPDATE_FAILED');
    }
}

async function sendMergeNotices(notices: TagMergeNotice[]): Promise<void> {
    for (const notice of notices) {
        await NotificationService.createNotification({
            userId: notice.userId,
            type: 'TAG_MERGED',
            translationKey: 'tagMerged.message',
            args: notice.args,
            link: notice.link,
        });
    }
}

export async function mergeTag(pendingId: string, canonicalId: string, locale: string): Promise<ActionResponse<{ affectedGroups: number }>> {
    const admin = await requireSiteAdmin();
    if (!admin.success) {
        return admin;
    }

    try {
        const { affectedGroups, notices } = await TaxonomyService.mergePendingTag(pendingId, canonicalId, locale);
        await sendMergeNotices(notices);

        revalidateTag('categories', 'max');
        revalidateTaxonomyAdminPages();

        return { success: true, data: { affectedGroups } };
    } catch (error) {
        return mapTaxonomyError(error, 'ACTION_FAILED');
    }
}

export async function addAlias(value: string, categoryId: string, locale?: string): Promise<ActionResponse<{ id: string }>> {
    const admin = await requireSiteAdmin();
    if (!admin.success) {
        return admin;
    }

    const parsed = addAliasSchema.safeParse({ value, categoryId, locale });
    if (!parsed.success) return INVALID;

    try {
        const alias = await TaxonomyService.createAlias(parsed.data);
        revalidateTaxonomyAdminPages();
        return { success: true, data: { id: alias.id } };
    } catch (error) {
        return mapTaxonomyError(error, 'CREATE_FAILED');
    }
}

export async function deleteAlias(id: string): Promise<ActionResponse> {
    const admin = await requireSiteAdmin();
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
    const admin = await requireSiteAdmin();
    if (!admin.success) {
        return admin;
    }

    try {
        const { slug, l1Slug } = await TaxonomyService.adminUpdateGroupTags(groupId, tagIds);
        revalidatePath(`/${locale}/${l1Slug}/group/${slug}`, 'page');
        revalidatePath(`/${locale}/${l1Slug}/group/${slug}/settings`, 'page');

        return { success: true };
    } catch (error) {
        return mapTaxonomyError(error, 'UPDATE_FAILED');
    }
}

export async function getPendingTags(): Promise<ActionResponse<PendingCategoryWithContext[]>> {
    const admin = await requireSiteAdmin();
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
    const admin = await requireSiteAdmin();
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
    const admin = await requireSiteAdmin();
    if (!admin.success) {
        return admin;
    }

    const parsed = idListSchema.safeParse(ids);
    if (!parsed.success) return INVALID;

    try {
        const count = await TaxonomyService.bulkApprovePending(parsed.data);
        revalidateTag('categories', 'max');
        revalidateTaxonomyAdminPages();
        return { success: true, data: { count } };
    } catch (error) {
        return mapTaxonomyError(error, 'ACTION_FAILED');
    }
}

export async function bulkDeleteAction(ids: string[]): Promise<ActionResponse> {
    const admin = await requireSiteAdmin();
    if (!admin.success) {
        return admin;
    }

    const parsed = idListSchema.safeParse(ids);
    if (!parsed.success) return INVALID;

    try {
        await TaxonomyService.bulkDelete(parsed.data);
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
    const admin = await requireSiteAdmin();
    if (!admin.success) {
        return admin;
    }

    const parsed = bulkMergeSchema.safeParse({ canonicalId, mergedIds, canonicalUpdates });
    if (!parsed.success) return INVALID;
    canonicalUpdates = parsed.data.canonicalUpdates;

    try {
        const notices = await TaxonomyService.bulkMergeWithNotices(canonicalId, mergedIds, canonicalUpdates);
        await sendMergeNotices(notices);

        revalidateTag('categories', 'max');
        revalidateTaxonomyAdminPages();
        return { success: true };
    } catch (error) {
        return mapTaxonomyError(error, 'ACTION_FAILED');
    }
}

