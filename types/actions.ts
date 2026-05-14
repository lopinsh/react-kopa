/**
 * Standardized error codes for Server Actions.
 * These should map to keys in the translation files (e.g., messages/en.json).
 */
export type ErrorCode =
    | 'UNAUTHORIZED'
    | 'UNAUTHORIZED_ADMIN'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'TAG_NOT_FOUND'
    | 'TAG_ALREADY_EXISTS'
    | 'ALIAS_CONFLICT'
    | 'VALIDATION_FAILED'
    | 'INTERNAL_SERVER_ERROR'
    | 'DELETE_FAILED'
    | 'SAVE_FAILED'
    | 'CREATE_FAILED'
    | 'UPDATE_FAILED'
    | 'JOIN_FAILED'
    | 'LEAVE_FAILED'
    | 'CANCEL_FAILED'
    | 'INQUIRY_FAILED'
    | 'ACTION_FAILED'
    | 'CATEGORY_IN_USE'
    | 'MANAGE_FAILED'
    | 'CREATE_EVENT_FAILED'
    | 'EVENT_NOT_FOUND'
    | 'EVENT_FULL'
    | 'TOGGLE_FAILED'
    | 'USERNAME_TAKEN'
    | 'UNKNOWN_ERROR'
    | 'POST_FAILED'
    | 'REPORT_FAILED'
    | 'RESOLUTION_FAILED'
    | 'DB_MIGRATION_REQUIRED';

/**
 * Standardized ActionError for thrown errors from services.
 */
export class ActionError extends Error {
    public readonly __isActionError = true;
    constructor(public code: ErrorCode, message?: string) {
        super(message || code);
        this.name = 'ActionError';
        // Ensure name property is kept after serialization if possible
        Object.defineProperty(this, 'name', { value: 'ActionError', enumerable: true });
    }
}
/**
 * Standardized response format for all Server Actions.
 */
export type ActionResponse<T = void> =
    | { success: true; data?: T }
    | { success: false; error: ErrorCode };
