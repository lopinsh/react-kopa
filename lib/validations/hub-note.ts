import { z } from 'zod';
import { HUB_NOTE_MAX, HUB_NOTE_REPLY_MAX } from '@/lib/constants';
import { messageTextSchema } from './message';

const noteText = z.string().trim().min(1).max(HUB_NOTE_MAX);
const idSchema = z.string().trim().min(1).max(64);
const slugSchema = z.string().trim().min(1).max(100);

/** A new Ziņa. The Veids (`categorySlug`) is the hub or one of its sub-veidi; group and city are optional (K-116, K-117). */
export const hubNoteSchema = z.object({
    content: noteText,
    categorySlug: slugSchema,
    groupId: idSchema.optional(),
    citySlug: slugSchema.optional(),
});
export type HubNoteInput = z.infer<typeof hubNoteSchema>;

/** Editing a Ziņa: the Veids is fixed once posted. */
export const hubNoteEditSchema = z.object({
    content: noteText,
    groupId: idSchema.nullish(),
    citySlug: slugSchema.nullish(),
});
export type HubNoteEditInput = z.infer<typeof hubNoteEditSchema>;

export const hubNoteReplySchema = z.object({ content: z.string().trim().min(1).max(HUB_NOTE_REPLY_MAX) });

/** A private request to a Ziņa's author: the first message goes into the chat when it is accepted (K-120). */
export const chatRequestSchema = z.object({ noteId: idSchema, content: messageTextSchema });

/** `?tab=`, `?q=` and `?z=` of the Ziņas page. */
export const hubNoteListSchema = z.object({
    tab: z.enum(['all', 'mine']).catch('all'),
    q: z.string().trim().max(100).catch(''),
    z: idSchema.optional().catch(undefined),
});

export const hubNoteIdSchema = idSchema;
