'use server';

import type { ActionResponse } from '@/types/actions';
import { handleActionError, requireSiteAdmin } from '@/lib/action-utils';
import { MatrixService, type MatrixSession, type PublicLine } from '@/lib/services/matrix.service';
import { MatrixTrialService, type TrialCheck, type TrialRooms } from '@/lib/services/matrix-trial.service';

/** K4 trial actions: admin only, nothing cached, so no revalidatePath. */

export async function setupMatrixTrialAction(): Promise<ActionResponse<TrialRooms>> {
    const admin = await requireSiteAdmin();
    if (!admin.success) return admin;
    try {
        return { success: true, data: await MatrixTrialService.setup() };
    } catch (e) {
        return handleActionError(e, 'MATRIX_FAILED');
    }
}

/** A token for the calling admin only; the appservice token never leaves the server. */
export async function matrixSessionAction(): Promise<ActionResponse<MatrixSession>> {
    const admin = await requireSiteAdmin();
    if (!admin.success) return admin;
    try {
        return { success: true, data: await MatrixService.sessionFor(admin.userId) };
    } catch (e) {
        return handleActionError(e, 'MATRIX_FAILED');
    }
}

export async function runMatrixChecksAction(): Promise<ActionResponse<TrialCheck[]>> {
    const admin = await requireSiteAdmin();
    if (!admin.success) return admin;
    try {
        return { success: true, data: await MatrixTrialService.runChecks(admin.userId) };
    } catch (e) {
        return handleActionError(e, 'MATRIX_FAILED');
    }
}

/** Variant B of the signed-out read (F4): the site reads the room for the page. Only trial rooms are readable. */
export async function readPublicAction(): Promise<ActionResponse<PublicLine[]>> {
    const admin = await requireSiteAdmin();
    if (!admin.success) return admin;
    try {
        const trial = await MatrixTrialService.find();
        return { success: true, data: trial ? await MatrixService.readPublic(trial.room) : [] };
    } catch (e) {
        return handleActionError(e, 'MATRIX_FAILED');
    }
}
