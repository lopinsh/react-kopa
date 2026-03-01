import { z } from 'zod';
import { ActionResponse } from '@/types/actions';

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
export function handleActionError(error: unknown, fallback: string = 'INTERNAL_SERVER_ERROR'): ActionResponse<any> {
    console.error(`[Action Error]:`, error);
    // In a real app, we might check if 'error' is a known type to return specific codes
    return { success: false, error: fallback as any };
}
