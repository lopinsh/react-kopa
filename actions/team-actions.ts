'use server';

import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { ActionResponse, ErrorCode } from '@/types/actions';
import { handleActionError } from '@/lib/action-utils';
import { isSiteOwner } from '@/lib/site-role';
import { TeamService, type TeamCandidate } from '@/lib/services/team.service';

/** Every team action is owner-only; the service checks the role in the database again. */
async function requireOwner(): Promise<{ userId: string } | { error: ErrorCode }> {
    const session = await auth();
    if (!session?.user?.id) return { error: 'UNAUTHORIZED' };
    if (!isSiteOwner(session.user.role)) return { error: 'FORBIDDEN' };
    return { userId: session.user.id };
}

export async function searchTeamCandidates(query: string): Promise<ActionResponse<TeamCandidate[]>> {
    const actor = await requireOwner();
    if ('error' in actor) return { success: false, error: actor.error };
    try {
        const result = await TeamService.searchUsers(actor.userId, query);
        return result.success ? { success: true, data: result.data ?? [] } : result;
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}

export async function makeAdmin(userId: string, locale: string): Promise<ActionResponse> {
    const actor = await requireOwner();
    if ('error' in actor) return { success: false, error: actor.error };
    try {
        const result = await TeamService.makeAdmin(actor.userId, userId);
        if (!result.success) return result;
        revalidatePath(`/${locale}/admin/team`, 'page');
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}

export async function removeAdmin(userId: string, locale: string): Promise<ActionResponse> {
    const actor = await requireOwner();
    if ('error' in actor) return { success: false, error: actor.error };
    try {
        const result = await TeamService.removeAdmin(actor.userId, userId);
        if (!result.success) return result;
        revalidatePath(`/${locale}/admin/team`, 'page');
        return { success: true };
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}
