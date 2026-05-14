import { z } from 'zod';
import { ActionResponse, ErrorCode } from '@/types/actions';

/**
 * Validates data against a Zod schema and returns a standardized ActionResponse.
 * Useful for ensuring the "Defensive Coding Law" is followed.
 */
export async function validateActionData<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): Promise<{ success: true; data: T } | { success: false; error: 'VALIDATION_FAILED' }> {
    const result = await schema.safeParseAsync(data);

    if (!result.success) {
        return { success: false, error: 'VALIDATION_FAILED' };
    }

    return { success: true, data: result.data };
}

/**
 * Simple wrapper for catching errors in actions and returning a standardized fallback.
 */
export function handleActionError(error: any, fallback: ErrorCode = 'INTERNAL_SERVER_ERROR'): ActionResponse<never> {
    console.error('[Action Error]:', error);

    // Check for our custom ActionError in a way that survives serialization
    if (error?.name === 'ActionError' || error?.__isActionError || error?.code) {
        return { success: false, error: error.code || fallback };
    }

    return { success: false, error: fallback };
}
