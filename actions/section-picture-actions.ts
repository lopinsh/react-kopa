'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { SectionPictureService } from '@/lib/services/section-picture.service';
import { sectionIdSchema, sectionPicturePickSchema, sectionPictureIdsSchema, pictureIdSchema, type SectionPicturePick } from '@/lib/validations/section-picture';
import { validateActionData, handleActionError } from '@/lib/action-utils';
import type { ActionResponse } from '@/types/actions';

function revalidateGroup(locale: string, slugs: { slug: string; l1Slug: string }): void {
    revalidatePath(`/${locale}/${slugs.l1Slug}/group/${slugs.slug}`, 'page');
    revalidatePath(`/${locale}/${slugs.l1Slug}/group/${slugs.slug}/settings`, 'page');
}

export async function addSectionPictureAction(
    groupId: string,
    sectionId: string,
    pick: SectionPicturePick,
    locale: string,
): Promise<ActionResponse<{ pictureId: string; sectionId: string }>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const id = await validateActionData(sectionIdSchema, sectionId);
        if (!id.success) return id;
        const picked = await validateActionData(sectionPicturePickSchema, pick);
        if (!picked.success) return picked;

        const result = await SectionPictureService.add(groupId, id.data, picked.data, session.user.id);
        revalidateGroup(locale, result);
        return { success: true, data: { pictureId: result.pictureId, sectionId: result.sectionId } };
    } catch (error) {
        return handleActionError(error, 'SAVE_FAILED');
    }
}

export async function removeSectionPictureAction(pictureId: string, locale: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const id = await validateActionData(pictureIdSchema, pictureId);
        if (!id.success) return id;

        revalidateGroup(locale, await SectionPictureService.remove(id.data, session.user.id));
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'DELETE_FAILED');
    }
}

export async function reorderSectionPicturesAction(sectionId: string, ids: string[], locale: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };

    try {
        const section = await validateActionData(sectionIdSchema, sectionId);
        if (!section.success) return section;
        const order = await validateActionData(sectionPictureIdsSchema, ids);
        if (!order.success) return order;

        revalidateGroup(locale, await SectionPictureService.reorder(section.data, order.data, session.user.id));
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'MANAGE_FAILED');
    }
}
