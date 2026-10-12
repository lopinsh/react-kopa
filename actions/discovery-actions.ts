'use server';

import { DiscoveryService } from '@/lib/services/discovery.service';
import type { ActionResponse } from '@/types/actions';
import { handleActionError } from '@/lib/action-utils';

export type ContextualSearchResults = Awaited<ReturnType<typeof DiscoveryService.searchContextual>>;

/**
 * Performs a contextual search for categories and groups. Called by the discovery search box
 * (a client component), so it is the one discovery read that stays an action.
 */
export async function searchContextual(
    query: string,
    locale: string,
    activeCat?: string,
    activeTag?: string
): Promise<ActionResponse<ContextualSearchResults>> {
    try {
        return { success: true, data: await DiscoveryService.searchContextual(query, locale, activeCat, activeTag) };
    } catch (error) {
        return handleActionError(error, 'ACTION_FAILED');
    }
}
