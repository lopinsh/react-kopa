/**
 * Standardized error codes for Server Actions.
 * These should map to keys in the translation files (e.g., messages/en.json).
 */
export type ErrorCode =
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
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
    | 'INTERNAL_SERVER_ERROR'
    | 'CATEGORY_IN_USE'
    | 'MANAGE_FAILED'
    | 'CREATE_EVENT_FAILED'
    | 'EVENT_NOT_FOUND'
    | 'EVENT_FULL'
    | 'TOGGLE_FAILED'
    | 'USERNAME_TAKEN'
    | 'UNKNOWN_ERROR';

/**
 * Standardized response format for all Server Actions.
 */
export type ActionResponse<T = void> =
    | { success: true; data?: T }
    | { success: false; error: ErrorCode };
