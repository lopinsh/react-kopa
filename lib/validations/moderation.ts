import { z } from 'zod';

export const MODERATION_REASON_MAX = 500;

export const hideGroupSchema = z.object({
    reason: z
        .string()
        .trim()
        .min(5, 'REASON_TOO_SHORT')
        .max(MODERATION_REASON_MAX, 'REASON_TOO_LONG'),
});

export type HideGroupValues = z.infer<typeof hideGroupSchema>;

/** Deleting a hidden group needs the same kind of reason as hiding it. */
export const deleteGroupSchema = hideGroupSchema;
