import { z } from 'zod';

export const hideGroupSchema = z.object({
    reason: z
        .string()
        .trim()
        .min(5, 'REASON_TOO_SHORT')
        .max(500, 'REASON_TOO_LONG'),
});

export type HideGroupValues = z.infer<typeof hideGroupSchema>;
