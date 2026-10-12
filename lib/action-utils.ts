import { z } from 'zod';
import { ActionResponse, ErrorCode, isErrorCode } from '@/types/actions';
import { auth } from '@/lib/auth';
import { isSiteAdmin, isSiteOwner } from '@/lib/site-role';

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
 * Only codes from the ErrorCode registry reach the client: an ActionError's code, or a service's
 * `throw new ActionError('NOT_FOUND')`. Anything else (Prisma codes,
 * connection errors, plain messages) becomes the fallback.
 */
export function handleActionError(error: unknown, fallback: ErrorCode = 'INTERNAL_SERVER_ERROR'): ActionResponse<never> {
    console.error('[Action Error]:', error);

    const info = (typeof error === 'object' && error !== null ? error : {}) as {
        name?: unknown; __isActionError?: unknown; code?: unknown; message?: unknown;
    };

    // Unmigrated database (Prisma "table does not exist")
    if (info.code === 'P2021') return { success: false, error: 'DB_MIGRATION_REQUIRED' };

    // Our custom ActionError, recognised in a way that survives serialization
    if ((info.name === 'ActionError' || info.__isActionError) && isErrorCode(info.code)) {
        return { success: false, error: info.code };
    }

    // Services that throw a plain Error carrying a registry code as the message
    if (error instanceof Error && isErrorCode(error.message)) {
        return { success: false, error: error.message };
    }

    return { success: false, error: fallback };
}

export type SiteRoleCheck =
    | { success: true; userId: string }
    | { success: false; error: 'UNAUTHORIZED' | 'FORBIDDEN' };

/**
 * The one admin guard for Server Actions. Signed out gives UNAUTHORIZED; signed in without the
 * role gives FORBIDDEN. Use: `const admin = await requireSiteAdmin(); if (!admin.success) return admin;`
 */
export async function requireSiteAdmin(): Promise<SiteRoleCheck> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };
    if (!isSiteAdmin(session.user.role)) return { success: false, error: 'FORBIDDEN' };
    return { success: true, userId: session.user.id };
}

/** Same as requireSiteAdmin, for owner-only actions. */
export async function requireSiteOwner(): Promise<SiteRoleCheck> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'UNAUTHORIZED' };
    if (!isSiteOwner(session.user.role)) return { success: false, error: 'FORBIDDEN' };
    return { success: true, userId: session.user.id };
}
