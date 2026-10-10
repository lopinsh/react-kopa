import { z } from 'zod';
import { FEEDBACK_KINDS, FEEDBACK_STATUSES, FEEDBACK_TEXT_MAX } from '@/lib/constants';

/** A new note, as captured by feedback mode. Everything except kind and text is filled in automatically. */
export const createFeedbackSchema = z.object({
    kind: z.enum(FEEDBACK_KINDS),
    text: z.string().trim().min(1).max(FEEDBACK_TEXT_MAX),
    path: z.string().min(1).max(500),
    locale: z.string().min(2).max(10),
    viewportW: z.number().int().min(1).max(20000),
    viewportH: z.number().int().min(1).max(20000),
    theme: z.string().max(20),
    selector: z.string().max(400),
    elementText: z.string().max(200),
    userAgent: z.string().max(400),
});
export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;

/** Status change plus an optional reply; used by the admin page and the agent API. */
export const updateFeedbackSchema = z.object({
    status: z.enum(FEEDBACK_STATUSES),
    reply: z.string().trim().max(FEEDBACK_TEXT_MAX).optional(),
});
export type UpdateFeedbackInput = z.infer<typeof updateFeedbackSchema>;

/** Admin list filters; unknown or empty values mean "no filter". */
export const feedbackFilterSchema = z.object({
    kind: z.enum(FEEDBACK_KINDS).optional().catch(undefined),
    status: z.enum(FEEDBACK_STATUSES).optional().catch(undefined),
    page: z.string().trim().max(200).optional().catch(undefined),
});
export type FeedbackFilter = z.infer<typeof feedbackFilterSchema>;
