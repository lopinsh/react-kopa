import { z } from 'zod';
import { ACTIVITY_FILTERS, ACTIVITY_KINDS } from '@/lib/constants/activity';

/** `${at ISO}~${kind}~${id}`: the last row shown. */
const cursorSchema = z
    .string()
    .max(200)
    .transform((value, ctx) => {
        const [iso, kind, id, ...rest] = value.split('~');
        const at = new Date(iso ?? '');
        const validKind = ACTIVITY_KINDS.find((k) => k === kind);
        if (rest.length > 0 || !id || !validKind || Number.isNaN(at.getTime())) {
            ctx.addIssue({ code: 'custom', message: 'VALIDATION_FAILED' });
            return z.NEVER;
        }
        return { at, kind: validKind, id };
    });

export const activityQuerySchema = z.object({
    type: z.enum(ACTIVITY_FILTERS).default('all'),
    cursor: cursorSchema.optional(),
});

export type ActivityQuery = z.infer<typeof activityQuerySchema>;
export type ActivityCursor = NonNullable<ActivityQuery['cursor']>;
