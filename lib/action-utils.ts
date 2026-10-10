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
export function handleActionError(error: unknown, fallback: ErrorCode = 'INTERNAL_SERVER_ERROR'): ActionResponse<never> {
    console.error('[Action Error]:', error);

    const info = (typeof error === 'object' && error !== null ? error : {}) as {
        name?: unknown; __isActionError?: unknown; code?: unknown;
    };
    const code = typeof info.code === 'string' ? info.code : null;

    // Unmigrated database (Prisma "table does not exist")
    if (code === 'P2021') return { success: false, error: 'DB_MIGRATION_REQUIRED' };

    // Our custom ActionError, recognised in a way that survives serialization
    if (info.name === 'ActionError' || info.__isActionError || code) {
        return { success: false, error: (code ?? fallback) as ErrorCode };
    }

    return { success: false, error: fallback };
}
