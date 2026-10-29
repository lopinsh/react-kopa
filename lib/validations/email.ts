import { z } from 'zod';

/** The `u` (user id) and `s` (signature) of an unsubscribe link; both come from the URL, so they are only checked for shape here. */
export const unsubscribeLinkSchema = z.object({
    u: z.string().min(1).max(64),
    s: z.string().min(1).max(128),
});
