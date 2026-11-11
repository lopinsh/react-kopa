'use server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { HubNoteService } from '@/lib/services/hub-note.service';
import { hubNoteEditSchema, hubNoteIdSchema, hubNoteSchema } from '@/lib/validations/hub-note';
import { handleActionError } from '@/lib/action-utils';
import type { ActionResponse } from '@/types/actions';

/** A Ziņa shows on its hub and its parent hub, in the Pārskats block and the Manas list: refresh every hub page. */
function refreshHubs(): void {
    revalidatePath('/[locale]/[l1Slug]/[...hub]', 'layout');
}

export async function createHubNote(input: unknown): Promise<ActionResponse<{ id: string; href: string }>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };
    const parsed = hubNoteSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: 'VALIDATION_FAILED' };
    try {
        const data = await HubNoteService.create(session.user.id, parsed.data);
        refreshHubs();
        return { success: true, data };
    } catch (error: unknown) {
        return handleActionError(error);
    }
}

export async function editHubNote(id: unknown, input: unknown): Promise<ActionResponse<void>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };
    const parsedId = hubNoteIdSchema.safeParse(id);
    const parsed = hubNoteEditSchema.safeParse(input);
    if (!parsedId.success || !parsed.success) return { success: false, error: 'VALIDATION_FAILED' };
    try {
        await HubNoteService.edit(session.user.id, parsedId.data, parsed.data);
        refreshHubs();
        return { success: true };
    } catch (error: unknown) {
        return handleActionError(error);
    }
}

export async function deleteHubNote(id: unknown): Promise<ActionResponse<void>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };
    const parsedId = hubNoteIdSchema.safeParse(id);
    if (!parsedId.success) return { success: false, error: 'VALIDATION_FAILED' };
    try {
        await HubNoteService.delete({ id: session.user.id, role: session.user.role }, parsedId.data);
        refreshHubs();
        return { success: true };
    } catch (error: unknown) {
        return handleActionError(error);
    }
}

export async function renewHubNote(id: unknown): Promise<ActionResponse<void>> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };
    const parsedId = hubNoteIdSchema.safeParse(id);
    if (!parsedId.success) return { success: false, error: 'VALIDATION_FAILED' };
    try {
        await HubNoteService.renew(session.user.id, parsedId.data);
        refreshHubs();
        return { success: true };
    } catch (error: unknown) {
        return handleActionError(error);
    }
}
