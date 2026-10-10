import { z } from 'zod';

export const MESSAGE_MAX_LENGTH = 2000;

/** One chat message, as typed by a person. Shared by the forms and the Server Actions. */
export const messageTextSchema = z.string().trim().min(1).max(MESSAGE_MAX_LENGTH);
