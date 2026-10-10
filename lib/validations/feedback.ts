import { z } from 'zod';
import { FEEDBACK_KINDS, FEEDBACK_STATUSES, FEEDBACK_TEXT_MAX, UI_NAMES } from '@/lib/constants';

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
    /** `data-ui` name of the component the note was left on; null when it was left outside any named element. */
    component: z.enum(UI_NAMES).nullable().optional(),
    /** Exact location of the element, so an agent can find it even without a name or text. */
    breadcrumb: z.string().max(600).nullable().optional(),
    /** Trimmed HTML of the element (scope), not the whole page. */
    outerHtml: z.string().max(1500).nullable().optional(),
    /** Git commit the page was built from ('dev' locally). */
    commit: z.string().max(40).nullable().optional(),
    heading: z.string().max(200).nullable().optional(),
    boxX: z.number().int().min(-100000).max(1000000).nullable().optional(),
    boxY: z.number().int().min(-100000).max(1000000).nullable().optional(),
    boxW: z.number().int().min(0).max(100000).nullable().optional(),
    boxH: z.number().int().min(0).max(1000000).nullable().optional(),
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
