'use server';

import { revalidatePath } from 'next/cache';
import type { ActionResponse } from '@/types/actions';
import { handleActionError, requireSiteOwner } from '@/lib/action-utils';
import { TeamService, type TeamCandidate } from '@/lib/services/team.service';

export async function searchTeamCandidates(query: string): Promise<ActionResponse<TeamCandidate[]>> {
    const actor = await requireSiteOwner();
    if (!actor.success) return actor;
    try {
        const result = await TeamService.searchUsers(actor.userId, query);
        return { success: true, data: result };
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}

export async function makeAdmin(userId: string, locale: string): Promise<ActionResponse> {
    const actor = await requireSiteOwner();
    if (!actor.success) return actor;
    try {
        await TeamService.makeAdmin(actor.userId, userId);
        revalidatePath(`/${locale}/admin/team`, 'page');
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}

export async function removeAdmin(userId: string, locale: string): Promise<ActionResponse> {
    const actor = await requireSiteOwner();
    if (!actor.success) return actor;
    try {
        await TeamService.removeAdmin(actor.userId, userId);
        revalidatePath(`/${locale}/admin/team`, 'page');
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}
